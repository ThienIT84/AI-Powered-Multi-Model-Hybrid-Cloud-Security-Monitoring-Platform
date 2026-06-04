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
  };
  ai2a?: {
    attack_type: string;
    confidence_score: number;
  };
  ai2b?: {
    web_attack_type: string;
    confidence_score: number;
  };
  fusion?: {
    confidence_score: number;
    risk_score: number;
    reason: string;
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
  };
  ai2a?: {
    attackType: string;
    confidenceScore: number;
  };
  ai2b?: {
    webAttackType: string;
    confidenceScore: number;
  };
  fusion?: {
    confidenceScore: number;
    riskScore: number;
    reason: string;
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
  ai1Result: "ANOMALY" | "NORMAL";
  ai2aClass: "PortScan" | "DoS" | "BruteForce" | "Normal";
  ai2bWeb: "XSS" | "SQLi" | "NONE";
  suricataEvidence: string;
  fusionDecision: string;
}

export function getAlertFusionMeta(alert: Alert): FusionAlertMeta {
  const isAnomaly = alert.riskScore > 35;
  const ai1Result = isAnomaly ? "ANOMALY" : "NORMAL";

  let ai2aClass: "PortScan" | "DoS" | "BruteForce" | "Normal" = "Normal";
  const attackLower = (alert.attackType || "").toLowerCase();
  if (attackLower.includes("scan")) {
    ai2aClass = "PortScan";
  } else if (attackLower.includes("ddos") || attackLower.includes("botnet") || attackLower.includes("beacon")) {
    ai2aClass = "DoS";
  } else if (attackLower.includes("brute") || attackLower.includes("credential") || attackLower.includes("stuffing")) {
    ai2aClass = "BruteForce";
  }

  let ai2bWeb: "XSS" | "SQLi" | "NONE" = "NONE";
  if (attackLower.includes("xss")) {
    ai2bWeb = "XSS";
  } else if (attackLower.includes("sql") || attackLower.includes("injection") || attackLower.includes("lfi") || attackLower.includes("command")) {
    ai2bWeb = "SQLi";
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
    ai2aClass,
    ai2bWeb,
    suricataEvidence,
    fusionDecision
  };
}
