from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

from app.contracts import ModelOutput, ModelSource, ModelStatus
from app.services.model_artifacts import model_artifact_root


class RealAI2BAdapter:
    name = "AI2B"

    def __init__(
        self,
        *,
        freeze_manifest: str = "Dataset/tools/ai2b_modeling/artifacts/freeze_v1_4_9/latest/ai2b_v1_4_9_freeze_manifest.json",
        policy_path: str = "Dataset/tools/ai2b_modeling/configs/ai2b_v1_4_8j_overlap_cleanup_policy.json",
    ) -> None:
        self.freeze_manifest = freeze_manifest
        self.policy_path = policy_path
        self._load_error = ""
        self._model: Any | None = None
        self._manifest: dict[str, Any] = {}
        self._policy: dict[str, Any] = {}
        self._helpers: dict[str, Any] = {}
        self._load()

    def supports(self, event: dict[str, Any]) -> bool:
        http = (event.get("evidence") or {}).get("http") or {}
        return bool(http.get("method") and http.get("uri"))

    def build_input(self, event: dict[str, Any]) -> dict[str, Any]:
        http = dict((event.get("evidence") or {}).get("http") or {})
        return {"method": http.get("method", "GET"), "uri": http.get("uri", "/")}

    def predict(self, model_input: dict[str, Any]) -> ModelOutput:
        if self._model is None:
            return ModelOutput(
                status=ModelStatus.NOT_AVAILABLE.value,
                source=ModelSource.UNAVAILABLE.value,
                model_version="AI2B_V1.4.9_RC",
                release_candidate="AI2B_V1.4.9_RC",
                input_scope="HTTP_URI_QUERY",
                reason=f"Frozen AI2B model is not available in this runtime: {self._load_error}",
            )
        try:
            frame = self._frame(model_input)
            candidate = self._candidate_policy(self._manifest["candidate"])
            text = self._candidate_text(frame, candidate)
            probabilities = self._helpers["predict_proba_candidate_model"](self._model, text, frame)
            predictions = self._helpers["predict_candidate_model"](self._model, text, frame)
            classes = list(self._manifest.get("class_order") or self._helpers["candidate_classes"](self._model))
            probability_map = {label: float(probabilities[0, classes.index(label)]) if label in classes else 0.0 for label in classes}
            label = str(predictions[0])
            return ModelOutput(
                status=ModelStatus.COMPLETED.value,
                source=ModelSource.REAL.value,
                label=label,
                confidence=max(probability_map.values()) if probability_map else 0.0,
                probabilities=probability_map,
                model_version="AI2B_V1.4.8j",
                release_candidate="AI2B_V1.4.9_RC",
                input_scope="HTTP_URI_QUERY",
                reason="Frozen AI2B V1.4.9 release-candidate prediction.",
            )
        except Exception as exc:  # noqa: BLE001 - return model status instead of crashing MVP API.
            return ModelOutput(
                status=ModelStatus.FAILED.value,
                source=ModelSource.REAL.value,
                model_version="AI2B_V1.4.8j",
                release_candidate="AI2B_V1.4.9_RC",
                input_scope="HTTP_URI_QUERY",
                reason=f"AI2B inference failed: {exc}",
            )

    def _load(self) -> None: 
        try:
            root = model_artifact_root()
            scripts = root / "Dataset/tools/ai2b_modeling/scripts"
            if str(scripts) not in sys.path:
                sys.path.insert(0, str(scripts))
            import __main__  # noqa: PLC0415
            import joblib  # noqa: PLC0415
            from train_ai2b_baseline_v1 import (  # noqa: PLC0415
                AI2BHybridTextLexicalModel,
                candidate_classes,
                predict_candidate_model,
                predict_proba_candidate_model,
            )
            from ai2b_common import load_json  # noqa: PLC0415

            __main__.AI2BHybridTextLexicalModel = AI2BHybridTextLexicalModel
            self._manifest = json.loads((root / self.freeze_manifest).read_text(encoding="utf-8"))
            policy_path = Path(self._manifest.get("policy_path") or self.policy_path)
            self._policy = load_json(root / policy_path if not policy_path.is_absolute() else policy_path)
            self._model = joblib.load(root / self._manifest["selected_model_path"])
            self._helpers = {
                "candidate_classes": candidate_classes,
                "predict_candidate_model": predict_candidate_model,
                "predict_proba_candidate_model": predict_proba_candidate_model,
            }
        except Exception as exc:  # noqa: BLE001
            self._load_error = str(exc)
            self._model = None

    def _candidate_policy(self, name: str) -> dict[str, Any]:
        for candidate in self._policy.get("candidate_models", []):
            if candidate.get("name") == name:
                return candidate
        raise ValueError(f"AI2B candidate not found in policy: {name}")

    def _candidate_text(self, frame: Any, candidate: dict[str, Any]) -> Any:
        scripts = model_artifact_root() / "Dataset/tools/ai2b_modeling/scripts"
        if str(scripts) not in sys.path:
            sys.path.insert(0, str(scripts))
        from ai2b_common import build_text  # noqa: PLC0415

        fields = self._policy["text_variants"][candidate["text_variant"]]["fields"]
        return frame.apply(lambda row: build_text(row, fields), axis=1)

    def _frame(self, model_input: dict[str, Any]) -> Any:
        import pandas as pd  # noqa: PLC0415

        method = str(model_input.get("method") or "GET")
        uri = str(model_input.get("uri") or "/")
        query = uri.split("?", 1)[1] if "?" in uri else ""
        # Minimal request-line frame. The frozen lexical extractor primarily reads method/uri/query fields.
        return pd.DataFrame(
            [
                {
                    "method": method,
                    "uri": uri,
                    "uri_model": uri,
                    "query_model": query,
                    "uri_model_norm": uri,
                    "query_model_norm": query,
                    "uri_model_norm_no_ident": uri,
                    "query_model_norm_no_ident": query,
                }
            ]
        )
