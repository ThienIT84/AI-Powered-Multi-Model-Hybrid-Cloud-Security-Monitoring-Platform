from __future__ import annotations

import hashlib
import hmac
import os
import time
from dataclasses import dataclass

from app.services.secrets import get_json_secret


SIGNATURE_HEADER = "X-SOC-Signature"
TIMESTAMP_HEADER = "X-SOC-Timestamp"


class IngestAuthenticationError(ValueError):
    """Raised when a collector request is missing or has an invalid signature."""


class IngestAuthenticationConfigurationError(RuntimeError):
    """Raised when signature verification is required but has no usable secret."""


@dataclass(frozen=True)
class IngestAuthenticationResult:
    enabled: bool
    source: str


def _truthy(value: str | None) -> bool:
    return str(value or "").strip().lower() in {"1", "true", "yes", "on"}


def _cloud_like_target() -> bool:
    target = os.getenv("SOC_DEPLOYMENT_TARGET", "local").strip().lower()
    return target not in {"", "local", "dev", "development", "test", "ci"}


def ingest_hmac_required() -> bool:
    if _cloud_like_target():
        # Cloud-like and invalid targets fail closed. An accidental
        # INGEST_HMAC_REQUIRED=false must never expose unsigned AWS ingestion.
        return True
    explicit = os.getenv("INGEST_HMAC_REQUIRED")
    if explicit is not None:
        return _truthy(explicit)
    return False


def _configured_secret() -> tuple[str | None, str]:
    secret_id = os.getenv("INGEST_HMAC_SECRET_ID")
    if _cloud_like_target():
        if not secret_id:
            if os.getenv("INGEST_HMAC_SECRET"):
                raise IngestAuthenticationConfigurationError(
                    "cloud ingest must load HMAC from Secrets Manager; configure "
                    "INGEST_HMAC_SECRET_ID instead of INGEST_HMAC_SECRET"
                )
            return None, "not_configured"
        return _secret_from_manager(secret_id)

    direct = os.getenv("INGEST_HMAC_SECRET")
    if direct:
        return direct, "environment"

    if not secret_id:
        return None, "not_configured"

    return _secret_from_manager(secret_id)


def _secret_from_manager(secret_id: str) -> tuple[str, str]:
    secret = get_json_secret(secret_id)
    secret_key = os.getenv("INGEST_HMAC_SECRET_KEY", "hmac_secret")
    value = secret.get(secret_key)
    if not isinstance(value, str) or not value:
        raise IngestAuthenticationConfigurationError(
            f"Secrets Manager value {secret_id!r} does not contain non-empty key {secret_key!r}"
        )
    return value, "secrets_manager"


def signature_for_body(body: bytes, timestamp: str, secret: str) -> str:
    message = timestamp.encode("ascii") + b"." + body
    digest = hmac.new(secret.encode("utf-8"), message, hashlib.sha256).hexdigest()
    return f"sha256={digest}"


def verify_ingest_signature(
    body: bytes,
    *,
    timestamp: str | None,
    signature: str | None,
    now: float | None = None,
) -> IngestAuthenticationResult:
    secret, source = _configured_secret()
    required = ingest_hmac_required()
    if not secret:
        if required:
            configuration = (
                "INGEST_HMAC_SECRET_ID"
                if _cloud_like_target()
                else "INGEST_HMAC_SECRET_ID or INGEST_HMAC_SECRET"
            )
            raise IngestAuthenticationConfigurationError(
                f"HMAC authentication is required; configure {configuration}"
            )
        return IngestAuthenticationResult(enabled=False, source=source)

    if not timestamp or not signature:
        raise IngestAuthenticationError(
            f"signed ingest requires {TIMESTAMP_HEADER} and {SIGNATURE_HEADER} headers"
        )
    try:
        request_time = int(timestamp)
    except ValueError as exc:
        raise IngestAuthenticationError(f"{TIMESTAMP_HEADER} must be a Unix timestamp") from exc

    maximum_skew = max(1, int(os.getenv("INGEST_HMAC_MAX_SKEW_SECONDS", "300")))
    current_time = time.time() if now is None else now
    if abs(current_time - request_time) > maximum_skew:
        raise IngestAuthenticationError("signed ingest request timestamp is outside the allowed window")

    expected = signature_for_body(body, timestamp, secret)
    if not hmac.compare_digest(expected, signature.strip().lower()):
        raise IngestAuthenticationError("invalid ingest request signature")
    return IngestAuthenticationResult(enabled=True, source=source)
