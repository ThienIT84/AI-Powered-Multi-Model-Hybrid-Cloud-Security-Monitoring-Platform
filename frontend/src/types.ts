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
  confidence: string;
  zeekData: ZeekData;
  suricataData: SuricataData;
  aiDecision: AiDecision;
  status: AlertStatus;
}

export interface TrafficData {
  timestamp: string;
  formattedTime: string;
  flows: number;
  anomalies: number;
  inbound: number;
  outbound: number;
  isAnomaly?: boolean;
  isPeak?: boolean;
}

