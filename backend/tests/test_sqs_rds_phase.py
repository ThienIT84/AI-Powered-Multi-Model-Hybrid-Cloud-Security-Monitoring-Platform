from __future__ import annotations

import pytest
from fastapi import HTTPException

from app import main
from app.services import rds_alert_store
from app.services.sqs_producer import send_event_to_sqs
from app.services.store import AlertStore


def test_enqueue_http_event_returns_queued_response(monkeypatch: pytest.MonkeyPatch) -> None:
    captured: dict[str, object] = {}

    def fake_send_event_to_sqs(event: dict) -> dict[str, str]:  # noqa: ANN001
        captured["event"] = event
        return {"message_id": "msg-123", "queue_url": "https://sqs.example/queue"}

    monkeypatch.setattr(main, "send_event_to_sqs", fake_send_event_to_sqs)

    response = main.enqueue_http_event(
        {
            "event_id": "evt-http-1",
            "method": "GET",
            "uri": "/search?q=%27%20OR%201%3D1--",
            "source_ip": "10.10.10.10",
            "destination_ip": "192.168.1.10",
            "user_agent": "pytest",
        }
    )

    envelope = captured["event"]
    event = envelope["event"]
    assert response == {"status": "queued", "event_id": "evt-http-1", "message_id": "msg-123"}
    assert envelope["envelope_type"] == "hybrid-soc.normalized-zeek-event"
    assert event["event_type"] == "http"
    assert event["source_ip"] == "10.10.10.10"
    assert event["destination_ip"] == "192.168.1.10"
    assert event["evidence"]["http"] == {
        "method": "GET",
        "uri": "/search?q=%27%20OR%201%3D1--",
        "user_agent": "pytest",
    }


@pytest.mark.parametrize(
    ("payload", "detail"),
    [
        ({"uri": "/search?q=x"}, "method is required"),
        ({"method": "GET"}, "uri is required"),
    ],
)
def test_enqueue_http_event_requires_method_and_uri(payload: dict, detail: str) -> None:
    with pytest.raises(HTTPException) as excinfo:
        main.enqueue_http_event(payload)

    assert excinfo.value.status_code == 400
    assert excinfo.value.detail == detail


def test_enqueue_http_event_sqs_failure_returns_503(monkeypatch: pytest.MonkeyPatch) -> None:
    def fail_send_event_to_sqs(event: dict) -> dict[str, str]:  # noqa: ARG001
        raise RuntimeError("SQS_QUEUE_URL is not configured")

    monkeypatch.setattr(main, "send_event_to_sqs", fail_send_event_to_sqs)

    with pytest.raises(HTTPException) as excinfo:
        main.enqueue_http_event({"method": "GET", "uri": "/search?q=x"})

    assert excinfo.value.status_code == 503
    assert "Failed to queue event" in str(excinfo.value.detail)


def test_latest_alert_returns_rds_payload(monkeypatch: pytest.MonkeyPatch) -> None:
    alert = {
        "id": "evt-latest",
        "attack_type": "SQL Injection",
        "risk_score": 94,
    }
    monkeypatch.setenv("RDS_SECRET_ID", "test/rds")
    monkeypatch.setattr(main, "list_final_alerts", lambda limit: [alert])
    monkeypatch.setattr(main, "store", AlertStore())

    assert main.latest_alert() == alert


def test_list_alerts_returns_persisted_rds_payloads(monkeypatch: pytest.MonkeyPatch) -> None:
    alerts = [
        {"id": "evt-newer", "attack_type": "SQL Injection"},
        {"id": "evt-older", "attack_type": "Cross-Site Scripting"},
    ]
    captured: dict[str, int] = {}

    def fake_list_final_alerts(limit: int) -> list[dict]:
        captured["limit"] = limit
        return alerts

    monkeypatch.setenv("RDS_SECRET_ID", "test/rds")
    monkeypatch.setattr(main, "list_final_alerts", fake_list_final_alerts)
    monkeypatch.setattr(main, "store", AlertStore())

    assert main.list_alerts(limit=25) == alerts
    assert captured["limit"] == 25

    assert main.list_alerts() == alerts
    assert captured["limit"] == 50


def test_list_alerts_rds_failure_falls_back_to_memory(monkeypatch: pytest.MonkeyPatch) -> None:
    def fail_list_final_alerts(limit: int) -> list[dict]:  # noqa: ARG001
        raise RuntimeError("RDS_SECRET_ID is not configured")

    memory = AlertStore()
    memory.add({"id": "evt-memory", "timestamp": "2026-01-01T00:00:00Z"})
    monkeypatch.setenv("RDS_SECRET_ID", "test/rds")
    monkeypatch.setattr(main, "list_final_alerts", fail_list_final_alerts)
    monkeypatch.setattr(main, "store", memory)

    assert main.list_alerts(limit=50) == [{"id": "evt-memory", "timestamp": "2026-01-01T00:00:00Z"}]


def test_latest_alert_returns_404_when_empty(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("RDS_SECRET_ID", raising=False)
    monkeypatch.setattr(main, "store", AlertStore())

    with pytest.raises(HTTPException) as excinfo:
        main.latest_alert()

    assert excinfo.value.status_code == 404
    assert excinfo.value.detail == "No alerts found"


def test_latest_alert_rds_failure_falls_back_to_memory(monkeypatch: pytest.MonkeyPatch) -> None:
    def fail_list_final_alerts(limit: int) -> list[dict]:  # noqa: ARG001
        raise RuntimeError("RDS_SECRET_ID is not configured")

    memory = AlertStore()
    alert = {"id": "evt-memory-latest", "timestamp": "2026-01-02T00:00:00Z"}
    memory.add(alert)
    monkeypatch.setenv("RDS_SECRET_ID", "test/rds")
    monkeypatch.setattr(main, "list_final_alerts", fail_list_final_alerts)
    monkeypatch.setattr(main, "store", memory)

    assert main.latest_alert() == alert


def test_send_event_to_sqs_requires_queue_url(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("SQS_QUEUE_URL", raising=False)

    with pytest.raises(RuntimeError, match="SQS_QUEUE_URL is not configured"):
        send_event_to_sqs({"event_id": "evt-1"})


def test_send_event_to_sqs_rejects_non_finite_json_before_client_creation(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("SQS_QUEUE_URL", "https://sqs.example/queue")

    with pytest.raises(ValueError, match="Out of range float values are not JSON compliant"):
        send_event_to_sqs({"event_id": "evt-nan", "score": float("nan")})


def test_upsert_final_alert_rejects_missing_event_id() -> None:
    with pytest.raises(ValueError, match="alert must contain id or event_id"):
        rds_alert_store.upsert_final_alert({"attack_type": "SQL Injection"})


def test_upsert_final_alert_uses_attack_type_as_final_label(monkeypatch: pytest.MonkeyPatch) -> None:
    captured: dict[str, object] = {}

    class FakeCursor:
        def __enter__(self) -> FakeCursor:
            return self

        def __exit__(self, exc_type: object, exc: object, tb: object) -> None:
            return None

        def execute(self, sql: str, params: dict) -> None:
            captured["sql"] = sql
            captured["params"] = params

    class FakeConn:
        def __enter__(self) -> FakeConn:
            return self

        def __exit__(self, exc_type: object, exc: object, tb: object) -> None:
            return None

        def cursor(self) -> FakeCursor:
            return FakeCursor()

        def commit(self) -> None:
            captured["committed"] = True

    monkeypatch.setattr(rds_alert_store, "get_conn", lambda: FakeConn())

    rds_alert_store.upsert_final_alert(
        {
            "id": "evt-rds-1",
            "severity": "High",
            "attack_type": "Controlled Exfiltration",
            "risk_score": 85,
            "confidence_score": 0.95,
            "source_ip": "10.10.10.10",
            "destination_ip": "192.168.1.10",
            "ai_analysis": {"ai2b": {"web_attack_type": "N/A"}},
        }
    )

    params = captured["params"]
    assert params["event_id"] == "evt-rds-1"
    assert params["alert_id"] == "evt-rds-1"
    assert params["final_label"] == "Controlled Exfiltration"
    assert captured["committed"] is True


def test_list_final_alerts_returns_payloads_in_database_order(monkeypatch: pytest.MonkeyPatch) -> None:
    captured: dict[str, object] = {}

    class FakeCursor:
        def __enter__(self) -> FakeCursor:
            return self

        def __exit__(self, exc_type: object, exc: object, tb: object) -> None:
            return None

        def execute(self, sql: str, params: dict) -> None:
            captured["sql"] = sql
            captured["params"] = params

        def fetchall(self) -> list[dict[str, dict[str, str]]]:
            return [
                {"payload": {"id": "evt-newer"}},
                {"payload": {"id": "evt-older"}},
            ]

    class FakeConn:
        def __enter__(self) -> FakeConn:
            return self

        def __exit__(self, exc_type: object, exc: object, tb: object) -> None:
            return None

        def cursor(self) -> FakeCursor:
            return FakeCursor()

    monkeypatch.setattr(rds_alert_store, "get_conn", lambda: FakeConn())

    assert rds_alert_store.list_final_alerts(limit=80) == [
        {"id": "evt-newer"},
        {"id": "evt-older"},
    ]
    assert "ORDER BY created_at DESC" in str(captured["sql"])
    assert captured["params"] == {"limit": 80}


def test_get_final_alert_queries_alert_or_event_id(monkeypatch: pytest.MonkeyPatch) -> None:
    captured: dict[str, object] = {}

    class FakeCursor:
        def __enter__(self) -> FakeCursor:
            return self

        def __exit__(self, exc_type: object, exc: object, tb: object) -> None:
            return None

        def execute(self, sql: str, params: dict) -> None:
            captured["sql"] = sql
            captured["params"] = params

        def fetchone(self) -> dict[str, dict[str, str]]:
            return {"payload": {"id": "alert-1", "event_id": "event-1"}}

    class FakeConn:
        def __enter__(self) -> FakeConn:
            return self

        def __exit__(self, exc_type: object, exc: object, tb: object) -> None:
            return None

        def cursor(self) -> FakeCursor:
            return FakeCursor()

    monkeypatch.setattr(rds_alert_store, "get_conn", lambda: FakeConn())

    assert rds_alert_store.get_final_alert("event-1") == {
        "id": "alert-1",
        "event_id": "event-1",
    }
    assert "alert_id = %(alert_id)s OR event_id = %(alert_id)s" in str(captured["sql"])
    assert captured["params"] == {"alert_id": "event-1"}
