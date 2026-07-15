from __future__ import annotations

import json

import pytest

from app.services.telemetry_pipeline import (
    TELEMETRY_ENVELOPE_TYPE,
    TELEMETRY_ENVELOPE_VERSION,
    build_sqs_envelope,
    build_telemetry_envelope,
    serialize_sqs_envelope,
    unpack_sqs_envelope,
    unpack_telemetry_message,
)


def test_build_and_unpack_versioned_sqs_envelope() -> None:
    event = {"event_id": "evt-1", "event_type": "network_flow"}

    body = serialize_sqs_envelope(
        event,
        raw_event_s3_uri="s3://soc-data/raw/zeek/2026/07/15/evt-1.json",
        enqueued_at="2026-07-15T01:02:03Z",
        metadata={"sensor_id": "zeek-01"},
    )
    unpacked = unpack_sqs_envelope(body)

    assert unpacked.event == event
    assert unpacked.envelope_version == TELEMETRY_ENVELOPE_VERSION
    assert unpacked.is_legacy is False
    assert unpacked.raw_event_s3_uri == "s3://soc-data/raw/zeek/2026/07/15/evt-1.json"
    assert unpacked.metadata == {
        "sensor_id": "zeek-01",
        "enqueued_at": "2026-07-15T01:02:03Z",
    }
    assert unpacked.storage == {
        "raw_s3_uri": "s3://soc-data/raw/zeek/2026/07/15/evt-1.json"
    }


def test_builder_does_not_mutate_event_or_metadata() -> None:
    event = {"event_id": "evt-copy"}
    metadata = {"producer": "collector"}

    envelope = build_sqs_envelope(
        event,
        enqueued_at="2026-07-15T00:00:00Z",
        metadata=metadata,
    )
    envelope["event"]["event_id"] = "changed"
    envelope["metadata"]["producer"] = "changed"

    assert event == {"event_id": "evt-copy"}
    assert metadata == {"producer": "collector"}


def test_sqs_envelope_serialization_rejects_non_finite_json() -> None:
    with pytest.raises(ValueError, match="Out of range float values are not JSON compliant"):
        serialize_sqs_envelope({"event_id": "evt-nan", "score": float("nan")})


def test_unpack_accepts_legacy_direct_event_body() -> None:
    legacy = {"event_id": "evt-legacy", "event_type": "http"}

    unpacked = unpack_sqs_envelope(json.dumps(legacy))

    assert unpacked.event == legacy
    assert unpacked.metadata == {}
    assert unpacked.storage == {}
    assert unpacked.envelope_version is None
    assert unpacked.is_legacy is True


def test_stable_pipeline_api_returns_event_and_storage() -> None:
    event = {"event_id": "evt-stable", "event_type": "combined"}
    envelope = build_telemetry_envelope(event, "s3://soc-data/raw/evt-stable.json")

    unpacked_event, storage = unpack_telemetry_message(envelope)

    assert unpacked_event == event
    assert storage == {"raw_s3_uri": "s3://soc-data/raw/evt-stable.json"}

    legacy_event, legacy_storage = unpack_telemetry_message(json.dumps(event))
    assert legacy_event == event
    assert legacy_storage == {}


def test_event_like_object_without_envelope_sentinel_remains_legacy() -> None:
    legacy = {"event_id": "evt-legacy", "event": {"nested": True}, "envelope_version": 1}

    assert unpack_sqs_envelope(legacy).event == legacy


def test_unpack_rejects_unsupported_version() -> None:
    envelope = {
        "envelope_type": TELEMETRY_ENVELOPE_TYPE,
        "envelope_version": 99,
        "event": {"event_id": "evt-future"},
    }

    with pytest.raises(ValueError, match="unsupported telemetry envelope version"):
        unpack_sqs_envelope(envelope)


@pytest.mark.parametrize("body", ["[]", b"[]"])
def test_unpack_rejects_non_object_json(body: str | bytes) -> None:
    with pytest.raises(ValueError, match="SQS message body must be a JSON object"):
        unpack_sqs_envelope(body)


@pytest.mark.parametrize("constant", ["NaN", "Infinity", "-Infinity"])
def test_unpack_rejects_nonstandard_json_numbers(constant: str) -> None:
    with pytest.raises(ValueError, match="non-standard JSON number"):
        unpack_sqs_envelope(
            '{"event_id":"evt-nonstandard","score":' + constant + "}"
        )


def test_unpack_rejects_invalid_envelope_members() -> None:
    with pytest.raises(ValueError, match="event must be a JSON object"):
        unpack_sqs_envelope(
            {
                "envelope_type": TELEMETRY_ENVELOPE_TYPE,
                "envelope_version": TELEMETRY_ENVELOPE_VERSION,
                "event": [],
            }
        )

    with pytest.raises(ValueError, match="metadata must be a JSON object"):
        unpack_sqs_envelope(
            {
                "envelope_type": TELEMETRY_ENVELOPE_TYPE,
                "envelope_version": TELEMETRY_ENVELOPE_VERSION,
                "event": {"event_id": "evt-1"},
                "metadata": [],
            }
        )

    with pytest.raises(ValueError, match="storage must be a JSON object"):
        unpack_sqs_envelope(
            {
                "envelope_type": TELEMETRY_ENVELOPE_TYPE,
                "envelope_version": TELEMETRY_ENVELOPE_VERSION,
                "event": {"event_id": "evt-1"},
                "storage": [],
            }
        )


@pytest.mark.parametrize(
    "raw_s3_uri",
    ["https://bucket/key", "s3://bucket", "s3:///key", 123],
)
def test_envelope_rejects_invalid_raw_s3_uri(raw_s3_uri: object) -> None:
    with pytest.raises(ValueError, match="raw_s3_uri"):
        unpack_sqs_envelope(
            {
                "envelope_type": TELEMETRY_ENVELOPE_TYPE,
                "envelope_version": TELEMETRY_ENVELOPE_VERSION,
                "event": {"event_id": "evt-1"},
                "storage": {"raw_s3_uri": raw_s3_uri},
            }
        )
