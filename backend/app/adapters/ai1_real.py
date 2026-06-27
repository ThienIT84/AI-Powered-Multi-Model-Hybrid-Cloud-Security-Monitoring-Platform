from __future__ import annotations

import json
import math
import sys
from pathlib import Path
from typing import Any, Sequence

from app.contracts import ModelOutput, ModelSource, ModelStatus


AI1_RELEASE_CANDIDATE = "AI1_RELEASE_CANDIDATE_V1"
DEFAULT_AI1_MODEL_VERSION = "AI1_ISOLATION_FOREST_V1"
INPUT_SCOPE = "ZEEK_CONN_FLOW_ANOMALY_FEATURES"


class RealAI1Adapter:
    name = "AI1"

    def __init__(
        self,
        *,
        release_dir: str = "Dataset/tools/ai1_modeling/artifacts/release_candidate_v1/latest",
    ) -> None:
        self.release_dir = release_dir
        self._load_error = ""
        self._model: Any | None = None
        self._preprocessor: Any | None = None
        self._features: list[str] = []
        self._model_version = DEFAULT_AI1_MODEL_VERSION
        self._threshold = 0.0
        self._normal_label = "NORMAL"
        self._anomaly_label = "ANOMALY"
        self._helpers: dict[str, Any] = {}
        self._load()

    def supports(self, event: dict[str, Any]) -> bool:
        return bool((event.get("evidence") or {}).get("flow"))

    def build_input(self, event: dict[str, Any]) -> dict[str, Any]:
        return dict((event.get("evidence") or {}).get("flow") or {})

    def predict(self, model_input: dict[str, Any]) -> ModelOutput:
        if self._model is None:
            return self._not_available(
                f"Frozen AI1 anomaly detector is not available in this runtime: {self._load_error}"
            )

        feature_values = self._feature_values(model_input)
        missing = [feature for feature in self._features if feature not in feature_values]
        if missing:
            return self._not_available(
                "AI1 frozen feature vector is incomplete. Missing features: "
                f"{', '.join(missing[:8])}"
                + ("..." if len(missing) > 8 else "")
            )

        try:
            score = self._predict_anomaly_score(feature_values)
            if not math.isfinite(score) or score < 0.0 or score > 1.0:
                raise ValueError(
                    "AI1 anomaly score must be normalized to the [0, 1] range before backend handoff"
                )
            label = self._anomaly_label if score >= self._threshold else self._normal_label
            relation = "above" if label == self._anomaly_label else "below"
            return ModelOutput(
                status=ModelStatus.COMPLETED.value,
                source=ModelSource.REAL.value,
                label=label,
                confidence=score,
                probabilities={},
                model_version=self._model_version,
                release_candidate=AI1_RELEASE_CANDIDATE,
                input_scope=INPUT_SCOPE,
                reason=(
                    "Frozen AI1 anomaly detector score "
                    f"{relation} threshold. score={score:.4f}; threshold={self._threshold:.4f}."
                ),
            )
        except Exception as exc:  # noqa: BLE001 - isolate adapter failure from the fusion pipeline.
            return ModelOutput(
                status=ModelStatus.FAILED.value,
                source=ModelSource.REAL.value,
                model_version=self._model_version,
                release_candidate=AI1_RELEASE_CANDIDATE,
                input_scope=INPUT_SCOPE,
                reason=f"AI1 inference failed: {exc}",
            )

    def _load(self) -> None:
        try:
            root = Path(__file__).resolve().parents[3]
            scripts = root / "Dataset/tools/ai1_modeling/scripts"
            if scripts.exists() and str(scripts) not in sys.path:
                sys.path.insert(0, str(scripts))

            import joblib  # noqa: PLC0415
            import pandas as pd  # noqa: PLC0415

            release_dir = root / self.release_dir
            manifest = json.loads((release_dir / "feature_manifest.json").read_text(encoding="utf-8"))
            thresholds = json.loads((release_dir / "thresholds_frozen.json").read_text(encoding="utf-8"))
            if thresholds.get("status") != "PASS":
                raise ValueError(f"AI1 frozen threshold status is not PASS: {thresholds.get('status')}")
            score_direction = thresholds.get("score_direction") or manifest.get("score_direction")
            if score_direction != "higher_is_more_anomalous":
                raise ValueError(
                    "AI1 artifact must expose normalized scores with score_direction=higher_is_more_anomalous"
                )

            self._features = list(manifest["input_features"])
            if not self._features:
                raise ValueError("AI1 feature_manifest.json has no input_features")
            if manifest.get("missing_value_policy") != "fail_if_missing":
                raise ValueError("AI1 feature_manifest.json must set missing_value_policy=fail_if_missing")
            self._model_version = str(manifest.get("model_name") or DEFAULT_AI1_MODEL_VERSION).upper()
            self._threshold = float(thresholds["selected_threshold"])
            if self._threshold < 0.0 or self._threshold > 1.0:
                raise ValueError("AI1 selected_threshold must be in the [0, 1] range")
            self._normal_label = str(thresholds.get("normal_label") or "NORMAL")
            self._anomaly_label = str(thresholds.get("anomaly_label") or "ANOMALY")
            self._model = joblib.load(release_dir / "model.joblib")
            preprocessor_path = release_dir / "preprocessor.joblib"
            self._preprocessor = joblib.load(preprocessor_path) if preprocessor_path.exists() else None
            self._helpers = {
                "pd": pd,
                "predict_anomaly_score": self._load_helper_score_function(),
            }
            self._startup_canary(release_dir)
        except Exception as exc:  # noqa: BLE001
            self._load_error = str(exc)
            self._model = None
            self._preprocessor = None

    def _load_helper_score_function(self) -> Any | None:
        try:
            from ai1_inference_common import predict_anomaly_score  # type: ignore[import-not-found]  # noqa: PLC0415

            return predict_anomaly_score
        except Exception:  # noqa: BLE001 - helper is optional for artifact handoff.
            return None

    def _startup_canary(self, release_dir: Path) -> None:
        smoke_path = release_dir / "smoke_samples.jsonl"
        if not smoke_path.exists():
            return
        first_line = ""
        with smoke_path.open("r", encoding="utf-8") as handle:
            for line in handle:
                if line.strip():
                    first_line = line
                    break
        if not first_line:
            return
        sample = json.loads(first_line)
        features = self._feature_values(sample)
        missing = [feature for feature in self._features if feature not in features]
        if missing:
            raise ValueError(f"AI1 smoke sample missing required features: {', '.join(missing[:8])}")
        score = self._predict_anomaly_score(features)
        if not math.isfinite(score) or score < 0.0 or score > 1.0:
            raise ValueError("AI1 smoke sample produced a non-normalized anomaly score")

    def _predict_anomaly_score(self, feature_values: dict[str, Any]) -> float:
        pd = self._helpers["pd"]
        frame = pd.DataFrame([{feature: feature_values.get(feature) for feature in self._features}])
        transformed = self._preprocessor.transform(frame) if self._preprocessor is not None else frame
        helper = self._helpers.get("predict_anomaly_score")
        if helper is not None:
            return self._first_score(self._call_score_helper(helper, frame, transformed))
        if hasattr(self._model, "predict_anomaly_score"):
            return self._first_score(self._model.predict_anomaly_score(transformed))
        if hasattr(self._model, "predict_proba"):
            probabilities = self._model.predict_proba(transformed)[0]
            classes = [str(label) for label in getattr(self._model, "classes_", [])]
            return self._anomaly_probability(classes, probabilities)
        raise ValueError(
            "AI1 model artifact must expose predict_anomaly_score or predict_proba with ANOMALY class"
        )

    def _call_score_helper(self, helper: Any, frame: Any, transformed: Any) -> Any:
        try:
            return helper(self._model, frame, transformed)
        except TypeError:
            return helper(self._model, transformed)

    def _anomaly_probability(self, classes: Sequence[str], probabilities: Sequence[float]) -> float:
        if not classes or len(classes) != len(probabilities):
            raise ValueError("AI1 predict_proba class/probability vectors are inconsistent")
        for index, class_name in enumerate(classes):
            if class_name.upper() == self._anomaly_label.upper():
                return float(probabilities[index])
        raise ValueError(f"AI1 predict_proba does not include anomaly class {self._anomaly_label!r}")

    def _first_score(self, value: Any) -> float:
        if isinstance(value, (int, float)):
            return float(value)
        if hasattr(value, "tolist"):
            value = value.tolist()
        while isinstance(value, (list, tuple)):
            if not value:
                raise ValueError("AI1 score vector is empty")
            value = value[0]
        return float(value)

    def _feature_values(self, model_input: dict[str, Any]) -> dict[str, Any]:
        nested = model_input.get("ai1_features") or model_input.get("features")
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
            model_version=self._model_version,
            release_candidate=AI1_RELEASE_CANDIDATE,
            input_scope=INPUT_SCOPE,
            reason=reason,
        )
