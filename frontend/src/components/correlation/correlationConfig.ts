export interface IncidentCluster {
  id: string;
  name: string;
  attackType: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  alertCount: number;
  durationMinutes: number;
  primaryActor: string;
  status: "ACTIVE" | "MITIGATED" | "CONTAINED" | "INVESTIGATING";
  targetSubnet: string;
}

export interface TimelineStep {
  timeAgo: string;
  title: string;
  engine: "Zeek Ingestion" | "AI1 Behavioral" | "Suricata Rule" | "Fusion Verdict";
  description: string;
  status: "NORMAL" | "WARNING" | "CRITICAL";
}

export interface CampaignStage {
  stage: "Recon" | "Scan" | "Exploit" | "Lateral Movement" | "Exfiltration";
  active: boolean;
  score: number;
  logCount: number;
  description: string;
}

export const INCIDENT_CLUSTERS: IncidentCluster[] = [
  {
    id: "INC-2049",
    name: "Subnet Exfiltration Campaign",
    attackType: "Multi-vector Exfiltration",
    severity: "CRITICAL",
    alertCount: 45,
    durationMinutes: 12,
    primaryActor: "APT-29 Shadow Corp",
    status: "ACTIVE",
    targetSubnet: "10.0.12.0/24",
  },
  {
    id: "INC-2051",
    name: "Credential Harvesting Attempt",
    attackType: "Distributed Brute Force",
    severity: "HIGH",
    alertCount: 28,
    durationMinutes: 34,
    primaryActor: "Scavenger Botnet-X",
    status: "INVESTIGATING",
    targetSubnet: "10.0.120.128/28",
  },
  {
    id: "INC-1980",
    name: "Dynamic LFI Gateway Attack",
    attackType: "Web App Code Injection",
    severity: "MEDIUM",
    alertCount: 14,
    durationMinutes: 120,
    primaryActor: "RedTeam_Hobbyist",
    status: "MITIGATED",
    targetSubnet: "10.0.4.0/24",
  }
];

export const CORRELATION_TIMELINE: TimelineStep[] = [
  { timeAgo: "12m 40s", title: "Zeek Connection log registered", engine: "Zeek Ingestion", description: "Established egress TCP socket bound standard SQL query headers", status: "NORMAL" },
  { timeAgo: "11m 15s", title: "AI1 behavioral trigger raised Anomaly", engine: "AI1 Behavioral", description: "Outbound bytes ratio of 12.4x exceeds regular local thresholds", status: "WARNING" },
  { timeAgo: "10m 02s", title: "Suricata rule match on static signature ID", engine: "Suricata Rule", description: "Identified shell injection exploit string matching standard SIDs", status: "CRITICAL" },
  { timeAgo: "09m 50s", title: "Fusion intelligence synthesized final verdict", engine: "Fusion Verdict", description: "Correlated behavioral telemetry and signature weights to critical", status: "CRITICAL" }
];

export const ATTACK_CAMPAIGN_STAGES: CampaignStage[] = [
  { stage: "Recon", active: true, score: 98, logCount: 520, description: "External IP address profiling local router open endpoints." },
  { stage: "Scan", active: true, score: 85, logCount: 2110, description: "TCP/UDP port sweeping targeting private cloud server farms." },
  { stage: "Exploit", active: true, score: 92, logCount: 45, description: "Ingressing SQL inject strings and LFI patterns in HTTP parameters." },
  { stage: "Lateral Movement", active: false, score: 10, logCount: 0, description: "Attempted SSH key sharing or internal packet copying." },
  { stage: "Exfiltration", active: false, score: 5, logCount: 0, description: "Transfer of DB binary records back to malicious actor destination." }
];
