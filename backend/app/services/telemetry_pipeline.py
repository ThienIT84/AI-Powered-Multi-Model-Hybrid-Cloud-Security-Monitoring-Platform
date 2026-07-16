from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping
from urllib.parse import urlsplit


TELEMETRY_ENVELOPE_TYPE = "hybrid-soc.normalized-zeek-event"
TELEMETRY_ENVELOPE_VERSION = 1


@dataclass(frozen=True)
class UnpackedTelemetry:
    """A normalized view of both versioned and legacy SQS message bodies."""

    event: dict[str, Any]
    storage: dict[str, Any] = field(default_factory=dict)
    metadata: dict[str, Any] = field(default_factory=dict)
    envelope_version: int | None = None
    is_legacy: bool = False

    @property
    def raw_event_s3_uri(self) -> str | None:
        value = self.storage.get("raw_s3_uri") or self.metadata.get("raw_event_s3_uri")
        return str(value) if value else None


def build_sqs_envelope(
    event: Mapping[str, Any],
    *,
    raw_event_s3_uri: str | None = None,
    enqueued_at: str | None = None,
    metadata: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    """Wrap a normalized Zeek event in the current SQS message contract.

    The event is copied so callers can safely reuse their normalized payload.
    Optional storage metadata lets a worker reuse a raw-event object written by
    the ingestion API instead of writing a second copy.
    """

    if not isinstance(event, Mapping):
        raise TypeError("telemetry event must be a mapping")

    message_metadata = dict(metadata or {})
    message_metadata.setdefault("enqueued_at", enqueued_at or _utc_now())
    storage = {"raw_s3_uri": _normalize_s3_uri(raw_event_s3_uri)} if raw_event_s3_uri else {}

    return {
        "envelope_type": TELEMETRY_ENVELOPE_TYPE,
        "envelope_version": TELEMETRY_ENVELOPE_VERSION,
        "event": dict(event),
        "storage": storage,
        "metadata": message_metadata,
    }


def build_telemetry_envelope(
    event: Mapping[str, Any],
    raw_s3_uri: str | None = None,
) -> dict[str, Any]:
    """Stable producer API for the normalized telemetry queue."""

    return build_sqs_envelope(event, raw_event_s3_uri=raw_s3_uri)


def serialize_sqs_envelope(
    event: Mapping[str, Any],
    *,
    raw_event_s3_uri: str | None = None,
    enqueued_at: str | None = None,
    metadata: Mapping[str, Any] | None = None,
) -> str:
    """Build and serialize an SQS envelope as compact UTF-8 JSON text."""

    envelope = build_sqs_envelope(
        event,
        raw_event_s3_uri=raw_event_s3_uri,
        enqueued_at=enqueued_at,
        metadata=metadata,
    )
    return json.dumps(
        envelope,
        ensure_ascii=False,
        allow_nan=False,
        separators=(",", ":"),
    )


def unpack_sqs_envelope(body: str | bytes | bytearray | Mapping[str, Any]) -> UnpackedTelemetry:
    """Decode the current envelope or a legacy direct-event SQS body.

    Legacy messages placed the normalized event directly in ``MessageBody``.
    They remain processable so deploying the new producer does not strand
    messages already waiting in the queue or its DLQ.
    """

    payload = _decode_body(body)
    if payload.get("envelope_type") != TELEMETRY_ENVELOPE_TYPE:
        return UnpackedTelemetry(event=dict(payload), is_legacy=True)

    version = payload.get("envelope_version")
    if version != TELEMETRY_ENVELOPE_VERSION:
        raise ValueError(f"unsupported telemetry envelope version: {version!r}")

    event = payload.get("event")
    if not isinstance(event, dict):
        raise ValueError("telemetry envelope event must be a JSON object")

    metadata = payload.get("metadata", {})
    if not isinstance(metadata, dict):
        raise ValueError("telemetry envelope metadata must be a JSON object")

    storage = payload.get("storage", {})
    if not isinstance(storage, dict):
        raise ValueError("telemetry envelope storage must be a JSON object")

    raw_s3_uri = storage.get("raw_s3_uri")
    if raw_s3_uri is not None:
        storage = {**storage, "raw_s3_uri": _normalize_s3_uri(raw_s3_uri)}

    # Accept the first envelope draft if one is already waiting in SQS/DLQ.
    if not storage and metadata.get("raw_event_s3_uri"):
        storage = {"raw_s3_uri": _normalize_s3_uri(metadata["raw_event_s3_uri"])}

    return UnpackedTelemetry(
        event=dict(event),
        storage=dict(storage),
        metadata=dict(metadata),
        envelope_version=TELEMETRY_ENVELOPE_VERSION,
        is_legacy=False,
    )


def unpack_telemetry_message(
    message: str | bytes | bytearray | Mapping[str, Any],
) -> tuple[dict[str, Any], dict[str, Any]]:
    """Stable worker API returning ``(event, storage_metadata)``.

    For legacy direct-event messages, storage metadata is an empty dictionary.
    """

    unpacked = unpack_sqs_envelope(message)
    return unpacked.event, unpacked.storage


def _decode_body(body: str | bytes | bytearray | Mapping[str, Any]) -> dict[str, Any]:
    if isinstance(body, Mapping):
        return dict(body)

    if isinstance(body, (bytes, bytearray)):
        body = bytes(body).decode("utf-8")

    if not isinstance(body, str):
        raise TypeError("SQS message body must be JSON text, bytes, or a mapping")

    payload = json.loads(body, parse_constant=_reject_nonstandard_json_constant)
    if not isinstance(payload, dict):
        raise ValueError("SQS message body must be a JSON object")
    return payload


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _reject_nonstandard_json_constant(value: str) -> None:
    raise ValueError(f"SQS message body contains non-standard JSON number {value}")


def _normalize_s3_uri(value: Any) -> str:
    if not isinstance(value, str):
        raise ValueError("raw_s3_uri must be an s3:// URI string")
    parsed = urlsplit(value.strip())
    if parsed.scheme != "s3" or not parsed.netloc or not parsed.path.lstrip("/"):
        raise ValueError("raw_s3_uri must be an s3:// URI with bucket and object key")
    if parsed.query or parsed.fragment or parsed.username or parsed.password or parsed.port:
        raise ValueError("raw_s3_uri must not contain credentials, query, fragment, or port")
    return f"s3://{parsed.netloc}/{parsed.path.lstrip('/')}"
