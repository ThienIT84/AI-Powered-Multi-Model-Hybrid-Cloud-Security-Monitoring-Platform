from __future__ import annotations

import json
import hashlib
import os
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping
from urllib.parse import quote

import boto3
from botocore.exceptions import ClientError


DEFAULT_AWS_REGION = "ap-southeast-1"
RAW_ZEEK_PREFIX = "raw/zeek"
ALERT_EVIDENCE_PREFIX = "evidence/alerts"
CONDITIONAL_WRITE_ATTEMPTS = 3
_NO_S3_TARGETS = {"", "local", "dev", "development", "test", "ci"}


@dataclass
class S3DataStore:
    """Persist raw telemetry and final-alert evidence in the S3 data bucket.

    A missing bucket is an intentional no-op for local/test targets. It is a
    configuration error for cloud-like targets, which prevents an AWS worker
    from silently acknowledging SQS messages without archiving their evidence.
    """

    bucket: str | None
    deployment_target: str = "local"
    region: str = DEFAULT_AWS_REGION
    kms_key_id: str | None = None
    client: Any | None = field(default=None, repr=False)

    @classmethod
    def from_env(cls) -> S3DataStore:
        return cls(
            bucket=_clean_optional(os.getenv("S3_DATA_BUCKET")),
            deployment_target=os.getenv("SOC_DEPLOYMENT_TARGET", "local").strip().lower(),
            region=os.getenv("AWS_REGION", DEFAULT_AWS_REGION).strip() or DEFAULT_AWS_REGION,
            kms_key_id=_clean_optional(os.getenv("S3_KMS_KEY_ID")),
        )

    @property
    def enabled(self) -> bool:
        return bool(_clean_optional(self.bucket))

    @property
    def required(self) -> bool:
        return self.deployment_target.strip().lower() not in _NO_S3_TARGETS

    def put_raw_zeek_event(self, event: Mapping[str, Any]) -> str | None:
        return self._put_json(raw_zeek_key(event), event)

    def put_alert_evidence(self, alert: Mapping[str, Any]) -> str | None:
        return self._put_json(alert_evidence_key(alert), alert)

    def _put_json(self, key: str, document: Mapping[str, Any]) -> str | None:
        bucket = _clean_optional(self.bucket)
        if not bucket:
            if self.required:
                raise RuntimeError(
                    "S3_DATA_BUCKET is required when SOC_DEPLOYMENT_TARGET="
                    f"{self.deployment_target!r}"
                )
            return None

        if not isinstance(document, Mapping):
            raise TypeError("S3 JSON document must be a mapping")

        body = json.dumps(
            dict(document),
            ensure_ascii=False,
            allow_nan=False,
            sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8")
        request: dict[str, Any] = {
            "Bucket": bucket,
            "Key": key,
            "Body": body,
            "ContentType": "application/json",
            "IfNoneMatch": "*",
            "Metadata": {"sha256": hashlib.sha256(body).hexdigest()},
        }
        if self.kms_key_id:
            request.update(
                ServerSideEncryption="aws:kms",
                SSEKMSKeyId=self.kms_key_id,
            )

        client = self._client()
        for attempt in range(1, CONDITIONAL_WRITE_ATTEMPTS + 1):
            try:
                client.put_object(**request)
                break
            except ClientError as exc:
                if not _is_conditional_write_conflict(exc):
                    raise

                # Both 412 (an object exists) and 409 (a concurrent operation)
                # require reconciliation.  A retry always retains IfNoneMatch,
                # so it can never overwrite a different object.
                existing_digest = _existing_object_digest(client, bucket=bucket, key=key)
                if existing_digest is not None:
                    if existing_digest == request["Metadata"]["sha256"]:
                        break
                    raise RuntimeError(
                        f"S3 object s3://{bucket}/{key} already exists with different content"
                    ) from exc
                if attempt == CONDITIONAL_WRITE_ATTEMPTS:
                    raise RuntimeError(
                        f"S3 conditional write conflict for s3://{bucket}/{key} "
                        f"could not be reconciled after {CONDITIONAL_WRITE_ATTEMPTS} attempts"
                    ) from exc
        return f"s3://{bucket}/{key}"

    def _client(self) -> Any:
        if self.client is None:
            self.client = boto3.client("s3", region_name=self.region)
        return self.client


def raw_zeek_key(event: Mapping[str, Any]) -> str:
    event_id = _required_identifier(event, "event_id")
    partition = _date_partition(event.get("timestamp"))
    return f"{RAW_ZEEK_PREFIX}/{partition}/{_key_identifier(event_id)}.json"


def alert_evidence_key(alert: Mapping[str, Any]) -> str:
    alert_id = alert.get("id") or alert.get("event_id")
    if not alert_id:
        raise ValueError("alert evidence requires id or event_id")
    partition = _date_partition(alert.get("timestamp"))
    return f"{ALERT_EVIDENCE_PREFIX}/{partition}/{_key_identifier(str(alert_id))}.json"


def store_raw_zeek_event(event: Mapping[str, Any]) -> str | None:
    """Environment-configured convenience wrapper for ingestion code."""

    return S3DataStore.from_env().put_raw_zeek_event(event)


def store_alert_evidence(alert: Mapping[str, Any]) -> str | None:
    """Environment-configured convenience wrapper for worker code."""

    return S3DataStore.from_env().put_alert_evidence(alert)


def archive_raw_zeek_event(event: Mapping[str, Any]) -> str | None:
    """Stable ingestion API; returns the object URI or ``None`` for local no-op."""

    return store_raw_zeek_event(event)


def archive_alert_evidence(alert: Mapping[str, Any]) -> str | None:
    """Stable worker API; returns the object URI or ``None`` for local no-op."""

    return store_alert_evidence(alert)


def _required_identifier(document: Mapping[str, Any], field_name: str) -> str:
    value = document.get(field_name)
    if not value:
        raise ValueError(f"S3 document requires {field_name}")
    return str(value)


def _key_identifier(value: str) -> str:
    return quote(value, safe="-_.~")


def _date_partition(value: Any) -> str:
    parsed = _parse_timestamp(value)
    return parsed.strftime("%Y/%m/%d") if parsed else "undated"


def _parse_timestamp(value: Any) -> datetime | None:
    if value in (None, ""):
        return None
    if isinstance(value, (int, float)):
        try:
            return datetime.fromtimestamp(float(value), tz=timezone.utc)
        except (OverflowError, OSError, ValueError):
            return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _clean_optional(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


def _existing_object_digest(client: Any, *, bucket: str, key: str) -> str | None:
    try:
        head = client.head_object(Bucket=bucket, Key=key)
    except ClientError as exc:
        if _is_not_found(exc):
            return None
        raise
    digest = (head.get("Metadata") or {}).get("sha256")
    if digest:
        return str(digest).lower()

    # Objects written by the pre-immutability adapter do not carry digest
    # metadata. Hash the small JSON object once so a safe rollout can still
    # recognize an identical retry without allowing different content.
    try:
        response = client.get_object(Bucket=bucket, Key=key)
    except ClientError as exc:
        if _is_not_found(exc):
            return None
        raise
    body = response.get("Body")
    if body is None:
        raise RuntimeError(f"S3 object has no Body: s3://{bucket}/{key}")
    hasher = hashlib.sha256()
    if hasattr(body, "read"):
        for chunk in iter(lambda: body.read(1024 * 1024), b""):
            hasher.update(chunk)
    elif isinstance(body, (bytes, bytearray)):
        hasher.update(bytes(body))
    else:
        raise TypeError(f"S3 object Body must be bytes: s3://{bucket}/{key}")
    return hasher.hexdigest()


def _is_conditional_write_conflict(exc: ClientError) -> bool:
    response = exc.response or {}
    error = response.get("Error") or {}
    status_code = (response.get("ResponseMetadata") or {}).get("HTTPStatusCode")
    return status_code in {409, 412} or error.get("Code") in {
        "409",
        "412",
        "ConditionalRequestConflict",
        "PreconditionFailed",
    }


def _is_not_found(exc: ClientError) -> bool:
    response = exc.response or {}
    error = response.get("Error") or {}
    status_code = (response.get("ResponseMetadata") or {}).get("HTTPStatusCode")
    return status_code == 404 or error.get("Code") in {"404", "NoSuchKey", "NotFound"}
