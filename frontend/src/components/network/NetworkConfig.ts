export type Severity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export enum ProtocolType {
  TCP = "TCP",
  UDP = "UDP",
  ICMP = "ICMP",
}

export enum NetworkStatus {
  NORMAL = "NORMAL",
  ANOMALY = "ANOMALY",
}

export enum LogSource {
  ZEEK = "ZEEK",
  SURICATA = "SURICATA",
  FIREWALL = "FIREWALL",
  DNS = "DNS",
  SSH = "SSH",
  HTTP = "HTTP",
  TLS = "TLS",
  AUTH = "AUTH",
  IDS = "IDS",
  EDR = "EDR",
}

export enum SeverityLevel {
  INFO = "INFO",
  WARNING = "WARNING",
  ALERT = "ALERT",
  CRITICAL = "CRITICAL",
}

export interface NetworkLog {
  id: string;
  timestamp: string;
  srcIp?: string;
  sourceIp?: string;
  srcPort?: number;
  sourcePort?: number;
  destIp: string;
  destPort: number;
  protocol: ProtocolType | "TCP" | "UDP" | "ICMP";
  origBytes: number;
  respBytes?: number;
  respPkts?: number;
  status?: NetworkStatus;
  verdict?: "NORMAL" | "ANOMALY";
  severity?: Severity;
  threatScore?: number; // 0 - 100
  confidence?: number; // AI Confidence 0 - 100
  reason?: string;
  country?: string;
  attackType?: string;
  duration: number; // milliseconds
  hexDump?: string;
}

export interface SyslogEvent {
  id: string;
  timestamp: string;
  source: LogSource;
  severity: SeverityLevel;
  message: string;
  host: string;
  category: string;
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
