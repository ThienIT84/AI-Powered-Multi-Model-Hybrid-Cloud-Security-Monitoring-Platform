from __future__ import annotations

from app.contracts import FusionOutput, ModelStatus


MODEL_ORDER = ("AI1", "AI2A", "AI2B")


class FusionService:
    def combine(self, outputs: dict[str, dict]) -> FusionOutput:
        contributors = [
            name
            for name in MODEL_ORDER
            if outputs.get(name, {}).get("status") == ModelStatus.COMPLETED.value
            and outputs.get(name, {}).get("source") == "real"
        ]
        completed_any = [
            name for name in MODEL_ORDER if outputs.get(name, {}).get("status") in {ModelStatus.COMPLETED.value, ModelStatus.SIMULATED.value}
        ]
        excluded = {name: outputs.get(name, {}).get("status", ModelStatus.NOT_RUN.value) for name in MODEL_ORDER if name not in completed_any}

        ai2b_label = str(outputs.get("AI2B", {}).get("label") or "").upper()
        ai2a_label = str(outputs.get("AI2A", {}).get("label") or "").upper()
        ai1_label = str(outputs.get("AI1", {}).get("label") or "").upper()
        ai2b_conf = float(outputs.get("AI2B", {}).get("confidence") or 0.0)
        ai2a_conf = float(outputs.get("AI2A", {}).get("confidence") or 0.0)
        ai1_conf = float(outputs.get("AI1", {}).get("confidence") or 0.0)

        if ai2b_label == "SQLI":
            return self._web_attack("SQL Injection", ai2b_conf, outputs, contributors, completed_any, excluded)
        if ai2b_label == "XSS":
            return self._web_attack("Cross-Site Scripting", ai2b_conf, outputs, contributors, completed_any, excluded)
        if ai2a_label and ai2a_label not in {"NORMAL", "NONE"} and ai1_label == "ANOMALY":
            risk = max(72, int(max(ai2a_conf, ai1_conf) * 100))
            return FusionOutput(
                mode=self._mode(outputs, contributors, completed_any),
                final_label="Suspicious Network Activity",
                risk_score=min(99, risk),
                severity="HIGH" if risk >= 80 else "MEDIUM",
                contributors=self._contributors(outputs, contributors, completed_any),
                excluded_models=excluded,
                reason="AI1 anomaly and AI2A flow classification indicate suspicious network behavior.",
            )
        if ai1_label == "ANOMALY":
            risk = max(55, int(ai1_conf * 100))
            return FusionOutput(
                mode=self._mode(outputs, contributors, completed_any),
                final_label="Network Anomaly",
                risk_score=risk,
                severity="MEDIUM",
                contributors=self._contributors(outputs, contributors, completed_any),
                excluded_models=excluded,
                reason="AI1 detected anomalous flow behavior.",
            )
        if completed_any:
            return FusionOutput(
                mode=self._mode(outputs, contributors, completed_any),
                final_label="Benign / No Confirmed Attack",
                risk_score=15,
                severity="LOW",
                contributors=self._contributors(outputs, contributors, completed_any),
                excluded_models=excluded,
                reason="Available model outputs did not confirm malicious behavior.",
            )
        return FusionOutput(
            mode="NO_AI_AVAILABLE",
            final_label="Unclassified Event",
            risk_score=0,
            severity="LOW",
            contributors=[],
            excluded_models={name: outputs.get(name, {}).get("status", ModelStatus.NOT_RUN.value) for name in MODEL_ORDER},
            reason="No model produced a completed result.",
        )

    def _web_attack(
        self,
        final_label: str,
        confidence: float,
        outputs: dict[str, dict],
        real_contributors: list[str],
        completed_any: list[str],
        excluded: dict[str, str],
    ) -> FusionOutput:
        risk = min(98, max(75, int(confidence * 100) - 2))
        return FusionOutput(
            mode=self._mode(outputs, real_contributors, completed_any),
            final_label=final_label,
            risk_score=risk,
            severity="CRITICAL" if risk >= 92 else "HIGH",
            contributors=self._contributors(outputs, real_contributors, completed_any),
            excluded_models=excluded,
            reason=f"AI2B HTTP semantic detector classified the request as {final_label}.",
        )

    def _contributors(self, outputs: dict[str, dict], real_contributors: list[str], completed_any: list[str]) -> list[str]:
        if real_contributors:
            return real_contributors
        return [name for name in completed_any if outputs.get(name, {}).get("status") == ModelStatus.SIMULATED.value]

    def _mode(self, outputs: dict[str, dict], real_contributors: list[str], completed_any: list[str]) -> str:
        if len(real_contributors) == 3:
            return "FULL_MULTI_MODEL"
        if real_contributors == ["AI2B"]:
            return "DEGRADED_AI2B_ONLY"
        if set(real_contributors) == {"AI2A", "AI2B"}:
            return "DEGRADED_AI2A_AI2B"
        if real_contributors:
            return "DEGRADED_" + "_".join(real_contributors)
        if completed_any and all(outputs.get(name, {}).get("source") in {"mock", "replay"} for name in completed_any):
            return "SIMULATED_FULL_MULTI_MODEL" if len(completed_any) == 3 else "SIMULATED_PARTIAL"
        return "NO_AI_AVAILABLE"

