export enum Severity {
  CRITICAL = "Critical",
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low"
}

export enum AlertStatus {
  NEW = "new",
  BLOCKING = "blocking",
  INVESTIGATING = "investigating",
  MONITORING = "monitoring",
  MITIGATED = "mitigated",
  ESCALATED = "escalated",
  RESOLVED = "resolved",
  FALSE_POSITIVE = "false_positive"
}

export interface BackendMitreDTO {
  technique_id: string;
  technique_name: string;
  tactic?: string;
  url?: string;
}

export interface BackendZeekEvidenceDTO {
  uri?: string;
  method?: string;
  user_agent?: string;
  duration?: string;
  orig_bytes?: number;
  resp_bytes?: number;
  orig_pkts?: number;
  resp_pkts?: number;
  conn_state?: string;
  service?: string;
}

export interface BackendSuricataEvidenceDTO {
  signature_id?: string;
  signature?: string;
  category?: string;
  severity?: number;
}

export interface BackendAiAnalysisDTO {
  ai1?: {
    verdict: string;
    anomaly_score: number;
    status?: string;
    source?: string;
    model_version?: string;
    input_scope?: string;
    reason?: string;
  };
  ai2a?: {
    attack_type: string;
    confidence_score: number;
    status?: string;
    source?: string;
    model_version?: string;
    input_scope?: string;
    reason?: string;
  };
  ai2b?: {
    web_attack_type: string;
    confidence_score: number;
    probabilities?: Record<string, number>;
    status?: string;
    source?: string;
    model_version?: string;
    release_candidate?: string;
    input_scope?: string;
    reason?: string;
  };
  fusion?: {
    confidence_score: number;
    risk_score: number;
    reason: string;
    mode?: string;
    contributors?: string[];
    excluded_models?: Record<string, string>;
    decision_version?: string;
  };
}

export interface BackendDecisionFlowStepDTO {
  stage: string;
  output: string;
  confidence?: number;
}

export interface BackendAlertDTO {
  id: string;
  timestamp: string;
  severity: string;
  attack_type: string;
  source_ip: string;
  destination_ip: string;
  source_port?: number;
  destination_port: number;
  protocol: string;
  direction?: string;
  confidence_score: number;
  risk_score: number;
  detected_by: string[];
  mitre: BackendMitreDTO;
  raw_payload?: string;
  zeek_evidence?: BackendZeekEvidenceDTO;
  suricata_evidence?: BackendSuricataEvidenceDTO;
  ai_analysis?: BackendAiAnalysisDTO;
  decision_flow?: BackendDecisionFlowStepDTO[];
  status?: string;
}

export interface MitreTechnique {
  techniqueId: string;
  techniqueName: string;
  tactic?: string;
  url?: string;
}

export interface MitreAttack {
  id: string;
  tactic: string;
  technique: string;
  description: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  actor?: string;
  status?: string;
}

export interface ZeekData {
  uri?: string;
  method?: string;
  userAgent?: string;
  duration?: string;
  origBytes?: number;
  respBytes?: number;
  origPkts?: number;
  respPkts?: number;
  connState?: string;
  service?: string;
}

export interface SuricataData {
  signatureId?: string;
  signature?: string;
  category?: string;
  severity?: number;
}

export interface AiDecision {
  ai1?: {
    verdict: string;
    anomalyScore: number;
    status?: string;
    source?: string;
    modelVersion?: string;
    inputScope?: string;
    reason?: string;
  };
  ai2a?: {
    attackType: string;
    confidenceScore: number;
    status?: string;
    source?: string;
    modelVersion?: string;
    inputScope?: string;
    reason?: string;
  };
  ai2b?: {
    webAttackType: string;
    confidenceScore: number;
    probabilities?: Record<string, number>;
    status?: string;
    source?: string;
    modelVersion?: string;
    releaseCandidate?: string;
    inputScope?: string;
    reason?: string;
  };
  fusion?: {
    confidenceScore: number;
    riskScore: number;
    reason: string;
    mode?: string;
    contributors?: string[];
    excludedModels?: Record<string, string>;
    decisionVersion?: string;
  };
}

export interface DecisionFlowStep {
  stage: string;
  output: string;
  confidence?: number;
}

export interface Alert {
  id: string;
  timestamp: string;
  sourceIp: string;
  destinationIp: string;
  destIp?: string; // Backwards compatibility
  sourcePort?: number;
  destinationPort: number;
  destPort?: number; // Backwards compatibility
  attackType: string;
  protocol: string;
  direction: string;
  severity: Severity;
  riskScore: number;
  confidenceScore: number;
  confidence?: number; // Backwards compatibility
  detectedBy: string[];
  mitre: MitreTechnique;
  rawPayload?: string;
  payload?: string; // Backwards compatibility
  zeekData: ZeekData;
  suricataData: SuricataData;
  aiDecision: AiDecision;
  decisionFlow: DecisionFlowStep[];
  status: AlertStatus;
  cloudProvider: "AWS" | "Azure" | "GCP";
  region: string;
  description: string;
  assignedAnalyst?: string;
  mitreAttack?: MitreAttack;
  timeline: TimelineEvent[];
}

export interface DashboardSummary {
  totalNetworkFlows: number;
  totalFusionAlerts: number;
  topThreat: string;
  flowChangePercent: number;
  alertChangePercent: number;
  classifiedAttackChangePercent: number;
}

export interface ModelStatus {
  name: string;
  status: string;
  accuracy: string;
  lastTrained: string;
}

export interface DataSourceHealth {
  name: string;
  status: string;
  eps: string;
}

export interface TrafficData {
  timestamp: string;
  formattedTime?: string;
  flows: number;
  anomalies: number;
  inbound: number;
  outbound: number;
  isAnomaly?: boolean;
  isPeak?: boolean;
}

export type FusionAlert = {
  ai1: string;
  ai2a: string;
  ai2b: string;
  suricata: boolean;
  fusionDecision: string;
  confidence: number;
  riskScore: number;
};

export interface FusionAlertMeta {
  ai1Result: string;
  ai1Status: string;
  ai1Source: string;
  ai2aClass: string;
  ai2aStatus: string;
  ai2aSource: string;
  ai2bWeb: string;
  ai2bStatus: string;
  ai2bSource: string;
  suricataEvidence: string;
  fusionDecision: string;
  fusionMode: string;
}

export function getAlertFusionMeta(alert: Alert): FusionAlertMeta {
  const isAnomaly = alert.riskScore > 35;
  const ai1Status = alert.aiDecision.ai1?.status ?? "completed";
  const ai2aStatus = alert.aiDecision.ai2a?.status ?? "completed";
  const ai2bStatus = alert.aiDecision.ai2b?.status ?? "completed";
  const ai1Source = alert.aiDecision.ai1?.source ?? "legacy";
  const ai2aSource = alert.aiDecision.ai2a?.source ?? "legacy";
  const ai2bSource = alert.aiDecision.ai2b?.source ?? "legacy";

  const ai1Completed = isModelResultPresent(ai1Status);
  const ai2aCompleted = isModelResultPresent(ai2aStatus);
  const ai2bCompleted = isModelResultPresent(ai2bStatus);

  const ai1Result = ai1Completed
    ? normalizeAi1Verdict(alert.aiDecision.ai1?.verdict) ?? (isAnomaly ? "ANOMALY" : "NORMAL")
    : "NORMAL";

  let ai2aClass = "Normal";
  const attackLower = (alert.attackType || "").toLowerCase();
  if (ai2aCompleted) {
    ai2aClass = normalizeAi2aLabel(alert.aiDecision.ai2a?.attackType) ?? "Normal";
  } else if (!alert.aiDecision.ai2a) {
    if (attackLower.includes("scan")) {
      ai2aClass = "PortScan";
    } else if (attackLower.includes("ddos") || attackLower.includes("botnet") || attackLower.includes("beacon")) {
      ai2aClass = "DoS";
    } else if (attackLower.includes("brute") || attackLower.includes("credential") || attackLower.includes("stuffing")) {
      ai2aClass = "BruteForce";
    }
  }

  let ai2bWeb = "NONE";
  if (ai2bCompleted) {
    ai2bWeb = normalizeAi2bLabel(alert.aiDecision.ai2b?.webAttackType) ?? "NONE";
  } else if (!alert.aiDecision.ai2b) {
    if (attackLower.includes("xss")) {
      ai2bWeb = "XSS";
    } else if (attackLower.includes("sql") || attackLower.includes("injection") || attackLower.includes("lfi") || attackLower.includes("command")) {
      ai2bWeb = "SQLi";
    }
  }

  let suricataEvidence = "NO MATCH";
  if (alert.suricataData?.signatureId) {
    suricataEvidence = alert.suricataData.signatureId;
  } else if (isAnomaly && (ai2aClass !== "Normal" || ai2bWeb !== "NONE")) {
    const baseSid = 2000000 + (alert.id.match(/\d+/) ? parseInt(alert.id.match(/\d+/)![0]) : 110);
    suricataEvidence = `SID: ${baseSid}`;
  }

  const sevUpper = String(alert.severity).toUpperCase();
  const attackName = alert.attackType || "Unknown Threat";
  const fusionDecision = `${sevUpper}: ${attackName}`;

  return {
    ai1Result,
    ai1Status,
    ai1Source,
    ai2aClass,
    ai2aStatus,
    ai2aSource,
    ai2bWeb,
    ai2bStatus,
    ai2bSource,
    suricataEvidence,
    fusionDecision,
    fusionMode: alert.aiDecision.fusion?.mode ?? "LEGACY_FRONTEND"
  };
}

function isModelResultPresent(status?: string) {
  const normalized = (status ?? "").toLowerCase();
  return normalized === "completed" || normalized === "simulated";
}

function normalizeAi1Verdict(value?: string) {
  if (!value || value === "N/A") return undefined;
  return value.toUpperCase().includes("ANOM") ? "ANOMALY" : "NORMAL";
}

function normalizeAi2aLabel(value?: string) {
  if (!value || value === "N/A") return undefined;
  const normalized = value.toLowerCase().replaceAll("_", " ");
  if (normalized.includes("normal") || normalized === "none") return "Normal";
  if (normalized.includes("scan")) return "PortScan";
  if (normalized.includes("brute") || normalized.includes("credential")) return "BruteForce";
  if (normalized.includes("dos") || normalized.includes("beacon") || normalized.includes("botnet")) return "DoS";
  if (normalized.includes("web")) return "WEB_ATTACK";
  return value;
}

function normalizeAi2bLabel(value?: string) {
  if (!value || value === "N/A") return undefined;
  const normalized = value.toLowerCase();
  if (normalized.includes("xss") || normalized.includes("cross-site")) return "XSS";
  if (normalized.includes("sql")) return "SQLi";
  if (normalized.includes("none") || normalized.includes("normal")) return "NONE";
  return value;
}
