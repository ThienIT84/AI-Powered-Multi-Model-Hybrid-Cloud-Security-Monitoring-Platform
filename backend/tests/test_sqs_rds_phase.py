from __future__ import annotations

import pytest
from fastapi import HTTPException

from app import main
from app.services import rds_alert_store
from app.services.sqs_producer import send_event_to_sqs


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

    event = captured["event"]
    assert response == {"status": "queued", "event_id": "evt-http-1", "message_id": "msg-123"}
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
    monkeypatch.setattr(main, "get_latest_alert_payload", lambda: alert)

    assert main.latest_alert() == alert


def test_latest_alert_returns_404_when_empty(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(main, "get_latest_alert_payload", lambda: None)

    with pytest.raises(HTTPException) as excinfo:
        main.latest_alert()

    assert excinfo.value.status_code == 404
    assert excinfo.value.detail == "No alerts found"


def test_latest_alert_rds_failure_returns_503(monkeypatch: pytest.MonkeyPatch) -> None:
    def fail_get_latest_alert_payload() -> dict | None:
        raise RuntimeError("RDS_SECRET_ID is not configured")

    monkeypatch.setattr(main, "get_latest_alert_payload", fail_get_latest_alert_payload)

    with pytest.raises(HTTPException) as excinfo:
        main.latest_alert()

    assert excinfo.value.status_code == 503
    assert "Failed to read latest alert" in str(excinfo.value.detail)


def test_send_event_to_sqs_requires_queue_url(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("SQS_QUEUE_URL", raising=False)

    with pytest.raises(RuntimeError, match="SQS_QUEUE_URL is not configured"):
        send_event_to_sqs({"event_id": "evt-1"})


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
