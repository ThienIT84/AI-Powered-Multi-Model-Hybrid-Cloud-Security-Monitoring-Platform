export enum Severity {
  CRITICAL = "Critical",
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low"
}

export enum AlertStatus {
  NEW = "new",
  INVESTIGATING = "investigating",
  MITIGATED = "mitigated",
  ESCALATED = "escalated",
  RESOLVED = "resolved",
  FALSE_POSITIVE = "false_positive"
}

export interface ZeekData {
  duration: string;
  origBytes: number;
  respBytes: number;
  connState: string;
}

export interface SuricataData {
  signatureId: string;
  category: string;
}

export interface AiDecision {
  ai1: string;
  ai2a: string;
  ai2b: string;
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

export interface Alert {
  id: string;
  timestamp: string;
  sourceIp: string;
  destIp: string;
  destPort: number;
  attackType: string;
  protocol: string;
  severity: Severity;
  riskScore: number;
  confidence: number;
  zeekData: ZeekData;
  suricataData: SuricataData;
  aiDecision: AiDecision;
  status: AlertStatus;
  cloudProvider: "AWS" | "Azure" | "GCP";
  region: string;
  description: string;
  assignedAnalyst?: string;
  mitreAttack?: MitreAttack;
  timeline: TimelineEvent[];
  payload?: string;
}

export interface TrafficData {
  timestamp: string;
  flows: number;
  anomalies: number;
  inbound: number;
  outbound: number;
  isAnomaly?: boolean;
  isPeak?: boolean;
}
