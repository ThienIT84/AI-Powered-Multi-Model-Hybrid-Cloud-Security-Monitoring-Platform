from __future__ import annotations

import json
import os
import signal
import time
from collections.abc import Callable
from typing import Any

import boto3

from app.dependencies import orchestrator
from app.services.rds_alert_store import upsert_final_alert


RUNNING = True


def _stop_worker(signum: int, frame: object) -> None:  # noqa: ARG001
    global RUNNING
    RUNNING = False


signal.signal(signal.SIGTERM, _stop_worker)
signal.signal(signal.SIGINT, _stop_worker)


def _process_message_body(
    body: str,
    *,
    event_processor: Callable[[dict[str, Any]], dict[str, Any]] = orchestrator.process,
    alert_writer: Callable[[dict[str, Any]], None] = upsert_final_alert,
) -> dict[str, str]:
    event = json.loads(body)

    if not isinstance(event, dict):
        raise ValueError("SQS message body must be a JSON object")

    event_id = event.get("event_id")
    if not event_id:
        raise ValueError("event_id is required")

    alert = event_processor(event)
    if not isinstance(alert, dict):
        raise TypeError("orchestrator.process(event) must return a dict alert DTO")

    alert_id = alert.get("id") or alert.get("event_id")
    if not alert_id:
        raise ValueError("alert DTO must contain id or event_id")

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

    print("socai-ai-worker started", flush=True)
    print(f"queue_url={queue_url}", flush=True)

    while RUNNING:
        response = client.receive_message(
            QueueUrl=queue_url,
            MaxNumberOfMessages=1,
            WaitTimeSeconds=20,
            VisibilityTimeout=120,
        )

        messages = response.get("Messages", [])
        if not messages:
            continue

        for message in messages:
            receipt_handle = message["ReceiptHandle"]

            try:
                started = time.time()
                result = _process_message_body(message["Body"])
                elapsed = time.time() - started

                client.delete_message(
                    QueueUrl=queue_url,
                    ReceiptHandle=receipt_handle,
                )

                print(
                    "processed message "
                    f"event_id={result.get('event_id')} "
                    f"alert_id={result.get('alert_id')} "
                    f"elapsed={elapsed:.3f}s",
                    flush=True,
                )

            except Exception as exc:  # noqa: BLE001 - failed messages must remain for retry/DLQ.
                print(
                    f"ERROR processing message: {type(exc).__name__}: {exc}",
                    flush=True,
                )

    print("socai-ai-worker stopped", flush=True)


if __name__ == "__main__":
    main()
