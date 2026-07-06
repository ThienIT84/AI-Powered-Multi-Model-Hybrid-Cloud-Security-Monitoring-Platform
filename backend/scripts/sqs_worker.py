#!/usr/bin/env python3
from __future__ import annotations

import asyncio
import logging
import os
import sys
import time
from typing import Any

from dotenv import load_dotenv


BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

load_dotenv(os.path.join(BACKEND_DIR, ".env"))

from app.contracts import normalize_event  # noqa: E402
from app.dependencies import orchestrator, s3_service, sqs_service, store, websockets  # noqa: E402


logging.basicConfig(
    level=os.getenv("WORKER_LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s [socai-sqs-worker] %(message)s",
)

logger = logging.getLogger("socai-sqs-worker")


def build_evidence_payload(event: dict[str, Any], alert: dict[str, Any]) -> dict[str, Any]:
    return {
        "schema_version": "1.0",
        "event_id": alert.get("id") or event.get("event_id"),
        "event_type": event.get("event_type", "unknown"),
        "queued_event": event,
        "alert": alert,
        "storage_source": "sqs_worker",
    }


def process_event(event: dict[str, Any]) -> dict[str, Any]:
    normalized_event = normalize_event(event)

    alert, created = store.upsert(orchestrator.process(normalized_event))

    evidence_payload = build_evidence_payload(normalized_event, alert)

    s3_uri = s3_service.upload_evidence(
        event_id=str(alert["id"]),
        data=evidence_payload,
        event_type=str(normalized_event.get("event_type", "unknown")),
    )

    alert["evidence_s3_uri"] = s3_uri

    # Best-effort only:
    # Nếu worker chạy process riêng với FastAPI backend, WebSocket connection không được share giữa 2 process.
    # Phần này không lỗi, nhưng realtime dashboard có thể cần Redis Pub/Sub hoặc polling ở phase sau.
    try:
        asyncio.run(websockets.broadcast_alert(alert, created=created))
    except Exception as exc:
        logger.warning("WebSocket best-effort broadcast failed: %s", exc)

    logger.info(
        "Processed event_id=%s attack_type=%s severity=%s s3_uri=%s",
        alert.get("id"),
        alert.get("attack_type"),
        alert.get("severity"),
        s3_uri,
    )

    return alert


def main() -> None:
    logger.info("Starting SQS worker")
    logger.info("AWS_REGION=%s", os.getenv("AWS_REGION", "ap-southeast-1"))
    logger.info("S3_EVIDENCE_BUCKET=%s", s3_service.bucket_name)
    logger.info("SQS_QUEUE_URL configured=%s", bool(sqs_service.queue_url))

    while True:
        try:
            messages = sqs_service.receive_events(
                max_messages=int(os.getenv("SQS_MAX_MESSAGES", "10")),
                wait_time_seconds=int(os.getenv("SQS_WAIT_TIME_SECONDS", "20")),
                visibility_timeout=int(os.getenv("SQS_VISIBILITY_TIMEOUT", "60")),
            )

            if not messages:
                continue

            logger.info("Received %d SQS message(s)", len(messages))

            for message in messages:
                message_id = message["message_id"]
                receipt_handle = message["receipt_handle"]

                try:
                    process_event(message["body"])
                    sqs_service.delete_message(receipt_handle)
                    logger.info("Deleted SQS message_id=%s", message_id)
                except Exception as exc:
                    logger.exception("Failed to process SQS message_id=%s: %s", message_id, exc)

        except KeyboardInterrupt:
            logger.info("Worker stopped by keyboard interrupt")
            break
        except Exception as exc:
            logger.exception("Worker loop error: %s", exc)
            time.sleep(int(os.getenv("WORKER_ERROR_SLEEP_SECONDS", "5")))


if __name__ == "__main__":
    main()