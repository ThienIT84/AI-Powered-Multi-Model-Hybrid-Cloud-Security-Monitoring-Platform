from __future__ import annotations

import hashlib
import io
import json
from typing import Any

import pytest
from botocore.exceptions import ClientError

from app.services import s3_data_store
from app.services.s3_data_store import S3DataStore, alert_evidence_key, raw_zeek_key


class FakeS3Client:
    def __init__(self) -> None:
        self.puts: list[dict[str, Any]] = []

    def put_object(self, **kwargs: Any) -> None:
        self.puts.append(kwargs)


class ExistingObjectS3Client(FakeS3Client):
    def __init__(self, existing_digest: str) -> None:
        super().__init__()
        self.existing_digest = existing_digest

    def put_object(self, **kwargs: Any) -> None:
        self.puts.append(kwargs)
        raise ClientError(
            {
                "Error": {"Code": "PreconditionFailed"},
                "ResponseMetadata": {"HTTPStatusCode": 412},
            },
            "PutObject",
        )

    def head_object(self, **kwargs: Any) -> dict[str, dict[str, str]]:  # noqa: ARG002
        return {"Metadata": {"sha256": self.existing_digest}}


class LegacyExistingObjectS3Client(ExistingObjectS3Client):
    def __init__(self, body: bytes) -> None:
        super().__init__(existing_digest="")
        self.body = body

    def get_object(self, **kwargs: Any) -> dict[str, io.BytesIO]:  # noqa: ARG002
        return {"Body": io.BytesIO(self.body)}


class ConflictWithExistingObjectS3Client(ExistingObjectS3Client):
    def put_object(self, **kwargs: Any) -> None:
        self.puts.append(kwargs)
        raise ClientError(
            {
                "Error": {"Code": "ConditionalRequestConflict"},
                "ResponseMetadata": {"HTTPStatusCode": 409},
            },
            "PutObject",
        )


class ConflictThenSuccessS3Client(FakeS3Client):
    def put_object(self, **kwargs: Any) -> None:
        self.puts.append(kwargs)
        if len(self.puts) == 1:
            raise ClientError(
                {
                    "Error": {"Code": "ConditionalRequestConflict"},
                    "ResponseMetadata": {"HTTPStatusCode": 409},
                },
                "PutObject",
            )

    def head_object(self, **kwargs: Any) -> None:  # noqa: ARG002
        raise ClientError(
            {
                "Error": {"Code": "NoSuchKey"},
                "ResponseMetadata": {"HTTPStatusCode": 404},
            },
            "HeadObject",
        )


class UnresolvedConflictS3Client(ConflictThenSuccessS3Client):
    def put_object(self, **kwargs: Any) -> None:
        self.puts.append(kwargs)
        raise ClientError(
            {
                "Error": {"Code": "ConditionalRequestConflict"},
                "ResponseMetadata": {"HTTPStatusCode": 409},
            },
            "PutObject",
        )


def test_deterministic_raw_and_evidence_keys() -> None:
    event = {"event_id": "evt/source 1", "timestamp": "2026-07-15T23:30:00+07:00"}
    alert = {"id": "alert/source 1", "timestamp": "2026-07-15T16:30:00Z"}

    assert raw_zeek_key(event) == "raw/zeek/2026/07/15/evt%2Fsource%201.json"
    assert alert_evidence_key(alert) == (
        "evidence/alerts/2026/07/15/alert%2Fsource%201.json"
    )


def test_missing_or_invalid_timestamp_uses_deterministic_undated_partition() -> None:
    assert raw_zeek_key({"event_id": "evt-undated"}) == (
        "raw/zeek/undated/evt-undated.json"
    )
    assert alert_evidence_key({"event_id": "evt-bad", "timestamp": "not-a-date"}) == (
        "evidence/alerts/undated/evt-bad.json"
    )


def test_configured_store_writes_json_and_returns_s3_uri() -> None:
    client = FakeS3Client()
    store = S3DataStore(
        bucket="soc-data",
        deployment_target="cloud",
        client=client,
    )
    event = {
        "timestamp": "2026-07-15T01:02:03Z",
        "event_id": "evt-1",
        "sensor_id": "zeek-đà-nẵng",
    }

    uri = store.put_raw_zeek_event(event)

    assert uri == "s3://soc-data/raw/zeek/2026/07/15/evt-1.json"
    assert len(client.puts) == 1
    request = client.puts[0]
    assert request["Bucket"] == "soc-data"
    assert request["Key"] == "raw/zeek/2026/07/15/evt-1.json"
    assert request["ContentType"] == "application/json"
    assert json.loads(request["Body"].decode("utf-8")) == event
    assert request["IfNoneMatch"] == "*"
    assert request["Metadata"]["sha256"]
    assert "ServerSideEncryption" not in request


def test_kms_configuration_sets_s3_server_side_encryption() -> None:
    client = FakeS3Client()
    store = S3DataStore(
        bucket="soc-data",
        deployment_target="aws",
        kms_key_id="arn:aws:kms:ap-southeast-1:123:key/abc",
        client=client,
    )

    uri = store.put_alert_evidence(
        {"id": "alert-1", "timestamp": "2026-07-15T01:02:03Z", "risk_score": 90}
    )

    assert uri == "s3://soc-data/evidence/alerts/2026/07/15/alert-1.json"
    assert client.puts[0]["ServerSideEncryption"] == "aws:kms"
    assert client.puts[0]["SSEKMSKeyId"] == "arn:aws:kms:ap-southeast-1:123:key/abc"


def test_s3_json_serialization_rejects_non_finite_numbers() -> None:
    client = FakeS3Client()
    store = S3DataStore(bucket="soc-data", deployment_target="aws", client=client)

    with pytest.raises(ValueError, match="Out of range float values are not JSON compliant"):
        store.put_raw_zeek_event({"event_id": "evt-nan", "score": float("nan")})

    assert client.puts == []


def test_local_without_bucket_is_explicit_noop() -> None:
    store = S3DataStore(bucket=None, deployment_target="local")

    assert store.put_raw_zeek_event({"event_id": "evt-local"}) is None
    assert store.client is None


@pytest.mark.parametrize("target", ["cloud", "aws", "production", "staging"])
def test_cloud_like_target_without_bucket_fails_closed(target: str) -> None:
    store = S3DataStore(bucket=None, deployment_target=target)

    with pytest.raises(RuntimeError, match="S3_DATA_BUCKET is required"):
        store.put_alert_evidence({"id": "alert-1"})


def test_environment_wrapper_builds_lazy_regional_client(monkeypatch: pytest.MonkeyPatch) -> None:
    client = FakeS3Client()
    captured: dict[str, str] = {}

    def fake_client(service: str, *, region_name: str) -> FakeS3Client:
        captured.update(service=service, region=region_name)
        return client

    monkeypatch.setenv("SOC_DEPLOYMENT_TARGET", "cloud")
    monkeypatch.setenv("S3_DATA_BUCKET", "soc-data")
    monkeypatch.setenv("AWS_REGION", "ap-southeast-2")
    monkeypatch.setenv("S3_KMS_KEY_ID", "kms-key-1")
    monkeypatch.setattr(s3_data_store.boto3, "client", fake_client)

    uri = s3_data_store.archive_raw_zeek_event(
        {"event_id": "evt-env", "timestamp": 1784083200}
    )

    assert uri == "s3://soc-data/raw/zeek/2026/07/15/evt-env.json"
    assert captured == {"service": "s3", "region": "ap-southeast-2"}
    assert client.puts[0]["ServerSideEncryption"] == "aws:kms"
    assert client.puts[0]["SSEKMSKeyId"] == "kms-key-1"


def test_stable_alert_archive_api_uses_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    client = FakeS3Client()
    monkeypatch.setenv("SOC_DEPLOYMENT_TARGET", "cloud")
    monkeypatch.setenv("S3_DATA_BUCKET", "soc-data")
    monkeypatch.delenv("S3_KMS_KEY_ID", raising=False)
    monkeypatch.setattr(s3_data_store.boto3, "client", lambda *args, **kwargs: client)

    uri = s3_data_store.archive_alert_evidence(
        {"id": "alert-stable", "timestamp": "2026-07-15T00:00:00Z"}
    )

    assert uri == "s3://soc-data/evidence/alerts/2026/07/15/alert-stable.json"


def test_keys_require_stable_identifiers() -> None:
    with pytest.raises(ValueError, match="requires event_id"):
        raw_zeek_key({"timestamp": "2026-07-15T00:00:00Z"})

    with pytest.raises(ValueError, match="requires id or event_id"):
        alert_evidence_key({"timestamp": "2026-07-15T00:00:00Z"})


def test_identical_existing_object_is_an_idempotent_success() -> None:
    event = {"event_id": "evt-retry", "timestamp": "2026-07-15T00:00:00Z"}
    canonical = json.dumps(
        event,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    client = ExistingObjectS3Client(hashlib.sha256(canonical).hexdigest())
    store = S3DataStore(bucket="soc-data", deployment_target="aws", client=client)

    assert store.put_raw_zeek_event(event) == (
        "s3://soc-data/raw/zeek/2026/07/15/evt-retry.json"
    )


def test_existing_object_with_different_content_fails_closed() -> None:
    client = ExistingObjectS3Client("different-digest")
    store = S3DataStore(bucket="soc-data", deployment_target="aws", client=client)

    with pytest.raises(RuntimeError, match="already exists with different content"):
        store.put_raw_zeek_event(
            {"event_id": "evt-conflict", "timestamp": "2026-07-15T00:00:00Z"}
        )


def test_conditional_request_conflict_retries_without_removing_precondition() -> None:
    client = ConflictThenSuccessS3Client()
    store = S3DataStore(bucket="soc-data", deployment_target="aws", client=client)

    assert store.put_raw_zeek_event(
        {"event_id": "evt-409-retry", "timestamp": "2026-07-15T00:00:00Z"}
    ).endswith("/evt-409-retry.json")
    assert len(client.puts) == 2
    assert all(request["IfNoneMatch"] == "*" for request in client.puts)


def test_unresolved_conditional_request_conflict_has_bounded_attempts() -> None:
    client = UnresolvedConflictS3Client()
    store = S3DataStore(bucket="soc-data", deployment_target="aws", client=client)

    with pytest.raises(RuntimeError, match="could not be reconciled after 3 attempts"):
        store.put_raw_zeek_event(
            {"event_id": "evt-409-stuck", "timestamp": "2026-07-15T00:00:00Z"}
        )

    assert len(client.puts) == 3


def test_conditional_request_conflict_never_overwrites_different_content() -> None:
    client = ConflictWithExistingObjectS3Client("different-digest")
    store = S3DataStore(bucket="soc-data", deployment_target="aws", client=client)

    with pytest.raises(RuntimeError, match="already exists with different content"):
        store.put_raw_zeek_event(
            {"event_id": "evt-409-different", "timestamp": "2026-07-15T00:00:00Z"}
        )

    assert len(client.puts) == 1


def test_legacy_existing_object_without_digest_metadata_is_hashed() -> None:
    event = {"event_id": "evt-legacy-retry", "timestamp": "2026-07-15T00:00:00Z"}
    canonical = json.dumps(
        event,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    store = S3DataStore(
        bucket="soc-data",
        deployment_target="aws",
        client=LegacyExistingObjectS3Client(canonical),
    )

    assert store.put_raw_zeek_event(event).endswith("/evt-legacy-retry.json")
