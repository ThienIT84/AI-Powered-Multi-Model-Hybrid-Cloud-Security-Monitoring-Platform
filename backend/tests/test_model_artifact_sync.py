from __future__ import annotations

import hashlib
import json
from io import BytesIO
from pathlib import Path

import pytest

from app.services.model_artifacts import model_artifact_root
from scripts.model_bundle_canary import run_model_bundle_canary
from scripts.sync_model_artifacts_from_s3 import sync_model_artifacts, verify_active_bundle


BUCKET = "soc-data"
PREFIX = "models/runtime-v1"


def _manifest(bundle_id: str, artifacts: dict[str, bytes]) -> bytes:
    document = {
        "schema_version": 1,
        "bundle_id": bundle_id,
        "artifacts": [
            {
                "path": path,
                "sha256": hashlib.sha256(value).hexdigest(),
                "size": len(value),
            }
            for path, value in sorted(artifacts.items())
        ],
    }
    return json.dumps(document, separators=(",", ":"), sort_keys=True).encode("utf-8")


class FakeS3Client:
    def __init__(self, manifest: bytes, artifacts: dict[str, bytes]) -> None:
        self.manifest = manifest
        self.artifacts = artifacts
        self.downloads: list[str] = []

    def get_object(self, **kwargs):
        assert kwargs == {"Bucket": BUCKET, "Key": f"{PREFIX}/manifest.json"}
        return {"Body": BytesIO(self.manifest)}

    def download_file(self, bucket: str, key: str, destination: str) -> None:
        assert bucket == BUCKET
        prefix = f"{PREFIX}/"
        assert key.startswith(prefix)
        relative = key.removeprefix(prefix)
        self.downloads.append(relative)
        Path(destination).write_bytes(self.artifacts[relative])


def _configure(monkeypatch, tmp_path: Path, manifest: bytes) -> None:
    monkeypatch.setenv("SOC_DEPLOYMENT_TARGET", "aws")
    monkeypatch.setenv("S3_DATA_BUCKET", BUCKET)
    monkeypatch.setenv("MODEL_S3_PREFIX", PREFIX)
    monkeypatch.setenv("MODEL_ARTIFACT_ROOT", str(tmp_path))
    monkeypatch.setenv(
        "MODEL_BUNDLE_MANIFEST_SHA256",
        hashlib.sha256(manifest).hexdigest(),
    )


def test_sync_verifies_and_atomically_activates_complete_bundle(monkeypatch, tmp_path: Path) -> None:
    artifacts = {
        "Dataset/model.joblib": b"model-bytes",
        "Dataset/runtime/config.json": b'{"threshold":0.7}',
    }
    manifest = _manifest("runtime-v1", artifacts)
    _configure(monkeypatch, tmp_path, manifest)
    client = FakeS3Client(manifest, artifacts)

    assert sync_model_artifacts(client=client) == 2

    active = model_artifact_root()
    assert active.parent == tmp_path / "versions"
    assert active.name.startswith("runtime-v1--")
    assert (tmp_path / "ACTIVE").read_text(encoding="utf-8").strip() == active.relative_to(
        tmp_path
    ).as_posix()
    assert (active / "Dataset/model.joblib").read_bytes() == b"model-bytes"
    assert not (tmp_path / "Dataset").exists()
    assert sorted(client.downloads) == sorted(artifacts)
    assert verify_active_bundle() == {
        "bundle_id": "runtime-v1",
        "manifest_sha256": hashlib.sha256(manifest).hexdigest(),
        "artifact_count": 2,
        "active_root": str(active),
    }


def test_exact_verified_version_is_reused_without_download(monkeypatch, tmp_path: Path) -> None:
    artifacts = {"Dataset/model.joblib": b"model-bytes"}
    manifest = _manifest("runtime-v1", artifacts)
    _configure(monkeypatch, tmp_path, manifest)

    assert sync_model_artifacts(client=FakeS3Client(manifest, artifacts)) == 1
    second_client = FakeS3Client(manifest, artifacts)
    assert sync_model_artifacts(client=second_client) == 0
    assert second_client.downloads == []


def test_corrupt_download_never_replaces_active_pointer(monkeypatch, tmp_path: Path) -> None:
    old_artifacts = {"Dataset/model.joblib": b"known-good-v1"}
    old_manifest = _manifest("runtime-v1", old_artifacts)
    _configure(monkeypatch, tmp_path, old_manifest)
    sync_model_artifacts(client=FakeS3Client(old_manifest, old_artifacts))
    old_pointer = (tmp_path / "ACTIVE").read_bytes()
    old_active = model_artifact_root()

    expected_new = {"Dataset/model.joblib": b"known-good-v2"}
    new_manifest = _manifest("runtime-v2", expected_new)
    _configure(monkeypatch, tmp_path, new_manifest)
    corrupt_client = FakeS3Client(
        new_manifest,
        {"Dataset/model.joblib": b"known-bad--v2"},
    )

    with pytest.raises(RuntimeError, match="SHA-256 mismatch"):
        sync_model_artifacts(client=corrupt_client)

    assert (tmp_path / "ACTIVE").read_bytes() == old_pointer
    assert (old_active / "Dataset/model.joblib").read_bytes() == b"known-good-v1"
    assert list((tmp_path / ".staging").iterdir()) == []


def test_manifest_digest_pin_is_checked_before_artifact_download(monkeypatch, tmp_path: Path) -> None:
    artifacts = {"Dataset/model.joblib": b"model"}
    manifest = _manifest("runtime-v1", artifacts)
    _configure(monkeypatch, tmp_path, manifest)
    monkeypatch.setenv("MODEL_BUNDLE_MANIFEST_SHA256", "0" * 64)
    client = FakeS3Client(manifest, artifacts)

    with pytest.raises(RuntimeError, match="manifest SHA-256 mismatch"):
        sync_model_artifacts(client=client)

    assert client.downloads == []
    assert not (tmp_path / "ACTIVE").exists()


def test_manifest_rejects_unsafe_artifact_path(monkeypatch, tmp_path: Path) -> None:
    raw = json.dumps(
        {
            "schema_version": 1,
            "bundle_id": "runtime-v1",
            "artifacts": [{"path": "../escape", "sha256": "0" * 64, "size": 0}],
        }
    ).encode("utf-8")
    _configure(monkeypatch, tmp_path, raw)

    with pytest.raises(ValueError, match="unsafe artifact"):
        sync_model_artifacts(client=FakeS3Client(raw, {}))

    assert not (tmp_path.parent / "escape").exists()
    assert not (tmp_path / "ACTIVE").exists()


def test_active_verification_rejects_files_not_listed_in_manifest(monkeypatch, tmp_path: Path) -> None:
    artifacts = {"Dataset/model.joblib": b"model"}
    manifest = _manifest("runtime-v1", artifacts)
    _configure(monkeypatch, tmp_path, manifest)
    sync_model_artifacts(client=FakeS3Client(manifest, artifacts))
    (model_artifact_root() / "unexpected.bin").write_bytes(b"not-pinned")

    with pytest.raises(RuntimeError, match="file set differs from manifest"):
        verify_active_bundle()


def test_model_root_without_active_pointer_remains_backward_compatible(monkeypatch, tmp_path: Path) -> None:
    monkeypatch.setenv("SOC_DEPLOYMENT_TARGET", "local")
    monkeypatch.setenv("MODEL_ARTIFACT_ROOT", str(tmp_path))

    assert model_artifact_root() == tmp_path.resolve()


def test_aws_model_root_requires_active_pointer(monkeypatch, tmp_path: Path) -> None:
    monkeypatch.setenv("SOC_DEPLOYMENT_TARGET", "aws")
    monkeypatch.setenv("MODEL_ARTIFACT_ROOT", str(tmp_path))

    with pytest.raises(RuntimeError, match="AWS model bundle pointer is missing"):
        model_artifact_root()


def test_model_root_rejects_non_file_active_pointer(monkeypatch, tmp_path: Path) -> None:
    monkeypatch.setenv("MODEL_ARTIFACT_ROOT", str(tmp_path))
    (tmp_path / "ACTIVE").mkdir()

    with pytest.raises(RuntimeError, match="regular file"):
        model_artifact_root()


def test_runtime_canary_checks_every_required_real_model(monkeypatch, tmp_path: Path) -> None:
    artifacts = {"Dataset/model.joblib": b"model"}
    manifest = _manifest("runtime-v1", artifacts)
    _configure(monkeypatch, tmp_path, manifest)
    sync_model_artifacts(client=FakeS3Client(manifest, artifacts))
    monkeypatch.setenv("AWS_REQUIRE_REAL_MODELS", "true")
    for name in ("AI1", "AI2A", "AI2B"):
        monkeypatch.setenv(f"{name}_PREDICTOR_MODE", "real")

    def healthy() -> list[dict[str, str]]:
        return [
            {"name": name, "status": "healthy", "source": "real"}
            for name in ("AI1", "AI2A", "AI2B")
        ]

    result = run_model_bundle_canary(status_provider=healthy)
    assert result["status"] == "model_bundle_canary_passed"
    assert result["real_models"] == ["AI1", "AI2A", "AI2B"]

    def unhealthy() -> list[dict[str, str | None]]:
        return [
            {
                "name": name,
                "status": "unavailable" if name == "AI2B" else "healthy",
                "source": "unavailable" if name == "AI2B" else "real",
                "reason": "load failed" if name == "AI2B" else None,
            }
            for name in ("AI1", "AI2A", "AI2B")
        ]

    with pytest.raises(RuntimeError, match="AI2B: load failed"):
        run_model_bundle_canary(status_provider=unhealthy)
