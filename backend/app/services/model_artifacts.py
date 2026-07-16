from __future__ import annotations

import os
import re
from pathlib import Path, PurePosixPath


ACTIVE_BUNDLE_POINTER = "ACTIVE"
ACTIVE_VERSION_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,160}$")


def repository_root() -> Path:
    return Path(__file__).resolve().parents[3]


def configured_model_artifact_root() -> Path:
    """Return the configured model bundle container without following ACTIVE."""

    configured = os.getenv("MODEL_ARTIFACT_ROOT", "").strip()
    return Path(configured).expanduser().resolve() if configured else repository_root()


def model_artifact_root() -> Path:
    """Return the active, complete model bundle root.

    The AWS synchronizer stores immutable versions below ``MODEL_ARTIFACT_ROOT``
    and atomically replaces its ``ACTIVE`` pointer only after every artifact has
    passed SHA-256 verification.  A direct bundle without ``ACTIVE`` remains
    supported for local development and older handoffs.
    """

    root = configured_model_artifact_root()
    pointer = root / ACTIVE_BUNDLE_POINTER
    if not os.path.lexists(pointer):
        if os.getenv("SOC_DEPLOYMENT_TARGET", "local").strip().lower() == "aws":
            raise RuntimeError(f"AWS model bundle pointer is missing: {pointer}")
        return root
    if pointer.is_symlink():
        raise RuntimeError(f"model bundle pointer must not be a symlink: {pointer}")
    if not pointer.is_file():
        raise RuntimeError(f"model bundle pointer must be a regular file: {pointer}")

    relative_text = pointer.read_text(encoding="utf-8").strip()
    relative = PurePosixPath(relative_text)
    if (
        not relative_text
        or relative.is_absolute()
        or "\\" in relative_text
        or "." in relative.parts
        or ".." in relative.parts
        or relative_text != relative.as_posix()
        or len(relative.parts) != 2
        or relative.parts[0] != "versions"
        or not ACTIVE_VERSION_RE.fullmatch(relative.parts[1])
    ):
        raise RuntimeError(f"model bundle pointer is unsafe: {relative_text!r}")

    active = root.joinpath(*relative.parts).resolve()
    if root != active and root not in active.parents:
        raise RuntimeError(f"model bundle pointer escapes MODEL_ARTIFACT_ROOT: {relative_text!r}")
    if not active.is_dir():
        raise RuntimeError(f"active model bundle does not exist: {active}")
    return active
