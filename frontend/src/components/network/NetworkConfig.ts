export type Severity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface NetworkLog {
  id: string;
  timestamp: string;
  srcIp: string;
  srcPort: number;
  destIp: string;
  destPort: number;
  protocol: "TCP" | "UDP" | "ICMP";
  origBytes: number;
  respPkts: number;
  verdict: "NORMAL" | "ANOMALY";
  severity: Severity;
  threatScore: number; // 0 - 100
  confidence: number; // AI Confidence 0 - 100
  reason: string;
  country: string;
  duration: number; // milliseconds
  hexDump?: string;
}

export interface ChartDataPoint {
  timeLabel: string;
  flows: number;
  bandwidth: number; // in KB/s
  anomalyScore: number; // in %
  isAnomaly: boolean;
  eventAnnotation?: string;
}

export interface NetworkStatsType {
  liveBandwidth: number;
  totalActiveConnections: number;
  threatLevel: number;
  activeEndpointsCount: number;
  suspiciousSessions: number;
  avgPacketSize: number;
  threatScore: number;
  activeCountries?: number;
}
