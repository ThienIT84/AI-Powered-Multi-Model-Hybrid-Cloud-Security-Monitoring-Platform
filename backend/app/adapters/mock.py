from __future__ import annotations

from typing import Any

from app.contracts import ModelOutput, ModelSource, ModelStatus


SSH_FAILED_CONNECTION_THRESHOLD = 5
SSH_CONNECTION_BURST_THRESHOLD = 20


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
        rate_features = _dict_value(model_input.get("network_rate_features"))
        ddos_suspected = bool(rate_features.get("ddos_suspected"))
        dos_suspected = bool(rate_features.get("dos_suspected"))
        anomaly = (
            ddos_suspected
            or dos_suspected
            or bool(hint and hint != "normal")
            or packets > 500
            or bytes_out > 20000
        )
        if ddos_suspected:
            confidence = 0.96
            reason = "Replay anomaly detector observed a distributed destination-rate burst."
        elif dos_suspected:
            confidence = 0.93
            reason = "Replay anomaly detector observed a same-source destination-rate burst."
        elif anomaly:
            confidence = 0.87
            reason = "Replay anomaly score exceeded the flow-volume or attack-hint threshold."
        else:
            confidence = 0.71
            reason = "Replay anomaly score remained below the flow and rate thresholds."
        return ModelOutput(
            status=ModelStatus.COMPLETED.value,
            source=ModelSource.MOCK.value,
            label="ANOMALY" if anomaly else "NORMAL",
            confidence=confidence,
            model_version="AI1_MOCK_V1",
            input_scope="FLOW_ANOMALY_FEATURES",
            reason=reason,
        )


class MockAI2AAdapter:
    name = "AI2A"

    def supports(self, event: dict[str, Any]) -> bool:
        return bool((event.get("evidence") or {}).get("flow"))

    def build_input(self, event: dict[str, Any]) -> dict[str, Any]:
        return dict((event.get("evidence") or {}).get("flow") or {})

    def predict(self, model_input: dict[str, Any]) -> ModelOutput:
        hint = str(model_input.get("attack_hint") or "").lower()
        rate_features = _dict_value(model_input.get("network_rate_features"))
        ai2a_features = _dict_value(model_input.get("ai2a_features"))
        dst_port = str(
            model_input.get("dst_port")
            or model_input.get("destination_port")
            or ai2a_features.get("dst_port")
            or ""
        )
        service = str(model_input.get("service") or ai2a_features.get("service") or "").lower()
        is_ssh = service == "ssh" or dst_port == "22" or bool(ai2a_features.get("is_ssh"))
        ssh_failures = _integer(ai2a_features.get("ssh_non_success_conn_count_60s_same_src_dst"))
        ssh_connections = _integer(ai2a_features.get("ssh_count_60s_same_src_dst"))
        same_src_dst_connections = _integer(rate_features.get("same_src_dst_connection_count"))
        ssh_failed_burst = is_ssh and ssh_failures >= SSH_FAILED_CONNECTION_THRESHOLD
        ssh_connection_burst = (
            is_ssh
            and ssh_connections >= SSH_CONNECTION_BURST_THRESHOLD
            and same_src_dst_connections >= SSH_CONNECTION_BURST_THRESHOLD
        )

        # SSH temporal evidence takes precedence over a generic connection-rate
        # flag so a bounded credential-guessing run is not mislabeled as DoS.
        if ssh_failed_burst or ssh_connection_burst:
            label = "SSH_BRUTEFORCE_INDICATOR"
            confidence = 0.94
            reason = (
                "Replay AI2A observed an SSH temporal burst: "
                f"non_success_60s={ssh_failures}, ssh_connections_60s={ssh_connections}."
            )
        elif bool(rate_features.get("ddos_suspected")):
            label = "DDOS_INDICATOR"
            confidence = 0.96
            reason = "Replay AI2A observed a multi-source destination-rate burst."
        elif bool(rate_features.get("dos_suspected")):
            label = "DOS_INDICATOR"
            confidence = 0.93
            reason = "Replay AI2A observed a same-source destination-rate burst."
        elif "scan" in hint:
            label = "PORT_SCAN_OR_RECON"
            confidence = 0.91
            reason = "Replay AI2A used the explicit port-scan attack hint."
        elif "brute" in hint:
            label = "SSH_BRUTEFORCE_INDICATOR"
            confidence = 0.91
            reason = "Replay AI2A used the explicit brute-force attack hint."
        elif "ddos" in hint:
            label = "DDOS_INDICATOR"
            confidence = 0.91
            reason = "Replay AI2A used the explicit DDoS attack hint."
        elif "dos" in hint:
            label = "DOS_INDICATOR"
            confidence = 0.91
            reason = "Replay AI2A used the explicit DoS attack hint."
        # HTTP is a transport/application service, not evidence of an attack by
        # itself.  The replay adapter should only emit WEB_ATTACK when the
        # fixture explicitly marks the flow as suspicious; URI-level SQLi/XSS
        # classification belongs to AI2B.
        elif "web" in hint:
            label = "WEB_ATTACK"
            confidence = 0.91
            reason = "Replay AI2A used the explicit web-attack hint."
        else:
            label = "NORMAL"
            confidence = 0.74
            reason = "Replay AI2A found no network attack-class evidence."
        return ModelOutput(
            status=ModelStatus.COMPLETED.value,
            source=ModelSource.MOCK.value,
            label=label,
            confidence=confidence,
            model_version="AI2A_MOCK_V1",
            input_scope="ZEEK_CONN_FLOW_FEATURES",
            reason=reason,
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


def _dict_value(value: Any) -> dict[str, Any]:
    return dict(value) if isinstance(value, dict) else {}


def _integer(value: Any) -> int:
    try:
        return int(float(value or 0))
    except (TypeError, ValueError):
        return 0

