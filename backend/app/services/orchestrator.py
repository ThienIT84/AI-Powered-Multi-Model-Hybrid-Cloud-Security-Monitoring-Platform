from __future__ import annotations

from typing import Any

from app.adapters.base import ModelAdapter
from app.contracts import ModelStatus, default_model_output, normalize_event
from app.services.fusion import MODEL_ORDER, FusionService


class EventOrchestrator:
    def __init__(self, adapters: dict[str, ModelAdapter], fusion: FusionService | None = None) -> None:
        self.adapters = adapters
        self.fusion = fusion or FusionService()

    def process(self, raw_event: dict[str, Any]) -> dict[str, Any]:
        event = normalize_event(raw_event)
        outputs: dict[str, dict[str, Any]] = {}
        for name in MODEL_ORDER:
            adapter = self.adapters.get(name)
            if adapter is None:
                outputs[name] = default_model_output(name, ModelStatus.NOT_AVAILABLE.value, "Adapter is not configured.").to_dict()
                continue
            if not adapter.supports(event):
                outputs[name] = default_model_output(
                    name,
                    ModelStatus.NOT_APPLICABLE.value,
                    f"{name} input scope does not match event_type={event['event_type']}.",
                ).to_dict()
                continue
            try:
                outputs[name] = adapter.predict(adapter.build_input(event)).to_dict()
            except Exception as exc:  # noqa: BLE001 - never let one adapter crash the alert pipeline.
                outputs[name] = default_model_output(name, ModelStatus.FAILED.value, f"{name} inference failed: {exc}").to_dict()

        fusion = self.fusion.combine(outputs).to_dict()
        return build_alert(event, outputs, fusion)


def build_alert(event: dict[str, Any], outputs: dict[str, dict[str, Any]], fusion: dict[str, Any]) -> dict[str, Any]:
    http = (event.get("evidence") or {}).get("http") or {}
    flow = (event.get("evidence") or {}).get("flow") or {}
    suricata = (event.get("evidence") or {}).get("suricata") or {}
    final_label = str(fusion["final_label"])
    mitre = mitre_for_label(final_label)
    detected_by = list(fusion.get("contributors") or [])
    return {
        "id": event["event_id"],
        "timestamp": event["timestamp"],
        "severity": title_severity(str(fusion["severity"])),
        "attack_type": final_label,
        "source_ip": event["source_ip"],
        "destination_ip": event["destination_ip"],
        "source_port": flow.get("source_port") or flow.get("src_port"),
        "destination_port": int(flow.get("destination_port") or flow.get("dst_port") or (443 if http else 0)),
        "protocol": str(flow.get("proto") or ("HTTP" if http else "TCP")).upper(),
        "direction": "External -> Internal",
        "confidence_score": confidence_for_alert(outputs),
        "risk_score": int(fusion["risk_score"]),
        "detected_by": detected_by,
        "mitre": mitre,
        "raw_payload": http.get("uri") or suricata.get("signature") or "",
        "zeek_evidence": {
            "sensor_id": event.get("sensor_id") or None,
            "correlation_id": event.get("correlation_id"),
            "transaction_id": event.get("transaction_id") or None,
            "correlation_status": event.get("correlation_status") or None,
            "uri": http.get("uri"),
            "method": http.get("method"),
            "user_agent": http.get("user_agent"),
            "duration": flow.get("duration"),
            "orig_bytes": flow.get("orig_bytes"),
            "resp_bytes": flow.get("resp_bytes"),
            "orig_pkts": flow.get("orig_pkts"),
            "resp_pkts": flow.get("resp_pkts"),
            "conn_state": flow.get("conn_state"),
            "service": flow.get("service") or ("http" if http else None),
        },
        "suricata_evidence": {
            "signature_id": suricata.get("signature_id"),
            "signature": suricata.get("signature"),
            "category": suricata.get("category"),
            "severity": suricata.get("severity"),
        } if suricata else None,
        "ai_analysis": {
            "ai1": output_to_frontend_ai1(outputs["AI1"]),
            "ai2a": output_to_frontend_ai2a(outputs["AI2A"]),
            "ai2b": output_to_frontend_ai2b(outputs["AI2B"]),
            "fusion": {
                "confidence_score": confidence_for_alert(outputs),
                "risk_score": int(fusion["risk_score"]),
                "reason": fusion.get("reason", ""),
                "mode": fusion.get("mode", ""),
                "contributors": fusion.get("contributors", []),
                "excluded_models": fusion.get("excluded_models", {}),
                "decision_version": fusion.get("decision_version", ""),
            },
        },
        "decision_flow": decision_flow(outputs, fusion),
        "status": "new",
    }


def output_to_frontend_ai1(output: dict[str, Any]) -> dict[str, Any]:
    return {
        "status": output.get("status"),
        "source": output.get("source"),
        "verdict": output.get("label") or "N/A",
        "anomaly_score": float(output.get("confidence") or 0.0),
        "model_version": output.get("model_version", ""),
        "input_scope": output.get("input_scope", ""),
        "reason": output.get("reason", ""),
    }


def output_to_frontend_ai2a(output: dict[str, Any]) -> dict[str, Any]:
    return {
        "status": output.get("status"),
        "source": output.get("source"),
        "attack_type": output.get("label") or "N/A",
        "confidence_score": float(output.get("confidence") or 0.0),
        "model_version": output.get("model_version", ""),
        "input_scope": output.get("input_scope", ""),
        "reason": output.get("reason", ""),
    }


def output_to_frontend_ai2b(output: dict[str, Any]) -> dict[str, Any]:
    return {
        "status": output.get("status"),
        "source": output.get("source"),
        "web_attack_type": output.get("label") or "N/A",
        "confidence_score": float(output.get("confidence") or 0.0),
        "probabilities": output.get("probabilities", {}),
        "model_version": output.get("model_version", ""),
        "release_candidate": output.get("release_candidate", ""),
        "input_scope": output.get("input_scope", ""),
        "reason": output.get("reason", ""),
    }


def confidence_for_alert(outputs: dict[str, dict[str, Any]]) -> float:
    values = [
        float(output.get("confidence") or 0.0)
        for output in outputs.values()
        if output.get("status") in {ModelStatus.COMPLETED.value, ModelStatus.SIMULATED.value}
    ]
    return max(values) if values else 0.0


def decision_flow(outputs: dict[str, dict[str, Any]], fusion: dict[str, Any]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for name in MODEL_ORDER:
        output = outputs[name]
        rows.append(
            {
                "stage": name,
                "output": f"{output.get('status')}:{output.get('label') or output.get('reason', '')}",
                "confidence": output.get("confidence"),
            }
        )
    rows.append(
        {
            "stage": "Fusion",
            "output": f"{fusion.get('mode')} -> {fusion.get('final_label')}",
            "confidence": confidence_for_alert(outputs),
        }
    )
    return rows


def mitre_for_label(label: str) -> dict[str, str]:
    lower = label.lower()
    if "sql" in lower or "scripting" in lower or "web" in lower:
        return {
            "technique_id": "T1190",
            "technique_name": "Exploit Public-Facing Application",
            "tactic": "Initial Access",
        }
    if "scan" in lower or "network" in lower:
        return {
            "technique_id": "T1046",
            "technique_name": "Network Service Discovery",
            "tactic": "Discovery",
        }
    return {"technique_id": "T0000", "technique_name": "No ATT&CK Mapping", "tactic": "Informational"}


def title_severity(value: str) -> str:
    return {
        "CRITICAL": "Critical",
        "HIGH": "High",
        "MEDIUM": "Medium",
        "LOW": "Low",
    }.get(value.upper(), "Low")
