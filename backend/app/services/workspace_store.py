from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from threading import RLock
from typing import Any
from uuid import uuid4


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _deep_merge(current: dict[str, Any], updates: dict[str, Any]) -> dict[str, Any]:
    merged = deepcopy(current)
    for key, value in updates.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = _deep_merge(merged[key], value)
        else:
            merged[key] = deepcopy(value)
    return merged


class WorkspaceStore:
    """Process-local CRUD store for workspace state without seeded/demo records.

    This intentionally starts with empty domain collections. It gives the current
    frontend stable CRUD contracts while persistent tables are introduced later.
    Runtime-derived settings may be supplied by the dependency wiring.
    """

    def __init__(self, *, runtime_settings: dict[str, Any] | None = None) -> None:
        self._cases: dict[str, dict[str, Any]] = {}
        self._playbooks: dict[str, dict[str, Any]] = {}
        self._alert_rules: dict[str, dict[str, Any]] = {}
        self._settings: dict[str, Any] = deepcopy(runtime_settings or {})
        self._lock = RLock()

    def list_cases(self) -> list[dict[str, Any]]:
        with self._lock:
            return deepcopy(list(self._cases.values()))

    def get_case(self, case_id: str) -> dict[str, Any] | None:
        with self._lock:
            item = self._cases.get(case_id)
            return deepcopy(item) if item is not None else None

    def create_case(self, payload: dict[str, Any]) -> dict[str, Any]:
        evidence = payload.get("evidence")
        case = deepcopy(evidence) if isinstance(evidence, dict) else deepcopy(payload)
        alert_id = str(payload.get("alertId") or case.get("alertId") or "")
        case_id = str(case.get("id") or payload.get("id") or (f"CASE-{alert_id}" if alert_id else f"CASE-{uuid4().hex[:12]}"))
        now = _utc_now()
        case.update(
            {
                "id": case_id,
                "source": payload.get("source") or case.get("source"),
                "alertId": alert_id or case.get("alertId"),
                "status": case.get("status") or "Open",
                "timestamp": case.get("timestamp") or now,
                "createdAt": case.get("createdAt") or now,
                "updatedAt": now,
            }
        )
        case.setdefault("comments", [])
        with self._lock:
            if case_id in self._cases:
                raise ValueError(f"Case {case_id} already exists")
            self._cases[case_id] = case
            return deepcopy(case)

    def update_case(self, case_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
        with self._lock:
            existing = self._cases.get(case_id)
            if existing is None:
                return None
            updated = _deep_merge(existing, updates)
            updated["id"] = case_id
            updated["updatedAt"] = _utc_now()
            self._cases[case_id] = updated
            return deepcopy(updated)

    def list_playbooks(self) -> list[dict[str, Any]]:
        with self._lock:
            return deepcopy(list(self._playbooks.values()))

    def get_playbook(self, playbook_id: str) -> dict[str, Any] | None:
        with self._lock:
            item = self._playbooks.get(playbook_id)
            return deepcopy(item) if item is not None else None

    def create_playbook(self, payload: dict[str, Any]) -> dict[str, Any]:
        playbook = deepcopy(payload)
        playbook_id = str(playbook.get("id") or f"PB-{uuid4().hex[:12]}")
        now = _utc_now()
        playbook.update(
            {
                "id": playbook_id,
                "createdAt": playbook.get("createdAt") or now,
                "updatedAt": now,
            }
        )
        with self._lock:
            if playbook_id in self._playbooks:
                raise ValueError(f"Playbook {playbook_id} already exists")
            self._playbooks[playbook_id] = playbook
            return deepcopy(playbook)

    def update_playbook(self, playbook_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
        with self._lock:
            existing = self._playbooks.get(playbook_id)
            if existing is None:
                return None
            updated = _deep_merge(existing, updates)
            updated["id"] = playbook_id
            updated["updatedAt"] = _utc_now()
            self._playbooks[playbook_id] = updated
            return deepcopy(updated)

    def list_alert_rules(self) -> list[dict[str, Any]]:
        with self._lock:
            return deepcopy(list(self._alert_rules.values()))

    def create_alert_rule(self, payload: dict[str, Any]) -> dict[str, Any]:
        rule = deepcopy(payload)
        rule_id = str(rule.get("id") or f"RULE-{uuid4().hex[:12]}")
        now = _utc_now()
        rule.update(
            {
                "id": rule_id,
                "status": "active" if bool(rule.get("isActive", True)) else "inactive",
                "createdAt": now,
                "updatedAt": now,
            }
        )
        with self._lock:
            if rule_id in self._alert_rules:
                raise ValueError(f"Alert rule {rule_id} already exists")
            self._alert_rules[rule_id] = rule
            return deepcopy(rule)

    def get_settings(self) -> dict[str, Any]:
        with self._lock:
            return deepcopy(self._settings)

    def update_settings(self, updates: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            self._settings = _deep_merge(self._settings, updates)
            self._settings["updatedAt"] = _utc_now()
            return deepcopy(self._settings)
