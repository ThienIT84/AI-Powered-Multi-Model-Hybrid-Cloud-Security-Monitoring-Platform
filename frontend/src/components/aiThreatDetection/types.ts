export interface ThreatEvent {
  id: string;
  timestamp: string;
  src_ip: string;
  dst_ip: string;
  attack_type: "XSS" | "SQLi" | "DoS" | "Port Scan" | "Brute Force" | "Botnet";
  severity: "Critical" | "High" | "Medium";
  confidence: number;

  pipeline: {
    zeek: boolean;
    ai1: number; // Anomaly score or index
    ai2a?: string; // Attack classification
    ai2b?: string; // Web payload scanner decision
    fusion_score: number; // Final fusion probability or score
  };

  mitre: string;
}

export interface GraphColors {
  cyan: string;
  emerald: string;
  amber: string;
  red: string;
  violet: string;
  gray: string;
  border: string;
  text: string;
  grid: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
}
