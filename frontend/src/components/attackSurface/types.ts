export interface AssetNode {
  id: string;
  name: string;
  type: string;
  location: "pfSense" | "DMZ" | "Internal Network" | "AWS Cloud" | "Gateway";
  riskScore: number;
  exposureScore: number;
  exposureLevel: "Low" | "Medium" | "High" | "Critical";
  connections: number;
  lastAlert: string;
  aiRiskScore: number;
  ip: string;
  environment: string;
  service: string;
  owner: string;
  topServices: { service: string; count: number; proto: string }[];
  suricataAlerts: { sigId: string; category: string; severity: "Low" | "Medium" | "High" | "Critical"; time: string }[];
  aiFindings: { aiMin: string; aiClass?: string; aiHTTP?: string; fusion: string };
  mitre: string[];
}

export interface AttackPath {
  id: string;
  name: string;
  description: string;
  riskScore: number;
  mitreMapping: string[];
  steps: {
    nodeId: string;
    label: string;
    vector: string;
    note: string;
  }[];
}

export interface CorrelationItem {
  id: string;
  time: string;
  asset: string;
  exposure: string;
  aiEvidence: string;
  suricata: string;
  fusionResult: string;
  severity: "Low" | "Medium" | "High" | "Critical";
}

export interface AwsServiceItem {
  name: string;
  id: string;
  monitored: string;
  exposureScore: number;
  riskLevel: string;
  recentAlerts: string;
  pct: number;
  color?: string;
  border?: string;
}
