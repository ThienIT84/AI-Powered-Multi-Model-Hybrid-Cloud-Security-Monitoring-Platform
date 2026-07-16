from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from ipaddress import ip_address
from typing import Any
from uuid import uuid4


class ModelStatus(str, Enum):
    COMPLETED = "completed"
    NOT_APPLICABLE = "not_applicable"
    NOT_AVAILABLE = "not_available"
    NOT_RUN = "not_run"
    FAILED = "failed"
    TIMEOUT = "timeout"
    SIMULATED = "simulated"


class ModelSource(str, Enum):
    REAL = "real"
    MOCK = "mock"
    REPLAY = "replay"
    UNAVAILABLE = "unavailable"


@dataclass(frozen=True)
class ModelOutput:
    status: str
    source: str
    label: str | None = None
    confidence: float | None = None
    probabilities: dict[str, float] = field(default_factory=dict)
    model_version: str = ""
    release_candidate: str = ""
    input_scope: str = ""
    reason: str = ""

    def to_dict(self) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "status": self.status,
            "source": self.source,
            "label": self.label,
            "confidence": self.confidence,
            "probabilities": self.probabilities,
            "model_version": self.model_version,
            "release_candidate": self.release_candidate,
            "input_scope": self.input_scope,
            "reason": self.reason,
        }
        return payload


@dataclass(frozen=True)
class FusionOutput:
    mode: str
    final_label: str
    risk_score: int
    severity: str
    contributors: list[str]
    excluded_models: dict[str, str]
    decision_version: str = "FUSION_V1_RULE_BASED"
    reason: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "mode": self.mode,
            "final_label": self.final_label,
            "risk_score": self.risk_score,
            "severity": self.severity,
            "contributors": self.contributors,
            "excluded_models": self.excluded_models,
            "decision_version": self.decision_version,
            "reason": self.reason,
        }


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def normalize_event(raw: dict[str, Any]) -> dict[str, Any]:
    evidence = dict(raw.get("evidence") or {})
    event_type = str(raw.get("event_type") or infer_event_type(evidence))
    return {
        "schema_version": str(raw.get("schema_version") or "1.0"),
        "event_type": event_type,
        "event_id": str(raw.get("event_id") or f"evt-{uuid4().hex[:12]}"),
        "correlation_id": str(raw.get("correlation_id") or raw.get("event_id") or f"corr-{uuid4().hex[:12]}"),
        "transaction_id": str(raw.get("transaction_id") or ""),
        "sensor_id": str(raw.get("sensor_id") or ""),
        "correlation_status": str(raw.get("correlation_status") or event_type),
        "timestamp": str(raw.get("timestamp") or utc_now()),
        "source_ip": str(raw.get("source_ip") or "0.0.0.0"),
        "destination_ip": str(raw.get("destination_ip") or "0.0.0.0"),
        "evidence": {
            "http": evidence.get("http"),
            "flow": evidence.get("flow"),
            "suricata": evidence.get("suricata"),
        },
    }


class EventContractError(ValueError):
    """Raised when an external telemetry payload violates the ingest contract."""


SUPPORTED_ZEEK_EVENT_TYPES = {"network_flow", "http", "combined"}
MAX_ZEEK_JSON_DEPTH = 64


def _validate_json_tree(value: Any) -> None:
    """Reject values that cannot be represented by standards-compliant JSON.

    The public ingest body has already been decoded by ``json.loads``, but the
    standard-library decoder accepts NaN/Infinity extensions.  An iterative walk
    also gives us a conservative depth limit before S3/SQS JSON serialization.
    """

    stack: list[tuple[Any, str, int]] = [(value, "$", 0)]
    seen_containers: set[int] = set()
    while stack:
        current, path, depth = stack.pop()
        if isinstance(current, float) and not math.isfinite(current):
            raise EventContractError(f"{path} must not contain NaN or Infinity")
        if not isinstance(current, (dict, list)):
            continue
        if depth > MAX_ZEEK_JSON_DEPTH:
            raise EventContractError(
                f"request JSON nesting must not exceed {MAX_ZEEK_JSON_DEPTH} levels"
            )
        container_id = id(current)
        if container_id in seen_containers:
            raise EventContractError("request JSON must not contain cyclic containers")
        seen_containers.add(container_id)
        if isinstance(current, dict):
            stack.extend(
                (child, f"{path}.{key}", depth + 1)
                for key, child in current.items()
            )
        else:
            stack.extend(
                (child, f"{path}[{index}]", depth + 1)
                for index, child in enumerate(current)
            )


def validate_zeek_ingest_event(raw: dict[str, Any]) -> dict[str, Any]:
    """Validate and normalize a Zeek Collector/Tailer event.

    Legacy local endpoints intentionally remain permissive.  The public cloud
    ingest endpoint uses this stricter contract so malformed telemetry is never
    placed on the shared SQS queue.
    """

    if not isinstance(raw, dict):
        raise EventContractError("request body must be a JSON object")

    _validate_json_tree(raw)

    if str(raw.get("schema_version") or "") != "1.0":
        raise EventContractError("schema_version must be 1.0")
    if not isinstance(raw.get("evidence"), dict):
        raise EventContractError("evidence must be a JSON object")
    raw_evidence = raw["evidence"]
    for evidence_name in ("http", "flow", "suricata"):
        evidence_value = raw_evidence.get(evidence_name)
        if evidence_value is not None and not isinstance(evidence_value, dict):
            raise EventContractError(
                f"evidence.{evidence_name} must be a JSON object or null"
            )

    required_text_fields = ("event_id", "sensor_id", "timestamp", "source_ip", "destination_ip")
    missing = [field for field in required_text_fields if not str(raw.get(field) or "").strip()]
    if missing:
        raise EventContractError(f"missing required field(s): {', '.join(missing)}")
    for field_name in ("event_id", "sensor_id"):
        if len(str(raw[field_name]).encode("utf-8")) > 200:
            raise EventContractError(f"{field_name} must not exceed 200 UTF-8 bytes")

    event = normalize_event(raw)
    if event["event_type"] not in SUPPORTED_ZEEK_EVENT_TYPES:
        supported = ", ".join(sorted(SUPPORTED_ZEEK_EVENT_TYPES))
        raise EventContractError(f"event_type must be one of: {supported}")

    for field_name in ("source_ip", "destination_ip"):
        try:
            ip_address(event[field_name])
        except ValueError as exc:
            raise EventContractError(f"{field_name} must be a valid IPv4 or IPv6 address") from exc

    try:
        parsed_timestamp = datetime.fromisoformat(event["timestamp"].replace("Z", "+00:00"))
    except ValueError as exc:
        raise EventContractError("timestamp must be an ISO-8601 value") from exc
    if parsed_timestamp.tzinfo is None:
        raise EventContractError("timestamp must include a timezone")

    evidence = event["evidence"]
    has_flow = isinstance(evidence.get("flow"), dict) and bool(evidence["flow"])
    has_http = isinstance(evidence.get("http"), dict) and bool(evidence["http"])
    if event["event_type"] == "network_flow" and not has_flow:
        raise EventContractError("network_flow events require evidence.flow")
    if event["event_type"] == "http" and not has_http:
        raise EventContractError("http events require evidence.http")
    if event["event_type"] == "combined" and not (has_flow and has_http):
        raise EventContractError("combined events require evidence.flow and evidence.http")

    if has_http:
        http = evidence["http"]
        if not str(http.get("method") or "").strip() or not str(http.get("uri") or "").strip():
            raise EventContractError("evidence.http requires method and uri")

    return event


def infer_event_type(evidence: dict[str, Any]) -> str:
    has_http = bool(evidence.get("http"))
    has_flow = bool(evidence.get("flow"))
    if has_http and has_flow:
        return "combined"
    if has_http:
        return "http"
    if has_flow:
        return "network_flow"
    return "unknown"


def default_model_output(model_name: str, status: str, reason: str, *, input_scope: str = "") -> ModelOutput:
    source = ModelSource.UNAVAILABLE.value if status == ModelStatus.NOT_AVAILABLE.value else ModelSource.REPLAY.value
    return ModelOutput(
        status=status,
        source=source,
        model_version=f"{model_name}_UNAVAILABLE",
        input_scope=input_scope,
        reason=reason,
    )
