from __future__ import annotations

from app.adapters.mock import MockAI1Adapter, MockAI2AAdapter, MockAI2BAdapter
from app.contracts import ModelOutput, ModelSource, ModelStatus
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


def test_ai2a_treats_ordinary_http_flow_as_normal_without_attack_hint() -> None:
    adapter = MockAI2AAdapter()

    output = adapter.predict({"service": "http", "dst_port": 80, "orig_pkts": 10})

    assert output.label == "NORMAL"


def test_ai2a_treats_ordinary_https_flow_as_normal_without_attack_hint() -> None:
    adapter = MockAI2AAdapter()

    output = adapter.predict({"service": "ssl", "dst_port": 443, "orig_pkts": 10})

    assert output.label == "NORMAL"


def test_ai2a_preserves_explicit_web_attack_hint() -> None:
    adapter = MockAI2AAdapter()

    output = adapter.predict({"attack_hint": "web", "service": "http", "dst_port": 80})

    assert output.label == "WEB_ATTACK"


def test_ai1_marks_small_flow_anomalous_when_rate_detector_flags_dos() -> None:
    output = MockAI1Adapter().predict(
        {
            "service": "http",
            "orig_pkts": 2,
            "orig_bytes": 200,
            "network_rate_features": {
                "same_src_dst_connection_count": 20,
                "dos_suspected": True,
                "ddos_suspected": False,
            },
        }
    )

    assert output.label == "ANOMALY"
    assert output.confidence == 0.93
    assert "rate burst" in output.reason


def test_ai2a_uses_rate_flags_for_dos_and_ddos_classes() -> None:
    adapter = MockAI2AAdapter()

    dos = adapter.predict(
        {"network_rate_features": {"dos_suspected": True, "ddos_suspected": False}}
    )
    ddos = adapter.predict(
        {"network_rate_features": {"dos_suspected": True, "ddos_suspected": True}}
    )

    assert dos.label == "DOS_INDICATOR"
    assert ddos.label == "DDOS_INDICATOR"
    assert ddos.confidence > dos.confidence


def test_ai2a_prioritizes_ssh_temporal_burst_over_generic_dos_flag() -> None:
    output = MockAI2AAdapter().predict(
        {
            "service": "ssh",
            "dst_port": 22,
            "ai2a_features": {
                "is_ssh": 1,
                "ssh_count_60s_same_src_dst": 8,
                "ssh_non_success_conn_count_60s_same_src_dst": 5,
            },
            "network_rate_features": {
                "same_src_dst_connection_count": 20,
                "dos_suspected": True,
                "ddos_suspected": False,
            },
        }
    )

    assert output.label == "SSH_BRUTEFORCE_INDICATOR"
    assert "non_success_60s=5" in output.reason


def test_corroborated_rate_burst_fuses_to_simulated_dos_and_keeps_evidence() -> None:
    rate_features = {
        "window_seconds": 10.0,
        "same_src_dst_connection_count": 20,
        "destination_connection_count": 20,
        "unique_source_count": 1,
        "dos_suspected": True,
        "ddos_suspected": False,
    }

    alert = build_orchestrator().process(
        {
            "event_type": "network_flow",
            "source_ip": "192.168.137.145",
            "destination_ip": "192.168.137.141",
            "evidence": {
                "flow": {
                    "service": "http",
                    "dst_port": 80,
                    "orig_pkts": 2,
                    "network_rate_features": rate_features,
                }
            },
        }
    )

    assert alert["ai_analysis"]["ai1"]["verdict"] == "ANOMALY"
    assert alert["ai_analysis"]["ai2a"]["attack_type"] == "DOS_INDICATOR"
    assert alert["attack_type"] == "Denial of Service"
    assert alert["severity"] == "High"
    assert alert["risk_score"] >= 85
    assert alert["ai_analysis"]["fusion"]["mode"] == "SIMULATED_PARTIAL"
    assert alert["zeek_evidence"]["rate_features"] == rate_features
    assert alert["mitre"]["technique_id"] == "T1498"


def test_corroborated_distributed_burst_fuses_to_critical_ddos() -> None:
    alert = build_orchestrator().process(
        {
            "event_type": "network_flow",
            "source_ip": "192.0.2.10",
            "destination_ip": "10.10.10.50",
            "evidence": {
                "flow": {
                    "service": "http",
                    "dst_port": 80,
                    "orig_pkts": 2,
                    "network_rate_features": {
                        "window_seconds": 10.0,
                        "same_src_dst_connection_count": 12,
                        "destination_connection_count": 50,
                        "unique_source_count": 5,
                        "dos_suspected": False,
                        "ddos_suspected": True,
                    },
                }
            },
        }
    )

    assert alert["ai_analysis"]["ai1"]["verdict"] == "ANOMALY"
    assert alert["ai_analysis"]["ai2a"]["attack_type"] == "DDOS_INDICATOR"
    assert alert["attack_type"] == "Distributed Denial of Service"
    assert alert["severity"] == "Critical"
    assert alert["risk_score"] >= 94


def test_combined_sqli_keeps_ai2a_network_class_normal_and_uses_ai2b() -> None:
    alert = build_orchestrator().process(
        {
            "event_type": "combined",
            "source_ip": "1.1.1.1",
            "destination_ip": "2.2.2.2",
            "evidence": {
                "flow": {"service": "http", "dst_port": 80, "orig_pkts": 10},
                "http": {"method": "GET", "uri": "/?q=%27%20OR%201%3D1--"},
            },
        }
    )

    assert alert["ai_analysis"]["ai2a"]["attack_type"] == "NORMAL"
    assert alert["ai_analysis"]["ai2b"]["web_attack_type"] == "SQLI"
    assert alert["attack_type"] == "SQL Injection"


class FixedFlowAdapter:
    name = "AI2A"

    def __init__(self, label: str, confidence: float = 0.95) -> None:
        self.label = label
        self.confidence = confidence

    def supports(self, event: dict) -> bool:
        return bool((event.get("evidence") or {}).get("flow"))

    def build_input(self, event: dict) -> dict:
        return dict((event.get("evidence") or {}).get("flow") or {})

    def predict(self, model_input: dict):  # noqa: ANN001
        return ModelOutput(
            status=ModelStatus.COMPLETED.value,
            source=ModelSource.REAL.value,
            label=self.label,
            confidence=self.confidence,
            model_version="AI2A_TEST_REAL",
            input_scope="ZEEK_CONN_FLOW_FEATURES",
        )


class FixedAI1Adapter:
    name = "AI1"

    def __init__(self, label: str, confidence: float = 0.91) -> None:
        self.label = label
        self.confidence = confidence

    def supports(self, event: dict) -> bool:
        return bool((event.get("evidence") or {}).get("flow"))

    def build_input(self, event: dict) -> dict:
        return dict((event.get("evidence") or {}).get("flow") or {})

    def predict(self, model_input: dict):  # noqa: ANN001
        return ModelOutput(
            status=ModelStatus.COMPLETED.value,
            source=ModelSource.REAL.value,
            label=self.label,
            confidence=self.confidence,
            model_version="AI1_TEST_REAL",
            input_scope="ZEEK_CONN_FLOW_ANOMALY_FEATURES",
        )


class FixedHttpAdapter:
    name = "AI2B"

    def __init__(self, label: str, confidence: float = 0.96) -> None:
        self.label = label
        self.confidence = confidence

    def supports(self, event: dict) -> bool:
        return bool((event.get("evidence") or {}).get("http"))

    def build_input(self, event: dict) -> dict:
        return dict((event.get("evidence") or {}).get("http") or {})

    def predict(self, model_input: dict):  # noqa: ANN001
        return ModelOutput(
            status=ModelStatus.COMPLETED.value,
            source=ModelSource.REAL.value,
            label=self.label,
            confidence=self.confidence,
            model_version="AI2B_TEST_REAL",
            input_scope="HTTP_URI_QUERY",
        )


def process_with_ai2a(label: str, *, ai2b_label: str = "NONE") -> dict:
    orchestrator = EventOrchestrator(
        {
            "AI1": MockAI1Adapter(),
            "AI2A": FixedFlowAdapter(label),
            "AI2B": FixedHttpAdapter(ai2b_label),
        },
        FusionService(),
    )
    return orchestrator.process(
        {
            "event_type": "combined",
            "source_ip": "10.10.10.10",
            "destination_ip": "192.168.1.10",
            "evidence": {
                "flow": {"service": "http", "dst_port": 8080, "orig_pkts": 10},
                "http": {"method": "GET", "uri": "/a10/callback?index=0"},
            },
        }
    )


def test_ai2a_real_beaconing_can_raise_degraded_alert_without_ai1_anomaly() -> None:
    alert = process_with_ai2a("http_beaconing_indicator")

    assert alert["attack_type"] == "HTTP Beaconing / Callback"
    assert alert["severity"] == "High"
    assert alert["ai_analysis"]["fusion"]["mode"] == "DEGRADED_AI2A_AI2B"
    assert "AI2A" in alert["detected_by"]
    assert "above threshold 0.90" in alert["ai_analysis"]["fusion"]["reason"]


def test_ai2a_real_exfiltration_maps_to_explicit_final_label() -> None:
    alert = process_with_ai2a("controlled_exfiltration", ai2b_label="NONE")

    assert alert["attack_type"] == "Controlled Exfiltration"
    assert alert["risk_score"] >= 80


def test_ai2a_unknown_and_normal_remain_benign_without_ai1_anomaly() -> None:
    unknown = process_with_ai2a("unknown")
    normal = process_with_ai2a("normal")

    assert unknown["attack_type"] == "Benign / No Confirmed Attack"
    assert normal["attack_type"] == "Benign / No Confirmed Attack"


def test_ai2b_web_attack_still_takes_priority_over_ai2a_attack() -> None:
    alert = process_with_ai2a("controlled_exfiltration", ai2b_label="SQLI")

    assert alert["attack_type"] == "SQL Injection"
    assert "AI2B HTTP semantic detector" in alert["ai_analysis"]["fusion"]["reason"]


def test_ai1_real_anomaly_only_maps_to_network_anomaly() -> None:
    orchestrator = EventOrchestrator(
        {
            "AI1": FixedAI1Adapter("ANOMALY", 0.91),
            "AI2A": MockAI2AAdapter(),
            "AI2B": MockAI2BAdapter(),
        },
        FusionService(),
    )

    alert = orchestrator.process(
        {
            "event_type": "network_flow",
            "source_ip": "10.10.10.10",
            "destination_ip": "192.168.1.10",
            "evidence": {"flow": {"service": "custom", "dst_port": 9999, "orig_pkts": 10}},
        }
    )

    assert alert["attack_type"] == "Network Anomaly"
    assert alert["ai_analysis"]["fusion"]["mode"] == "DEGRADED_AI1"
    assert alert["ai_analysis"]["fusion"]["contributors"] == ["AI1"]


def test_ai2b_web_attack_still_takes_priority_over_ai1_anomaly() -> None:
    orchestrator = EventOrchestrator(
        {
            "AI1": FixedAI1Adapter("ANOMALY", 0.91),
            "AI2A": MockAI2AAdapter(),
            "AI2B": FixedHttpAdapter("SQLI", 0.96),
        },
        FusionService(),
    )

    alert = orchestrator.process(
        {
            "event_type": "combined",
            "source_ip": "10.10.10.10",
            "destination_ip": "192.168.1.10",
            "evidence": {
                "flow": {"service": "http", "dst_port": 80, "orig_pkts": 10},
                "http": {"method": "GET", "uri": "/search?q=%27%20OR%201%3D1--"},
            },
        }
    )

    assert alert["attack_type"] == "SQL Injection"
    assert "AI2B HTTP semantic detector" in alert["ai_analysis"]["fusion"]["reason"]
