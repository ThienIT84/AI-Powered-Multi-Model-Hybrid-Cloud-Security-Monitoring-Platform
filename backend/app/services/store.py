from __future__ import annotations

from collections import deque
from typing import Any


class AlertStore:
    def __init__(self, max_items: int = 200) -> None:
        self._items: deque[dict[str, Any]] = deque(maxlen=max_items)

    def add(self, alert: dict[str, Any]) -> dict[str, Any]:
        self._items.appendleft(alert)
        return alert

    def list(self, limit: int = 50) -> list[dict[str, Any]]:
        return list(self._items)[:limit]

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

