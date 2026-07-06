from __future__ import annotations

import os

from app.adapters.ai1_real import RealAI1Adapter
from app.adapters.ai2a_real import RealAI2AAdapter
from app.adapters.ai2b_real import RealAI2BAdapter
from app.adapters.mock import MockAI1Adapter, MockAI2AAdapter, MockAI2BAdapter
from app.adapters.unavailable import UnavailableAdapter
from app.services.fusion import FusionService
from app.services.orchestrator import EventOrchestrator
from app.services.s3_service import S3Service
from app.services.sqs_service import SQSService
from app.services.store import AlertStore
from app.services.websocket_manager import WebSocketManager


def build_orchestrator() -> EventOrchestrator:
    return EventOrchestrator(
        adapters={
            "AI1": _build_ai1_adapter(),
            "AI2A": _build_ai2a_adapter(),
            "AI2B": _build_ai2b_adapter(),
        },
        fusion=FusionService(),
    )


def _mode(name: str, default: str = "mock") -> str:
    return os.getenv(f"{name}_PREDICTOR_MODE", default).strip().lower()


def _build_ai1_adapter() -> object:
    mode = _mode("AI1")
    if mode == "mock":
        return MockAI1Adapter()
    if mode == "unavailable":
        return UnavailableAdapter(
            "AI1",
            reason="AI1 adapter is disabled by AI1_PREDICTOR_MODE=unavailable.",
            input_scope="ZEEK_CONN_FLOW_ANOMALY_FEATURES",
            supported_scope="flow",
        )
    if mode == "real":
        return RealAI1Adapter()
    return UnavailableAdapter(
        "AI1",
        reason=f"Unsupported AI1_PREDICTOR_MODE={mode!r}.",
        input_scope="ZEEK_CONN_FLOW_ANOMALY_FEATURES",
        supported_scope="flow",
    )


def _build_ai2a_adapter() -> object:
    mode = _mode("AI2A")
    if mode == "mock":
        return MockAI2AAdapter()
    if mode == "unavailable":
        return UnavailableAdapter(
            "AI2A",
            reason="AI2A adapter is disabled by AI2A_PREDICTOR_MODE=unavailable.",
            input_scope="ZEEK_CONN_FLOW_FEATURES",
            supported_scope="flow",
        )
    if mode == "real":
        return RealAI2AAdapter()
    return UnavailableAdapter(
        "AI2A",
        reason=f"Unsupported AI2A_PREDICTOR_MODE={mode!r}.",
        input_scope="ZEEK_CONN_FLOW_FEATURES",
        supported_scope="flow",
    )


def _build_ai2b_adapter() -> object:
    mode = _mode("AI2B")
    if mode == "mock":
        return MockAI2BAdapter()
    if mode == "unavailable":
        return UnavailableAdapter(
            "AI2B",
            reason="AI2B adapter is disabled by AI2B_PREDICTOR_MODE=unavailable.",
            input_scope="HTTP_URI_QUERY",
            supported_scope="http",
        )
    if mode == "real":
        return RealAI2BAdapter()
    return UnavailableAdapter(
        "AI2B",
        reason=f"Unsupported AI2B_PREDICTOR_MODE={mode!r}.",
        input_scope="HTTP_URI_QUERY",
        supported_scope="http",
    )


orchestrator = build_orchestrator()
store = AlertStore()
websockets = WebSocketManager()
s3_service = S3Service()
sqs_service = SQSService()
processing_mode = os.getenv("PROCESSING_MODE", "sync").strip().lower()
