export interface ZeekConnection {
  timestamp: string;
  protocol: string;
  service: string;
  destPort: number;
  bytes: number;
  state: string;
}

export interface Asset {
  id: string;
  hostname: string;
  ip: string;
  zone: string; // "On-Prem" | "DMZ" | "Internal Network" | "AWS Cloud"
  type: string;
  owner: string;
  status: "Normal" | "Warning" | "Critical";
  riskScore: number;
  openAlerts: number;
  lastSeen: string;
  services: string[];
  ports: number[];
  connections: ZeekConnection[];
}

export interface CloudResource {
  id: string;
  name: string;
  type: "EC2" | "RDS" | "S3" | "SQS" | "IAM";
  status: "Normal" | "Warning" | "Critical";
  region: string;
  alerts: number;
}
