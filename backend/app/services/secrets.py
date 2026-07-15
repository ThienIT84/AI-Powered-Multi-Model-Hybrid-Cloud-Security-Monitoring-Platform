from __future__ import annotations

import json
import os
import threading
import time
from typing import Any

import boto3


_CACHE_LOCK = threading.Lock()
_SECRET_CACHE: dict[tuple[str, str], tuple[float, dict[str, Any]]] = {}


def _cache_ttl_seconds() -> float:
    raw_value = os.getenv("SECRETS_CACHE_TTL_SECONDS", "300")
    try:
        return max(0.0, float(raw_value))
    except ValueError as exc:
        raise RuntimeError("SECRETS_CACHE_TTL_SECONDS must be a number") from exc


def clear_secret_cache() -> None:
    """Clear cached values, primarily for controlled rotation and tests."""

    with _CACHE_LOCK:
        _SECRET_CACHE.clear()


def get_json_secret(secret_id: str) -> dict[str, Any]:
    region = os.environ.get("AWS_REGION", "ap-southeast-1")
    cache_key = (region, secret_id)
    now = time.monotonic()
    with _CACHE_LOCK:
        cached = _SECRET_CACHE.get(cache_key)
        if cached and cached[0] > now:
            return dict(cached[1])

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

    ttl = _cache_ttl_seconds()
    if ttl > 0:
        with _CACHE_LOCK:
            _SECRET_CACHE[cache_key] = (time.monotonic() + ttl, dict(secret))
    return dict(secret)
