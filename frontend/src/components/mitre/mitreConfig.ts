// --- MITRE ATT&CK Mapping - Simplified Config & Data Model ---

export interface MitreAlertMapping {
  alertId: string;
  timestamp: string;
  attackType: string;
  fusionDecision: string;
  techniqueId: string;
  techniqueName: string;
  tactic: string;
  confidence: number;
  sourceIp: string;
  destIp: string;
  detectionSources: string[];
}

export interface MitreTechniqueSummaryItem {
  techniqueId: string;
  techniqueName: string;
  alertCount: number;
  tactic: string;
  detectionSources: string[];
}

// Static alert stream mapped to MITRE ATT&CK
export const MITRE_ALERT_MAPPINGS: MitreAlertMapping[] = [
  {
    alertId: "AL-482",
    timestamp: "09:37:12",
    attackType: "Brute Force",
    fusionDecision: "Brute Force",
    techniqueId: "T1110",
    techniqueName: "Brute Force",
    tactic: "Credential Access",
    confidence: 91,
    sourceIp: "192.168.1.5",
    destIp: "10.0.0.10",
    detectionSources: ["AI2A", "Suricata", "Fusion"]
  },
  {
    alertId: "AL-512",
    timestamp: "10:15:30",
    attackType: "SQL Injection",
    fusionDecision: "SQL Injection",
    techniqueId: "T1190",
    techniqueName: "Exploit Public-Facing Application",
    tactic: "Initial Access",
    confidence: 97,
    sourceIp: "185.220.101.4",
    destIp: "10.0.12.5",
    detectionSources: ["AI2B", "Fusion"]
  },
  {
    alertId: "AL-319",
    timestamp: "09:32:14",
    attackType: "Port Scan",
    fusionDecision: "Port Scan",
    techniqueId: "T1046",
    techniqueName: "Network Service Scanning",
    tactic: "Discovery",
    confidence: 91,
    sourceIp: "192.168.1.50",
    destIp: "10.0.0.1",
    detectionSources: ["AI2A", "Fusion"]
  },
  {
    alertId: "AL-108",
    timestamp: "08:12:44",
    attackType: "XSS",
    fusionDecision: "XSS Injection",
    techniqueId: "T1190",
    techniqueName: "Exploit Public-Facing Application",
    tactic: "Initial Access",
    confidence: 88,
    sourceIp: "198.51.100.72",
    destIp: "10.0.12.6",
    detectionSources: ["AI2B", "Suricata", "Fusion"]
  },
  {
    alertId: "AL-224",
    timestamp: "07:40:02",
    attackType: "DoS",
    fusionDecision: "Distributed SYN Flood",
    techniqueId: "T1498",
    techniqueName: "Network Denial of Service",
    tactic: "Impact",
    confidence: 95,
    sourceIp: "203.0.113.15",
    destIp: "10.0.2.100",
    detectionSources: ["Suricata", "Fusion"]
  },
  {
    alertId: "AL-193",
    timestamp: "06:15:22",
    attackType: "Beaconing",
    fusionDecision: "C2 DNS Beaconing",
    techniqueId: "T1071",
    techniqueName: "Application Layer Protocol",
    tactic: "Command & Control",
    confidence: 83,
    sourceIp: "10.0.5.12",
    destIp: "93.184.216.34",
    detectionSources: ["AI1", "Fusion"]
  },
  {
    alertId: "AL-812",
    timestamp: "05:08:11",
    attackType: "Brute Force",
    fusionDecision: "Credential Spraying",
    techniqueId: "T1110",
    techniqueName: "Brute Force",
    tactic: "Credential Access",
    confidence: 89,
    sourceIp: "192.168.1.18",
    destIp: "10.0.0.10",
    detectionSources: ["AI2A", "Fusion"]
  },
  {
    alertId: "AL-644",
    timestamp: "04:30:15",
    attackType: "Port Scan",
    fusionDecision: "Vertical Subnet Sweep",
    techniqueId: "T1046",
    techniqueName: "Network Service Scanning",
    tactic: "Discovery",
    confidence: 94,
    sourceIp: "192.168.1.99",
    destIp: "10.0.0.22",
    detectionSources: ["AI2A"]
  }
];

// Helper to pre-calculate technique summaries
export const MITRE_TECH_SUMMARIES: MitreTechniqueSummaryItem[] = [
  {
    techniqueId: "T1110",
    techniqueName: "Brute Force",
    alertCount: 24,
    tactic: "Credential Access",
    detectionSources: ["AI2A", "Suricata", "Fusion"]
  },
  {
    techniqueId: "T1190",
    techniqueName: "Exploit Public-Facing Application",
    alertCount: 18,
    tactic: "Initial Access",
    detectionSources: ["AI2B", "Suricata", "Fusion"]
  },
  {
    techniqueId: "T1046",
    techniqueName: "Network Service Scanning",
    alertCount: 12,
    tactic: "Discovery",
    detectionSources: ["AI2A", "Fusion"]
  },
  {
    techniqueId: "T1498",
    techniqueName: "Network Denial of Service",
    alertCount: 8,
    tactic: "Impact",
    detectionSources: ["Suricata", "Fusion"]
  },
  {
    techniqueId: "T1071",
    techniqueName: "Application Layer Protocol",
    alertCount: 6,
    tactic: "Command & Control",
    detectionSources: ["AI1", "Fusion"]
  }
];
