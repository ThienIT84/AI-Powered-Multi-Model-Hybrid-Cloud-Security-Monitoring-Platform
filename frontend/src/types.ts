export enum Severity {
  CRITICAL = "Critical",
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low"
}

export enum AlertStatus {
  BLOCKING = "blocking",
  INVESTIGATING = "investigating",
  MONITORING = "monitoring",
  RESOLVED = "resolved"
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
  sourcePort?: number;
  destinationPort: number;
  attackType: string;
  protocol: string;
  direction: string;
  severity: Severity;
  riskScore: number;
  confidenceScore: number;
  detectedBy: string[];
  mitre: MitreTechnique;
  rawPayload?: string;
  zeekData: ZeekData;
  suricataData: SuricataData;
  aiDecision: AiDecision;
  decisionFlow: DecisionFlowStep[];
  status: AlertStatus;
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
