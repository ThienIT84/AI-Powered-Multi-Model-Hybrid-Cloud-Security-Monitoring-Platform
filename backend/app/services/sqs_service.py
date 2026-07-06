from __future__ import annotations

import json
import os
from typing import Any

import boto3
from botocore.exceptions import ClientError


class SQSService:
    def __init__(self, queue_url: str | None = None, region: str | None = None) -> None:
        self.queue_url = queue_url or os.getenv("SQS_QUEUE_URL")
        self.region = region or os.getenv("AWS_REGION", "ap-southeast-1")
        self.message_group_id = os.getenv("SQS_MESSAGE_GROUP_ID", "socai-events")
        self.sqs_client = boto3.client("sqs", region_name=self.region)

    def _require_queue_url(self) -> str:
        if not self.queue_url:
            raise RuntimeError("SQS_QUEUE_URL is not configured.")
        return self.queue_url

    def send_event(self, event: dict[str, Any]) -> str:
        queue_url = self._require_queue_url()

        payload: dict[str, Any] = {
            "QueueUrl": queue_url,
            "MessageBody": json.dumps(event, ensure_ascii=False, default=str),
        }

        if queue_url.endswith(".fifo"):
            payload["MessageGroupId"] = self.message_group_id
            payload["MessageDeduplicationId"] = str(event.get("event_id") or event.get("id"))

        try:
            response = self.sqs_client.send_message(**payload)
            return response["MessageId"]
        except ClientError as exc:
            raise RuntimeError(f"Failed to send event to SQS: {exc}") from exc

    def receive_events(
        self,
        max_messages: int = 10,
        wait_time_seconds: int = 20,
        visibility_timeout: int = 60,
    ) -> list[dict[str, Any]]:
        queue_url = self._require_queue_url()
        max_messages = max(1, min(max_messages, 10))

        try:
            response = self.sqs_client.receive_message(
                QueueUrl=queue_url,
                MaxNumberOfMessages=max_messages,
                WaitTimeSeconds=wait_time_seconds,
                VisibilityTimeout=visibility_timeout,
                AttributeNames=["ApproximateReceiveCount"],
            )

            messages = response.get("Messages", [])
            parsed_messages: list[dict[str, Any]] = []

            for msg in messages:
                parsed_messages.append(
                    {
                        "message_id": msg["MessageId"],
                        "receipt_handle": msg["ReceiptHandle"],
                        "body": json.loads(msg["Body"]),
                        "attributes": msg.get("Attributes", {}),
                    }
                )

            return parsed_messages
        except ClientError as exc:
            raise RuntimeError(f"Failed to receive events from SQS: {exc}") from exc

    def delete_message(self, receipt_handle: str) -> None:
        queue_url = self._require_queue_url()

        try:
            self.sqs_client.delete_message(
                QueueUrl=queue_url,
                ReceiptHandle=receipt_handle,
            )
        except ClientError as exc:
            raise RuntimeError(f"Failed to delete message from SQS: {exc}") from exc

    def get_queue_depth(self) -> dict[str, str]:
        queue_url = self._require_queue_url()

        try:
            response = self.sqs_client.get_queue_attributes(
                QueueUrl=queue_url,
                AttributeNames=[
                    "ApproximateNumberOfMessages",
                    "ApproximateNumberOfMessagesNotVisible",
                    "ApproximateNumberOfMessagesDelayed",
                ],
            )
            return response.get("Attributes", {})
        except ClientError as exc:
            raise RuntimeError(f"Failed to get SQS queue attributes: {exc}") from exc