from __future__ import annotations

import json
import os
from collections.abc import Callable
from typing import Any

from app.services.model_artifacts import model_artifact_root
from scripts.sync_model_artifacts_from_s3 import verify_active_bundle


MODEL_NAMES = ("AI1", "AI2A", "AI2B")


def _enabled(name: str, *, default: bool = False) -> bool:
    fallback = "true" if default else "false"
    return os.getenv(name, fallback).strip().lower() in {"1", "true", "yes", "on"}


def run_model_bundle_canary(
    *,
    status_provider: Callable[[], list[dict[str, Any]]] | None = None,
) -> dict[str, Any]:
    """Verify bundle hashes and prove configured real adapters can load it."""

    bundle = verify_active_bundle()
    deployment_target = os.getenv("SOC_DEPLOYMENT_TARGET", "local").strip().lower()
    configured_modes = {
        name: os.getenv(f"{name}_PREDICTOR_MODE", "unavailable").strip().lower()
        for name in MODEL_NAMES
    }
    expected_real = [
        name
        for name in MODEL_NAMES
        if configured_modes[name] == "real"
    ]
    require_all_real = deployment_target == "aws" and _enabled(
        "AWS_REQUIRE_REAL_MODELS",
        default=True,
    )
    if require_all_real:
        not_real = [name for name in MODEL_NAMES if configured_modes[name] != "real"]
        if not_real:
            raise RuntimeError(
                "AWS model canary requires real predictor mode for: " + ", ".join(not_real)
            )

    if status_provider is None:
        # Import only after the ACTIVE pointer is verified. app.dependencies
        # constructs the real adapters during import and therefore exercises the
        # same paths that the API and worker will use.
        from app.dependencies import model_runtime_status  # noqa: PLC0415

        status_provider = model_runtime_status

    statuses = status_provider()
    status_by_name = {str(item.get("name")): item for item in statuses}
    failures: list[str] = []
    for name in expected_real:
        status = status_by_name.get(name)
        if not status:
            failures.append(f"{name}: missing runtime status")
            continue
        if status.get("status") != "healthy" or status.get("source") != "real":
            reason = status.get("reason") or status.get("message") or "model did not load"
            failures.append(f"{name}: {reason}")
    if failures:
        raise RuntimeError("model bundle runtime canary failed: " + "; ".join(failures))

    return {
        "status": "model_bundle_canary_passed",
        "active_root": str(model_artifact_root()),
        "bundle_id": bundle["bundle_id"],
        "manifest_sha256": bundle["manifest_sha256"],
        "artifact_count": bundle["artifact_count"],
        "real_models": expected_real,
    }


def main() -> None:
    print(json.dumps(run_model_bundle_canary(), sort_keys=True), flush=True)


if __name__ == "__main__":
    main()
