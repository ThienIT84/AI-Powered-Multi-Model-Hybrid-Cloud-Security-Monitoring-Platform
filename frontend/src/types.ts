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

export interface BackendRateFeaturesDTO {
  window_seconds?: number;
  same_src_dst_connection_count?: number;
  destination_connection_count?: number;
  unique_source_count?: number;
  dos_suspected?: boolean;
  ddos_suspected?: boolean;
}

export interface BackendZeekEvidenceDTO {
  sensor_id?: string;
  correlation_id?: string;
  transaction_id?: string;
  correlation_status?: string;
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
  rate_features?: BackendRateFeaturesDTO | null;
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
  event_id?: string;
  timestamp: string;
  severity: string;
  attack_type: string;
  source_ip: string;
  destination_ip: string;
  source_port?: number | null;
  destination_port: number;
  protocol: string;
  direction?: string;
  confidence_score: number;
  risk_score: number;
  detected_by: string[];
  mitre: BackendMitreDTO;
  raw_payload?: string;
  zeek_evidence?: BackendZeekEvidenceDTO | null;
  suricata_evidence?: BackendSuricataEvidenceDTO | null;
  ai_analysis?: BackendAiAnalysisDTO;
  decision_flow?: BackendDecisionFlowStepDTO[];
  status?: string;
  event_type?: string;
  cloud_provider?: "AWS" | "Azure" | "GCP";
  region?: string;
  resource_id?: string;
  resource_type?: string;
  assigned_analyst?: string;
  analyst_notes?: string[];
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
  sensorId?: string;
  correlationId?: string;
  transactionId?: string;
  correlationStatus?: string;
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
  rateFeatures?: {
    windowSeconds?: number;
    sameSrcDstConnectionCount?: number;
    destinationConnectionCount?: number;
    uniqueSourceCount?: number;
    dosSuspected?: boolean;
    ddosSuspected?: boolean;
  };
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
  eventType?: string;
  cloudProvider?: "AWS" | "Azure" | "GCP";
  region?: string;
  resourceId?: string;
  resourceType?: string;
  description: string;
  assignedAnalyst?: string;
  analystNotes?: string[];
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

export type NetworkFlowVerdict = "NORMAL" | "ANOMALY";

/** A real, retained Zeek observation returned by /api/network/activity. */
export interface NetworkFlow {
  id: string;
  sensorId?: string | null;
  source: string;
  timestamp: string;
  srcIp: string;
  srcPort?: number | null;
  dstIp: string;
  dstPort: number;
  protocol: string;
  service?: string | null;
  bytes: number;
  packets: number;
  verdict: NetworkFlowVerdict;
  severity: string;
  anomalyScore: number;
  correlationId?: string | null;
  relatedAlertId: string;
}

export type SocketStatus = "connecting" | "connected" | "reconnecting" | "disconnected" | "error";

export interface PlatformStatus {
  socketStatus: SocketStatus;
  dataMode: "demo" | "replay" | "live";
  dataSourcesOnline: number | null;
  dataSourcesTotal: number | null;
  modelHealthy: number | null;
  modelTotal: number | null;
  eventRatePerSecond: number | null;
  lastIngestAt: string | null;
  lastError: string | null;
  dataSources?: DataSourceRuntimeStatus[];
  models?: ModelRuntimeStatus[];
  databaseStatus?: "healthy" | "warning" | "offline" | "unknown";
}

export interface DataSourceRuntimeStatus {
  id: string;
  name: string;
  status: "healthy" | "warning" | "offline" | "unknown";
  eventCount?: number | null;
  lastSeenAt?: string | null;
  message?: string | null;
}

export interface ModelRuntimeStatus {
  name: string;
  status: string;
  source: string;
  modelVersion?: string | null;
  lastSeenAt?: string | null;
  message?: string | null;
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
  const ai1Status = alert.aiDecision.ai1?.status ?? "not_run";
  const ai2aStatus = alert.aiDecision.ai2a?.status ?? "not_run";
  const ai2bStatus = alert.aiDecision.ai2b?.status ?? "not_run";
  const ai1Source = alert.aiDecision.ai1?.source ?? "unknown";
  const ai2aSource = alert.aiDecision.ai2a?.source ?? "unknown";
  const ai2bSource = alert.aiDecision.ai2b?.source ?? "unknown";
  const ai1Result = alert.aiDecision.ai1?.verdict ?? "N/A";
  const ai2aClass = alert.aiDecision.ai2a?.attackType ?? "N/A";
  const ai2bWeb = alert.aiDecision.ai2b?.webAttackType ?? "N/A";
  const suricataEvidence = alert.suricataData?.signatureId ?? "NO DATA";

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
    fusionMode: alert.aiDecision.fusion?.mode ?? "N/A"
  };
}
