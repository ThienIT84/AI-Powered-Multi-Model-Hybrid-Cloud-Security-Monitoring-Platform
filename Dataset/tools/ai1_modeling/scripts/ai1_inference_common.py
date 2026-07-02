import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Any, Dict, List

def _first_score(value: Any) -> float:
    """Extract the first scalar float from a possibly nested array/list."""
    if isinstance(value, (int, float)):
        return float(value)
    if hasattr(value, "tolist"):
        value = value.tolist()
    while isinstance(value, (list, tuple)):
        if not value:
            raise ValueError("AI1 score vector is empty")
        value = value[0]
    return float(value)

def predict_anomaly_score(model: Any, frame: pd.DataFrame, transformed: np.ndarray) -> np.ndarray:
    """
    Helper function loaded by backend's RealAI1Adapter.
    Takes the IsolationForest model, the original frame, and the RobustScaled features.
    Returns anomaly scores normalized to [0, 1] where higher is more anomalous.
    """
    if hasattr(model, "predict_anomaly_score"):
        try:
            raw_scores = model.predict_anomaly_score(transformed)
        except TypeError:
            raw_scores = model.predict_anomaly_score(frame)
        return np.array(raw_scores)
    
    elif hasattr(model, "decision_function"):
        # IsolationForest decision_function returns lower values for anomalies.
        raw_scores = model.decision_function(transformed)
        scores = 0.5 - raw_scores
        return np.clip(scores, 0.0, 1.0)
        
    elif hasattr(model, "score_samples"):
        raw_scores = model.score_samples(transformed)
        scores = 0.5 - raw_scores
        return np.clip(scores, 0.0, 1.0)
        
    else:
        raise ValueError("AI1 model must expose predict_anomaly_score or decision_function")

def load_ai1_artifacts(artifact_dir: str):
    """
    Helper to load all AI1 artifacts from a directory.
    """
    model_path = os.path.join(artifact_dir, "model.joblib")
    preprocessor_path = os.path.join(artifact_dir, "preprocessor.joblib")
    manifest_path = os.path.join(artifact_dir, "feature_manifest.json")
    threshold_path = os.path.join(artifact_dir, "thresholds_frozen.json")
    
    model = joblib.load(model_path)
    preprocessor = joblib.load(preprocessor_path) if os.path.exists(preprocessor_path) else None
    with open(manifest_path, "r") as f:
        manifest = json.load(f)
    with open(threshold_path, "r") as f:
        thresholds = json.load(f)
        
    return {
        "model": model,
        "preprocessor": preprocessor,
        "manifest": manifest,
        "thresholds": thresholds
    }

def score_ai1(features: Dict[str, Any], artifacts: Dict[str, Any]) -> float:
    """
    Calculates the normalized anomaly score for a given feature dictionary.
    """
    feature_list = artifacts["manifest"]["input_features"]
    frame = pd.DataFrame([{f: features.get(f, 0) for f in feature_list}])
    
    preprocessor = artifacts.get("preprocessor")
    transformed = preprocessor.transform(frame) if preprocessor is not None else frame
    
    scores = predict_anomaly_score(artifacts["model"], frame, transformed)
    return float(scores[0])

def predict_ai1(features: Dict[str, Any], artifacts: Dict[str, Any]) -> Dict[str, Any]:
    """
    Returns the prediction label and score.
    """
    score = score_ai1(features, artifacts)
    threshold = artifacts["thresholds"]["selected_threshold"]
    label = artifacts["thresholds"]["anomaly_label"] if score >= threshold else artifacts["thresholds"]["normal_label"]
    
    return {
        "label": label,
        "confidence": score,
        "selected_threshold": threshold
    }
