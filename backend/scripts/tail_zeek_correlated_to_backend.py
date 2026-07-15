from __future__ import annotations

import argparse
import hashlib
import hmac
import json
import math
import os
import queue
import shlex
import sqlite3
import subprocess
import sys
import threading
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any
from urllib.parse import urlparse
from urllib.request import Request, urlopen

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.replay import (  # noqa: E402
    DEFAULT_DDOS_DESTINATION_THRESHOLD,
    DEFAULT_DDOS_UNIQUE_SOURCES_THRESHOLD,
    DEFAULT_DOS_SAME_SRC_DST_THRESHOLD,
    DEFAULT_NETWORK_RATE_WINDOW_SECONDS,
    AI2AStreamingFlowFeatureExtractor,
    NetworkRateFeatureExtractor,
)
from app.replay.zeek import ReplayEventBuilder, normalize_conn_row, normalize_http_row, parse_zeek_line  # noqa: E402


DEFAULT_CORRELATION_TIMEOUT_SECONDS = 5.0
DEFAULT_CONN_BATCH_DELAY_SECONDS = 0.5
DEFAULT_HEARTBEAT_INTERVAL_SECONDS = 30.0
DEFAULT_SSH_RECONNECT_DELAY_SECONDS = 5.0
DEFAULT_POST_ATTEMPTS = 1
DEFAULT_POST_RETRY_DELAY_SECONDS = 1.0
DEFAULT_POST_MAX_RETRY_DELAY_SECONDS = 30.0
DEFAULT_OUTBOX_DRAIN_BATCH_SIZE = 25
DEFAULT_OUTBOX_MAX_BACKOFF_SECONDS = 60.0
MIN_OUTBOX_RETRY_DELAY_SECONDS = 1.0


def default_outbox_path() -> Path:
    configured = os.getenv("ZEEK_COLLECTOR_OUTBOX_PATH")
    if configured:
        return Path(configured).expanduser()
    state_root = os.getenv("XDG_STATE_HOME")
    base = Path(state_root).expanduser() if state_root else Path.home() / ".local" / "state"
    return base / "hybrid-soc" / "zeek-collector-outbox.sqlite3"


def main() -> None:
    parser = argparse.ArgumentParser(description="Tail Zeek conn/http logs, correlate by UID transaction, and POST events.")
    parser.add_argument("--conn-log", required=True, help="Path to Zeek conn.log on local host or remote Zeek VM.")
    parser.add_argument("--http-log", required=True, help="Path to Zeek http.log on local host or remote Zeek VM.")
    parser.add_argument("--api-url", default="http://localhost:8000/api/events")
    parser.add_argument("--zeek-ssh", default="", help="Optional SSH target, for example zeek@192.168.17.20.")
    parser.add_argument("--sensor-id", default="zeek-vm-01")
    parser.add_argument(
        "--allow-endpoint",
        action="append",
        default=[],
        help="Keep rows where either endpoint matches this IP; repeat to allow more IPs.",
    )
    parser.add_argument(
        "--require-both-endpoints",
        action="store_true",
        help="Require the row's complete endpoint pair to exactly match the allowed endpoint set.",
    )
    parser.add_argument("--correlation-timeout", type=float, default=DEFAULT_CORRELATION_TIMEOUT_SECONDS)
    parser.add_argument("--conn-batch-delay", type=float, default=DEFAULT_CONN_BATCH_DELAY_SECONDS)
    parser.add_argument(
        "--network-rate-window",
        type=float,
        default=DEFAULT_NETWORK_RATE_WINDOW_SECONDS,
        help="Seconds of Zeek connections used to calculate DoS/DDoS rate features.",
    )
    parser.add_argument(
        "--dos-same-src-dst-threshold",
        type=int,
        default=DEFAULT_DOS_SAME_SRC_DST_THRESHOLD,
        help="Same-source-to-destination connections in the rate window that indicate DoS.",
    )
    parser.add_argument(
        "--ddos-destination-threshold",
        type=int,
        default=DEFAULT_DDOS_DESTINATION_THRESHOLD,
        help="Total destination connections in the rate window required to indicate DDoS.",
    )
    parser.add_argument(
        "--ddos-unique-sources-threshold",
        type=int,
        default=DEFAULT_DDOS_UNIQUE_SOURCES_THRESHOLD,
        help="Unique sources in the rate window required to indicate DDoS.",
    )
    parser.add_argument("--poll-interval", type=float, default=0.25)
    parser.add_argument(
        "--heartbeat-interval",
        type=float,
        default=DEFAULT_HEARTBEAT_INTERVAL_SECONDS,
        help="Print a health record every N seconds while idle; 0 disables heartbeats.",
    )
    parser.add_argument(
        "--ssh-reconnect-delay",
        type=float,
        default=DEFAULT_SSH_RECONNECT_DELAY_SECONDS,
        help="Seconds to wait before reconnecting a closed SSH stream.",
    )
    parser.add_argument(
        "--post-attempts",
        type=int,
        default=DEFAULT_POST_ATTEMPTS,
        help="Maximum API POST attempts in one delivery cycle; failures remain in the durable outbox.",
    )
    parser.add_argument(
        "--post-retry-delay",
        type=float,
        default=DEFAULT_POST_RETRY_DELAY_SECONDS,
        help="Initial seconds between failed API POST attempts (exponential backoff).",
    )
    parser.add_argument(
        "--post-max-retry-delay",
        type=float,
        default=DEFAULT_POST_MAX_RETRY_DELAY_SECONDS,
        help="Maximum seconds between API POST attempts in one delivery cycle.",
    )
    parser.add_argument(
        "--outbox-path",
        default=str(default_outbox_path()),
        help="Persistent SQLite outbox path (or set ZEEK_COLLECTOR_OUTBOX_PATH).",
    )
    parser.add_argument(
        "--outbox-drain-batch-size",
        type=int,
        default=DEFAULT_OUTBOX_DRAIN_BATCH_SIZE,
        help="Maximum queued events attempted in one outbox drain cycle.",
    )
    parser.add_argument(
        "--outbox-max-backoff",
        type=float,
        default=DEFAULT_OUTBOX_MAX_BACKOFF_SECONDS,
        help="Maximum seconds before a retained outbox event becomes eligible for another delivery cycle.",
    )
    parser.add_argument("--max-emitted-events", type=int, default=0, help="Stop after N emitted events; 0 means no limit.")
    parser.add_argument("--from-start", action="store_true", help="For local files, read existing rows before exiting.")
    parser.add_argument("--dry-run", action="store_true", help="Print correlated events instead of POSTing them.")
    args = parser.parse_args()

    settings = CorrelatorSettings(
        sensor_id=args.sensor_id,
        allowed_endpoints=set(args.allow_endpoint),
        require_both_endpoints=args.require_both_endpoints,
        correlation_timeout_seconds=args.correlation_timeout,
        network_rate_window_seconds=args.network_rate_window,
        dos_same_src_dst_threshold=args.dos_same_src_dst_threshold,
        ddos_destination_threshold=args.ddos_destination_threshold,
        ddos_unique_sources_threshold=args.ddos_unique_sources_threshold,
    )
    outbox: SQLiteEventOutbox | None = None
    try:
        if not args.dry_run:
            outbox = SQLiteEventOutbox(Path(args.outbox_path))
            _print_status(
                _json(
                    {
                        "status": "outbox_ready",
                        "outbox_path": str(outbox.path),
                        "pending": outbox.count(),
                        "retry_in_seconds": outbox.delivery_retry_in(),
                    }
                )
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
                heartbeat_interval=args.heartbeat_interval,
                ssh_reconnect_delay=args.ssh_reconnect_delay,
                post_attempts=args.post_attempts,
                post_retry_delay=args.post_retry_delay,
                post_max_retry_delay=args.post_max_retry_delay,
                outbox=outbox,
                outbox_drain_batch_size=args.outbox_drain_batch_size,
                outbox_max_backoff=args.outbox_max_backoff,
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
                post_attempts=args.post_attempts,
                post_retry_delay=args.post_retry_delay,
                post_max_retry_delay=args.post_max_retry_delay,
                outbox=outbox,
                outbox_drain_batch_size=args.outbox_drain_batch_size,
                outbox_max_backoff=args.outbox_max_backoff,
            )
    except OutboxPersistenceError as exc:
        _print_exception("collector_fatal_outbox_error", exc)
        raise SystemExit(2) from exc
    finally:
        if outbox is not None:
            outbox.close()


@dataclass(frozen=True)
class CorrelatorSettings:
    sensor_id: str
    allowed_endpoints: set[str] = field(default_factory=set)
    require_both_endpoints: bool = False
    correlation_timeout_seconds: float = DEFAULT_CORRELATION_TIMEOUT_SECONDS
    network_rate_window_seconds: float = DEFAULT_NETWORK_RATE_WINDOW_SECONDS
    dos_same_src_dst_threshold: int = DEFAULT_DOS_SAME_SRC_DST_THRESHOLD
    ddos_destination_threshold: int = DEFAULT_DDOS_DESTINATION_THRESHOLD
    ddos_unique_sources_threshold: int = DEFAULT_DDOS_UNIQUE_SOURCES_THRESHOLD


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


class OutboxPersistenceError(RuntimeError):
    """The collector cannot safely persist or read an event."""


class OutboxConflictError(OutboxPersistenceError):
    """An event ID was reused for a different immutable payload."""


class EventSerializationError(OutboxPersistenceError, ValueError):
    """An event cannot be represented as strict JSON."""


class UnexpectedBackendStatus(RuntimeError):
    """The backend responded, but did not explicitly accept the event."""


@dataclass(frozen=True)
class OutboxEvent:
    event_id: str
    event: dict[str, Any]
    attempts: int


@dataclass(frozen=True)
class OutboxDrainResult:
    delivered: int = 0
    deferred: int = 0
    circuit_open: bool = False
    retry_in_seconds: float = 0.0


class SQLiteEventOutbox:
    def __init__(self, path: Path) -> None:
        self.path = path.expanduser().resolve()
        parent_existed = self.path.parent.exists()
        try:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            if not parent_existed:
                os.chmod(self.path.parent, 0o700)
            self._connection = sqlite3.connect(self.path, timeout=10.0)
            self._connection.row_factory = sqlite3.Row
            self._connection.execute("PRAGMA journal_mode=WAL")
            self._connection.execute("PRAGMA synchronous=FULL")
            self._connection.execute("PRAGMA busy_timeout=10000")
            self._connection.execute(
                """
                CREATE TABLE IF NOT EXISTS event_outbox (
                    event_id TEXT PRIMARY KEY,
                    payload_json TEXT NOT NULL,
                    created_at REAL NOT NULL,
                    attempts INTEGER NOT NULL DEFAULT 0,
                    next_attempt_at REAL NOT NULL DEFAULT 0,
                    last_error TEXT
                )
                """
            )
            self._connection.execute(
                """
                CREATE TABLE IF NOT EXISTS delivery_state (
                    singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
                    consecutive_failures INTEGER NOT NULL DEFAULT 0,
                    next_delivery_at REAL NOT NULL DEFAULT 0,
                    last_error TEXT
                )
                """
            )
            self._connection.execute(
                """
                CREATE TABLE IF NOT EXISTS event_identity (
                    event_id TEXT PRIMARY KEY,
                    payload_sha256 TEXT NOT NULL,
                    first_seen_at REAL NOT NULL
                )
                """
            )
            self._connection.execute(
                """
                INSERT OR IGNORE INTO delivery_state (
                    singleton, consecutive_failures, next_delivery_at, last_error
                ) VALUES (1, 0, 0, NULL)
                """
            )
            for pending_row in self._connection.execute(
                "SELECT event_id, payload_json, created_at FROM event_outbox"
            ).fetchall():
                payload_sha256 = _payload_sha256(pending_row["payload_json"])
                identity = self._connection.execute(
                    "SELECT payload_sha256 FROM event_identity WHERE event_id = ?",
                    (pending_row["event_id"],),
                ).fetchone()
                if identity is not None and identity["payload_sha256"] != payload_sha256:
                    raise OutboxConflictError(
                        f"Outbox identity ledger conflicts with pending event {pending_row['event_id']!r}"
                    )
                self._connection.execute(
                    """
                    INSERT OR IGNORE INTO event_identity (event_id, payload_sha256, first_seen_at)
                    VALUES (?, ?, ?)
                    """,
                    (pending_row["event_id"], payload_sha256, pending_row["created_at"]),
                )
            self._connection.commit()
            try:
                os.chmod(self.path, 0o600)
            except OSError:
                pass
        except OutboxPersistenceError:
            if hasattr(self, "_connection"):
                self._connection.close()
            raise
        except (OSError, sqlite3.Error) as exc:
            if hasattr(self, "_connection"):
                self._connection.close()
            raise OutboxPersistenceError(f"Cannot initialize SQLite outbox at {self.path}: {exc}") from exc

    def close(self) -> None:
        try:
            self._connection.close()
        except sqlite3.Error as exc:
            raise OutboxPersistenceError(f"Cannot close SQLite outbox at {self.path}: {exc}") from exc

    def enqueue(self, event: dict[str, Any]) -> bool:
        event_id = event.get("event_id")
        if not isinstance(event_id, str) or not event_id.strip():
            raise EventSerializationError("Outbox event_id must be a non-empty string")
        payload_json = _serialize_event(event)
        payload_sha256 = _payload_sha256(payload_json)
        created_at = time.time()
        try:
            with self._connection:
                identity = self._connection.execute(
                    "SELECT payload_sha256 FROM event_identity WHERE event_id = ?",
                    (event_id,),
                ).fetchone()
                if identity is not None and identity["payload_sha256"] != payload_sha256:
                    raise OutboxConflictError(
                        f"Outbox event_id {event_id!r} was previously registered with a different payload"
                    )
                self._connection.execute(
                    """
                    INSERT OR IGNORE INTO event_identity (event_id, payload_sha256, first_seen_at)
                    VALUES (?, ?, ?)
                    """,
                    (event_id, payload_sha256, created_at),
                )
                existing = self._connection.execute(
                    "SELECT payload_json FROM event_outbox WHERE event_id = ?",
                    (event_id,),
                ).fetchone()
                if existing is not None:
                    if existing["payload_json"] != payload_json:
                        raise OutboxConflictError(
                            f"Outbox event_id {event_id!r} already exists with a different payload"
                        )
                    return False
                self._connection.execute(
                    """
                    INSERT INTO event_outbox (
                        event_id, payload_json, created_at, attempts, next_attempt_at, last_error
                    ) VALUES (?, ?, ?, 0, 0, NULL)
                    """,
                    (event_id, payload_json, created_at),
                )
        except OutboxConflictError:
            raise
        except sqlite3.Error as exc:
            raise OutboxPersistenceError(f"Cannot persist event {event_id!r} in outbox: {exc}") from exc
        return True

    def pending(self, *, limit: int, force: bool = False, now: float | None = None) -> list[OutboxEvent]:
        wall_clock = time.time() if now is None else now
        where = "1 = 1" if force else "next_attempt_at <= ?"
        parameters: tuple[object, ...] = () if force else (wall_clock,)
        try:
            rows = self._connection.execute(
                f"""
                SELECT event_id, payload_json, attempts
                FROM event_outbox
                WHERE {where}
                ORDER BY created_at ASC, event_id ASC
                LIMIT ?
                """,  # noqa: S608 - where is selected from two fixed internal strings.
                (*parameters, max(1, int(limit))),
            ).fetchall()
        except sqlite3.Error as exc:
            raise OutboxPersistenceError(f"Cannot read pending events from outbox: {exc}") from exc

        pending: list[OutboxEvent] = []
        for row in rows:
            try:
                event = json.loads(row["payload_json"], parse_constant=_reject_json_constant)
            except (TypeError, ValueError, json.JSONDecodeError) as exc:
                raise OutboxPersistenceError(
                    f"Outbox payload for event {row['event_id']!r} is not valid strict JSON: {exc}"
                ) from exc
            if not isinstance(event, dict):
                raise OutboxPersistenceError(f"Outbox payload for event {row['event_id']!r} is not a JSON object")
            pending.append(OutboxEvent(event_id=row["event_id"], event=event, attempts=int(row["attempts"])))
        return pending

    def mark_delivered(self, event_id: str) -> None:
        try:
            with self._connection:
                cursor = self._connection.execute("DELETE FROM event_outbox WHERE event_id = ?", (event_id,))
                if cursor.rowcount != 1:
                    raise OutboxPersistenceError(
                        f"Cannot acknowledge event {event_id!r}: it is no longer present in the outbox"
                    )
                self._connection.execute(
                    """
                    UPDATE delivery_state
                    SET consecutive_failures = 0, next_delivery_at = 0, last_error = NULL
                    WHERE singleton = 1
                    """
                )
        except OutboxPersistenceError:
            raise
        except sqlite3.Error as exc:
            raise OutboxPersistenceError(f"Cannot acknowledge delivered event {event_id!r}: {exc}") from exc

    def record_failure(
        self,
        event_id: str,
        exc: Exception,
        *,
        base_delay: float,
        max_backoff: float,
    ) -> tuple[int, int, float]:
        try:
            with self._connection:
                row = self._connection.execute(
                    "SELECT attempts FROM event_outbox WHERE event_id = ?",
                    (event_id,),
                ).fetchone()
                if row is None:
                    raise OutboxPersistenceError(
                        f"Cannot defer event {event_id!r}: it is no longer present in the outbox"
                    )
                event_attempt = int(row["attempts"]) + 1
                state = self._connection.execute(
                    "SELECT consecutive_failures FROM delivery_state WHERE singleton = 1"
                ).fetchone()
                if state is None:
                    raise OutboxPersistenceError("Outbox delivery state is missing")
                circuit_failures = int(state["consecutive_failures"]) + 1
                initial_delay = max(MIN_OUTBOX_RETRY_DELAY_SECONDS, base_delay)
                ceiling = max(MIN_OUTBOX_RETRY_DELAY_SECONDS, max_backoff)
                event_retry = min(ceiling, initial_delay * (2 ** min(event_attempt - 1, 16)))
                circuit_retry = min(ceiling, initial_delay * (2 ** min(circuit_failures - 1, 16)))
                retry_in = max(event_retry, circuit_retry)
                next_delivery_at = time.time() + retry_in
                self._connection.execute(
                    """
                    UPDATE event_outbox
                    SET attempts = ?, next_attempt_at = ?, last_error = ?
                    WHERE event_id = ?
                    """,
                    (event_attempt, next_delivery_at, str(exc)[:2000], event_id),
                )
                self._connection.execute(
                    """
                    UPDATE delivery_state
                    SET consecutive_failures = ?, next_delivery_at = ?, last_error = ?
                    WHERE singleton = 1
                    """,
                    (circuit_failures, next_delivery_at, str(exc)[:2000]),
                )
        except OutboxPersistenceError:
            raise
        except sqlite3.Error as db_exc:
            raise OutboxPersistenceError(f"Cannot defer outbox event {event_id!r}: {db_exc}") from db_exc
        return event_attempt, circuit_failures, retry_in

    def delivery_retry_in(self, *, now: float | None = None) -> float:
        wall_clock = time.time() if now is None else now
        try:
            row = self._connection.execute(
                "SELECT next_delivery_at FROM delivery_state WHERE singleton = 1"
            ).fetchone()
        except sqlite3.Error as exc:
            raise OutboxPersistenceError(f"Cannot read outbox delivery state: {exc}") from exc
        if row is None:
            raise OutboxPersistenceError("Outbox delivery state is missing")
        return max(0.0, float(row["next_delivery_at"]) - wall_clock)

    def count(self) -> int:
        try:
            row = self._connection.execute("SELECT COUNT(*) AS count FROM event_outbox").fetchone()
        except sqlite3.Error as exc:
            raise OutboxPersistenceError(f"Cannot count pending outbox events: {exc}") from exc
        return int(row["count"])


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

    def _transaction_correlation_id(self, uid: str, trans_depth: int) -> str:
        return f"zeek:{self.settings.sensor_id}:{uid}:{trans_depth}"

    def _flow_correlation_id(self, uid: str) -> str:
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
        correlation_id = self._transaction_correlation_id(uid, trans_depth)
        event = ReplayEventBuilder().build(
            uid,
            flow=flow,
            http=http,
            event_id=correlation_id,
            sensor_id=self.settings.sensor_id,
            transaction_id=f"{uid}:{trans_depth}",
            correlation_status=correlation_status,
        )
        event["correlation_id"] = correlation_id
        if http.get("ts"):
            event["timestamp"] = _timestamp(http.get("ts"))
        event["event_id"] = _immutable_event_id(correlation_id, event)
        return event

    def _build_flow_event(self, uid: str, flow: dict[str, Any]) -> dict[str, Any]:
        correlation_id = self._flow_correlation_id(uid)
        event = ReplayEventBuilder().build(
            uid,
            flow=flow,
            event_id=correlation_id,
            sensor_id=self.settings.sensor_id,
            transaction_id=f"{uid}:flow",
            correlation_status="flow_only",
        )
        event["correlation_id"] = correlation_id
        event["event_id"] = _immutable_event_id(correlation_id, event)
        return event

    def _keep_row(self, row: dict[str, Any]) -> bool:
        if not self.settings.allowed_endpoints:
            return True
        endpoints = {str(row.get("source_ip") or ""), str(row.get("destination_ip") or "")}
        if self.settings.require_both_endpoints:
            return endpoints == self.settings.allowed_endpoints
        return bool(endpoints & self.settings.allowed_endpoints)

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
    def __init__(
        self,
        *,
        network_rate_window_seconds: float = DEFAULT_NETWORK_RATE_WINDOW_SECONDS,
        dos_same_src_dst_threshold: int = DEFAULT_DOS_SAME_SRC_DST_THRESHOLD,
        ddos_destination_threshold: int = DEFAULT_DDOS_DESTINATION_THRESHOLD,
        ddos_unique_sources_threshold: int = DEFAULT_DDOS_UNIQUE_SOURCES_THRESHOLD,
    ) -> None:
        self.extractor = AI2AStreamingFlowFeatureExtractor()
        self.network_rate_extractor = NetworkRateFeatureExtractor(
            window_seconds=network_rate_window_seconds,
            dos_same_src_dst_threshold=dos_same_src_dst_threshold,
            ddos_destination_threshold=ddos_destination_threshold,
            ddos_unique_sources_threshold=ddos_unique_sources_threshold,
        )
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
        ai2a_enriched = self.extractor.enrich_batch(batch)
        return self.network_rate_extractor.enrich_batch(ai2a_enriched)


def run_local_files(
    *,
    conn_log: Path,
    http_log: Path,
    api_url: str,
    settings: CorrelatorSettings,
    max_emitted_events: int,
    dry_run: bool,
    from_start: bool,
    post_attempts: int = DEFAULT_POST_ATTEMPTS,
    post_retry_delay: float = DEFAULT_POST_RETRY_DELAY_SECONDS,
    post_max_retry_delay: float = DEFAULT_POST_MAX_RETRY_DELAY_SECONDS,
    outbox: SQLiteEventOutbox | None = None,
    outbox_drain_batch_size: int = DEFAULT_OUTBOX_DRAIN_BATCH_SIZE,
    outbox_max_backoff: float = DEFAULT_OUTBOX_MAX_BACKOFF_SECONDS,
) -> None:
    if not from_start:
        raise SystemExit("Local file mode requires --from-start. Use --zeek-ssh for live remote tailing.")
    if not dry_run and outbox is None:
        raise OutboxPersistenceError("Live delivery requires a persistent SQLite outbox")
    correlator = ZeekTransactionCorrelator(settings)
    emitted = 0
    print(_json({"status": "correlated_tail_started", "mode": "local_files", "dry_run": dry_run}))
    if outbox is not None:
        startup_limit = _delivery_limit(max_emitted_events, emitted, outbox_drain_batch_size)
        if startup_limit:
            result = drain_outbox(
                outbox,
                api_url=api_url,
                post_attempts=post_attempts,
                post_retry_delay=post_retry_delay,
                post_max_retry_delay=post_max_retry_delay,
                max_backoff=outbox_max_backoff,
                limit=startup_limit,
            )
            emitted += result.delivered
    for kind, row in _local_log_items(conn_log, http_log, settings=settings):
        if kind == "flow":
            events = correlator.ingest_flow(row, now=_numeric(row.get("ts")))
        else:
            events = correlator.ingest_http(row, now=_numeric(row.get("ts")))
        emitted = _emit_many(
            events,
            api_url=api_url,
            dry_run=dry_run,
            emitted=emitted,
            max_emitted_events=max_emitted_events,
            post_attempts=post_attempts,
            post_retry_delay=post_retry_delay,
            post_max_retry_delay=post_max_retry_delay,
            outbox=outbox,
            outbox_drain_batch_size=outbox_drain_batch_size,
            outbox_max_backoff=outbox_max_backoff,
        )
        if max_emitted_events and emitted >= max_emitted_events:
            break
    if not max_emitted_events or emitted < max_emitted_events:
        events = correlator.expire(now=time.monotonic() + settings.correlation_timeout_seconds + 1)
        emitted = _emit_many(
            events,
            api_url=api_url,
            dry_run=dry_run,
            emitted=emitted,
            max_emitted_events=max_emitted_events,
            post_attempts=post_attempts,
            post_retry_delay=post_retry_delay,
            post_max_retry_delay=post_max_retry_delay,
            outbox=outbox,
            outbox_drain_batch_size=outbox_drain_batch_size,
            outbox_max_backoff=outbox_max_backoff,
        )
    print(
        _json(
            {
                "status": "correlated_tail_stopped",
                "emitted": emitted,
                "outbox_pending": outbox.count() if outbox is not None else 0,
            }
        )
    )


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
    heartbeat_interval: float = DEFAULT_HEARTBEAT_INTERVAL_SECONDS,
    ssh_reconnect_delay: float = DEFAULT_SSH_RECONNECT_DELAY_SECONDS,
    post_attempts: int = DEFAULT_POST_ATTEMPTS,
    post_retry_delay: float = DEFAULT_POST_RETRY_DELAY_SECONDS,
    post_max_retry_delay: float = DEFAULT_POST_MAX_RETRY_DELAY_SECONDS,
    outbox: SQLiteEventOutbox | None = None,
    outbox_drain_batch_size: int = DEFAULT_OUTBOX_DRAIN_BATCH_SIZE,
    outbox_max_backoff: float = DEFAULT_OUTBOX_MAX_BACKOFF_SECONDS,
) -> None:
    if not dry_run and outbox is None:
        raise OutboxPersistenceError("Live delivery requires a persistent SQLite outbox")
    _print_status(
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
    _print_status(
        _json(
            {
                "status": "ssh_source_gap_warning",
                "source_delivery_guarantee": "best_effort",
                "detail": (
                    "SSH reconnect uses tail -n 0; rows written during disconnect or lost to rotation may never reach "
                    "the correlator. Run a checkpointing collector on the Zeek host for source-level durability."
                ),
            }
        ),
        error=True,
    )
    lines: queue.Queue[tuple[str, dict[str, Any]]] = queue.Queue()
    stop = threading.Event()
    process: subprocess.Popen[str] | None = None
    conn_state = TimedConnBatchState(
        network_rate_window_seconds=settings.network_rate_window_seconds,
        dos_same_src_dst_threshold=settings.dos_same_src_dst_threshold,
        ddos_destination_threshold=settings.ddos_destination_threshold,
        ddos_unique_sources_threshold=settings.ddos_unique_sources_threshold,
    )
    correlator = ZeekTransactionCorrelator(settings)
    emitted = 0
    ssh_session = 0
    stop_reason = "requested"
    last_heartbeat = time.monotonic()
    last_outbox_drain = time.monotonic()

    if outbox is not None:
        startup_limit = _delivery_limit(max_emitted_events, emitted, outbox_drain_batch_size)
        if startup_limit:
            result = drain_outbox(
                outbox,
                api_url=api_url,
                post_attempts=post_attempts,
                post_retry_delay=post_retry_delay,
                post_max_retry_delay=post_max_retry_delay,
                max_backoff=outbox_max_backoff,
                limit=startup_limit,
            )
            emitted += result.delivered

    def emit(events: list[dict[str, Any]]) -> None:
        nonlocal emitted
        emitted = _emit_many(
            events,
            api_url=api_url,
            dry_run=dry_run,
            emitted=emitted,
            max_emitted_events=max_emitted_events,
            tolerate_errors=True,
            post_attempts=post_attempts,
            post_retry_delay=post_retry_delay,
            post_max_retry_delay=post_max_retry_delay,
            outbox=outbox,
            outbox_drain_batch_size=outbox_drain_batch_size,
            outbox_max_backoff=outbox_max_backoff,
        )

    try:
        while not stop.is_set():
            if process is not None and process.poll() is not None:
                _print_status(
                    _json(
                        {
                            "status": "ssh_stream_disconnected",
                            "return_code": process.returncode,
                            "reconnect_in_seconds": max(0.0, ssh_reconnect_delay),
                            "ssh_session": ssh_session,
                        }
                    ),
                    error=True,
                )
                process = None
                if stop.wait(max(0.0, ssh_reconnect_delay)):
                    break

            if process is None:
                try:
                    process = _start_ssh_multiplex_reader(zeek_ssh, conn_log, http_log, lines, stop)
                    ssh_session += 1
                    _print_status(
                        _json(
                            {
                                "status": "ssh_stream_started",
                                "ssh_session": ssh_session,
                                "zeek_ssh": zeek_ssh,
                            }
                        )
                    )
                except OSError as exc:
                    _print_exception("ssh_stream_start_failed", exc, reconnect_in_seconds=max(0.0, ssh_reconnect_delay))
                    if stop.wait(max(0.05, ssh_reconnect_delay)):
                        break
                    continue

            try:
                kind, row = lines.get(timeout=max(0.05, poll_interval))
                if kind == "conn":
                    for flow in conn_state.push(row):
                        emit(correlator.ingest_flow(flow))
                else:
                    emit(correlator.ingest_http(row))
            except queue.Empty:
                pass
            except OutboxPersistenceError:
                stop_reason = "outbox_persistence_error"
                raise
            except Exception as exc:  # Keep a malformed row from stopping the live collector.
                _print_exception("row_processing_failed", exc)

            try:
                for flow in conn_state.flush_if_stale(max_age_seconds=max(0.0, conn_batch_delay)):
                    emit(correlator.ingest_flow(flow))
                emit(correlator.expire())
            except OutboxPersistenceError:
                stop_reason = "outbox_persistence_error"
                raise
            except Exception as exc:  # Keep a malformed batch from stopping the live collector.
                _print_exception("batch_processing_failed", exc)

            now = time.monotonic()
            if outbox is not None and now - last_outbox_drain >= 1.0:
                delivery_limit = _delivery_limit(max_emitted_events, emitted, outbox_drain_batch_size)
                if delivery_limit:
                    result = drain_outbox(
                        outbox,
                        api_url=api_url,
                        post_attempts=post_attempts,
                        post_retry_delay=post_retry_delay,
                        post_max_retry_delay=post_max_retry_delay,
                        max_backoff=outbox_max_backoff,
                        limit=delivery_limit,
                    )
                    emitted += result.delivered
                last_outbox_drain = now
            if heartbeat_interval > 0 and now - last_heartbeat >= heartbeat_interval:
                _print_status(
                    _json(
                        {
                            "status": "collector_heartbeat",
                            "emitted": emitted,
                            "queued_rows": lines.qsize(),
                            "ssh_running": process is not None and process.poll() is None,
                            "ssh_session": ssh_session,
                            "outbox_pending": outbox.count() if outbox is not None else 0,
                            "outbox_retry_in_seconds": outbox.delivery_retry_in() if outbox is not None else 0,
                        }
                    )
                )
                last_heartbeat = now
            if max_emitted_events and emitted >= max_emitted_events:
                stop_reason = "max_emitted_events"
                break
    except KeyboardInterrupt:
        stop_reason = "keyboard_interrupt"
    finally:
        stop.set()
        if process is not None and process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=2)
            except subprocess.TimeoutExpired:
                process.kill()
        _print_status(
            _json(
                {
                    "status": "correlated_tail_stopped",
                    "emitted": emitted,
                    "reason": stop_reason,
                    "outbox_pending": outbox.count() if outbox is not None else 0,
                }
            )
        )


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
        [
            "ssh",
            "-o",
            "ServerAliveInterval=15",
            "-o",
            "ServerAliveCountMax=3",
            zeek_ssh,
            remote,
        ],
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
            try:
                kind, payload = _split_multiplexed_line(raw_line)
                if not kind:
                    continue
                row, fields = parse_zeek_line(payload, fields_by_kind[kind])
                fields_by_kind[kind] = fields
                if row is None:
                    continue
                normalized = normalize_conn_row(row) if kind == "conn" else normalize_http_row(row)
                lines.put((kind, normalized))
            except Exception as exc:  # A single malformed Zeek row must not end the reader thread.
                _print_exception("zeek_line_rejected", exc)

    threading.Thread(target=read_stdout, daemon=True).start()
    return process


def _split_multiplexed_line(raw_line: str) -> tuple[str | None, str]:
    if raw_line.startswith("__AI2B_CONN__|"):
        return "conn", raw_line.removeprefix("__AI2B_CONN__|")
    if raw_line.startswith("__AI2B_HTTP__|"):
        return "http", raw_line.removeprefix("__AI2B_HTTP__|")
    return None, raw_line


def _local_log_items(
    conn_log: Path,
    http_log: Path,
    *,
    settings: CorrelatorSettings | None = None,
) -> list[tuple[str, dict[str, Any]]]:
    settings = settings or CorrelatorSettings(sensor_id="")
    conn_state = TimedConnBatchState(
        network_rate_window_seconds=settings.network_rate_window_seconds,
        dos_same_src_dst_threshold=settings.dos_same_src_dst_threshold,
        ddos_destination_threshold=settings.ddos_destination_threshold,
        ddos_unique_sources_threshold=settings.ddos_unique_sources_threshold,
    )
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
    tolerate_errors: bool = False,
    post_attempts: int = DEFAULT_POST_ATTEMPTS,
    post_retry_delay: float = DEFAULT_POST_RETRY_DELAY_SECONDS,
    post_max_retry_delay: float = DEFAULT_POST_MAX_RETRY_DELAY_SECONDS,
    outbox: SQLiteEventOutbox | None = None,
    outbox_drain_batch_size: int = DEFAULT_OUTBOX_DRAIN_BATCH_SIZE,
    outbox_max_backoff: float = DEFAULT_OUTBOX_MAX_BACKOFF_SECONDS,
) -> int:
    count = emitted
    if dry_run:
        for event in events:
            if max_emitted_events and count >= max_emitted_events:
                return count
            _print_status(_json({"status": "dry_run_event", "event": event}))
            count += 1
        return count

    if outbox is None:
        raise OutboxPersistenceError("Refusing non-dry-run delivery without a persistent SQLite outbox")

    # Store every event produced by this correlator call before attempting network I/O.
    # `tolerate_errors` is retained for call compatibility; delivery errors are safe
    # because the event stays queued, while persistence/integrity errors always fail.
    _ = tolerate_errors
    for event in events:
        inserted = outbox.enqueue(event)
        _print_status(
            _json(
                {
                    "status": "outbox_enqueued" if inserted else "outbox_duplicate",
                    "event_id": event.get("event_id"),
                    "event_type": event.get("event_type"),
                    "outbox_pending": outbox.count(),
                }
            )
        )

    delivery_limit = _delivery_limit(max_emitted_events, count, outbox_drain_batch_size)
    if not delivery_limit:
        return count
    result = drain_outbox(
        outbox,
        api_url=api_url,
        post_attempts=post_attempts,
        post_retry_delay=post_retry_delay,
        post_max_retry_delay=post_max_retry_delay,
        max_backoff=outbox_max_backoff,
        limit=delivery_limit,
    )
    return count + result.delivered


def drain_outbox(
    outbox: SQLiteEventOutbox,
    *,
    api_url: str,
    post_attempts: int = DEFAULT_POST_ATTEMPTS,
    post_retry_delay: float = DEFAULT_POST_RETRY_DELAY_SECONDS,
    post_max_retry_delay: float = DEFAULT_POST_MAX_RETRY_DELAY_SECONDS,
    max_backoff: float = DEFAULT_OUTBOX_MAX_BACKOFF_SECONDS,
    limit: int = DEFAULT_OUTBOX_DRAIN_BATCH_SIZE,
    force: bool = False,
) -> OutboxDrainResult:
    if not force:
        retry_in = outbox.delivery_retry_in()
        if retry_in > 0:
            return OutboxDrainResult(circuit_open=True, retry_in_seconds=retry_in)
    delivered = 0
    deferred = 0
    for queued in outbox.pending(limit=max(1, limit), force=force):
        try:
            response_status = post_event(
                api_url,
                queued.event,
                attempts=post_attempts,
                retry_delay=post_retry_delay,
                max_retry_delay=post_max_retry_delay,
            )
        except Exception as exc:
            event_delivery_cycle, circuit_failures, retry_in = outbox.record_failure(
                queued.event_id,
                exc,
                base_delay=post_retry_delay,
                max_backoff=max_backoff,
            )
            _print_exception(
                "outbox_delivery_deferred",
                exc,
                event_id=queued.event_id,
                event_delivery_cycle=event_delivery_cycle,
                consecutive_outage_failures=circuit_failures,
                retry_in_seconds=retry_in,
                retained=True,
                outbox_pending=outbox.count(),
            )
            deferred += 1
            # A shared backend outage is likely; avoid blocking source collection by
            # retrying the whole queue in the same cycle.
            break

        outbox.mark_delivered(queued.event_id)
        event = queued.event
        _print_status(
            _json(
                {
                    "status": "posted",
                    "event_id": queued.event_id,
                    "event_type": event.get("event_type"),
                    "correlation_status": event.get("correlation_status"),
                    "transaction_id": event.get("transaction_id"),
                    "uri": ((event.get("evidence") or {}).get("http") or {}).get("uri"),
                    "backend_status": response_status,
                    "outbox_pending": outbox.count(),
                }
            )
        )
        delivered += 1
    return OutboxDrainResult(delivered=delivered, deferred=deferred)


def post_event(
    api_url: str,
    event: dict[str, Any],
    *,
    attempts: int = 1,
    retry_delay: float = 0.0,
    max_retry_delay: float = DEFAULT_POST_MAX_RETRY_DELAY_SECONDS,
) -> int:
    payload = _serialize_event(event).encode("utf-8")
    maximum_attempts = max(1, attempts)
    last_error: Exception | None = None
    for attempt in range(1, maximum_attempts + 1):
        try:
            request = _build_post_request(api_url, payload)
            with urlopen(request, timeout=10) as response:  # noqa: S310 - local lab API endpoint.
                status = getattr(response, "status", None)
                if status is None and callable(getattr(response, "getcode", None)):
                    status = response.getcode()
                response.read()
            if not isinstance(status, int):
                raise UnexpectedBackendStatus("Backend response did not include an HTTP status")
            canonical_ingest = _is_canonical_ingest_url(api_url)
            if canonical_ingest and status != 202:
                raise UnexpectedBackendStatus(
                    f"Canonical ingest endpoint must return HTTP 202, received HTTP {status}"
                )
            if not canonical_ingest and not 200 <= status < 300:
                raise UnexpectedBackendStatus(f"Legacy endpoint returned non-2xx HTTP {status}")
            return status
        except (OSError, UnexpectedBackendStatus) as exc:
            last_error = exc
            if attempt >= maximum_attempts:
                raise RuntimeError(f"Failed to POST event to {api_url} after {attempt} attempt(s): {exc}") from exc
            backoff = max(0.0, retry_delay) * (2 ** min(attempt - 1, 16))
            time.sleep(min(max(0.0, max_retry_delay), backoff))
    raise RuntimeError(f"Failed to POST event to {api_url}: {last_error}")


def _build_post_request(api_url: str, payload: bytes) -> Request:
    request = Request(api_url, data=payload, method="POST")
    request.add_header("Content-Type", "application/json")
    hmac_secret = os.getenv("INGEST_HMAC_SECRET")
    if hmac_secret:
        signed_at = str(int(time.time()))
        message = signed_at.encode("ascii") + b"." + payload
        signature = hmac.new(hmac_secret.encode("utf-8"), message, hashlib.sha256).hexdigest()
        request.add_header("X-SOC-Timestamp", signed_at)
        request.add_header("X-SOC-Signature", f"sha256={signature}")
    return request


def _is_canonical_ingest_url(api_url: str) -> bool:
    path = urlparse(api_url).path.rstrip("/")
    return path == "/ingest" or path.startswith("/ingest/")


def _delivery_limit(max_emitted_events: int, emitted: int, batch_size: int) -> int:
    limit = max(1, int(batch_size))
    if max_emitted_events:
        remaining = max_emitted_events - emitted
        if remaining <= 0:
            return 0
        limit = min(limit, remaining)
    return limit


def _serialize_event(event: dict[str, Any]) -> str:
    try:
        return json.dumps(event, ensure_ascii=False, allow_nan=False, separators=(",", ":"), sort_keys=True)
    except (TypeError, ValueError) as exc:
        raise EventSerializationError(f"Event is not valid strict JSON: {exc}") from exc


def _payload_sha256(payload_json: str) -> str:
    return hashlib.sha256(payload_json.encode("utf-8")).hexdigest()


def _immutable_event_id(correlation_id: str, event: dict[str, Any]) -> str:
    status = str(event.get("correlation_status") or event.get("event_type") or "event").strip().lower()
    revision_material = {key: value for key, value in event.items() if key != "event_id"}
    revision = hashlib.sha256(_serialize_event(revision_material).encode("utf-8")).hexdigest()[:16]
    return f"{correlation_id}:{status}:{revision}"


def _reject_json_constant(value: str) -> None:
    raise ValueError(f"Non-finite JSON number {value!r} is not allowed")


def _trans_depth(http: dict[str, Any]) -> int:
    try:
        return int(http.get("trans_depth") or 1)
    except (TypeError, ValueError):
        return 1


def _numeric(value: object, default: float = 0.0) -> float:
    if value is None or value == "-":
        return default
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return default
    return numeric if math.isfinite(numeric) else default


def _timestamp(value: object) -> str:
    from datetime import datetime, timezone

    try:
        numeric = float(value)
        if not math.isfinite(numeric):
            raise ValueError("timestamp must be finite")
        return datetime.fromtimestamp(numeric, tz=timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    except (TypeError, ValueError, OverflowError, OSError):
        return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _json(payload: dict[str, Any]) -> str:
    return json.dumps(payload, allow_nan=False, sort_keys=True)


def _print_status(message: str, *, error: bool = False) -> None:
    print(message, file=sys.stderr if error else sys.stdout, flush=True)


def _print_exception(status: str, exc: Exception, **details: Any) -> None:
    _print_status(
        _json(
            {
                "status": status,
                "error_type": type(exc).__name__,
                "error": str(exc),
                **details,
            }
        ),
        error=True,
    )


if __name__ == "__main__":
    main()
