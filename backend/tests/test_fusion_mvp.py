from __future__ import annotations

from app.adapters.mock import MockAI1Adapter, MockAI2AAdapter, MockAI2BAdapter
from app.contracts import ModelStatus
from app.services.fusion import FusionService
from app.services.orchestrator import EventOrchestrator


def build_orchestrator() -> EventOrchestrator:
    return EventOrchestrator({"AI1": MockAI1Adapter(), "AI2A": MockAI2AAdapter(), "AI2B": MockAI2BAdapter()}, FusionService())


def test_http_only_event_does_not_run_flow_models() -> None:
    alert = build_orchestrator().process(
        {
            "event_type": "http",
            "source_ip": "1.1.1.1",
            "destination_ip": "2.2.2.2",
            "evidence": {"http": {"method": "GET", "uri": "/search?q=mock-sqli"}},
        }
    )

    ai = alert["ai_analysis"]
    assert ai["ai1"]["status"] == ModelStatus.NOT_APPLICABLE.value
    assert ai["ai2a"]["status"] == ModelStatus.NOT_APPLICABLE.value
    assert ai["ai2b"]["status"] == ModelStatus.COMPLETED.value
    assert alert["attack_type"] == "SQL Injection"


def test_flow_only_event_does_not_run_ai2b() -> None:
    alert = build_orchestrator().process(
        {
            "event_type": "network_flow",
            "source_ip": "1.1.1.1",
            "destination_ip": "2.2.2.2",
            "evidence": {"flow": {"attack_hint": "scan", "orig_pkts": 900, "service": "ssh", "dst_port": 22}},
        }
    )

    ai = alert["ai_analysis"]
    assert ai["ai1"]["status"] == ModelStatus.COMPLETED.value
    assert ai["ai2a"]["status"] == ModelStatus.COMPLETED.value
    assert ai["ai2b"]["status"] == ModelStatus.NOT_APPLICABLE.value
    assert alert["attack_type"] == "Suspicious Network Activity"


def test_combined_event_uses_all_supported_mock_adapters() -> None:
    alert = build_orchestrator().process(
        {
            "event_type": "combined",
            "source_ip": "1.1.1.1",
            "destination_ip": "2.2.2.2",
            "evidence": {
                "http": {"method": "GET", "uri": "/search?q=mock-xss"},
                "flow": {"attack_hint": "web", "orig_pkts": 100, "service": "http", "dst_port": 80},
            },
        }
    )

    ai = alert["ai_analysis"]
    assert ai["ai1"]["status"] == ModelStatus.COMPLETED.value
    assert ai["ai2a"]["status"] == ModelStatus.COMPLETED.value
    assert ai["ai2b"]["web_attack_type"] == "XSS"
    assert alert["attack_type"] == "Cross-Site Scripting"
    assert alert["ai_analysis"]["fusion"]["mode"] == "SIMULATED_FULL_MULTI_MODEL"

