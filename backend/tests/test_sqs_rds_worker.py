from __future__ import annotations

import json
import time
from typing import Any

import pytest

from app.workers import sqs_rds_worker


def test_process_message_body_persists_alert_and_returns_ids() -> None:
    calls: dict[str, Any] = {}

    def event_processor(event: dict[str, Any]) -> dict[str, Any]:
        calls["event"] = event
        return {"id": event["event_id"], "attack_type": "SQL Injection"}

    def alert_writer(alert: dict[str, Any]) -> None:
        calls["alert"] = alert

    result = sqs_rds_worker._process_message_body(
        json.dumps({"event_id": "evt-worker-1", "event_type": "http"}),
        event_processor=event_processor,
        alert_writer=alert_writer,
    )

    assert result == {"event_id": "evt-worker-1", "alert_id": "evt-worker-1"}
    assert calls["event"]["event_id"] == "evt-worker-1"
    assert calls["alert"]["attack_type"] == "SQL Injection"


def test_process_envelope_reuses_raw_s3_uri_and_archives_final_evidence() -> None:
    calls: dict[str, Any] = {"raw_archives": 0}

    def raw_archiver(event: dict[str, Any]) -> str:  # noqa: ARG001
        calls["raw_archives"] += 1
        return "s3://bucket/raw/unexpected.json"

    def alert_archiver(alert: dict[str, Any]) -> str:
        calls["archived_alert"] = dict(alert)
        return "s3://bucket/evidence/evt-envelope.json"

    def alert_writer(alert: dict[str, Any]) -> None:
        calls["persisted_alert"] = dict(alert)

    body = json.dumps(
        {
            "envelope_type": "hybrid-soc.normalized-zeek-event",
            "envelope_version": 1,
            "event": {"event_id": "evt-envelope", "event_type": "network_flow"},
            "storage": {"raw_s3_uri": "s3://bucket/raw/evt-envelope.json"},
            "metadata": {},
        }
    )
    result = sqs_rds_worker._process_message_body(
        body,
        event_processor=lambda event: {"id": event["event_id"], "attack_type": "Denial of Service"},
        alert_writer=alert_writer,
        raw_event_archiver=raw_archiver,
        alert_archiver=alert_archiver,
    )

    assert result == {"event_id": "evt-envelope", "alert_id": "evt-envelope"}
    assert calls["raw_archives"] == 0
    persisted = calls["persisted_alert"]
    assert persisted["event_id"] == "evt-envelope"
    assert persisted["raw_s3_uri"] == "s3://bucket/raw/evt-envelope.json"
    assert persisted["evidence_s3_uri"] == "s3://bucket/evidence/evt-envelope.json"


def test_process_message_body_rejects_non_object_json() -> None:
    with pytest.raises(ValueError, match="SQS message body must be a JSON object"):
        sqs_rds_worker._process_message_body("[]")


def test_process_message_body_rejects_invalid_json() -> None:
    with pytest.raises(json.JSONDecodeError):
        sqs_rds_worker._process_message_body("{not-json")


def test_process_message_body_rejects_nonstandard_json_numbers() -> None:
    with pytest.raises(ValueError, match="non-standard JSON number"):
        sqs_rds_worker._process_message_body(
            '{"event_id":"evt-worker-nan","score":NaN}'
        )


def test_process_message_body_requires_event_id() -> None:
    with pytest.raises(ValueError, match="event_id is required"):
        sqs_rds_worker._process_message_body(json.dumps({"event_type": "http"}))


def test_process_message_body_requires_dict_alert() -> None:
    def event_processor(event: dict[str, Any]) -> list[str]:  # noqa: ARG001
        return ["not", "an", "alert"]

    with pytest.raises(TypeError, match=r"orchestrator\.process\(event\) must return a dict alert DTO"):
        sqs_rds_worker._process_message_body(
            json.dumps({"event_id": "evt-worker-2"}),
            event_processor=event_processor,
        )


def test_process_message_body_uses_event_id_when_processor_omits_alert_id() -> None:
    persisted: list[dict[str, Any]] = []

    def event_processor(event: dict[str, Any]) -> dict[str, Any]:  # noqa: ARG001
        return {"attack_type": "SQL Injection"}

    result = sqs_rds_worker._process_message_body(
        json.dumps({"event_id": "evt-worker-3"}),
        event_processor=event_processor,
        alert_writer=lambda alert: persisted.append(dict(alert)),
        raw_event_archiver=lambda _event: None,
        alert_archiver=lambda _alert: None,
    )

    assert result == {"event_id": "evt-worker-3", "alert_id": "evt-worker-3"}
    assert persisted[0]["event_id"] == "evt-worker-3"


def test_main_refuses_to_start_without_queue_url(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("SQS_QUEUE_URL", raising=False)

    with pytest.raises(RuntimeError, match="SQS_QUEUE_URL is not configured"):
        sqs_rds_worker.main()


def test_main_deletes_message_after_success(monkeypatch: pytest.MonkeyPatch) -> None:
    calls: dict[str, Any] = {"deleted": []}

    class FakeSQSClient:
        def __init__(self) -> None:
            self.receive_count = 0

        def receive_message(self, **kwargs: Any) -> dict[str, Any]:
            calls["receive_kwargs"] = kwargs
            self.receive_count += 1
            if self.receive_count == 1:
                return {
                    "Messages": [
                        {
                            "Body": json.dumps({"event_id": "evt-worker-4"}),
                            "ReceiptHandle": "receipt-4",
                        }
                    ]
                }
            sqs_rds_worker.RUNNING = False
            return {}

        def delete_message(self, **kwargs: Any) -> None:
            calls["deleted"].append(kwargs)

    def fake_client(service: str, region_name: str) -> FakeSQSClient:
        calls["client"] = {"service": service, "region_name": region_name}
        return FakeSQSClient()

    def fake_process_message_body(body: str) -> dict[str, str]:
        calls["body"] = body
        return {"event_id": "evt-worker-4", "alert_id": "evt-worker-4"}

    monkeypatch.setenv("SQS_QUEUE_URL", "https://sqs.example/main")
    monkeypatch.setattr(sqs_rds_worker.boto3, "client", fake_client)
    monkeypatch.setattr(sqs_rds_worker, "_process_message_body", fake_process_message_body)
    monkeypatch.setattr(sqs_rds_worker, "RUNNING", True)

    try:
        sqs_rds_worker.main()
    finally:
        sqs_rds_worker.RUNNING = True

    assert calls["client"] == {"service": "sqs", "region_name": "ap-southeast-1"}
    assert calls["receive_kwargs"] == {
        "QueueUrl": "https://sqs.example/main",
        "MaxNumberOfMessages": 1,
        "WaitTimeSeconds": 20,
        "VisibilityTimeout": 120,
    }
    assert calls["deleted"] == [
        {"QueueUrl": "https://sqs.example/main", "ReceiptHandle": "receipt-4"}
    ]


def test_main_does_not_delete_message_after_processing_error(monkeypatch: pytest.MonkeyPatch) -> None:
    calls: dict[str, Any] = {"deleted": []}

    class FakeSQSClient:
        def __init__(self) -> None:
            self.receive_count = 0

        def receive_message(self, **kwargs: Any) -> dict[str, Any]:  # noqa: ARG002
            self.receive_count += 1
            if self.receive_count == 1:
                return {
                    "Messages": [
                        {
                            "Body": json.dumps({"event_id": "evt-worker-5"}),
                            "ReceiptHandle": "receipt-5",
                        }
                    ]
                }
            sqs_rds_worker.RUNNING = False
            return {}

        def delete_message(self, **kwargs: Any) -> None:
            calls["deleted"].append(kwargs)

    def fake_client(service: str, region_name: str) -> FakeSQSClient:  # noqa: ARG001
        return FakeSQSClient()

    def fail_process_message_body(body: str) -> dict[str, str]:  # noqa: ARG001
        raise RuntimeError("RDS commit failed")

    monkeypatch.setenv("SQS_QUEUE_URL", "https://sqs.example/main")
    monkeypatch.setattr(sqs_rds_worker.boto3, "client", fake_client)
    monkeypatch.setattr(sqs_rds_worker, "_process_message_body", fail_process_message_body)
    monkeypatch.setattr(sqs_rds_worker, "RUNNING", True)

    try:
        sqs_rds_worker.main()
    finally:
        sqs_rds_worker.RUNNING = True

    assert calls["deleted"] == []


def test_visibility_heartbeat_renews_long_running_message() -> None:
    calls: list[dict[str, Any]] = []

    class FakeSQSClient:
        def change_message_visibility(self, **kwargs: Any) -> None:
            calls.append(kwargs)

    with sqs_rds_worker._visibility_heartbeat(
        FakeSQSClient(),
        queue_url="https://sqs.example/main",
        receipt_handle="receipt-long",
        visibility_timeout=120,
        heartbeat_interval=0.01,
    ):
        time.sleep(0.035)

    assert calls
    assert calls[0] == {
        "QueueUrl": "https://sqs.example/main",
        "ReceiptHandle": "receipt-long",
        "VisibilityTimeout": 120,
    }
