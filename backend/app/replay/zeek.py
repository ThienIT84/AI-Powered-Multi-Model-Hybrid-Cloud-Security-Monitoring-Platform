from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable


def _first(row: dict[str, Any], *keys: str, default: Any = None) -> Any:
    for key in keys:
        if key not in row:
            continue
        value = row[key]
        if value is None or value == "-":
            continue
        return value
    return default


def _to_int(value: Any) -> int | None:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def _timestamp(value: Any) -> str:
    try:
        return datetime.fromtimestamp(float(value), tz=timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    except (TypeError, ValueError, OSError):
        return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


class ZeekLogParser:
    def parse(self, path: str | Path) -> list[dict[str, Any]]:
        path = Path(path)
        fields: list[str] | None = None
        rows: list[dict[str, Any]] = []
        for raw_line in path.read_text(encoding="utf-8").splitlines():
            row, fields = parse_zeek_line(raw_line, fields)
            if row is not None:
                rows.append(row)
        return rows


class ZeekConnParser(ZeekLogParser):
    def parse_flows(self, path: str | Path) -> list[dict[str, Any]]:
        return [normalize_conn_row(row) for row in self.parse(path)]


class ZeekHttpParser(ZeekLogParser):
    def parse_http(self, path: str | Path) -> list[dict[str, Any]]:
        return [normalize_http_row(row) for row in self.parse(path)]


def parse_zeek_line(raw_line: str, fields: list[str] | None = None) -> tuple[dict[str, Any] | None, list[str] | None]:
    line = raw_line.strip()
    if not line:
        return None, fields
    if line.startswith("#fields"):
        return None, line.split("\t")[1:]
    if line.startswith("#"):
        return None, fields
    if line.startswith("{"):
        return json.loads(line), fields
    if fields:
        values = line.split("\t")
        return dict(zip(fields, values, strict=False)), fields
    return None, fields


def normalize_conn_row(row: dict[str, Any]) -> dict[str, Any]:
    src_ip = _first(row, "src_ip", "id.orig_h", "source_ip", default="0.0.0.0")
    dst_ip = _first(row, "dst_ip", "id.resp_h", "destination_ip", default="0.0.0.0")
    src_port = _to_int(_first(row, "src_port", "id.orig_p", "source_port"))
    dst_port = _to_int(_first(row, "dst_port", "id.resp_p", "destination_port"))
    return {
        "uid": str(_first(row, "uid", default="")),
        "ts": _first(row, "ts", default=""),
        "source_ip": str(src_ip),
        "destination_ip": str(dst_ip),
        "src_ip": str(src_ip),
        "dst_ip": str(dst_ip),
        "source_port": src_port,
        "destination_port": dst_port,
        "src_port": src_port,
        "dst_port": dst_port,
        "proto": str(_first(row, "proto", default="")).lower(),
        "service": str(_first(row, "service", default="")).lower(),
        "duration": _first(row, "duration", default=0),
        "orig_bytes": _first(row, "orig_bytes", default=0),
        "resp_bytes": _first(row, "resp_bytes", default=0),
        "orig_pkts": _first(row, "orig_pkts", default=0),
        "resp_pkts": _first(row, "resp_pkts", default=0),
        "orig_ip_bytes": _first(row, "orig_ip_bytes", default=0),
        "resp_ip_bytes": _first(row, "resp_ip_bytes", default=0),
        "conn_state": _first(row, "conn_state", default=""),
        "history": _first(row, "history", default=""),
    }


def normalize_http_row(row: dict[str, Any]) -> dict[str, Any]:
    src_ip = _first(row, "src_ip", "id.orig_h", "source_ip", default="0.0.0.0")
    dst_ip = _first(row, "dst_ip", "id.resp_h", "destination_ip", default="0.0.0.0")
    return {
        "uid": str(_first(row, "uid", default="")),
        "ts": _first(row, "ts", default=""),
        "source_ip": str(src_ip),
        "destination_ip": str(dst_ip),
        "method": str(_first(row, "method", default="GET")),
        "host": _first(row, "host", default=None),
        "uri": str(_first(row, "uri", default="/")),
        "user_agent": _first(row, "user_agent", default=None),
        "status_code": _to_int(_first(row, "status_code", default=None)),
    }


@dataclass(frozen=True)
class ZeekUidCorrelator:
    def correlate(self, flows: Iterable[dict[str, Any]], http_rows: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
        flows_by_uid = {str(row.get("uid") or ""): row for row in flows if row.get("uid")}
        http_by_uid = {str(row.get("uid") or ""): row for row in http_rows if row.get("uid")}
        events = []
        for uid in sorted(set(flows_by_uid) | set(http_by_uid)):
            flow = flows_by_uid.get(uid)
            http = http_by_uid.get(uid)
            events.append(ReplayEventBuilder().build(uid, flow=flow, http=http))
        return sorted(events, key=lambda event: (event["timestamp"], event["event_id"]))


class ReplayEventBuilder:
    def build(
        self,
        uid: str,
        *,
        flow: dict[str, Any] | None = None,
        http: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        if not flow and not http:
            raise ValueError("Replay event requires at least flow or http evidence")
        evidence = {"flow": flow, "http": http, "suricata": None}
        source = flow or http or {}
        event_type = "combined" if flow and http else "network_flow" if flow else "http"
        return {
            "schema_version": "1.0",
            "event_type": event_type,
            "event_id": f"zeek-{uid}",
            "correlation_id": uid,
            "timestamp": _timestamp(source.get("ts")),
            "source_ip": str(source.get("source_ip") or "0.0.0.0"),
            "destination_ip": str(source.get("destination_ip") or "0.0.0.0"),
            "evidence": evidence,
        }
