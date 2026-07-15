from __future__ import annotations

import os
from dataclasses import replace
from typing import Any

from app.adapters.ai1_real import RealAI1Adapter
from app.adapters.ai2a_real import RealAI2AAdapter
from app.adapters.ai2b_real import RealAI2BAdapter
from app.adapters.base import ModelAdapter
from app.adapters.mock import MockAI1Adapter, MockAI2AAdapter, MockAI2BAdapter
from app.adapters.unavailable import UnavailableAdapter
from app.contracts import ModelOutput, ModelSource, ModelStatus
from app.services.fusion import FusionService
from app.services.orchestrator import EventOrchestrator
from app.services.store import AlertStore
from app.services.websocket_manager import WebSocketManager
from app.services.workspace_store import WorkspaceStore


class ReplayAdapter:
    """Expose explicit replay semantics while reusing deterministic fixtures."""

    def __init__(self, delegate: ModelAdapter) -> None:
        self.delegate = delegate
        self.name = delegate.name
        self.runtime_mode = "replay"

    def supports(self, event: dict[str, Any]) -> bool:
        return self.delegate.supports(event)

    def build_input(self, event: dict[str, Any]) -> dict[str, Any]:
        return self.delegate.build_input(event)

    def predict(self, model_input: dict[str, Any]) -> ModelOutput:
        output = self.delegate.predict(model_input)
        return replace(
            output,
            status=ModelStatus.SIMULATED.value,
            source=ModelSource.REPLAY.value,
            reason=f"Replay fixture output. {output.reason}",
        )


def _tag_mode(adapter: Any, mode: str) -> Any:
    adapter.runtime_mode = mode
    return adapter


def build_orchestrator() -> EventOrchestrator:
    return EventOrchestrator(
        adapters={
            "AI1": _build_ai1_adapter(),
            "AI2A": _build_ai2a_adapter(),
            "AI2B": _build_ai2b_adapter(),
        },
        fusion=FusionService(),
    )


def _mode(name: str, default: str = "unavailable") -> str:
    return os.getenv(f"{name}_PREDICTOR_MODE", default).strip().lower()


def _build_ai1_adapter() -> object:
    mode = _mode("AI1")
    if mode == "mock":
        return _tag_mode(MockAI1Adapter(), mode)
    if mode == "replay":
        return ReplayAdapter(MockAI1Adapter())
    if mode == "unavailable":
        return _tag_mode(UnavailableAdapter(
            "AI1",
            reason="AI1 adapter is disabled by AI1_PREDICTOR_MODE=unavailable.",
            input_scope="ZEEK_CONN_FLOW_ANOMALY_FEATURES",
            supported_scope="flow",
        ), mode)
    if mode == "real":
        return _tag_mode(RealAI1Adapter(), mode)
    return _tag_mode(UnavailableAdapter(
        "AI1",
        reason=f"Unsupported AI1_PREDICTOR_MODE={mode!r}.",
        input_scope="ZEEK_CONN_FLOW_ANOMALY_FEATURES",
        supported_scope="flow",
    ), mode)


def _build_ai2a_adapter() -> object:
    mode = _mode("AI2A")
    if mode == "mock":
        return _tag_mode(MockAI2AAdapter(), mode)
    if mode == "replay":
        return ReplayAdapter(MockAI2AAdapter())
    if mode == "unavailable":
        return _tag_mode(UnavailableAdapter(
            "AI2A",
            reason="AI2A adapter is disabled by AI2A_PREDICTOR_MODE=unavailable.",
            input_scope="ZEEK_CONN_FLOW_FEATURES",
            supported_scope="flow",
        ), mode)
    if mode == "real":
        return _tag_mode(RealAI2AAdapter(), mode)
    return _tag_mode(UnavailableAdapter(
        "AI2A",
        reason=f"Unsupported AI2A_PREDICTOR_MODE={mode!r}.",
        input_scope="ZEEK_CONN_FLOW_FEATURES",
        supported_scope="flow",
    ), mode)


def _build_ai2b_adapter() -> object:
    mode = _mode("AI2B")
    if mode == "mock":
        return _tag_mode(MockAI2BAdapter(), mode)
    if mode == "replay":
        return ReplayAdapter(MockAI2BAdapter())
    if mode == "unavailable":
        return _tag_mode(UnavailableAdapter(
            "AI2B",
            reason="AI2B adapter is disabled by AI2B_PREDICTOR_MODE=unavailable.",
            input_scope="HTTP_URI_QUERY",
            supported_scope="http",
        ), mode)
    if mode == "real":
        return _tag_mode(RealAI2BAdapter(), mode)
    return _tag_mode(UnavailableAdapter(
        "AI2B",
        reason=f"Unsupported AI2B_PREDICTOR_MODE={mode!r}.",
        input_scope="HTTP_URI_QUERY",
        supported_scope="http",
    ), mode)


def model_runtime_status(runtime: EventOrchestrator | None = None) -> list[dict[str, Any]]:
    active = runtime or orchestrator
    statuses: list[dict[str, Any]] = []
    for name in ("AI1", "AI2A", "AI2B"):
        adapter = active.adapters.get(name)
        mode = str(getattr(adapter, "runtime_mode", "unavailable"))
        reason = str(getattr(adapter, "reason", "") or getattr(adapter, "_load_error", ""))
        source = mode
        if adapter is None or isinstance(adapter, UnavailableAdapter):
            state = "unavailable"
            source = "unavailable"
        elif mode in {"mock", "replay"}:
            state = "simulated"
        elif mode == "real":
            loaded = getattr(adapter, "_model", None) is not None
            if name == "AI2A":
                loaded = loaded and getattr(adapter, "_preprocessor", None) is not None
            state = "healthy" if loaded else "unavailable"
            source = "real" if loaded else "unavailable"
        else:
            state = "unavailable"
            source = "unavailable"
        statuses.append(
            {
                "name": name,
                "mode": mode,
                "status": state,
                "source": source,
                "accuracy": None,
                "lastTrained": None,
                "modelVersion": getattr(adapter, "_model_version", None),
                "releaseCandidate": None,
                "reason": reason or None,
                "message": reason or None,
                "lastSeenAt": None,
            }
        )
    return statuses


def runtime_settings() -> dict[str, Any]:
    return {
        "runtime": {
            "deploymentTarget": os.getenv("SOC_DEPLOYMENT_TARGET", "local"),
            "awsRegion": os.getenv("AWS_REGION", "ap-southeast-1"),
            "sqsConfigured": bool(os.getenv("SQS_QUEUE_URL")),
            "s3DataBucketConfigured": bool(os.getenv("S3_DATA_BUCKET")),
            "rdsConfigured": bool(os.getenv("RDS_SECRET_ID")),
            "ingestHmacConfigured": bool(os.getenv("INGEST_HMAC_SECRET_ID") or os.getenv("INGEST_HMAC_SECRET")),
            "predictorModes": {name: _mode(name) for name in ("AI1", "AI2A", "AI2B")},
            "workspacePersistence": "process_local",
            "workspaceSharedAcrossInstances": False,
            "workspaceSurvivesRestart": False,
        }
    }


orchestrator = build_orchestrator()
store = AlertStore()
websockets = WebSocketManager()
workspace = WorkspaceStore(runtime_settings=runtime_settings())
