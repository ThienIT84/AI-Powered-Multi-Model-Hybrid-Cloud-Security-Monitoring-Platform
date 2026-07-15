from __future__ import annotations

import asyncio
import json
import math

import pytest
from fastapi import HTTPException

from app import main
from app.contracts import EventContractError, validate_zeek_ingest_event
from app.services.ingest_auth import (
    IngestAuthenticationConfigurationError,
    IngestAuthenticationError,
    IngestAuthenticationResult,
    ingest_hmac_required,
    signature_for_body,
    verify_ingest_signature,
)
from app.services.store import AlertStore


def zeek_event() -> dict:
    return {
        "schema_version": "1.0",
        "event_type": "network_flow",
        "event_id": "zeek-sensor-01-C1-flow",
        "sensor_id": "zeek-sensor-01",
        "timestamp": "2026-07-15T01:02:03Z",
        "source_ip": "192.168.137.145",
        "destination_ip": "192.168.137.141",
        "evidence": {
            "flow": {"uid": "C1", "proto": "tcp", "dst_port": 80},
            "http": None,
            "suricata": None,
        },
    }


def test_strict_zeek_contract_accepts_normalized_flow() -> None:
    event = validate_zeek_ingest_event(zeek_event())
    assert event["event_id"] == "zeek-sensor-01-C1-flow"
    assert event["event_type"] == "network_flow"


def test_strict_zeek_contract_rejects_missing_sensor() -> None:
    payload = zeek_event()
    payload.pop("sensor_id")
    with pytest.raises(EventContractError, match="sensor_id"):
        validate_zeek_ingest_event(payload)


def test_strict_zeek_contract_rejects_malformed_evidence_and_schema() -> None:
    payload = zeek_event()
    payload["evidence"] = "not-an-object"
    with pytest.raises(EventContractError, match="evidence must be a JSON object"):
        validate_zeek_ingest_event(payload)

    payload = zeek_event()
    payload["schema_version"] = "2.0"
    with pytest.raises(EventContractError, match="schema_version must be 1.0"):
        validate_zeek_ingest_event(payload)


@pytest.mark.parametrize("evidence_name", ["http", "flow", "suricata"])
def test_strict_zeek_contract_rejects_non_object_evidence_members(
    evidence_name: str,
) -> None:
    payload = zeek_event()
    payload["evidence"][evidence_name] = "not-an-object"

    with pytest.raises(
        EventContractError,
        match=rf"evidence\.{evidence_name} must be a JSON object or null",
    ):
        validate_zeek_ingest_event(payload)


@pytest.mark.parametrize("non_finite", [math.nan, math.inf, -math.inf])
def test_strict_zeek_contract_rejects_nested_non_finite_numbers(
    non_finite: float,
) -> None:
    payload = zeek_event()
    payload["evidence"]["flow"]["nested"] = {"values": [non_finite]}

    with pytest.raises(EventContractError, match="must not contain NaN or Infinity"):
        validate_zeek_ingest_event(payload)


def test_strict_zeek_contract_rejects_excessive_json_depth() -> None:
    payload = zeek_event()
    nested: dict[str, object] = payload["evidence"]["flow"]
    for _ in range(70):
        child: dict[str, object] = {}
        nested["child"] = child
        nested = child

    with pytest.raises(EventContractError, match="nesting must not exceed"):
        validate_zeek_ingest_event(payload)


def test_hmac_signature_round_trip(monkeypatch: pytest.MonkeyPatch) -> None:
    body = b'{"event_id":"evt-1"}'
    timestamp = "1000"
    monkeypatch.setenv("INGEST_HMAC_SECRET", "collector-secret")
    monkeypatch.setenv("INGEST_HMAC_REQUIRED", "true")
    signature = signature_for_body(body, timestamp, "collector-secret")

    result = verify_ingest_signature(body, timestamp=timestamp, signature=signature, now=1000)
    assert result.enabled is True
    assert result.source == "environment"


def test_aws_ingest_hmac_cannot_be_disabled_by_override(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("SOC_DEPLOYMENT_TARGET", "aws")
    monkeypatch.setenv("INGEST_HMAC_REQUIRED", "false")

    assert ingest_hmac_required() is True


def test_aws_ingest_rejects_direct_environment_secret(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("SOC_DEPLOYMENT_TARGET", "aws")
    monkeypatch.setenv("INGEST_HMAC_SECRET", "must-not-live-on-ec2")
    monkeypatch.delenv("INGEST_HMAC_SECRET_ID", raising=False)

    with pytest.raises(
        IngestAuthenticationConfigurationError,
        match="must load HMAC from Secrets Manager",
    ):
        verify_ingest_signature(b"{}", timestamp="1000", signature="invalid", now=1000)


def test_local_ingest_hmac_can_be_explicitly_enabled_or_disabled(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("SOC_DEPLOYMENT_TARGET", "local")
    monkeypatch.setenv("INGEST_HMAC_REQUIRED", "true")
    assert ingest_hmac_required() is True

    monkeypatch.setenv("INGEST_HMAC_REQUIRED", "false")
    assert ingest_hmac_required() is False


def test_hmac_signature_rejects_replay_window(monkeypatch: pytest.MonkeyPatch) -> None:
    body = b"{}"
    monkeypatch.setenv("INGEST_HMAC_SECRET", "collector-secret")
    signature = signature_for_body(body, "1000", "collector-secret")
    with pytest.raises(IngestAuthenticationError, match="outside the allowed window"):
        verify_ingest_signature(body, timestamp="1000", signature=signature, now=2000)


def test_cloud_ingest_archives_then_enqueues(monkeypatch: pytest.MonkeyPatch) -> None:
    captured: dict[str, object] = {}
    body = json.dumps(zeek_event()).encode("utf-8")

    class FakeRequest:
        headers = {"X-SOC-Timestamp": "1000", "X-SOC-Signature": "sha256=test"}

        async def stream(self):
            yield body

    monkeypatch.setattr(
        main,
        "verify_ingest_signature",
        lambda *_args, **_kwargs: IngestAuthenticationResult(enabled=True, source="secrets_manager"),
    )
    monkeypatch.setattr(main, "archive_raw_zeek_event", lambda event: "s3://data/raw/evt.json")

    def fake_send(message: dict) -> dict[str, str]:
        captured["message"] = message
        return {"message_id": "message-1", "queue_url": "https://sqs.example/queue"}

    monkeypatch.setattr(main, "send_event_to_sqs", fake_send)
    monkeypatch.setattr(main, "store", AlertStore())

    response = asyncio.run(main.ingest_zeek_event(FakeRequest()))
    envelope = captured["message"]
    assert response["status"] == "queued"
    assert response["message_id"] == "message-1"
    assert envelope["event"]["event_id"] == "zeek-sensor-01-C1-flow"
    assert envelope["storage"]["raw_s3_uri"] == "s3://data/raw/evt.json"
    assert main.store.metrics()["ingested_total"] == 1


def test_cloud_ingest_rejects_invalid_contract_before_sqs(monkeypatch: pytest.MonkeyPatch) -> None:
    payload = zeek_event()
    payload["source_ip"] = "not-an-ip"
    body = json.dumps(payload).encode("utf-8")

    class FakeRequest:
        headers: dict[str, str] = {}

        async def stream(self):
            yield body

    monkeypatch.setattr(
        main,
        "verify_ingest_signature",
        lambda *_args, **_kwargs: IngestAuthenticationResult(enabled=False, source="not_configured"),
    )
    with pytest.raises(HTTPException) as excinfo:
        asyncio.run(main.ingest_zeek_event(FakeRequest()))
    assert excinfo.value.status_code == 422
    assert "source_ip" in str(excinfo.value.detail)


def test_cloud_ingest_maps_json_recursion_failure_to_bad_request(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    body = b"{}"

    class FakeRequest:
        headers: dict[str, str] = {}

        async def stream(self):
            yield body

    monkeypatch.setattr(
        main,
        "verify_ingest_signature",
        lambda *_args, **_kwargs: IngestAuthenticationResult(enabled=False, source="not_configured"),
    )
    monkeypatch.setattr(
        main.json,
        "loads",
        lambda _body: (_ for _ in ()).throw(RecursionError("JSON nesting is too deep")),
    )

    with pytest.raises(HTTPException) as excinfo:
        asyncio.run(main.ingest_zeek_event(FakeRequest()))

    assert excinfo.value.status_code == 400
    assert excinfo.value.detail == "request body must contain valid JSON"


def test_aws_target_disables_legacy_event_routes(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("SOC_DEPLOYMENT_TARGET", "aws")
    monkeypatch.delenv("ALLOW_LEGACY_INGEST", raising=False)
    with pytest.raises(HTTPException) as excinfo:
        main.enqueue_http_event({"method": "GET", "uri": "/"})
    assert excinfo.value.status_code == 404


def test_aws_readiness_requires_all_real_models_by_default(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("SOC_DEPLOYMENT_TARGET", "aws")
    monkeypatch.setenv("SQS_QUEUE_URL", "https://sqs.example/queue")
    monkeypatch.setenv("S3_DATA_BUCKET", "soc-data")
    monkeypatch.setenv("RDS_SECRET_ID", "soc/rds")
    monkeypatch.setenv("INGEST_HMAC_SECRET_ID", "soc/ingest")
    monkeypatch.delenv("AWS_REQUIRE_REAL_MODELS", raising=False)
    monkeypatch.setattr(
        main,
        "model_runtime_status",
        lambda: [
            {"name": "AI1", "mode": "real", "status": "healthy"},
            {"name": "AI2A", "mode": "replay", "status": "simulated"},
            {"name": "AI2B", "mode": "real", "status": "healthy"},
        ],
    )

    with pytest.raises(HTTPException) as excinfo:
        main.readiness()

    assert excinfo.value.status_code == 503
    assert "AI2A" in str(excinfo.value.detail)


def test_aws_readiness_accepts_three_loaded_real_models(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("SOC_DEPLOYMENT_TARGET", "aws")
    monkeypatch.setenv("SQS_QUEUE_URL", "https://sqs.example/queue")
    monkeypatch.setenv("S3_DATA_BUCKET", "soc-data")
    monkeypatch.setenv("RDS_SECRET_ID", "soc/rds")
    monkeypatch.setenv("INGEST_HMAC_SECRET_ID", "soc/ingest")
    monkeypatch.setattr(
        main,
        "model_runtime_status",
        lambda: [
            {"name": name, "mode": "real", "status": "healthy"}
            for name in ("AI1", "AI2A", "AI2B")
        ],
    )

    assert main.readiness()["usableModels"] == ["AI1", "AI2A", "AI2B"]
