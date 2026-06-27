from __future__ import annotations

import json
from pathlib import Path

import joblib
import pytest

from app.adapters.ai1_real import INPUT_SCOPE, RealAI1Adapter
from app.contracts import ModelStatus


class ScoreModel:
    def __init__(self, score: float) -> None:
        self.score = score

    def predict_anomaly_score(self, frame):  # noqa: ANN001
        return [self.score]


def write_ai1_artifact(
    release_dir: Path,
    *,
    score: float = 0.91,
    threshold: float = 0.85,
    features: tuple[str, ...] = ("duration", "orig_bytes"),
) -> None:
    release_dir.mkdir(parents=True, exist_ok=True)
    (release_dir / "feature_manifest.json").write_text(
        json.dumps(
            {
                "model_name": "ai1_isolation_forest_v1",
                "input_scope": INPUT_SCOPE,
                "input_features": list(features),
                "numeric_features": list(features),
                "categorical_features": [],
                "score_name": "anomaly_score",
                "score_direction": "higher_is_more_anomalous",
                "missing_value_policy": "fail_if_missing",
            }
        ),
        encoding="utf-8",
    )
    (release_dir / "thresholds_frozen.json").write_text(
        json.dumps(
            {
                "selected_threshold": threshold,
                "normal_label": "NORMAL",
                "anomaly_label": "ANOMALY",
                "score_direction": "higher_is_more_anomalous",
                "status": "PASS",
            }
        ),
        encoding="utf-8",
    )
    joblib.dump(ScoreModel(score), release_dir / "model.joblib")


def test_ai1_real_missing_artifact_returns_not_available(tmp_path: Path) -> None:
    adapter = RealAI1Adapter(release_dir=str(tmp_path / "missing"))

    output = adapter.predict({"ai1_features": {"duration": 1.0, "orig_bytes": 1280}})

    assert output.status == ModelStatus.NOT_AVAILABLE.value
    assert output.source == "unavailable"
    assert "not available" in output.reason


def test_ai1_real_missing_features_returns_not_available(tmp_path: Path) -> None:
    write_ai1_artifact(tmp_path)
    adapter = RealAI1Adapter(release_dir=str(tmp_path))

    output = adapter.predict({"ai1_features": {"duration": 1.0}})

    assert output.status == ModelStatus.NOT_AVAILABLE.value
    assert output.source == "unavailable"
    assert "AI1 frozen feature vector is incomplete" in output.reason
    assert "orig_bytes" in output.reason


def test_ai1_real_predicts_anomaly_above_threshold(tmp_path: Path) -> None:
    write_ai1_artifact(tmp_path, score=0.91, threshold=0.85)
    adapter = RealAI1Adapter(release_dir=str(tmp_path))

    output = adapter.predict({"ai1_features": {"duration": 1.2, "orig_bytes": 1280}})

    assert output.status == ModelStatus.COMPLETED.value
    assert output.source == "real"
    assert output.label == "ANOMALY"
    assert output.confidence == pytest.approx(0.91)
    assert output.input_scope == INPUT_SCOPE


def test_ai1_real_predicts_normal_below_threshold(tmp_path: Path) -> None:
    write_ai1_artifact(tmp_path, score=0.2, threshold=0.85)
    adapter = RealAI1Adapter(release_dir=str(tmp_path))

    output = adapter.predict({"ai1_features": {"duration": 0.2, "orig_bytes": 20}})

    assert output.status == ModelStatus.COMPLETED.value
    assert output.source == "real"
    assert output.label == "NORMAL"
    assert output.confidence == pytest.approx(0.2)


def test_ai1_real_rejects_non_normalized_score(tmp_path: Path) -> None:
    write_ai1_artifact(tmp_path, score=2.0, threshold=0.85)
    adapter = RealAI1Adapter(release_dir=str(tmp_path))

    output = adapter.predict({"ai1_features": {"duration": 1.2, "orig_bytes": 1280}})

    assert output.status == ModelStatus.FAILED.value
    assert output.source == "real"
    assert "normalized to the [0, 1] range" in output.reason


def test_ai1_real_mode_does_not_fallback_to_mock(monkeypatch, tmp_path: Path) -> None:
    from app import dependencies

    monkeypatch.setenv("AI1_PREDICTOR_MODE", "real")
    monkeypatch.setenv("AI2A_PREDICTOR_MODE", "mock")
    monkeypatch.setenv("AI2B_PREDICTOR_MODE", "mock")
    monkeypatch.setattr(dependencies, "RealAI1Adapter", lambda: RealAI1Adapter(release_dir=str(tmp_path / "missing")))

    alert = dependencies.build_orchestrator().process(
        {
            "event_type": "network_flow",
            "evidence": {
                "flow": {
                    "service": "ssh",
                    "dst_port": 22,
                    "orig_pkts": 10,
                    "ai1_features": {"duration": 1.0, "orig_bytes": 100},
                }
            },
        }
    )

    assert alert["ai_analysis"]["ai1"]["status"] == ModelStatus.NOT_AVAILABLE.value
    assert alert["ai_analysis"]["ai1"]["source"] == "unavailable"
    assert alert["ai_analysis"]["ai1"]["verdict"] == "N/A"
