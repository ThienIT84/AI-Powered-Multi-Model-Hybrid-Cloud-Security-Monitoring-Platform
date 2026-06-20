from __future__ import annotations

from typing import Any, Protocol

from app.contracts import ModelOutput


class ModelAdapter(Protocol):
    name: str

    def supports(self, event: dict[str, Any]) -> bool:
        ...

    def build_input(self, event: dict[str, Any]) -> dict[str, Any]:
        ...

    def predict(self, model_input: dict[str, Any]) -> ModelOutput:
        ...

