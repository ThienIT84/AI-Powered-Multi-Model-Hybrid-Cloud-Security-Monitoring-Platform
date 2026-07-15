from __future__ import annotations

import json
import os
import signal
import threading
import time
from collections.abc import Callable, Iterator
from contextlib import contextmanager
from typing import Any

import boto3

from app.dependencies import orchestrator
from app.services.rds_alert_store import upsert_final_alert
from app.services.s3_data_store import archive_alert_evidence, archive_raw_zeek_event
from app.services.telemetry_pipeline import unpack_telemetry_message


RUNNING = True


def _log(event: str, **fields: Any) -> None:
    print(json.dumps({"event": event, **fields}, ensure_ascii=False, sort_keys=True), flush=True)


def _stop_worker(signum: int, frame: object) -> None:  # noqa: ARG001
    global RUNNING
    RUNNING = False


signal.signal(signal.SIGTERM, _stop_worker)
signal.signal(signal.SIGINT, _stop_worker)


def _bounded_env_int(name: str, default: int, *, minimum: int, maximum: int) -> int:
    raw_value = os.getenv(name, str(default))
    try:
        parsed = int(raw_value)
    except ValueError as exc:
        raise RuntimeError(f"{name} must be an integer") from exc
    return max(minimum, min(parsed, maximum))


@contextmanager
def _visibility_heartbeat(
    client: Any,
    *,
    queue_url: str,
    receipt_handle: str,
    visibility_timeout: int,
    heartbeat_interval: float,
) -> Iterator[None]:
    """Renew an in-flight SQS lease until processing and deletion finish."""

    stopped = threading.Event()

    def renew() -> None:
        while not stopped.wait(heartbeat_interval):
            try:
                client.change_message_visibility(
                    QueueUrl=queue_url,
                    ReceiptHandle=receipt_handle,
                    VisibilityTimeout=visibility_timeout,
                )
            except Exception as exc:  # noqa: BLE001 - processing can still finish before lease expiry.
                _log(
                    "visibility_heartbeat_failed",
                    error_type=type(exc).__name__,
                    error=str(exc),
                )

    thread = threading.Thread(target=renew, name="sqs-visibility-heartbeat", daemon=True)
    thread.start()
    try:
        yield
    finally:
        stopped.set()
        thread.join(timeout=max(1.0, min(float(heartbeat_interval), 5.0)))


def _process_message_body(
    body: str,
    *,
    event_processor: Callable[[dict[str, Any]], dict[str, Any]] = orchestrator.process,
    alert_writer: Callable[[dict[str, Any]], None] = upsert_final_alert,
    raw_event_archiver: Callable[[dict[str, Any]], str | None] = archive_raw_zeek_event,
    alert_archiver: Callable[[dict[str, Any]], str | None] = archive_alert_evidence,
) -> dict[str, str]:
    event, storage = unpack_telemetry_message(body)

    event_id = event.get("event_id")
    if not event_id:
        raise ValueError("event_id is required")

    raw_s3_uri = storage.get("raw_s3_uri") or raw_event_archiver(event)
    alert = event_processor(event)
    if not isinstance(alert, dict):
        raise TypeError("orchestrator.process(event) must return a dict alert DTO")
    alert = dict(alert)
    alert.setdefault("event_id", str(event_id))

    alert_id = alert.get("id") or alert.get("event_id")
    if not alert_id:
        raise ValueError("alert DTO must contain id or event_id")

    alert["evidence_summary"] = {
        "zeek": alert.get("zeek_evidence"),
        "suricata": alert.get("suricata_evidence"),
        "detected_by": alert.get("detected_by") or [],
        "fusion": ((alert.get("ai_analysis") or {}).get("fusion") if isinstance(alert.get("ai_analysis"), dict) else None),
    }
    alert["storage"] = {
        **(alert.get("storage") if isinstance(alert.get("storage"), dict) else {}),
        "raw_s3_uri": raw_s3_uri,
    }
    evidence_s3_uri = alert_archiver(alert)
    alert["storage"]["evidence_s3_uri"] = evidence_s3_uri
    alert["raw_s3_uri"] = raw_s3_uri
    alert["evidence_s3_uri"] = evidence_s3_uri

    alert_writer(alert)

    return {
        "event_id": str(event_id),
        "alert_id": str(alert_id),
    }


def main() -> None:
    region = os.environ.get("AWS_REGION", "ap-southeast-1")
    queue_url = os.environ.get("SQS_QUEUE_URL")

    if not queue_url:
        raise RuntimeError("SQS_QUEUE_URL is not configured")

    client = boto3.client("sqs", region_name=region)
    visibility_timeout = _bounded_env_int(
        "SQS_VISIBILITY_TIMEOUT_SECONDS",
        120,
        minimum=30,
        maximum=43_200,
    )
    heartbeat_interval = _bounded_env_int(
        "SQS_VISIBILITY_HEARTBEAT_SECONDS",
        min(30, max(1, visibility_timeout // 3)),
        minimum=1,
        maximum=max(1, visibility_timeout // 2),
    )

    _log(
        "worker_started",
        queue=queue_url.rstrip("/").rsplit("/", 1)[-1],
        region=region,
        visibility_timeout_seconds=visibility_timeout,
        visibility_heartbeat_seconds=heartbeat_interval,
    )

    while RUNNING:
        response = client.receive_message(
            QueueUrl=queue_url,
            MaxNumberOfMessages=1,
            WaitTimeSeconds=20,
            VisibilityTimeout=visibility_timeout,
        )

        messages = response.get("Messages", [])
        if not messages:
            continue

        for message in messages:
            receipt_handle = message["ReceiptHandle"]

            try:
                started = time.time()
                with _visibility_heartbeat(
                    client,
                    queue_url=queue_url,
                    receipt_handle=receipt_handle,
                    visibility_timeout=visibility_timeout,
                    heartbeat_interval=heartbeat_interval,
                ):
                    result = _process_message_body(message["Body"])
                    elapsed = time.time() - started

                    client.delete_message(
                        QueueUrl=queue_url,
                        ReceiptHandle=receipt_handle,
                    )

                _log(
                    "message_processed",
                    event_id=result.get("event_id"),
                    alert_id=result.get("alert_id"),
                    elapsed_seconds=round(elapsed, 3),
                )

            except Exception as exc:  # noqa: BLE001 - failed messages must remain for retry/DLQ.
                _log(
                    "message_processing_failed",
                    error_type=type(exc).__name__,
                    error=str(exc),
                )

    _log("worker_stopped")


if __name__ == "__main__":
    main()
