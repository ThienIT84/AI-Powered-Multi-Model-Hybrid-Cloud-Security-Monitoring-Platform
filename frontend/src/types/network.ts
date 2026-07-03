export type NetworkTelemetrySource =
  | "Zeek conn.log"
  | "Zeek http.log"
  | "Suricata alert"
  | "VPC Flow Logs"
  | "Demo simulation"
  | "Replay dataset"
  | "Unknown telemetry";

export interface NetworkFlow {
  id: string;
  sensorId: string;
  source: NetworkTelemetrySource;
  timestamp: string;
  srcIp: string;
  dstIp: string;
  protocol: "TCP" | "UDP" | "ICMP" | string;
  service: string;
  bytes: number;
  packets: number;
  correlationId: string;
  relatedAlertId?: string;
  relatedCaseId?: string;
}
