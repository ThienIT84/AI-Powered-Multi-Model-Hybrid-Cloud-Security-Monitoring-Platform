from __future__ import annotations

from collections import Counter, deque
from copy import deepcopy
from datetime import datetime, timezone
from hashlib import sha256
from ipaddress import ip_address
from threading import RLock
from typing import Any, Iterable


SEVERITIES = ("Critical", "High", "Medium", "Low")
TERMINAL_ALERT_STATUSES = {"resolved", "mitigated", "false_positive", "false positive"}


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _iso_timestamp(value: datetime) -> str:
    return value.astimezone(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _parse_timestamp(value: Any) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _number(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _integer(value: Any, default: int = 0) -> int:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


def _alert_id(alert: dict[str, Any]) -> str:
    return str(alert.get("id") or alert.get("event_id") or "")


def _is_open_alert(alert: dict[str, Any]) -> bool:
    return str(alert.get("status") or "new").strip().lower() not in TERMINAL_ALERT_STATUSES


def _is_low_severity(alert: dict[str, Any]) -> bool:
    severity = str(alert.get("severity") or "Low").strip().title()
    return severity not in {"Critical", "High", "Medium"}


def _is_zeek_http_observation(alert: dict[str, Any], zeek: dict[str, Any]) -> bool:
    """Recognize a connection observed only through Zeek's HTTP analyzer.

    The correlating tailer emits ``http_only`` when it saw an HTTP transaction
    but the matching conn.log row did not arrive before the correlation window.
    Requiring the correlator identifiers keeps ordinary application HTTP alerts
    (which also have method/URI fields) out of the network-flow counters.
    """
    return (
        str(zeek.get("correlation_status") or "").strip().lower() == "http_only"
        and bool(str(zeek.get("sensor_id") or "").strip())
        and bool(str(zeek.get("transaction_id") or "").strip())
        and any(zeek.get(field) not in (None, "") for field in ("method", "uri"))
        and str(alert.get("source_ip") or "") not in ("", "0.0.0.0")
        and str(alert.get("destination_ip") or "") not in ("", "0.0.0.0")
    )


def _is_network_alert(alert: dict[str, Any]) -> bool:
    zeek = alert.get("zeek_evidence") or {}
    if not isinstance(zeek, dict):
        return False
    flow_fields = (
        "duration",
        "orig_bytes",
        "resp_bytes",
        "orig_pkts",
        "resp_pkts",
        "conn_state",
    )
    has_conn_evidence = alert.get("source_port") is not None or any(
        zeek.get(field) not in (None, "") for field in flow_fields
    )
    return has_conn_evidence or _is_zeek_http_observation(alert, zeek)


def severity_counts(alerts: Iterable[dict[str, Any]]) -> dict[str, int]:
    counts = {severity: 0 for severity in SEVERITIES}
    for alert in alerts:
        normalized = str(alert.get("severity") or "Low").strip().title()
        counts[normalized if normalized in counts else "Low"] += 1
    return counts


def attack_distribution(alerts: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    items = list(alerts)
    counts = Counter(str(alert.get("attack_type") or "Unknown") for alert in items)
    total = sum(counts.values())
    return [
        {
            "attackType": attack_type,
            "count": count,
            "percentage": round((count / total) * 100, 2) if total else 0.0,
        }
        for attack_type, count in counts.most_common()
    ]


def summarize_alerts(alerts: Iterable[dict[str, Any]]) -> dict[str, Any]:
    items = list(alerts)
    distribution = attack_distribution(items)
    counts = severity_counts(items)
    return {
        "total_alerts": len(items),
        "total_fusion_alerts": len(items),
        "top_threat": distribution[0]["attackType"] if distribution else None,
        "critical": counts["Critical"],
        "high": counts["High"],
        "medium": counts["Medium"],
        "low": counts["Low"],
    }


def dashboard_summary(alerts: Iterable[dict[str, Any]]) -> dict[str, Any]:
    items = list(alerts)
    summary = summarize_alerts(items)
    risks = [_number(alert.get("risk_score")) for alert in items if alert.get("risk_score") is not None]
    confidences = [
        _number(alert.get("confidence_score"))
        for alert in items
        if alert.get("confidence_score") is not None
    ]
    return {
        "totalAlerts": summary["total_alerts"],
        "totalFusionAlerts": summary["total_fusion_alerts"],
        "totalNetworkFlows": sum(1 for alert in items if _is_network_alert(alert)),
        "criticalAlerts": summary["critical"],
        "highAlerts": summary["high"],
        "mediumAlerts": summary["medium"],
        "lowAlerts": summary["low"],
        "openAlerts": sum(1 for alert in items if _is_open_alert(alert)),
        "topThreat": summary["top_threat"],
        "averageRiskScore": round(sum(risks) / len(risks), 2) if risks else None,
        "averageConfidence": round(sum(confidences) / len(confidences), 4) if confidences else None,
        "severityDistribution": [
            {"name": severity, "value": severity_counts(items)[severity]}
            for severity in SEVERITIES
        ],
        "scope": "retained_alerts",
    }


def network_activity(alerts: Iterable[dict[str, Any]]) -> dict[str, Any]:
    flows: list[dict[str, Any]] = []
    buckets: dict[str, dict[str, Any]] = {}

    for alert in alerts:
        if not _is_network_alert(alert):
            continue
        zeek = alert.get("zeek_evidence") or {}
        timestamp = str(alert.get("timestamp") or "")
        parsed = _parse_timestamp(timestamp)
        bucket_key = _iso_timestamp(parsed.replace(second=0, microsecond=0)) if parsed else timestamp
        risk_score = _integer(alert.get("risk_score"))
        is_anomaly = risk_score > 35
        direction = str(alert.get("direction") or "").lower()
        inbound = 1 if "external" in direction and "internal" in direction and direction.index("external") < direction.index("internal") else 0
        outbound = 1 if "internal" in direction and "external" in direction and direction.index("internal") < direction.index("external") else 0

        point = buckets.setdefault(
            bucket_key,
            {
                "timestamp": bucket_key,
                "flows": 0,
                "anomalies": 0,
                "inbound": 0,
                "outbound": 0,
            },
        )
        point["flows"] += 1
        point["anomalies"] += int(is_anomaly)
        point["inbound"] += inbound
        point["outbound"] += outbound

        orig_bytes = _integer(zeek.get("orig_bytes"))
        resp_bytes = _integer(zeek.get("resp_bytes"))
        orig_pkts = _integer(zeek.get("orig_pkts"))
        resp_pkts = _integer(zeek.get("resp_pkts"))
        source = "zeek.http" if _is_zeek_http_observation(alert, zeek) else "zeek.conn"
        flows.append(
            {
                "id": _alert_id(alert),
                "sensorId": zeek.get("sensor_id"),
                "source": source,
                "timestamp": timestamp,
                "srcIp": alert.get("source_ip"),
                "srcPort": alert.get("source_port"),
                "dstIp": alert.get("destination_ip"),
                "dstPort": _integer(alert.get("destination_port")),
                "protocol": str(alert.get("protocol") or "").upper(),
                "service": zeek.get("service"),
                "bytes": orig_bytes + resp_bytes,
                "packets": orig_pkts + resp_pkts,
                "verdict": "ANOMALY" if is_anomaly else "NORMAL",
                "severity": str(alert.get("severity") or "Low").upper(),
                "anomalyScore": risk_score,
                "correlationId": zeek.get("correlation_id"),
                "relatedAlertId": _alert_id(alert),
            }
        )

    points = sorted(buckets.values(), key=lambda point: point["timestamp"])
    flows.sort(key=lambda flow: flow["timestamp"], reverse=True)
    return {
        "totalFlows": len(flows),
        "totalAnomalies": sum(1 for flow in flows if flow["verdict"] == "ANOMALY"),
        "points": points,
        "flows": flows,
        "scope": "retained_alerts_with_flow_evidence",
    }


def asset_inventory(alerts: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    assets: dict[str, dict[str, Any]] = {}

    for alert in alerts:
        timestamp = str(alert.get("timestamp") or "")
        risk_score = _integer(alert.get("risk_score"))
        severity = str(alert.get("severity") or "Low").title()
        zeek = alert.get("zeek_evidence") or {}
        service = str(zeek.get("service") or "").strip()
        protocol = str(alert.get("protocol") or "").strip().upper()
        destination_port = _integer(alert.get("destination_port"))

        endpoints = (
            (str(alert.get("source_ip") or ""), "source"),
            (str(alert.get("destination_ip") or ""), "destination"),
        )
        for ip, role in endpoints:
            if not ip or ip == "0.0.0.0":
                continue
            asset = assets.setdefault(
                ip,
                {
                    "id": f"asset-{sha256(ip.encode('utf-8')).hexdigest()[:12]}",
                    "hostname": None,
                    "ip": ip,
                    "zone": None,
                    "type": None,
                    "owner": None,
                    "status": "Normal",
                    "riskScore": 0,
                    "openAlerts": 0,
                    "lastSeen": timestamp,
                    "services": set(),
                    "ports": set(),
                    "roles": set(),
                    "connections": [],
                    "alertIds": set(),
                },
            )
            asset["roles"].add(role)
            if service:
                asset["services"].add(service)
            if protocol:
                asset["services"].add(protocol)
            if destination_port:
                asset["ports"].add(destination_port)
            asset["riskScore"] = max(asset["riskScore"], risk_score)
            if _parse_timestamp(timestamp) and (
                not _parse_timestamp(asset["lastSeen"])
                or _parse_timestamp(timestamp) > _parse_timestamp(asset["lastSeen"])
            ):
                asset["lastSeen"] = timestamp
            alert_id = _alert_id(alert)
            if alert_id not in asset["alertIds"] and _is_open_alert(alert):
                asset["openAlerts"] += 1
            asset["alertIds"].add(alert_id)
            if role == "source" and _is_network_alert(alert):
                asset["connections"].append(
                    {
                        "timestamp": timestamp,
                        "protocol": protocol,
                        "service": service,
                        "destPort": destination_port,
                        "bytes": _integer(zeek.get("orig_bytes")) + _integer(zeek.get("resp_bytes")),
                        "state": str(zeek.get("conn_state") or ""),
                        "destinationIp": alert.get("destination_ip"),
                    }
                )
            if severity == "Critical" or asset["riskScore"] >= 80:
                asset["status"] = "Critical"
            elif asset["status"] != "Critical" and (severity == "High" or asset["riskScore"] >= 50):
                asset["status"] = "Warning"

    result: list[dict[str, Any]] = []
    for asset in assets.values():
        asset["services"] = sorted(asset["services"])
        asset["ports"] = sorted(asset["ports"])
        asset["roles"] = sorted(asset["roles"])
        asset["alertIds"] = sorted(asset["alertIds"])
        result.append(asset)
    result.sort(key=lambda asset: (-asset["riskScore"], asset["ip"]))
    return result


def ioc_inventory(alerts: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    indicators: dict[str, dict[str, Any]] = {}
    for alert in alerts:
        risk_score = _integer(alert.get("risk_score"))
        attack_type = str(alert.get("attack_type") or "")
        if risk_score <= 35 or attack_type.lower() in {"benign / no confirmed attack", "unclassified event"}:
            continue
        value = str(alert.get("source_ip") or "")
        if not value or value == "0.0.0.0":
            continue
        try:
            version = ip_address(value).version
            indicator_type = f"IPv{version}"
        except ValueError:
            indicator_type = "IP"
        timestamp = str(alert.get("timestamp") or "")
        item = indicators.setdefault(
            value,
            {
                "id": f"ioc-{sha256(value.encode('utf-8')).hexdigest()[:12]}",
                "type": indicator_type,
                "value": value,
                "severity": str(alert.get("severity") or "Low"),
                "confidence": _number(alert.get("confidence_score")),
                "riskScore": risk_score,
                "firstSeen": timestamp,
                "lastSeen": timestamp,
                "threats": set(),
                "relatedAlertIds": set(),
                "source": "fusion_alerts",
            },
        )
        item["riskScore"] = max(item["riskScore"], risk_score)
        item["confidence"] = max(item["confidence"], _number(alert.get("confidence_score")))
        item["threats"].add(attack_type)
        item["relatedAlertIds"].add(_alert_id(alert))
        timestamps = [candidate for candidate in (item["firstSeen"], item["lastSeen"], timestamp) if _parse_timestamp(candidate)]
        if timestamps:
            item["firstSeen"] = min(timestamps, key=lambda candidate: _parse_timestamp(candidate) or _utc_now())
            item["lastSeen"] = max(timestamps, key=lambda candidate: _parse_timestamp(candidate) or _utc_now())
        if risk_score >= item["riskScore"]:
            item["severity"] = str(alert.get("severity") or item["severity"])

    result: list[dict[str, Any]] = []
    for indicator in indicators.values():
        indicator["threats"] = sorted(indicator["threats"])
        indicator["relatedAlertIds"] = sorted(indicator["relatedAlertIds"])
        result.append(indicator)
    result.sort(key=lambda indicator: (-indicator["riskScore"], indicator["value"]))
    return result


def reports_summary(alerts: Iterable[dict[str, Any]]) -> dict[str, Any]:
    items = list(alerts)
    summary = summarize_alerts(items)
    risks = [_number(alert.get("risk_score")) for alert in items if alert.get("risk_score") is not None]
    timestamps = [str(alert.get("timestamp")) for alert in items if _parse_timestamp(alert.get("timestamp"))]
    return {
        "totalAlerts": len(items),
        "criticalAlerts": summary["critical"],
        "highAlerts": summary["high"],
        "mediumAlerts": summary["medium"],
        "lowAlerts": summary["low"],
        "topThreat": summary["top_threat"],
        "averageRisk": round(sum(risks) / len(risks), 2) if risks else None,
        "meanLatency": None,
        "attackDistribution": attack_distribution(items),
        "severityDistribution": severity_counts(items),
        "period": {
            "from": min(timestamps, key=lambda value: _parse_timestamp(value) or _utc_now()) if timestamps else None,
            "to": max(timestamps, key=lambda value: _parse_timestamp(value) or _utc_now()) if timestamps else None,
        },
        "scope": "retained_alerts",
    }


class AlertStore:
    def __init__(self, max_items: int = 200) -> None:
        self._max_items = max(0, int(max_items))
        # Retention is enforced explicitly so ordinary Low telemetry cannot
        # silently displace a retained High/Critical incident.
        self._items: deque[dict[str, Any]] = deque()
        self._ingest_times: deque[datetime] = deque(maxlen=max(max_items * 5, 1000))
        self._ingested_total = 0
        self._last_ingest_at: str | None = None
        self._lock = RLock()

    def _record_ingest(self) -> None:
        now = _utc_now()
        self._ingest_times.append(now)
        self._ingested_total += 1
        self._last_ingest_at = _iso_timestamp(now)

    def record_ingest(self) -> None:
        """Record accepted telemetry that is processed asynchronously elsewhere."""
        with self._lock:
            self._record_ingest()

    def add(self, alert: dict[str, Any]) -> dict[str, Any]:
        stored = deepcopy(alert)
        with self._lock:
            self._items.appendleft(stored)
            self._enforce_retention()
            self._record_ingest()
        return deepcopy(stored)

    def upsert(self, alert: dict[str, Any]) -> tuple[dict[str, Any], bool]:
        """Insert a new alert or replace an existing alert with the same id."""
        stored = deepcopy(alert)
        alert_id = _alert_id(stored)
        with self._lock:
            if alert_id:
                for index, existing in enumerate(self._items):
                    if _alert_id(existing) == alert_id:
                        self._items[index] = stored
                        self._record_ingest()
                        return deepcopy(stored), False
            self._items.appendleft(stored)
            self._enforce_retention()
            self._record_ingest()
            return deepcopy(stored), True

    def _enforce_retention(self) -> None:
        while len(self._items) > self._max_items:
            low_index = next(
                (
                    index
                    for index in range(len(self._items) - 1, -1, -1)
                    if _is_low_severity(self._items[index])
                ),
                None,
            )
            if low_index is None:
                self._items.pop()
            else:
                del self._items[low_index]

    def get(self, alert_id: str) -> dict[str, Any] | None:
        with self._lock:
            for item in self._items:
                if _alert_id(item) == alert_id:
                    return deepcopy(item)
        return None

    def update(self, alert_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
        with self._lock:
            for index, existing in enumerate(self._items):
                if _alert_id(existing) != alert_id:
                    continue
                updated = {**existing, **deepcopy(updates)}
                self._items[index] = updated
                return deepcopy(updated)
        return None

    def list(self, limit: int = 50) -> list[dict[str, Any]]:
        with self._lock:
            return deepcopy(list(self._items)[:limit])

    @property
    def last_ingest_at(self) -> str | None:
        with self._lock:
            return self._last_ingest_at

    def metrics(self) -> dict[str, Any]:
        cutoff = _utc_now().timestamp() - 60.0
        with self._lock:
            while self._ingest_times and self._ingest_times[0].timestamp() < cutoff:
                self._ingest_times.popleft()
            return {
                "retained_alerts": len(self._items),
                "ingested_total": self._ingested_total,
                "event_rate_per_second": round(len(self._ingest_times) / 60.0, 4),
                "last_ingest_at": self._last_ingest_at,
            }

    def summary(self) -> dict[str, Any]:
        return summarize_alerts(self.list(limit=len(self._items)))

    def dashboard_summary(self) -> dict[str, Any]:
        return dashboard_summary(self.list(limit=len(self._items)))

    def network_activity(self) -> dict[str, Any]:
        return network_activity(self.list(limit=len(self._items)))

    def attack_distribution(self) -> list[dict[str, Any]]:
        return attack_distribution(self.list(limit=len(self._items)))

    def assets(self) -> list[dict[str, Any]]:
        return asset_inventory(self.list(limit=len(self._items)))

    def iocs(self) -> list[dict[str, Any]]:
        return ioc_inventory(self.list(limit=len(self._items)))

    def reports_summary(self) -> dict[str, Any]:
        return reports_summary(self.list(limit=len(self._items)))
