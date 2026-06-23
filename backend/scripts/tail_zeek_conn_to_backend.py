from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path
from typing import TextIO
from urllib.error import URLError
from urllib.request import Request, urlopen

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.replay import AI2AStreamingFlowFeatureExtractor  # noqa: E402
from app.replay.zeek import ReplayEventBuilder, normalize_conn_row, parse_zeek_line  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Tail Zeek conn.log and POST new AI2A flow events to the backend API.")
    parser.add_argument("--conn-log", required=True, help="Path to live Zeek conn.log, or '-' to read from stdin.")
    parser.add_argument("--api-url", default="http://localhost:8000/api/events")
    parser.add_argument("--poll-interval", type=float, default=0.5)
    parser.add_argument("--limit", type=int, default=0, help="Stop after N emitted events; 0 means no limit.")
    parser.add_argument("--from-start", action="store_true", help="Read existing rows before following new rows.")
    parser.add_argument("--dry-run", action="store_true", help="Print events instead of POSTing them.")
    args = parser.parse_args()

    tail_conn_log(
        args.conn_log,
        api_url=args.api_url,
        poll_interval=args.poll_interval,
        limit=args.limit,
        from_start=args.from_start,
        dry_run=args.dry_run,
    )


def tail_conn_log(
    conn_log: str,
    *,
    api_url: str,
    poll_interval: float,
    limit: int,
    from_start: bool,
    dry_run: bool,
) -> None:
    input_label = "stdin" if conn_log == "-" else str(conn_log)
    fields = None if conn_log == "-" else _load_fields(Path(conn_log))
    print(
        json.dumps(
            {
                "status": "tail_started",
                "conn_log": input_label,
                "api_url": api_url,
                "from_start": from_start,
                "dry_run": dry_run,
            },
            sort_keys=True,
        ),
        flush=True,
    )
    state = StreamingConnTailState()
    if conn_log == "-":
        emitted = _consume_lines(
            sys.stdin,
            fields=fields,
            state=state,
            api_url=api_url,
            limit=limit,
            dry_run=dry_run,
            wait_for_more=False,
            poll_interval=poll_interval,
        )
    else:
        with Path(conn_log).open("r", encoding="utf-8") as handle:
            if not from_start:
                handle.seek(0, 2)
            emitted = _consume_lines(
                handle,
                fields=fields,
                state=state,
                api_url=api_url,
                limit=limit,
                dry_run=dry_run,
                wait_for_more=True,
                poll_interval=poll_interval,
            )
    print(json.dumps({"status": "tail_stopped", "emitted": emitted}, sort_keys=True), flush=True)


class StreamingConnTailState:
    def __init__(self) -> None:
        self.extractor = AI2AStreamingFlowFeatureExtractor()
        self.pending_ts: float | None = None
        self.pending: list[dict] = []

    def push(self, flow: dict) -> list[dict]:
        ts = _numeric(flow.get("ts"))
        ready: list[dict] = []
        if self.pending and ts != self.pending_ts:
            ready = self.flush()
        self.pending_ts = ts
        self.pending.append(flow)
        return ready

    def flush(self) -> list[dict]:
        if not self.pending:
            return []
        batch = self.pending
        self.pending = []
        self.pending_ts = None
        return self.extractor.enrich_batch(batch)


def _consume_lines(
    handle: TextIO,
    *,
    fields: list[str] | None,
    state: StreamingConnTailState,
    api_url: str,
    limit: int,
    dry_run: bool,
    wait_for_more: bool,
    poll_interval: float,
) -> int:
    emitted = 0
    while True:
        raw_line = handle.readline()
        if not raw_line:
            if wait_for_more:
                time.sleep(poll_interval)
                continue
            for flow in state.flush():
                if _emit_flow(flow, api_url=api_url, dry_run=dry_run, sequence=emitted + 1):
                    emitted += 1
                    if limit and emitted >= limit:
                        return emitted
            break
        row, fields = parse_zeek_line(raw_line, fields)
        if row is None:
            continue
        flow = normalize_conn_row(row)
        for ready_flow in state.push(flow):
            if _emit_flow(ready_flow, api_url=api_url, dry_run=dry_run, sequence=emitted + 1):
                emitted += 1
                if limit and emitted >= limit:
                    for final_flow in state.flush():
                        if _emit_flow(final_flow, api_url=api_url, dry_run=dry_run, sequence=emitted + 1):
                            emitted += 1
                            if limit and emitted >= limit:
                                return emitted
                    return emitted
    return emitted


def _emit_flow(flow: dict, *, api_url: str, dry_run: bool, sequence: int) -> bool:
    event = build_conn_event(flow, sequence=sequence)
    if dry_run:
        print(json.dumps({"status": "dry_run_event", "event": event}, sort_keys=True), flush=True)
    else:
        post_event(api_url, event)
        print(
            json.dumps(
                {
                    "status": "posted",
                    "event_id": event["event_id"],
                    "service": event["evidence"]["flow"].get("service"),
                    "dst_port": event["evidence"]["flow"].get("dst_port"),
                },
                sort_keys=True,
            ),
            flush=True,
        )
    return True


def build_conn_event(flow: dict, *, sequence: int) -> dict:
    uid = flow.get("uid") or f"conn-tail-{sequence}"
    return ReplayEventBuilder().build(str(uid), flow=flow)


def post_event(api_url: str, event: dict) -> None:
    payload = json.dumps(event).encode("utf-8")
    request = Request(api_url, data=payload, method="POST")
    request.add_header("Content-Type", "application/json")
    try:
        with urlopen(request, timeout=10) as response:  # noqa: S310 - local lab API endpoint.
            response.read()
    except URLError as exc:
        raise RuntimeError(f"Failed to POST event to {api_url}: {exc}") from exc


def _load_fields(conn_log: Path) -> list[str] | None:
    fields: list[str] | None = None
    if not conn_log.exists():
        raise FileNotFoundError(f"Zeek conn.log does not exist: {conn_log}")
    with conn_log.open("r", encoding="utf-8") as handle:
        for line in handle:
            _, fields = parse_zeek_line(line, fields)
    return fields


def _numeric(value: object, default: float = 0.0) -> float:
    if value is None or value == "-":
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


if __name__ == "__main__":
    main()
