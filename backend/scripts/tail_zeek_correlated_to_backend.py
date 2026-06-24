from __future__ import annotations

import argparse
import json
import queue
import shlex
import subprocess
import sys
import threading
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any
from urllib.error import URLError
from urllib.request import Request, urlopen

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.replay import AI2AStreamingFlowFeatureExtractor  # noqa: E402
from app.replay.zeek import ReplayEventBuilder, normalize_conn_row, normalize_http_row, parse_zeek_line  # noqa: E402


DEFAULT_CORRELATION_TIMEOUT_SECONDS = 5.0
DEFAULT_CONN_BATCH_DELAY_SECONDS = 0.5


def main() -> None:
    parser = argparse.ArgumentParser(description="Tail Zeek conn/http logs, correlate by UID transaction, and POST events.")
    parser.add_argument("--conn-log", required=True, help="Path to Zeek conn.log on local host or remote Zeek VM.")
    parser.add_argument("--http-log", required=True, help="Path to Zeek http.log on local host or remote Zeek VM.")
    parser.add_argument("--api-url", default="http://localhost:8000/api/events")
    parser.add_argument("--zeek-ssh", default="", help="Optional SSH target, for example zeek@192.168.17.20.")
    parser.add_argument("--sensor-id", default="zeek-vm-01")
    parser.add_argument("--allow-endpoint", action="append", default=[])
    parser.add_argument("--require-both-endpoints", action="store_true")
    parser.add_argument("--correlation-timeout", type=float, default=DEFAULT_CORRELATION_TIMEOUT_SECONDS)
    parser.add_argument("--conn-batch-delay", type=float, default=DEFAULT_CONN_BATCH_DELAY_SECONDS)
    parser.add_argument("--poll-interval", type=float, default=0.25)
    parser.add_argument("--max-emitted-events", type=int, default=0, help="Stop after N emitted events; 0 means no limit.")
    parser.add_argument("--from-start", action="store_true", help="For local files, read existing rows before exiting.")
    parser.add_argument("--dry-run", action="store_true", help="Print correlated events instead of POSTing them.")
    args = parser.parse_args()

    settings = CorrelatorSettings(
        sensor_id=args.sensor_id,
        allowed_endpoints=set(args.allow_endpoint),
        require_both_endpoints=args.require_both_endpoints,
        correlation_timeout_seconds=args.correlation_timeout,
    )
    if args.zeek_ssh:
        run_ssh_tail(
            args.zeek_ssh,
            conn_log=args.conn_log,
            http_log=args.http_log,
            api_url=args.api_url,
            settings=settings,
            max_emitted_events=args.max_emitted_events,
            dry_run=args.dry_run,
            poll_interval=args.poll_interval,
            conn_batch_delay=args.conn_batch_delay,
        )
    else:
        run_local_files(
            conn_log=Path(args.conn_log),
            http_log=Path(args.http_log),
            api_url=args.api_url,
            settings=settings,
            max_emitted_events=args.max_emitted_events,
            dry_run=args.dry_run,
            from_start=args.from_start,
        )


@dataclass(frozen=True)
class CorrelatorSettings:
    sensor_id: str
    allowed_endpoints: set[str] = field(default_factory=set)
    require_both_endpoints: bool = False
    correlation_timeout_seconds: float = DEFAULT_CORRELATION_TIMEOUT_SECONDS


@dataclass
class HttpTransactionState:
    http: dict[str, Any]
    seen_at: float
    emitted_status: str = ""


@dataclass
class ConnectionState:
    flow: dict[str, Any] | None = None
    flow_seen_at: float = 0.0
    flow_emitted: bool = False
    http_transactions: dict[int, HttpTransactionState] = field(default_factory=dict)


class ZeekTransactionCorrelator:
    def __init__(self, settings: CorrelatorSettings) -> None:
        self.settings = settings
        self._connections: dict[str, ConnectionState] = {}

    def ingest_flow(self, flow: dict[str, Any], *, now: float | None = None) -> list[dict[str, Any]]:
        now = time.monotonic() if now is None else now
        if not self._keep_row(flow):
            return []
        uid = str(flow.get("uid") or "")
        if not uid:
            return []
        state = self._connections.setdefault(self._connection_key(uid), ConnectionState())
        state.flow = flow
        state.flow_seen_at = now
        events = []
        for transaction in state.http_transactions.values():
            event = self._build_transaction_event(uid, transaction.http, flow, correlation_status="combined")
            transaction.emitted_status = "combined"
            events.append(event)
        return events

    def ingest_http(self, http: dict[str, Any], *, now: float | None = None) -> list[dict[str, Any]]:
        now = time.monotonic() if now is None else now
        if not self._keep_row(http):
            return []
        uid = str(http.get("uid") or "")
        if not uid:
            return []
        trans_depth = _trans_depth(http)
        state = self._connections.setdefault(self._connection_key(uid), ConnectionState())
        transaction = state.http_transactions.setdefault(trans_depth, HttpTransactionState(http=http, seen_at=now))
        transaction.http = http
        transaction.seen_at = now
        if state.flow:
            transaction.emitted_status = "combined"
            return [self._build_transaction_event(uid, http, state.flow, correlation_status="combined")]
        return []

    def expire(self, *, now: float | None = None) -> list[dict[str, Any]]:
        now = time.monotonic() if now is None else now
        events: list[dict[str, Any]] = []
        for uid_key, state in list(self._connections.items()):
            uid = uid_key.split(":", 1)[1]
            has_http_transactions = bool(state.http_transactions)
            for transaction in state.http_transactions.values():
                if transaction.emitted_status:
                    continue
                if now - transaction.seen_at >= self.settings.correlation_timeout_seconds:
                    transaction.emitted_status = "http_only"
                    events.append(self._build_transaction_event(uid, transaction.http, None, correlation_status="http_only"))
            if state.flow and not has_http_transactions and not state.flow_emitted:
                if now - state.flow_seen_at >= self.settings.correlation_timeout_seconds:
                    state.flow_emitted = True
                    events.append(self._build_flow_event(uid, state.flow))
            if self._is_done(state, now):
                self._connections.pop(uid_key, None)
        return events

    def _connection_key(self, uid: str) -> str:
        return f"{self.settings.sensor_id}:{uid}"

    def _event_id(self, uid: str, trans_depth: int) -> str:
        return f"zeek:{self.settings.sensor_id}:{uid}:{trans_depth}"

    def _flow_event_id(self, uid: str) -> str:
        return f"zeek:{self.settings.sensor_id}:{uid}:flow"

    def _build_transaction_event(
        self,
        uid: str,
        http: dict[str, Any],
        flow: dict[str, Any] | None,
        *,
        correlation_status: str,
    ) -> dict[str, Any]:
        trans_depth = _trans_depth(http)
        event = ReplayEventBuilder().build(
            uid,
            flow=flow,
            http=http,
            event_id=self._event_id(uid, trans_depth),
            sensor_id=self.settings.sensor_id,
            transaction_id=f"{uid}:{trans_depth}",
            correlation_status=correlation_status,
        )
        if http.get("ts"):
            event["timestamp"] = _timestamp(http.get("ts"))
        return event

    def _build_flow_event(self, uid: str, flow: dict[str, Any]) -> dict[str, Any]:
        return ReplayEventBuilder().build(
            uid,
            flow=flow,
            event_id=self._flow_event_id(uid),
            sensor_id=self.settings.sensor_id,
            transaction_id=f"{uid}:flow",
            correlation_status="flow_only",
        )

    def _keep_row(self, row: dict[str, Any]) -> bool:
        if not self.settings.allowed_endpoints:
            return True
        endpoints = {str(row.get("source_ip") or ""), str(row.get("destination_ip") or "")}
        if self.settings.require_both_endpoints:
            return endpoints == self.settings.allowed_endpoints
        return endpoints <= self.settings.allowed_endpoints

    def _is_done(self, state: ConnectionState, now: float) -> bool:
        if state.flow and state.http_transactions:
            return all(transaction.emitted_status == "combined" for transaction in state.http_transactions.values())
        if state.flow and state.flow_emitted and now - state.flow_seen_at >= self.settings.correlation_timeout_seconds:
            return True
        if not state.flow and state.http_transactions:
            return False
        if state.http_transactions and all(transaction.emitted_status for transaction in state.http_transactions.values()):
            oldest = min(transaction.seen_at for transaction in state.http_transactions.values())
            return now - oldest >= self.settings.correlation_timeout_seconds
        return False


class TimedConnBatchState:
    def __init__(self) -> None:
        self.extractor = AI2AStreamingFlowFeatureExtractor()
        self.pending_ts: float | None = None
        self.pending: list[dict[str, Any]] = []
        self.updated_at: float = 0.0

    def push(self, flow: dict[str, Any], *, now: float | None = None) -> list[dict[str, Any]]:
        now = time.monotonic() if now is None else now
        ts = _numeric(flow.get("ts"))
        ready: list[dict[str, Any]] = []
        if self.pending and ts != self.pending_ts:
            ready = self.flush()
        self.pending_ts = ts
        self.pending.append(flow)
        self.updated_at = now
        return ready

    def flush_if_stale(self, *, now: float | None = None, max_age_seconds: float = DEFAULT_CONN_BATCH_DELAY_SECONDS) -> list[dict[str, Any]]:
        now = time.monotonic() if now is None else now
        if self.pending and now - self.updated_at >= max_age_seconds:
            return self.flush()
        return []

    def flush(self) -> list[dict[str, Any]]:
        if not self.pending:
            return []
        batch = self.pending
        self.pending = []
        self.pending_ts = None
        return self.extractor.enrich_batch(batch)


def run_local_files(
    *,
    conn_log: Path,
    http_log: Path,
    api_url: str,
    settings: CorrelatorSettings,
    max_emitted_events: int,
    dry_run: bool,
    from_start: bool,
) -> None:
    if not from_start:
        raise SystemExit("Local file mode requires --from-start. Use --zeek-ssh for live remote tailing.")
    correlator = ZeekTransactionCorrelator(settings)
    emitted = 0
    print(_json({"status": "correlated_tail_started", "mode": "local_files", "dry_run": dry_run}))
    for kind, row in _local_log_items(conn_log, http_log):
        if kind == "flow":
            events = correlator.ingest_flow(row, now=_numeric(row.get("ts")))
        else:
            events = correlator.ingest_http(row, now=_numeric(row.get("ts")))
        emitted = _emit_many(events, api_url=api_url, dry_run=dry_run, emitted=emitted, max_emitted_events=max_emitted_events)
        if max_emitted_events and emitted >= max_emitted_events:
            break
    if not max_emitted_events or emitted < max_emitted_events:
        events = correlator.expire(now=time.monotonic() + settings.correlation_timeout_seconds + 1)
        emitted = _emit_many(events, api_url=api_url, dry_run=dry_run, emitted=emitted, max_emitted_events=max_emitted_events)
    print(_json({"status": "correlated_tail_stopped", "emitted": emitted}))


def run_ssh_tail(
    zeek_ssh: str,
    *,
    conn_log: str,
    http_log: str,
    api_url: str,
    settings: CorrelatorSettings,
    max_emitted_events: int,
    dry_run: bool,
    poll_interval: float,
    conn_batch_delay: float,
) -> None:
    print(
        _json(
            {
                "status": "correlated_tail_started",
                "mode": "ssh",
                "zeek_ssh": zeek_ssh,
                "sensor_id": settings.sensor_id,
                "dry_run": dry_run,
            }
        )
    )
    lines: queue.Queue[tuple[str, dict[str, Any]]] = queue.Queue()
    stop = threading.Event()
    process = _start_ssh_multiplex_reader(zeek_ssh, conn_log, http_log, lines, stop)
    conn_state = TimedConnBatchState()
    correlator = ZeekTransactionCorrelator(settings)
    emitted = 0
    try:
        while not stop.is_set():
            try:
                kind, row = lines.get(timeout=poll_interval)
                if kind == "conn":
                    for flow in conn_state.push(row):
                        emitted = _emit_many(
                            correlator.ingest_flow(flow),
                            api_url=api_url,
                            dry_run=dry_run,
                            emitted=emitted,
                            max_emitted_events=max_emitted_events,
                        )
                else:
                    emitted = _emit_many(
                        correlator.ingest_http(row),
                        api_url=api_url,
                        dry_run=dry_run,
                        emitted=emitted,
                        max_emitted_events=max_emitted_events,
                    )
            except queue.Empty:
                pass
            for flow in conn_state.flush_if_stale(max_age_seconds=conn_batch_delay):
                emitted = _emit_many(
                    correlator.ingest_flow(flow),
                    api_url=api_url,
                    dry_run=dry_run,
                    emitted=emitted,
                    max_emitted_events=max_emitted_events,
                )
            emitted = _emit_many(
                correlator.expire(),
                api_url=api_url,
                dry_run=dry_run,
                emitted=emitted,
                max_emitted_events=max_emitted_events,
            )
            if max_emitted_events and emitted >= max_emitted_events:
                break
    except KeyboardInterrupt:
        pass
    finally:
        stop.set()
        process.terminate()
        print(_json({"status": "correlated_tail_stopped", "emitted": emitted}))


def _start_ssh_multiplex_reader(
    zeek_ssh: str,
    conn_log: str,
    http_log: str,
    lines: queue.Queue[tuple[str, dict[str, Any]]],
    stop: threading.Event,
) -> subprocess.Popen[str]:
    remote = (
        f"(grep '^#fields' {shlex.quote(conn_log)}; tail -n 0 -F {shlex.quote(conn_log)}) "
        "| sed -u 's/^/__AI2B_CONN__|/' & "
        f"(grep '^#fields' {shlex.quote(http_log)}; tail -n 0 -F {shlex.quote(http_log)}) "
        "| sed -u 's/^/__AI2B_HTTP__|/' & "
        "wait"
    )
    process = subprocess.Popen(  # noqa: S603 - command is fixed argv and used for local lab SSH streaming.
        ["ssh", zeek_ssh, remote],
        stdout=subprocess.PIPE,
        stderr=None,
        text=True,
        encoding="utf-8",
    )

    def read_stdout() -> None:
        fields_by_kind: dict[str, list[str] | None] = {"conn": None, "http": None}
        assert process.stdout is not None
        for raw_line in process.stdout:
            if stop.is_set():
                break
            kind, payload = _split_multiplexed_line(raw_line)
            if not kind:
                continue
            row, fields = parse_zeek_line(payload, fields_by_kind[kind])
            fields_by_kind[kind] = fields
            if row is None:
                continue
            normalized = normalize_conn_row(row) if kind == "conn" else normalize_http_row(row)
            lines.put((kind, normalized))

    threading.Thread(target=read_stdout, daemon=True).start()
    return process


def _split_multiplexed_line(raw_line: str) -> tuple[str | None, str]:
    if raw_line.startswith("__AI2B_CONN__|"):
        return "conn", raw_line.removeprefix("__AI2B_CONN__|")
    if raw_line.startswith("__AI2B_HTTP__|"):
        return "http", raw_line.removeprefix("__AI2B_HTTP__|")
    return None, raw_line


def _local_log_items(conn_log: Path, http_log: Path) -> list[tuple[str, dict[str, Any]]]:
    conn_state = TimedConnBatchState()
    items: list[tuple[str, dict[str, Any]]] = []
    conn_fields: list[str] | None = None
    for line in conn_log.read_text(encoding="utf-8").splitlines():
        row, conn_fields = parse_zeek_line(line, conn_fields)
        if row is None:
            continue
        for flow in conn_state.push(normalize_conn_row(row), now=_numeric(row.get("ts"))):
            items.append(("flow", flow))
    for flow in conn_state.flush():
        items.append(("flow", flow))

    http_fields: list[str] | None = None
    for line in http_log.read_text(encoding="utf-8").splitlines():
        row, http_fields = parse_zeek_line(line, http_fields)
        if row is None:
            continue
        items.append(("http", normalize_http_row(row)))
    return sorted(items, key=lambda item: (_numeric(item[1].get("ts")), 0 if item[0] == "flow" else 1))


def _emit_many(
    events: list[dict[str, Any]],
    *,
    api_url: str,
    dry_run: bool,
    emitted: int,
    max_emitted_events: int,
) -> int:
    count = emitted
    for event in events:
        if max_emitted_events and count >= max_emitted_events:
            return count
        if dry_run:
            print(_json({"status": "dry_run_event", "event": event}))
        else:
            post_event(api_url, event)
            print(
                _json(
                    {
                        "status": "posted",
                        "event_id": event["event_id"],
                        "event_type": event["event_type"],
                        "correlation_status": event.get("correlation_status"),
                        "transaction_id": event.get("transaction_id"),
                        "uri": (event.get("evidence") or {}).get("http", {}).get("uri"),
                    }
                )
            )
        count += 1
    return count


def post_event(api_url: str, event: dict[str, Any]) -> None:
    payload = json.dumps(event).encode("utf-8")
    request = Request(api_url, data=payload, method="POST")
    request.add_header("Content-Type", "application/json")
    try:
        with urlopen(request, timeout=10) as response:  # noqa: S310 - local lab API endpoint.
            response.read()
    except URLError as exc:
        raise RuntimeError(f"Failed to POST event to {api_url}: {exc}") from exc


def _trans_depth(http: dict[str, Any]) -> int:
    try:
        return int(http.get("trans_depth") or 1)
    except (TypeError, ValueError):
        return 1


def _numeric(value: object, default: float = 0.0) -> float:
    if value is None or value == "-":
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _timestamp(value: object) -> str:
    from datetime import datetime, timezone

    try:
        return datetime.fromtimestamp(float(value), tz=timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    except (TypeError, ValueError, OSError):
        return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _json(payload: dict[str, Any]) -> str:
    return json.dumps(payload, sort_keys=True)


if __name__ == "__main__":
    main()
