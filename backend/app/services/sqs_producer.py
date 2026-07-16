from __future__ import annotations

import json
import os
from typing import Any

import boto3


def send_event_to_sqs(event: dict[str, Any]) -> dict[str, Any]:
    region = os.environ.get("AWS_REGION", "ap-southeast-1")
    queue_url = os.environ.get("SQS_QUEUE_URL")

    if not queue_url:
        raise RuntimeError("SQS_QUEUE_URL is not configured")

    message_body = json.dumps(
        event,
        ensure_ascii=False,
        allow_nan=False,
        separators=(",", ":"),
    )
    client = boto3.client("sqs", region_name=region)
    response = client.send_message(
        QueueUrl=queue_url,
        MessageBody=message_body,
    )

    return {
        "message_id": response["MessageId"],
        "queue_url": queue_url,
    }
