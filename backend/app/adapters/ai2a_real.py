from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Sequence

from app.contracts import ModelOutput, ModelSource, ModelStatus
from app.services.model_artifacts import model_artifact_root


AI2A_CANDIDATE = "rf_v2_1_full_safe_plus_ssh_minimal"
AI2A_RELEASE_CANDIDATE = "AI2A_RELEASE_CANDIDATE_V1"
UNKNOWN_LABEL = "unknown"


def threshold_label(classes: Sequence[str], probabilities: Sequence[float], threshold: float) -> tuple[str, str, float]:
    if len(classes) == 0 or len(probabilities) == 0 or len(classes) != len(probabilities):
        raise ValueError("AI2A class/probability vectors are inconsistent")
    best_index = max(range(len(probabilities)), key=lambda index: float(probabilities[index]))
    raw_label = str(classes[best_index])
    confidence = float(probabilities[best_index])
    return (raw_label if confidence >= threshold else UNKNOWN_LABEL, raw_label, confidence)


class RealAI2AAdapter:
    name = "AI2A"

    def __init__(
        self,
        *,
        release_dir: str = "Dataset/tools/ai2a_modeling/artifacts/release_candidate_v1/20260605T071810Z",
        feature_manifest_path: str = (
            "Dataset/tools/ai2a_modeling/artifacts/temporal_v2_1/20260603T080212Z/"
            "rf_v2_1_full_safe_plus_ssh_minimal/feature_manifest.json"
        ),
    ) -> None:
        self.release_dir = release_dir
        self.feature_manifest_path = feature_manifest_path
        self._load_error = ""
        self._model: Any | None = None
        self._preprocessor: Any | None = None
        self._features: list[str] = []
        self._categorical_features: list[str] = []
        self._threshold = 0.0
        self._classes: list[str] = []
        self._helpers: dict[str, Any] = {}
        self._load()

    def supports(self, event: dict[str, Any]) -> bool:
        return bool((event.get("evidence") or {}).get("flow"))

    def build_input(self, event: dict[str, Any]) -> dict[str, Any]:
        return dict((event.get("evidence") or {}).get("flow") or {})

    def predict(self, model_input: dict[str, Any]) -> ModelOutput:
        if self._model is None or self._preprocessor is None:
            return self._not_available(
                f"Frozen AI2A release-candidate is not available in this runtime: {self._load_error}"
            )
        feature_values = self._feature_values(model_input)
        missing = [feature for feature in self._features if feature not in feature_values]
        if missing:
            return self._not_available(
                "AI2A raw-flow extractor is not active for this event; frozen feature vector is "
                f"incomplete. Missing features: {', '.join(missing[:8])}"
                + ("..." if len(missing) > 8 else "")
            )
        try:
            probabilities = self._predict_probabilities(feature_values)
            label, raw_label, confidence = threshold_label(self._classes, probabilities, self._threshold)
            probability_map = {
                class_name: float(probabilities[index]) for index, class_name in enumerate(self._classes)
            }
            return ModelOutput(
                status=ModelStatus.COMPLETED.value,
                source=ModelSource.REAL.value,
                label=label,
                confidence=confidence,
                probabilities=probability_map,
                model_version=f"AI2A_{AI2A_CANDIDATE}",
                release_candidate=AI2A_RELEASE_CANDIDATE,
                input_scope="ZEEK_CONN_FLOW_FEATURES",
                reason=(
                    "Frozen AI2A release-candidate prediction. "
                    f"raw_label={raw_label}; threshold={self._threshold:.2f}; "
                    f"thresholded_label={label}."
                ),
            )
        except Exception as exc:  # noqa: BLE001 - isolate one adapter failure from the fusion pipeline.
            return ModelOutput(
                status=ModelStatus.FAILED.value,
                source=ModelSource.REAL.value,
                model_version=f"AI2A_{AI2A_CANDIDATE}",
                release_candidate=AI2A_RELEASE_CANDIDATE,
                input_scope="ZEEK_CONN_FLOW_FEATURES",
                reason=f"AI2A inference failed: {exc}",
            )

    def _load(self) -> None:
        try:
            root = model_artifact_root()
            scripts = root / "Dataset/tools/ai2a_modeling/scripts"
            if str(scripts) not in sys.path:
                sys.path.insert(0, str(scripts))
            import joblib  # noqa: PLC0415
            import numpy as np  # noqa: PLC0415
            import pandas as pd  # noqa: PLC0415
            from ai2a_training_common import prepare_features  # noqa: PLC0415

            release_dir = root / self.release_dir
            variant_dir = release_dir / AI2A_CANDIDATE
            threshold_info = json.loads((release_dir / "thresholds_frozen.json").read_text(encoding="utf-8"))[
                AI2A_CANDIDATE
            ]
            if threshold_info.get("status") != "PASS":
                raise ValueError(f"AI2A frozen threshold status is not PASS: {threshold_info.get('status')}")
            manifest = json.loads((root / self.feature_manifest_path).read_text(encoding="utf-8"))
            if manifest.get("experiment") != AI2A_CANDIDATE:
                raise ValueError(f"AI2A feature manifest experiment mismatch: {manifest.get('experiment')}")

            self._features = list(manifest["input_features"])
            self._categorical_features = list(manifest["categorical_features"])
            if len(self._features) != 41:
                raise ValueError(f"AI2A frozen feature count mismatch: {len(self._features)}")
            self._threshold = float(threshold_info["selected_threshold"])
            self._model = joblib.load(variant_dir / "model.joblib")
            self._preprocessor = joblib.load(variant_dir / "preprocessor.joblib")
            self._classes = [str(label) for label in self._model.classes_]
            if not self._classes:
                raise ValueError("AI2A model has no classes_")
            self._helpers = {"prepare_features": prepare_features, "np": np, "pd": pd}
            self._startup_canary()
        except Exception as exc:  # noqa: BLE001
            self._load_error = str(exc)
            self._model = None
            self._preprocessor = None

    def _startup_canary(self) -> None:
        np = self._helpers["np"]
        row = {}
        categorical = set(self._categorical_features)
        for feature in self._features:
            row[feature] = "__MISSING__" if feature in categorical else 0.0
        probabilities = self._predict_probabilities(row)
        if len(probabilities) != len(self._classes):
            raise ValueError("AI2A canary probability/class length mismatch")
        if not all(np.isfinite(probabilities)):
            raise ValueError("AI2A canary produced non-finite probabilities")
        total = float(sum(probabilities))
        if abs(total - 1.0) > 1e-6:
            raise ValueError(f"AI2A canary probabilities do not sum to 1: {total}")

    def _predict_probabilities(self, feature_values: dict[str, Any]) -> list[float]:
        pd = self._helpers["pd"]
        prepare_features = self._helpers["prepare_features"]
        frame = pd.DataFrame([{feature: feature_values.get(feature) for feature in self._features}])
        prepared = prepare_features(frame, self._features, self._categorical_features)
        transformed = self._preprocessor.transform(prepared)
        probabilities = self._model.predict_proba(transformed)[0]
        return [float(value) for value in probabilities]

    def _feature_values(self, model_input: dict[str, Any]) -> dict[str, Any]:
        nested = model_input.get("ai2a_features") or model_input.get("features")
        if isinstance(nested, dict):
            values = dict(nested)
            for key, value in model_input.items():
                values.setdefault(key, value)
            return values
        return dict(model_input)

    def _not_available(self, reason: str) -> ModelOutput:
        return ModelOutput(
            status=ModelStatus.NOT_AVAILABLE.value,
            source=ModelSource.UNAVAILABLE.value,
            model_version=f"AI2A_{AI2A_CANDIDATE}",
            release_candidate=AI2A_RELEASE_CANDIDATE,
            input_scope="ZEEK_CONN_FLOW_FEATURES",
            reason=reason,
        )
