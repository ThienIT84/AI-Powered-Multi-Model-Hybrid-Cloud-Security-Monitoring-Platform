from __future__ import annotations

import os

from app.adapters.ai2b_real import RealAI2BAdapter
from app.adapters.mock import MockAI1Adapter, MockAI2AAdapter, MockAI2BAdapter
from app.services.fusion import FusionService
from app.services.orchestrator import EventOrchestrator
from app.services.store import AlertStore
from app.services.websocket_manager import WebSocketManager


def build_orchestrator() -> EventOrchestrator:
    ai2b_mode = os.getenv("AI2B_PREDICTOR_MODE", "mock").lower()
    ai2b_adapter = RealAI2BAdapter() if ai2b_mode == "real" else MockAI2BAdapter()
    return EventOrchestrator(
        adapters={
            "AI1": MockAI1Adapter(),
            "AI2A": MockAI2AAdapter(),
            "AI2B": ai2b_adapter,
        },
        fusion=FusionService(),
    )


orchestrator = build_orchestrator()
store = AlertStore()
websockets = WebSocketManager()

