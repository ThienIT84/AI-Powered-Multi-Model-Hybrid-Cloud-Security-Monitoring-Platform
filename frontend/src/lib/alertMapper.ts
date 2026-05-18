import {
  Alert,
  AlertStatus,
  BackendAlertDTO,
  Severity,
} from "../types";

function normalizeSeverity(severity: string): Severity {
  const normalized = severity.toLowerCase();
  if (normalized === "critical") return Severity.CRITICAL;
  if (normalized === "high") return Severity.HIGH;
  if (normalized === "medium") return Severity.MEDIUM;
  return Severity.LOW;
}

function normalizeStatus(status?: string): AlertStatus {
  const normalized = status?.toLowerCase();
  if (normalized === AlertStatus.NEW) return AlertStatus.NEW;
  if (normalized === AlertStatus.BLOCKING) return AlertStatus.BLOCKING;
  if (normalized === AlertStatus.INVESTIGATING) return AlertStatus.INVESTIGATING;
  if (normalized === AlertStatus.MONITORING) return AlertStatus.MONITORING;
  if (normalized === AlertStatus.MITIGATED) return AlertStatus.MITIGATED;
  if (normalized === AlertStatus.ESCALATED) return AlertStatus.ESCALATED;
  if (normalized === AlertStatus.RESOLVED) return AlertStatus.RESOLVED;
  if (normalized === AlertStatus.FALSE_POSITIVE) return AlertStatus.FALSE_POSITIVE;
  return AlertStatus.INVESTIGATING;
}

function buildMitreUrl(techniqueId: string) {
  return `https://attack.mitre.org/techniques/${techniqueId.replace(".", "/")}/`;
}

export function mapBackendAlertToAlert(dto: BackendAlertDTO): Alert {
  const mitreUrl = dto.mitre.url ?? buildMitreUrl(dto.mitre.technique_id);
  const decisionFlow =
    dto.decision_flow?.map((step) => ({
      stage: step.stage,
      output: step.output,
      confidence: step.confidence,
    })) ?? [];
  const fusionReason = dto.ai_analysis?.fusion?.reason;

  return {
    id: dto.id,
    timestamp: dto.timestamp,
    sourceIp: dto.source_ip,
    destinationIp: dto.destination_ip,
    sourcePort: dto.source_port,
    destinationPort: dto.destination_port,
    attackType: dto.attack_type,
    protocol: dto.protocol,
    direction: dto.direction ?? "External -> Internal",
    severity: normalizeSeverity(dto.severity),
    riskScore: dto.risk_score,
    confidenceScore: dto.confidence_score,
    detectedBy: dto.detected_by ?? [],
    mitre: {
      techniqueId: dto.mitre.technique_id,
      techniqueName: dto.mitre.technique_name,
      tactic: dto.mitre.tactic,
      url: mitreUrl,
    },
    rawPayload: dto.raw_payload,
    zeekData: {
      uri: dto.zeek_evidence?.uri,
      method: dto.zeek_evidence?.method,
      userAgent: dto.zeek_evidence?.user_agent,
      duration: dto.zeek_evidence?.duration,
      origBytes: dto.zeek_evidence?.orig_bytes,
      respBytes: dto.zeek_evidence?.resp_bytes,
      origPkts: dto.zeek_evidence?.orig_pkts,
      respPkts: dto.zeek_evidence?.resp_pkts,
      connState: dto.zeek_evidence?.conn_state,
      service: dto.zeek_evidence?.service,
    },
    suricataData: {
      signatureId: dto.suricata_evidence?.signature_id,
      signature: dto.suricata_evidence?.signature,
      category: dto.suricata_evidence?.category,
      severity: dto.suricata_evidence?.severity,
    },
    aiDecision: {
      ai1: dto.ai_analysis?.ai1
        ? {
            verdict: dto.ai_analysis.ai1.verdict,
            anomalyScore: dto.ai_analysis.ai1.anomaly_score,
          }
        : undefined,
      ai2a: dto.ai_analysis?.ai2a
        ? {
            attackType: dto.ai_analysis.ai2a.attack_type,
            confidenceScore: dto.ai_analysis.ai2a.confidence_score,
          }
        : undefined,
      ai2b: dto.ai_analysis?.ai2b
        ? {
            webAttackType: dto.ai_analysis.ai2b.web_attack_type,
            confidenceScore: dto.ai_analysis.ai2b.confidence_score,
          }
        : undefined,
      fusion: dto.ai_analysis?.fusion
        ? {
            confidenceScore: dto.ai_analysis.fusion.confidence_score,
            riskScore: dto.ai_analysis.fusion.risk_score,
            reason: dto.ai_analysis.fusion.reason,
          }
        : undefined,
    },
    decisionFlow,
    status: normalizeStatus(dto.status),
    cloudProvider: "AWS",
    region: "ap-southeast-1",
    description:
      fusionReason ??
      `${dto.attack_type} detected from ${dto.source_ip} targeting ${dto.destination_ip}:${dto.destination_port}.`,
    assignedAnalyst: "Admin_Phu",
    mitreAttack: {
      id: dto.mitre.technique_id,
      tactic: dto.mitre.tactic ?? "Mapped",
      technique: dto.mitre.technique_name,
      description: `${dto.mitre.technique_name} mapped from Fusion Layer evidence.`,
    },
    timeline:
      decisionFlow.length > 0
        ? decisionFlow.map((step, index) => ({
            id: `flow-${index + 1}`,
            timestamp: dto.timestamp,
            type: step.stage,
            description: step.output,
            status: step.confidence !== undefined ? `${Math.round(step.confidence * 100)}%` : undefined,
          }))
        : [
            {
              id: "flow-1",
              timestamp: dto.timestamp,
              type: "Fusion Layer",
              description: fusionReason ?? `${dto.attack_type} alert created`,
            },
          ],
  };
}

export function mapAlertToBackendPayload(alert: Alert): BackendAlertDTO {
  return {
    id: alert.id,
    timestamp: alert.timestamp,
    severity: alert.severity,
    attack_type: alert.attackType,
    source_ip: alert.sourceIp,
    destination_ip: alert.destinationIp,
    source_port: alert.sourcePort,
    destination_port: alert.destinationPort,
    protocol: alert.protocol,
    direction: alert.direction,
    confidence_score: alert.confidenceScore,
    risk_score: alert.riskScore,
    detected_by: alert.detectedBy,
    mitre: {
      technique_id: alert.mitre.techniqueId,
      technique_name: alert.mitre.techniqueName,
      tactic: alert.mitre.tactic,
      url: alert.mitre.url,
    },
    raw_payload: alert.rawPayload,
    zeek_evidence: {
      uri: alert.zeekData.uri,
      method: alert.zeekData.method,
      user_agent: alert.zeekData.userAgent,
      duration: alert.zeekData.duration,
      orig_bytes: alert.zeekData.origBytes,
      resp_bytes: alert.zeekData.respBytes,
      orig_pkts: alert.zeekData.origPkts,
      resp_pkts: alert.zeekData.respPkts,
      conn_state: alert.zeekData.connState,
      service: alert.zeekData.service,
    },
    suricata_evidence: {
      signature_id: alert.suricataData.signatureId,
      signature: alert.suricataData.signature,
      category: alert.suricataData.category,
      severity: alert.suricataData.severity,
    },
    ai_analysis: {
      ai1: alert.aiDecision.ai1
        ? {
            verdict: alert.aiDecision.ai1.verdict,
            anomaly_score: alert.aiDecision.ai1.anomalyScore,
          }
        : undefined,
      ai2a: alert.aiDecision.ai2a
        ? {
            attack_type: alert.aiDecision.ai2a.attackType,
            confidence_score: alert.aiDecision.ai2a.confidenceScore,
          }
        : undefined,
      ai2b: alert.aiDecision.ai2b
        ? {
            web_attack_type: alert.aiDecision.ai2b.webAttackType,
            confidence_score: alert.aiDecision.ai2b.confidenceScore,
          }
        : undefined,
      fusion: alert.aiDecision.fusion
        ? {
            confidence_score: alert.aiDecision.fusion.confidenceScore,
            risk_score: alert.aiDecision.fusion.riskScore,
            reason: alert.aiDecision.fusion.reason,
          }
        : undefined,
    },
    decision_flow: alert.decisionFlow.map((step) => ({
      stage: step.stage,
      output: step.output,
      confidence: step.confidence,
    })),
    status: alert.status,
  };
}
