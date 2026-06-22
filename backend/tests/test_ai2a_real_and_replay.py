from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from app.adapters.ai2a_real import RealAI2AAdapter, threshold_label
from app.adapters.mock import MockAI1Adapter, MockAI2BAdapter
from app.contracts import ModelStatus
from app.dependencies import build_orchestrator
from app.replay import ZeekConnParser, ZeekHttpParser, ZeekUidCorrelator
from app.replay.zeek import parse_zeek_line
from app.services.fusion import FusionService
from app.services.orchestrator import EventOrchestrator


def test_threshold_label_abstains_below_frozen_threshold() -> None:
    label, raw_label, confidence = threshold_label(["normal", "ssh_bruteforce_indicator"], [0.2, 0.8], 0.9)

    assert label == "unknown"
    assert raw_label == "ssh_bruteforce_indicator"
    assert confidence == 0.8


def test_threshold_label_keeps_class_at_or_above_threshold() -> None:
    label, raw_label, confidence = threshold_label(["normal", "ssh_bruteforce_indicator"], [0.05, 0.95], 0.9)

    assert label == "ssh_bruteforce_indicator"
    assert raw_label == "ssh_bruteforce_indicator"
    assert confidence == 0.95


def test_ai2a_real_missing_artifact_returns_not_available(tmp_path: Path) -> None:
    adapter = RealAI2AAdapter(release_dir=str(tmp_path), feature_manifest_path=str(tmp_path / "feature_manifest.json"))

    output = adapter.predict({"service": "ssh", "dst_port": 22})

    assert output.status == ModelStatus.NOT_AVAILABLE.value
    assert output.source == "unavailable"
    assert "not available" in output.reason


def test_ai2a_unavailable_mode_is_explicit_not_mock(monkeypatch) -> None:
    monkeypatch.setenv("AI1_PREDICTOR_MODE", "mock")
    monkeypatch.setenv("AI2A_PREDICTOR_MODE", "unavailable")
    monkeypatch.setenv("AI2B_PREDICTOR_MODE", "mock")

    alert = build_orchestrator().process(
        {
            "event_type": "network_flow",
            "evidence": {"flow": {"service": "ssh", "dst_port": 22, "orig_pkts": 10}},
        }
    )

    assert alert["ai_analysis"]["ai2a"]["status"] == ModelStatus.NOT_AVAILABLE.value
    assert alert["ai_analysis"]["ai2a"]["source"] == "unavailable"


def test_ai2a_unavailable_mode_still_respects_flow_scope(monkeypatch) -> None:
    monkeypatch.setenv("AI1_PREDICTOR_MODE", "mock")
    monkeypatch.setenv("AI2A_PREDICTOR_MODE", "unavailable")
    monkeypatch.setenv("AI2B_PREDICTOR_MODE", "mock")

    alert = build_orchestrator().process(
        {
            "event_type": "http",
            "evidence": {"http": {"method": "GET", "uri": "/search?q=mock-sqli"}},
        }
    )

    assert alert["ai_analysis"]["ai2a"]["status"] == ModelStatus.NOT_APPLICABLE.value


def test_ai2a_real_does_not_guess_missing_frozen_features() -> None:
    adapter = RealAI2AAdapter.__new__(RealAI2AAdapter)
    adapter._model = object()
    adapter._preprocessor = object()
    adapter._features = ["dst_port", "ssh_count_60s_same_src"]
    adapter._categorical_features = []
    adapter._threshold = 0.9
    adapter._classes = ["normal", "ssh_bruteforce_indicator"]
    adapter._load_error = ""
    adapter._helpers = {}

    output = adapter.predict({"dst_port": 22})

    assert output.status == ModelStatus.NOT_AVAILABLE.value
    assert "frozen feature vector is incomplete" in output.reason
    assert "ssh_count_60s_same_src" in output.reason


def test_ai2a_unknown_label_does_not_trigger_network_attack_with_ai1_anomaly() -> None:
    class UnknownAI2A:
        name = "AI2A"

        def supports(self, event: dict) -> bool:
            return bool((event.get("evidence") or {}).get("flow"))

        def build_input(self, event: dict) -> dict:
            return dict((event.get("evidence") or {}).get("flow") or {})

        def predict(self, model_input: dict):  # noqa: ANN001
            from app.contracts import ModelOutput, ModelSource

            return ModelOutput(
                status=ModelStatus.COMPLETED.value,
                source=ModelSource.REAL.value,
                label="unknown",
                confidence=0.8,
                model_version="AI2A_TEST",
                input_scope="ZEEK_CONN_FLOW_FEATURES",
            )

    orchestrator = EventOrchestrator(
        {"AI1": MockAI1Adapter(), "AI2A": UnknownAI2A(), "AI2B": MockAI2BAdapter()},
        FusionService(),
    )

    alert = orchestrator.process(
        {
            "event_type": "network_flow",
            "evidence": {"flow": {"attack_hint": "scan", "orig_pkts": 900, "service": "ssh", "dst_port": 22}},
        }
    )

    assert alert["attack_type"] == "Network Anomaly"


def test_zeek_json_uid_correlation_builds_combined_and_single_scope_events(tmp_path: Path) -> None:
    conn_log = tmp_path / "conn.log"
    http_log = tmp_path / "http.log"
    conn_log.write_text(
        "\n".join(
            [
                '{"ts":1.0,"uid":"C1","id.orig_h":"10.0.0.1","id.orig_p":1234,"id.resp_h":"10.0.0.2","id.resp_p":80,"proto":"tcp","service":"http"}',
                '{"ts":2.0,"uid":"C2","id.orig_h":"10.0.0.3","id.orig_p":2222,"id.resp_h":"10.0.0.4","id.resp_p":22,"proto":"tcp","service":"ssh"}',
            ]
        ),
        encoding="utf-8",
    )
    http_log.write_text(
        "\n".join(
            [
                '{"ts":1.1,"uid":"C1","id.orig_h":"10.0.0.1","id.resp_h":"10.0.0.2","method":"GET","uri":"/search?q=x"}',
                '{"ts":3.0,"uid":"C3","id.orig_h":"10.0.0.5","id.resp_h":"10.0.0.6","method":"GET","uri":"/only-http"}',
            ]
        ),
        encoding="utf-8",
    )

    events = ZeekUidCorrelator().correlate(ZeekConnParser().parse_flows(conn_log), ZeekHttpParser().parse_http(http_log))
    by_id = {event["correlation_id"]: event for event in events}

    assert by_id["C1"]["event_type"] == "combined"
    assert by_id["C2"]["event_type"] == "network_flow"
    assert by_id["C3"]["event_type"] == "http"
    assert by_id["C1"]["evidence"]["http"]["uri"] == "/search?q=x"


def test_zeek_tsv_fields_parser(tmp_path: Path) -> None:
    conn_log = tmp_path / "conn.log"
    conn_log.write_text(
        "#separator \\x09\n"
        "#fields\tts\tuid\tid.orig_h\tid.orig_p\tid.resp_h\tid.resp_p\tproto\tservice\n"
        "1.0\tC1\t10.0.0.1\t1234\t10.0.0.2\t80\ttcp\thttp\n",
        encoding="utf-8",
    )

    rows = ZeekConnParser().parse_flows(conn_log)

    assert rows == [
        {
            "uid": "C1",
            "ts": "1.0",
            "source_ip": "10.0.0.1",
            "destination_ip": "10.0.0.2",
            "src_ip": "10.0.0.1",
            "dst_ip": "10.0.0.2",
            "source_port": 1234,
            "destination_port": 80,
            "src_port": 1234,
            "dst_port": 80,
            "proto": "tcp",
            "service": "http",
            "duration": 0,
            "orig_bytes": 0,
            "resp_bytes": 0,
            "orig_pkts": 0,
            "resp_pkts": 0,
            "orig_ip_bytes": 0,
            "resp_ip_bytes": 0,
            "conn_state": "",
            "history": "",
        }
    ]


def test_zeek_parse_line_supports_incremental_tailer_rows() -> None:
    row, fields = parse_zeek_line("#fields\tts\tuid\tid.orig_h\tid.resp_h\tmethod\turi\n")

    assert row is None
    assert fields == ["ts", "uid", "id.orig_h", "id.resp_h", "method", "uri"]

    row, fields = parse_zeek_line("1.0\tC1\t10.0.0.1\t10.0.0.2\tGET\t/search?q=x\n", fields)

    assert fields == ["ts", "uid", "id.orig_h", "id.resp_h", "method", "uri"]
    assert row == {
        "ts": "1.0",
        "uid": "C1",
        "id.orig_h": "10.0.0.1",
        "id.resp_h": "10.0.0.2",
        "method": "GET",
        "uri": "/search?q=x",
    }


def test_http_tailer_accepts_stdin_dash() -> None:
    payload = (
        "#fields\tts\tuid\tid.orig_h\tid.resp_h\tmethod\turi\n"
        "1.0\tC1\t10.10.10.10\t192.168.1.10\tGET\t/ai2a_p11_app/search?q=x\n"
    )
    script = Path(__file__).resolve().parents[1] / "scripts" / "tail_zeek_http_to_backend.py"
    result = subprocess.run(
        [
            sys.executable,
            str(script),
            "--http-log",
            "-",
            "--limit",
            "1",
            "--dry-run",
        ],
        input=payload,
        text=True,
        capture_output=True,
        check=True,
    )

    assert '"http_log": "stdin"' in result.stdout
    assert '"status": "dry_run_event"' in result.stdout
    assert "/ai2a_p11_app/search?q=x" in result.stdout
