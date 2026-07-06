from __future__ import annotations

import json
import os
from functools import lru_cache
from typing import Any

import boto3


@lru_cache(maxsize=8)
def get_json_secret(secret_id: str) -> dict[str, Any]:
    region = os.environ.get("AWS_REGION", "ap-southeast-1")
    client = boto3.client("secretsmanager", region_name=region)

    response = client.get_secret_value(SecretId=secret_id)
    secret_string = response.get("SecretString")

    if not secret_string:
        raise RuntimeError(f"Secret {secret_id} does not contain SecretString")

    try:
        secret = json.loads(secret_string)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Secret {secret_id} does not contain valid JSON") from exc

    if not isinstance(secret, dict):
        raise RuntimeError(f"Secret {secret_id} JSON must be an object")

    return secret
