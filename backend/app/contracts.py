from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
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
