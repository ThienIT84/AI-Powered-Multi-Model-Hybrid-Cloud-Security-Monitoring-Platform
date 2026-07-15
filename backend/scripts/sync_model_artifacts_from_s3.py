from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
from pathlib import Path, PurePosixPath
from typing import Any
from uuid import uuid4

import boto3

from app.services.model_artifacts import ACTIVE_BUNDLE_POINTER, configured_model_artifact_root


MANIFEST_OBJECT_NAME = "manifest.json"
STORED_MANIFEST_NAME = ".socai-bundle-manifest.json"
STORED_MANIFEST_DIGEST_NAME = ".socai-bundle-manifest.sha256"
MANIFEST_SCHEMA_VERSION = 1
MAX_MANIFEST_BYTES = 5 * 1024 * 1024
MAX_ARTIFACTS = 10_000
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
BUNDLE_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")
RESERVED_ARTIFACT_PATHS = {
    ACTIVE_BUNDLE_POINTER,
    MANIFEST_OBJECT_NAME,
    STORED_MANIFEST_NAME,
    STORED_MANIFEST_DIGEST_NAME,
}
WINDOWS_FORBIDDEN_CHARS = frozenset('<>:"|?*')
WINDOWS_RESERVED_NAMES = {
    "CON",
    "PRN",
    "AUX",
    "NUL",
    *(f"COM{index}" for index in range(1, 10)),
    *(f"LPT{index}" for index in range(1, 10)),
}


def sync_model_artifacts(*, client: Any | None = None) -> int:
    """Download, verify and atomically activate one versioned model bundle.

    ``MODEL_ARTIFACT_ROOT`` is a stable bundle container. Complete versions are
    stored below ``versions/`` and adapters follow an atomically replaced
    ``ACTIVE`` text pointer. A failed download or hash check never changes the
    active bundle.
    """

    bucket = os.getenv("S3_DATA_BUCKET", "").strip()
    prefix = os.getenv("MODEL_S3_PREFIX", "").strip().strip("/")
    target_value = os.getenv("MODEL_ARTIFACT_ROOT", "").strip()
    deployment_target = os.getenv("SOC_DEPLOYMENT_TARGET", "local").strip().lower()
    expected_manifest_digest = os.getenv("MODEL_BUNDLE_MANIFEST_SHA256", "").strip()

    required = {
        "S3_DATA_BUCKET": bucket,
        "MODEL_S3_PREFIX": prefix,
        "MODEL_ARTIFACT_ROOT": target_value,
    }
    if deployment_target == "aws":
        required["MODEL_BUNDLE_MANIFEST_SHA256"] = expected_manifest_digest

    if any(not value for value in required.values()):
        if deployment_target == "aws":
            missing = [name for name, value in required.items() if not value]
            raise RuntimeError(f"AWS model sync is missing: {', '.join(missing)}")
        return 0

    if expected_manifest_digest and not SHA256_RE.fullmatch(expected_manifest_digest):
        raise ValueError("MODEL_BUNDLE_MANIFEST_SHA256 must contain 64 lowercase hexadecimal characters")

    target_root = configured_model_artifact_root()
    target_root.mkdir(parents=True, exist_ok=True)
    versions_root = _ensure_internal_directory(target_root, "versions")
    staging_root = _ensure_internal_directory(target_root, ".staging")

    s3 = client or boto3.client("s3", region_name=os.getenv("AWS_REGION", "ap-southeast-1"))
    manifest_key = f"{prefix}/{MANIFEST_OBJECT_NAME}"
    manifest_bytes = _read_s3_object(s3, bucket=bucket, key=manifest_key)
    manifest_digest = hashlib.sha256(manifest_bytes).hexdigest()
    if expected_manifest_digest and manifest_digest != expected_manifest_digest:
        raise RuntimeError(
            "model bundle manifest SHA-256 mismatch: "
            f"expected {expected_manifest_digest}, received {manifest_digest}"
        )
    manifest = _parse_manifest(manifest_bytes)

    version_name = f"{manifest['bundle_id']}--{manifest_digest[:16]}"
    version_dir = versions_root / version_name
    if version_dir.is_symlink():
        raise RuntimeError(f"model bundle version must not be a symlink: {version_dir}")
    if version_dir.exists():
        _verify_version_directory(version_dir, manifest_bytes, manifest_digest, manifest)
        _activate_version(target_root, version_dir)
        return 0

    staging_dir = staging_root / f"{version_name}.{uuid4().hex}.tmp"
    staging_dir.mkdir(parents=False, exist_ok=False)
    downloaded = 0
    try:
        for artifact in manifest["artifacts"]:
            relative = PurePosixPath(artifact["path"])
            destination = staging_dir.joinpath(*relative.parts)
            resolved_destination = destination.resolve()
            if staging_dir != resolved_destination and staging_dir not in resolved_destination.parents:
                raise RuntimeError(f"model artifact escapes staging: {artifact['path']!r}")
            destination.parent.mkdir(parents=True, exist_ok=True)
            key = f"{prefix}/{artifact['path']}"
            s3.download_file(bucket, key, str(destination))
            _verify_artifact(destination, artifact)
            _fsync_file(destination)
            downloaded += 1

        _write_durable(staging_dir / STORED_MANIFEST_NAME, manifest_bytes)
        _write_durable(
            staging_dir / STORED_MANIFEST_DIGEST_NAME,
            f"{manifest_digest}\n".encode("ascii"),
        )
        _verify_version_directory(staging_dir, manifest_bytes, manifest_digest, manifest)

        try:
            os.replace(staging_dir, version_dir)
            _fsync_directory(versions_root)
        except OSError:
            # A concurrent deployment may have activated the exact same pinned
            # version. Reuse it only after a complete independent verification.
            if not version_dir.exists():
                raise
            _verify_version_directory(version_dir, manifest_bytes, manifest_digest, manifest)
    finally:
        if staging_dir.exists():
            shutil.rmtree(staging_dir)

    _activate_version(target_root, version_dir)
    return downloaded


def verify_active_bundle() -> dict[str, Any]:
    """Re-verify the active version and return non-secret canary metadata."""

    root = configured_model_artifact_root()
    pointer = root / ACTIVE_BUNDLE_POINTER
    if not pointer.is_file() or pointer.is_symlink():
        raise RuntimeError(f"active model bundle pointer is missing or unsafe: {pointer}")
    relative_text = pointer.read_text(encoding="utf-8").strip()
    relative = _safe_relative_path(relative_text, context="active model bundle pointer")
    if len(relative.parts) != 2 or relative.parts[0] != "versions":
        raise RuntimeError(f"active model bundle pointer has invalid structure: {relative_text!r}")
    version_dir = root.joinpath(*relative.parts).resolve()
    if root != version_dir and root not in version_dir.parents:
        raise RuntimeError("active model bundle pointer escapes MODEL_ARTIFACT_ROOT")

    manifest_path = version_dir / STORED_MANIFEST_NAME
    if not manifest_path.is_file() or manifest_path.is_symlink():
        raise RuntimeError(f"active model bundle manifest is missing or unsafe: {manifest_path}")
    manifest_bytes = manifest_path.read_bytes()
    manifest_digest = hashlib.sha256(manifest_bytes).hexdigest()
    expected_manifest_digest = os.getenv("MODEL_BUNDLE_MANIFEST_SHA256", "").strip()
    if expected_manifest_digest and not SHA256_RE.fullmatch(expected_manifest_digest):
        raise ValueError("MODEL_BUNDLE_MANIFEST_SHA256 must contain 64 lowercase hexadecimal characters")
    if expected_manifest_digest and manifest_digest != expected_manifest_digest:
        raise RuntimeError(
            "active model bundle manifest does not match MODEL_BUNDLE_MANIFEST_SHA256"
        )
    manifest = _parse_manifest(manifest_bytes)
    _verify_version_directory(version_dir, manifest_bytes, manifest_digest, manifest)
    return {
        "bundle_id": manifest["bundle_id"],
        "manifest_sha256": manifest_digest,
        "artifact_count": len(manifest["artifacts"]),
        "active_root": str(version_dir),
    }


def _read_s3_object(client: Any, *, bucket: str, key: str) -> bytes:
    response = client.get_object(Bucket=bucket, Key=key)
    body = response.get("Body")
    if body is None:
        raise RuntimeError(f"S3 object has no Body: s3://{bucket}/{key}")
    value = body.read(MAX_MANIFEST_BYTES + 1) if hasattr(body, "read") else body
    if not isinstance(value, (bytes, bytearray)):
        raise TypeError(f"S3 object Body must be bytes: s3://{bucket}/{key}")
    result = bytes(value)
    if not result:
        raise ValueError(f"model bundle manifest is empty: s3://{bucket}/{key}")
    if len(result) > MAX_MANIFEST_BYTES:
        raise ValueError(f"model bundle manifest exceeds {MAX_MANIFEST_BYTES} bytes")
    return result


def _parse_manifest(raw: bytes) -> dict[str, Any]:
    try:
        document = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValueError("model bundle manifest must be valid UTF-8 JSON") from exc
    if not isinstance(document, dict):
        raise ValueError("model bundle manifest must be a JSON object")
    schema_version = document.get("schema_version")
    if (
        isinstance(schema_version, bool)
        or not isinstance(schema_version, int)
        or schema_version != MANIFEST_SCHEMA_VERSION
    ):
        raise ValueError(
            f"model bundle manifest schema_version must be {MANIFEST_SCHEMA_VERSION}"
        )

    bundle_id_value = document.get("bundle_id")
    if not isinstance(bundle_id_value, str):
        raise ValueError("model bundle manifest bundle_id must be a string")
    bundle_id = bundle_id_value
    if not BUNDLE_ID_RE.fullmatch(bundle_id):
        raise ValueError("model bundle manifest has an invalid bundle_id")

    artifacts_value = document.get("artifacts")
    if not isinstance(artifacts_value, list) or not artifacts_value:
        raise ValueError("model bundle manifest artifacts must be a non-empty array")
    if len(artifacts_value) > MAX_ARTIFACTS:
        raise ValueError(f"model bundle manifest exceeds {MAX_ARTIFACTS} artifacts")

    artifacts: list[dict[str, Any]] = []
    seen_paths: set[str] = set()
    for index, value in enumerate(artifacts_value):
        if not isinstance(value, dict):
            raise ValueError(f"model bundle artifact #{index} must be an object")
        path_value = value.get("path")
        if not isinstance(path_value, str):
            raise ValueError(f"model bundle artifact #{index} path must be a string")
        relative = _safe_relative_path(path_value, context=f"artifact #{index}")
        path = relative.as_posix()
        if path in RESERVED_ARTIFACT_PATHS:
            raise ValueError(f"model bundle artifact path is reserved: {path!r}")
        if path in seen_paths:
            raise ValueError(f"model bundle manifest contains duplicate path: {path!r}")
        seen_paths.add(path)

        digest_value = value.get("sha256")
        if not isinstance(digest_value, str):
            raise ValueError(f"model bundle artifact sha256 must be a string: {path!r}")
        digest = digest_value
        if not SHA256_RE.fullmatch(digest):
            raise ValueError(f"model bundle artifact has invalid sha256: {path!r}")
        size_value = value.get("size")
        if isinstance(size_value, bool) or not isinstance(size_value, int) or size_value < 0:
            raise ValueError(f"model bundle artifact has invalid size: {path!r}")
        artifacts.append({"path": path, "sha256": digest, "size": size_value})

    return {
        "schema_version": MANIFEST_SCHEMA_VERSION,
        "bundle_id": bundle_id,
        "artifacts": artifacts,
    }


def _safe_relative_path(value: str, *, context: str) -> PurePosixPath:
    relative = PurePosixPath(value)
    if (
        not value
        or relative.is_absolute()
        or "\\" in value
        or not relative.parts
        or "." in relative.parts
        or ".." in relative.parts
        or any(not part for part in relative.parts)
        or value != relative.as_posix()
        or any(_unsafe_windows_part(part) for part in relative.parts)
    ):
        raise ValueError(f"unsafe {context} path: {value!r}")
    return relative


def _unsafe_windows_part(part: str) -> bool:
    if part.endswith((" ", ".")):
        return True
    if any(character in WINDOWS_FORBIDDEN_CHARS or ord(character) < 32 for character in part):
        return True
    return part.split(".", 1)[0].upper() in WINDOWS_RESERVED_NAMES


def _verify_artifact(path: Path, artifact: dict[str, Any]) -> None:
    if path.is_symlink() or not path.is_file():
        raise RuntimeError(f"model artifact is missing or not a regular file: {artifact['path']}")
    actual_size = path.stat().st_size
    if actual_size != artifact["size"]:
        raise RuntimeError(
            f"model artifact size mismatch for {artifact['path']}: "
            f"expected {artifact['size']}, received {actual_size}"
        )
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    actual_digest = digest.hexdigest()
    if actual_digest != artifact["sha256"]:
        raise RuntimeError(
            f"model artifact SHA-256 mismatch for {artifact['path']}: "
            f"expected {artifact['sha256']}, received {actual_digest}"
        )


def _verify_version_directory(
    version_dir: Path,
    manifest_bytes: bytes,
    manifest_digest: str,
    manifest: dict[str, Any],
) -> None:
    if version_dir.is_symlink() or not version_dir.is_dir():
        raise RuntimeError(f"model bundle version is missing or unsafe: {version_dir}")
    stored_manifest = version_dir / STORED_MANIFEST_NAME
    stored_digest = version_dir / STORED_MANIFEST_DIGEST_NAME
    if stored_manifest.is_symlink() or not stored_manifest.is_file():
        raise RuntimeError(f"model bundle version has no verified manifest: {version_dir}")
    if stored_manifest.read_bytes() != manifest_bytes:
        raise RuntimeError(f"model bundle stored manifest differs from pinned manifest: {version_dir}")
    if stored_digest.is_symlink() or not stored_digest.is_file():
        raise RuntimeError(f"model bundle version has no manifest digest marker: {version_dir}")
    if stored_digest.read_text(encoding="ascii").strip().lower() != manifest_digest:
        raise RuntimeError(f"model bundle manifest digest marker is invalid: {version_dir}")

    for artifact in manifest["artifacts"]:
        relative = PurePosixPath(artifact["path"])
        path = version_dir.joinpath(*relative.parts)
        resolved = path.resolve()
        if version_dir != resolved and version_dir not in resolved.parents:
            raise RuntimeError(f"model artifact escapes version directory: {artifact['path']!r}")
        _verify_artifact(path, artifact)

    expected_files = {
        STORED_MANIFEST_NAME,
        STORED_MANIFEST_DIGEST_NAME,
        *(artifact["path"] for artifact in manifest["artifacts"]),
    }
    actual_files: set[str] = set()
    for path in version_dir.rglob("*"):
        if path.is_symlink():
            raise RuntimeError(f"model bundle contains a symlink: {path}")
        if path.is_file():
            actual_files.add(path.relative_to(version_dir).as_posix())
        elif not path.is_dir():
            raise RuntimeError(f"model bundle contains a non-regular entry: {path}")
    if actual_files != expected_files:
        missing = sorted(expected_files - actual_files)
        unexpected = sorted(actual_files - expected_files)
        raise RuntimeError(
            "model bundle file set differs from manifest: "
            f"missing={missing!r}, unexpected={unexpected!r}"
        )


def _write_durable(path: Path, value: bytes) -> None:
    with path.open("xb") as stream:
        stream.write(value)
        stream.flush()
        os.fsync(stream.fileno())


def _ensure_internal_directory(root: Path, name: str) -> Path:
    path = root / name
    if path.is_symlink():
        raise RuntimeError(f"model bundle internal directory must not be a symlink: {path}")
    path.mkdir(parents=False, exist_ok=True)
    resolved = path.resolve()
    if resolved.parent != root or not resolved.is_dir():
        raise RuntimeError(f"model bundle internal directory is unsafe: {path}")
    return resolved


def _fsync_file(path: Path) -> None:
    # Windows requires a writable descriptor for fsync; staging artifacts are
    # private to this sync and remain writable until activation.
    with path.open("rb+") as stream:
        stream.flush()
        os.fsync(stream.fileno())


def _activate_version(root: Path, version_dir: Path) -> None:
    relative = version_dir.relative_to(root).as_posix()
    temporary = root / f".{ACTIVE_BUNDLE_POINTER}.{uuid4().hex}.tmp"
    try:
        _write_durable(temporary, f"{relative}\n".encode("utf-8"))
        os.replace(temporary, root / ACTIVE_BUNDLE_POINTER)
        _fsync_directory(root)
    finally:
        if temporary.exists():
            temporary.unlink()


def _fsync_directory(path: Path) -> None:
    """Best-effort directory fsync; unavailable for directories on Windows."""

    try:
        descriptor = os.open(path, os.O_RDONLY)
    except OSError:
        return
    try:
        os.fsync(descriptor)
    except OSError:
        pass
    finally:
        os.close(descriptor)


def main() -> None:
    downloaded = sync_model_artifacts()
    verified = verify_active_bundle()
    print(
        json.dumps(
            {
                "status": "model_artifacts_synced",
                "downloaded_objects": downloaded,
                **verified,
            },
            sort_keys=True,
        ),
        flush=True,
    )


if __name__ == "__main__":
    main()
