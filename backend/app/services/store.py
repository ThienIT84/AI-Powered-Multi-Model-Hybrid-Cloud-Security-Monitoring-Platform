from __future__ import annotations

from collections import deque
from datetime import datetime, timezone
import json
import os
from pathlib import Path
from typing import Any


class AlertStore:
    def __init__(self, max_items: int = 200) -> None:
        default_path = Path(__file__).resolve().parents[2] / "tmp" / "alert_store.json"
        self._path = Path(os.environ.get("ALERT_STORE_PATH", default_path))
        self._items: deque[dict[str, Any]] = deque(maxlen=max_items)
        self._cases: list[dict[str, Any]] = []
        self._rules: list[dict[str, Any]] = []
        self._last_ingest_at: str | None = None
        self._load()

    def _load(self) -> None:
        if not self._path.exists():
            return
        try:
            data = json.loads(self._path.read_text(encoding="utf-8"))
            self._items = deque(data.get("items", []), maxlen=self._items.maxlen)
            self._cases = list(data.get("cases", []))
            self._rules = list(data.get("rules", []))
            self._last_ingest_at = data.get("last_ingest_at")
        except (OSError, json.JSONDecodeError, TypeError):
            self._items = deque(maxlen=self._items.maxlen)
            self._cases = []
            self._rules = []
            self._last_ingest_at = None

    def _persist(self) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "last_ingest_at": self._last_ingest_at,
            "items": list(self._items),
            "cases": self._cases,
            "rules": self._rules,
        }
        self._path.write_text(json.dumps(payload, ensure_ascii=True, indent=2), encoding="utf-8")

    def add(self, alert: dict[str, Any]) -> dict[str, Any]:
        self._last_ingest_at = datetime.now(timezone.utc).isoformat()
        self._items.appendleft(alert)
        self._persist()
        return alert

    def upsert(self, alert: dict[str, Any]) -> tuple[dict[str, Any], bool]:
        """Insert a new alert or replace an existing alert with the same id.

        Returns (alert, created). The in-memory MVP store keeps newest items at
        the front, so updates preserve the existing row position instead of
        creating duplicates.
        """
        alert_id = alert.get("id")
        if alert_id:
            for index, existing in enumerate(self._items):
                if existing.get("id") == alert_id:
                    self._last_ingest_at = datetime.now(timezone.utc).isoformat()
                    self._items[index] = alert
                    self._persist()
                    return alert, False
        self.add(alert)
        return alert, True

    def list(self, limit: int = 50) -> list[dict[str, Any]]:
        return list(self._items)[:limit]

    def get(self, alert_id: str) -> dict[str, Any] | None:
        for item in self._items:
            if item.get("id") == alert_id:
                return item
        return None

    def get_network_flow(self, flow_id: str) -> dict[str, Any] | None:
        for flow in self.network_flows(limit=self._items.maxlen or 200):
            if flow.get("id") == flow_id:
                return flow
        return None

    def update(self, alert_id: str, update: dict[str, Any]) -> dict[str, Any] | None:
        for index, item in enumerate(self._items):
            if item.get("id") == alert_id:
                audit_event = {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "action": update.get("audit_action", "alert.updated"),
                    "payload": {key: value for key, value in update.items() if key != "audit_action"},
                }
                existing_audit = list(item.get("audit_log") or [])
                next_item = {
                    **item,
                    **{key: value for key, value in update.items() if key != "audit_action"},
                    "audit_log": [*existing_audit, audit_event],
                    "updated_at": audit_event["timestamp"],
                }
                self._items[index] = next_item
                self._persist()
                return next_item
        return None

    def summary(self) -> dict[str, Any]:
        items = list(self._items)
        attacks = [item.get("attack_type", "Unknown") for item in items]
        top_threat = max(set(attacks), key=attacks.count) if attacks else "None"
        return {
            "total_alerts": len(items),
            "total_fusion_alerts": len(items),
            "top_threat": top_threat,
            "critical": sum(1 for item in items if str(item.get("severity", "")).lower() == "critical"),
            "high": sum(1 for item in items if str(item.get("severity", "")).lower() == "high"),
            "medium": sum(1 for item in items if str(item.get("severity", "")).lower() == "medium"),
            "low": sum(1 for item in items if str(item.get("severity", "")).lower() == "low"),
        }

    def status(self) -> dict[str, Any]:
        return {
            "status": "ok",
            "data_sources_online": None,
            "data_sources_total": None,
            "model_healthy": None,
            "model_total": None,
            "event_rate_per_second": None,
            "last_ingest_at": self._last_ingest_at,
            "alert_count": len(self._items),
            "last_error": None,
        }

    def network_flows(self, limit: int = 200) -> list[dict[str, Any]]:
        flows: list[dict[str, Any]] = []
        for item in list(self._items)[:limit]:
            evidence = item.get("evidence") or {}
            flow = evidence.get("flow") or item.get("flow") or {}
            http = evidence.get("http") or {}
            zeek = item.get("zeek_evidence") or {}
            src_ip = item.get("source_ip") or flow.get("src_ip") or flow.get("id.orig_h") or ""
            dst_ip = item.get("destination_ip") or flow.get("dst_ip") or flow.get("id.resp_h") or ""
            protocol = item.get("protocol") or flow.get("proto") or "TCP"
            service = flow.get("service") or zeek.get("service") or ("http" if http else "unknown")
            orig_bytes = int(flow.get("orig_bytes") or zeek.get("orig_bytes") or 0)
            resp_bytes = int(flow.get("resp_bytes") or zeek.get("resp_bytes") or 0)
            orig_pkts = int(flow.get("orig_pkts") or zeek.get("orig_pkts") or 0)
            resp_pkts = int(flow.get("resp_pkts") or zeek.get("resp_pkts") or 0)
            flows.append(
                {
                    "id": item.get("id"),
                    "sensor_id": zeek.get("sensor_id") or flow.get("sensor_id") or "backend-store",
                    "source": "live",
                    "timestamp": item.get("timestamp"),
                    "src_ip": src_ip,
                    "src_port": item.get("source_port") or flow.get("src_port") or flow.get("id.orig_p"),
                    "dst_ip": dst_ip,
                    "dst_port": item.get("destination_port") or flow.get("dst_port") or flow.get("id.resp_p") or 0,
                    "protocol": protocol,
                    "service": service,
                    "bytes": orig_bytes + resp_bytes,
                    "packets": orig_pkts + resp_pkts,
                    "correlation_id": zeek.get("correlation_id") or item.get("id"),
                    "related_alert_id": item.get("id"),
                    "severity": item.get("severity"),
                    "risk_score": item.get("risk_score"),
                    "reason": item.get("attack_type"),
                }
            )
        return flows

    def list_cases(self) -> list[dict[str, Any]]:
        return self._cases

    def get_case(self, case_id: str) -> dict[str, Any] | None:
        for case in self._cases:
            if case.get("id") == case_id:
                return case
        return None

    def create_case_from_alert(self, alert_id: str) -> dict[str, Any] | None:
        alert = self.get(alert_id)
        if not alert:
            return None
        case_id = f"CASE-{alert_id}"
        existing = self.get_case(case_id)
        if existing:
            return existing
        now = datetime.now(timezone.utc).isoformat()
        case = {
            "id": case_id,
            "title": f"{alert.get('attack_type', 'Security alert')} investigation",
            "severity": alert.get("severity", "Medium"),
            "status": "Open",
            "timestamp": now,
            "source_ip": alert.get("source_ip", ""),
            "destination_ip": alert.get("destination_ip", ""),
            "attack_type": alert.get("attack_type", "Unknown"),
            "zeek": {
                "conn_log": [json.dumps(alert.get("zeek_evidence") or alert.get("evidence", {}).get("flow") or {})],
                "http_log": [json.dumps(alert.get("evidence", {}).get("http") or {})],
                "flows": 1,
            },
            "detection": {
                "ai1": {"label": "Unknown", "score": 0},
                "ai2a": {"class": alert.get("attack_type", "Unknown"), "confidence": alert.get("confidence_score", 0)},
            },
            "suricata": {"signatures": [json.dumps(alert.get("suricata_evidence") or {})]},
            "timeline": {
                "events": [
                    f"{now} - Case created from alert {alert_id}.",
                    f"{now} - Evidence package linked to source alert.",
                ]
            },
            "comments": [],
            "notes": f"Related alert: {alert_id}",
            "related_alerts": [alert_id],
            "audit_log": [
                {
                    "timestamp": now,
                    "action": "case.created_from_alert",
                    "payload": {"alert_id": alert_id},
                }
            ],
        }
        self._cases.insert(0, case)
        self.update(alert_id, {"status": "escalated", "case_id": case_id, "audit_action": "case.created_from_alert"})
        self._persist()
        return case

    def upsert_case(self, case: dict[str, Any]) -> dict[str, Any]:
        case_id = case.get("id")
        for index, item in enumerate(self._cases):
            if item.get("id") == case_id:
                self._cases[index] = {**item, **case}
                self._persist()
                return self._cases[index]
        self._cases.insert(0, case)
        self._persist()
        return case

    def update_case(self, case_id: str, update: dict[str, Any]) -> dict[str, Any] | None:
        for index, case in enumerate(self._cases):
            if case.get("id") == case_id:
                now = datetime.now(timezone.utc).isoformat()
                audit = list(case.get("audit_log") or [])
                action = update.pop("audit_action", "case.updated")
                audit.append({"timestamp": now, "action": action, "payload": update})
                timeline = dict(case.get("timeline") or {"events": []})
                supplied_timeline = update.get("timeline")
                if isinstance(supplied_timeline, dict) and isinstance(supplied_timeline.get("events"), list):
                    timeline = supplied_timeline
                else:
                    timeline["events"] = [*list(timeline.get("events") or []), f"{now} - Case updated: {', '.join(update.keys())}."]
                self._cases[index] = {**case, **update, "timeline": timeline, "audit_log": audit, "updated_at": now}
                self._persist()
                return self._cases[index]
        return None

    def assign_case(self, case_id: str, analyst: str) -> dict[str, Any] | None:
        now = datetime.now(timezone.utc).isoformat()
        case = self.get_case(case_id)
        if not case:
            return None
        timeline = dict(case.get("timeline") or {"events": []})
        timeline["events"] = [*list(timeline.get("events") or []), f"{now} - Case assigned to {analyst}."]
        return self.update_case(case_id, {"assignedTo": analyst, "status": "In Progress", "timeline": timeline, "audit_action": "case.assigned"})

    def add_case_note(self, case_id: str, note: str, author: str) -> dict[str, Any] | None:
        now = datetime.now(timezone.utc).isoformat()
        case = self.get_case(case_id)
        if not case:
            return None
        comment = {"id": f"comm-{case_id}-{len(case.get('comments') or []) + 1}", "author": author, "timestamp": now, "text": note}
        timeline = dict(case.get("timeline") or {"events": []})
        timeline["events"] = [*list(timeline.get("events") or []), f"{now} - Analyst note added."]
        return self.update_case(
            case_id,
            {
                "comments": [*list(case.get("comments") or []), comment],
                "timeline": timeline,
                "audit_action": "case.note_added",
            },
        )

    def close_case(self, case_id: str, resolution: str) -> dict[str, Any] | None:
        now = datetime.now(timezone.utc).isoformat()
        case = self.get_case(case_id)
        if not case:
            return None
        timeline = dict(case.get("timeline") or {"events": []})
        timeline["events"] = [*list(timeline.get("events") or []), f"{now} - Case closed: {resolution}."]
        return self.update_case(
            case_id,
            {
                "status": "Resolved",
                "resolution": {"summary": resolution, "closed_at": now},
                "timeline": timeline,
                "audit_action": "case.closed",
            },
        )

    def list_rules(self) -> list[dict[str, Any]]:
        return self._rules

    def create_rule(self, rule: dict[str, Any]) -> dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        item = {
            **rule,
            "id": rule.get("id") or f"RULE-{len(self._rules) + 1:04d}",
            "created_at": now,
            "updated_at": now,
            "audit_log": [{"timestamp": now, "action": "rule.created", "payload": rule}],
        }
        self._rules.insert(0, item)
        self._persist()
        return item

    def test_rule(self, rule: dict[str, Any]) -> dict[str, Any]:
        matches = 0
        attack_type = str(rule.get("conditions", {}).get("attackType") or "").lower()
        for item in self._items:
            if attack_type and attack_type in str(item.get("attack_type", "")).lower():
                matches += 1
        return {
            "status": "success",
            "matches": matches,
            "tested_at": datetime.now(timezone.utc).isoformat(),
        }
