from __future__ import annotations

from typing import Any

from app.contracts import ModelOutput, ModelSource, ModelStatus


class UnavailableAdapter:
    def __init__(self, name: str, *, reason: str, input_scope: str = "", supported_scope: str = "any") -> None:
        self.name = name
        self.reason = reason
        self.input_scope = input_scope
        self.supported_scope = supported_scope

    def supports(self, event: dict[str, Any]) -> bool:
        evidence = event.get("evidence") or {}
        if self.supported_scope == "flow":
            return bool(evidence.get("flow"))
        if self.supported_scope == "http":
            http = evidence.get("http") or {}
            return bool(http.get("method") and http.get("uri"))
        return True

    def build_input(self, event: dict[str, Any]) -> dict[str, Any]:
        del event
        return {}

    def predict(self, model_input: dict[str, Any]) -> ModelOutput:
        del model_input
        return ModelOutput(
            status=ModelStatus.NOT_AVAILABLE.value,
            source=ModelSource.UNAVAILABLE.value,
            model_version=f"{self.name}_UNAVAILABLE",
            input_scope=self.input_scope,
            reason=self.reason,
        )
