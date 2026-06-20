from __future__ import annotations

from typing import Any

from app.contracts import ModelOutput, ModelSource, ModelStatus


class MockAI1Adapter:
    name = "AI1"

    def supports(self, event: dict[str, Any]) -> bool:
        return bool((event.get("evidence") or {}).get("flow"))

    def build_input(self, event: dict[str, Any]) -> dict[str, Any]:
        return dict((event.get("evidence") or {}).get("flow") or {})

    def predict(self, model_input: dict[str, Any]) -> ModelOutput:
        hint = str(model_input.get("attack_hint") or model_input.get("label_hint") or "").lower()
        packets = int(float(model_input.get("orig_pkts") or model_input.get("packets") or 0))
        bytes_out = int(float(model_input.get("orig_bytes") or model_input.get("bytes") or 0))
        anomaly = bool(hint and hint != "normal") or packets > 500 or bytes_out > 20000
        confidence = 0.87 if anomaly else 0.71
        return ModelOutput(
            status=ModelStatus.COMPLETED.value,
            source=ModelSource.MOCK.value,
            label="ANOMALY" if anomaly else "NORMAL",
            confidence=confidence,
            model_version="AI1_MOCK_V1",
            input_scope="FLOW_ANOMALY_FEATURES",
            reason="Mock anomaly score from flow volume and attack_hint.",
        )


class MockAI2AAdapter:
    name = "AI2A"

    def supports(self, event: dict[str, Any]) -> bool:
        return bool((event.get("evidence") or {}).get("flow"))

    def build_input(self, event: dict[str, Any]) -> dict[str, Any]:
        return dict((event.get("evidence") or {}).get("flow") or {})

    def predict(self, model_input: dict[str, Any]) -> ModelOutput:
        hint = str(model_input.get("attack_hint") or "").lower()
        service = str(model_input.get("service") or "").lower()
        dst_port = str(model_input.get("dst_port") or model_input.get("destination_port") or "")
        if "scan" in hint:
            label = "PORT_SCAN_OR_RECON"
        elif "brute" in hint or service == "ssh" or dst_port == "22":
            label = "SSH_BRUTEFORCE_INDICATOR"
        elif "dos" in hint or "ddos" in hint:
            label = "DOS_INDICATOR"
        elif "web" in hint or service == "http" or dst_port in {"80", "443"}:
            label = "WEB_ATTACK"
        else:
            label = "NORMAL"
        confidence = 0.91 if label != "NORMAL" else 0.74
        return ModelOutput(
            status=ModelStatus.COMPLETED.value,
            source=ModelSource.MOCK.value,
            label=label,
            confidence=confidence,
            model_version="AI2A_MOCK_V1",
            input_scope="ZEEK_CONN_FLOW_FEATURES",
            reason="Mock AI2A class from flow service, destination port and attack_hint.",
        )


class MockAI2BAdapter:
    name = "AI2B"

    def supports(self, event: dict[str, Any]) -> bool:
        http = (event.get("evidence") or {}).get("http") or {}
        return bool(http.get("method") and http.get("uri"))

    def build_input(self, event: dict[str, Any]) -> dict[str, Any]:
        return dict((event.get("evidence") or {}).get("http") or {})

    def predict(self, model_input: dict[str, Any]) -> ModelOutput:
        uri = str(model_input.get("uri") or "").lower()
        if "mock-sqli" in uri or " union " in uri or "%20union%20" in uri or " or " in uri or "%27" in uri:
            label = "SQLI"
            probabilities = {"NONE": 0.02, "SQLI": 0.95, "XSS": 0.03}
        elif "mock-xss" in uri or "<script" in uri or "%3cscript" in uri or "onerror" in uri:
            label = "XSS"
            probabilities = {"NONE": 0.03, "SQLI": 0.02, "XSS": 0.95}
        else:
            label = "NONE"
            probabilities = {"NONE": 0.91, "SQLI": 0.05, "XSS": 0.04}
        return ModelOutput(
            status=ModelStatus.COMPLETED.value,
            source=ModelSource.MOCK.value,
            label=label,
            confidence=max(probabilities.values()),
            probabilities=probabilities,
            model_version="AI2B_MOCK_V1",
            release_candidate="AI2B_V1.4.9_RC",
            input_scope="HTTP_URI_QUERY",
            reason="Mock AI2B HTTP semantic classification from URI patterns.",
        )

