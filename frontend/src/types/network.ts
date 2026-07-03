export interface NetworkFlow {
  id: string;
  sensorId: string;
  source: "demo" | "replay" | "live";
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

