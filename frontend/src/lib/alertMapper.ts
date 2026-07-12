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
    sourcePort: dto.source_port ?? undefined,
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
      sensorId: dto.zeek_evidence?.sensor_id,
      correlationId: dto.zeek_evidence?.correlation_id,
      transactionId: dto.zeek_evidence?.transaction_id,
      correlationStatus: dto.zeek_evidence?.correlation_status,
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
            status: dto.ai_analysis.ai1.status,
            source: dto.ai_analysis.ai1.source,
            modelVersion: dto.ai_analysis.ai1.model_version,
            inputScope: dto.ai_analysis.ai1.input_scope,
            reason: dto.ai_analysis.ai1.reason,
          }
        : undefined,
      ai2a: dto.ai_analysis?.ai2a
        ? {
            attackType: dto.ai_analysis.ai2a.attack_type,
            confidenceScore: dto.ai_analysis.ai2a.confidence_score,
            status: dto.ai_analysis.ai2a.status,
            source: dto.ai_analysis.ai2a.source,
            modelVersion: dto.ai_analysis.ai2a.model_version,
            inputScope: dto.ai_analysis.ai2a.input_scope,
            reason: dto.ai_analysis.ai2a.reason,
          }
        : undefined,
      ai2b: dto.ai_analysis?.ai2b
        ? {
            webAttackType: dto.ai_analysis.ai2b.web_attack_type,
            confidenceScore: dto.ai_analysis.ai2b.confidence_score,
            probabilities: dto.ai_analysis.ai2b.probabilities,
            status: dto.ai_analysis.ai2b.status,
            source: dto.ai_analysis.ai2b.source,
            modelVersion: dto.ai_analysis.ai2b.model_version,
            releaseCandidate: dto.ai_analysis.ai2b.release_candidate,
            inputScope: dto.ai_analysis.ai2b.input_scope,
            reason: dto.ai_analysis.ai2b.reason,
          }
        : undefined,
      fusion: dto.ai_analysis?.fusion
        ? {
            confidenceScore: dto.ai_analysis.fusion.confidence_score,
            riskScore: dto.ai_analysis.fusion.risk_score,
            reason: dto.ai_analysis.fusion.reason,
            mode: dto.ai_analysis.fusion.mode,
            contributors: dto.ai_analysis.fusion.contributors,
            excludedModels: dto.ai_analysis.fusion.excluded_models,
            decisionVersion: dto.ai_analysis.fusion.decision_version,
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
      sensor_id: alert.zeekData.sensorId,
      correlation_id: alert.zeekData.correlationId,
      transaction_id: alert.zeekData.transactionId,
      correlation_status: alert.zeekData.correlationStatus,
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
            status: alert.aiDecision.ai1.status,
            source: alert.aiDecision.ai1.source,
            model_version: alert.aiDecision.ai1.modelVersion,
            input_scope: alert.aiDecision.ai1.inputScope,
            reason: alert.aiDecision.ai1.reason,
          }
        : undefined,
      ai2a: alert.aiDecision.ai2a
        ? {
            attack_type: alert.aiDecision.ai2a.attackType,
            confidence_score: alert.aiDecision.ai2a.confidenceScore,
            status: alert.aiDecision.ai2a.status,
            source: alert.aiDecision.ai2a.source,
            model_version: alert.aiDecision.ai2a.modelVersion,
            input_scope: alert.aiDecision.ai2a.inputScope,
            reason: alert.aiDecision.ai2a.reason,
          }
        : undefined,
      ai2b: alert.aiDecision.ai2b
        ? {
            web_attack_type: alert.aiDecision.ai2b.webAttackType,
            confidence_score: alert.aiDecision.ai2b.confidenceScore,
            probabilities: alert.aiDecision.ai2b.probabilities,
            status: alert.aiDecision.ai2b.status,
            source: alert.aiDecision.ai2b.source,
            model_version: alert.aiDecision.ai2b.modelVersion,
            release_candidate: alert.aiDecision.ai2b.releaseCandidate,
            input_scope: alert.aiDecision.ai2b.inputScope,
            reason: alert.aiDecision.ai2b.reason,
          }
        : undefined,
      fusion: alert.aiDecision.fusion
        ? {
            confidence_score: alert.aiDecision.fusion.confidenceScore,
            risk_score: alert.aiDecision.fusion.riskScore,
            reason: alert.aiDecision.fusion.reason,
            mode: alert.aiDecision.fusion.mode,
            contributors: alert.aiDecision.fusion.contributors,
            excluded_models: alert.aiDecision.fusion.excludedModels,
            decision_version: alert.aiDecision.fusion.decisionVersion,
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
