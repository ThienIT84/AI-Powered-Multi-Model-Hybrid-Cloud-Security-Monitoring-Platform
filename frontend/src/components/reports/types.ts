export interface AlertRecord {
  id: string;
  timestamp: string;
  sourceIp: string;
  destinationService: string;
  severity: "critical" | "high" | "medium" | "low";
  attackType: "XSS" | "SQLi" | "Port Scan" | "DoS" | "Brute Force" | "Unknown Anomaly";
  country: string;
  riskScore: number;
  aiSources: ("AI1" | "AI2A" | "AI2B" | "Fusion Layer")[];
  latency: number;
  evidence: string;
  affectedAsset: string;
  mitreMapping: string[];
  aiDecisions: {
    ai1: { label: string; confidence: number };
    ai2a: { label: string; confidence: number };
    ai2b: { label: string; confidence: number };
    fusion: { risk: number; action: string };
  };
}

export interface CalculatedKPIs {
  totalAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  mediumAlerts: number;
  lowAlerts: number;
  topThreat: string;
  averageRisk: number;
  meanLatency: number;
}
