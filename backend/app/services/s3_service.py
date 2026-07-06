from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from typing import Any

import boto3
from botocore.exceptions import ClientError


class S3Service:
    def __init__(self, bucket_name: str | None = None, region: str | None = None) -> None:
        self.bucket_name = bucket_name or os.getenv("S3_EVIDENCE_BUCKET", "socai-dev-data-913626885845")
        self.region = region or os.getenv("AWS_REGION", "ap-southeast-1")
        self.s3_client = boto3.client("s3", region_name=self.region)

    def _extract_event_type(self, data: dict[str, Any], event_type: str | None = None) -> str:
        if event_type:
            return event_type

        direct_type = data.get("event_type")
        if direct_type:
            return str(direct_type)

        event = data.get("event")
        if isinstance(event, dict) and event.get("event_type"):
            return str(event["event_type"])

        queued_event = data.get("queued_event")
        if isinstance(queued_event, dict) and queued_event.get("event_type"):
            return str(queued_event["event_type"])

        return "unknown"

    def _generate_key(self, event_type: str, event_id: str) -> str:
        now = datetime.now(timezone.utc)
        return (
            f"evidence/{event_type}/"
            f"year={now.year}/month={now.month:02d}/day={now.day:02d}/"
            f"{event_id}.json"
        )

    def upload_evidence(
        self,
        event_id: str,
        data: dict[str, Any],
        event_type: str | None = None,
    ) -> str:
        """
        Upload evidence JSON to S3.

        Returns:
            s3://bucket/key
        """
        resolved_event_type = self._extract_event_type(data, event_type)
        key = self._generate_key(resolved_event_type, event_id)

        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=json.dumps(data, ensure_ascii=False, default=str).encode("utf-8"),
                ContentType="application/json",
            )
            return f"s3://{self.bucket_name}/{key}"
        except ClientError as exc:
            raise RuntimeError(f"Failed to upload evidence to S3: {exc}") from exc

    def download_evidence(self, key_or_s3_uri: str) -> dict[str, Any]:
        """
        Download evidence from S3.

        Accepts either:
        - evidence/http/year=.../file.json
        - s3://bucket/evidence/http/year=.../file.json
        """
        key = key_or_s3_uri
        bucket = self.bucket_name

        if key_or_s3_uri.startswith("s3://"):
            without_scheme = key_or_s3_uri.replace("s3://", "", 1)
            bucket, key = without_scheme.split("/", 1)

        try:
            response = self.s3_client.get_object(Bucket=bucket, Key=key)
            return json.loads(response["Body"].read().decode("utf-8"))
        except ClientError as exc:
            raise RuntimeError(f"Failed to download evidence from S3: {exc}") from exc

    def list_evidence(self, prefix: str = "evidence/") -> list[str]:
        keys: list[str] = []
        continuation_token: str | None = None

        try:
            while True:
                kwargs: dict[str, Any] = {
                    "Bucket": self.bucket_name,
                    "Prefix": prefix,
                }
                if continuation_token:
                    kwargs["ContinuationToken"] = continuation_token

                response = self.s3_client.list_objects_v2(**kwargs)
                keys.extend(obj["Key"] for obj in response.get("Contents", []))

                if not response.get("IsTruncated"):
                    break

                continuation_token = response.get("NextContinuationToken")

            return keys
        except ClientError as exc:
            raise RuntimeError(f"Failed to list evidence in S3: {exc}") from exc