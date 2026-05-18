import {
  AlertStatus,
  BackendAlertDTO,
  BackendMitreDTO,
  BackendSuricataEvidenceDTO,
  BackendZeekEvidenceDTO,
  DashboardSummary,
  DataSourceHealth,
  ModelStatus,
  TrafficData,
} from "../types";

interface AttackProfile {
  attackType: string;
  severity: string;
  protocol: string;
  destinationPort: number;
  detectedBy: string[];
  mitre: BackendMitreDTO;
  payload?: string;
  zeek: BackendZeekEvidenceDTO;
  suricata?: BackendSuricataEvidenceDTO;
}

const attackProfiles: AttackProfile[] = [
  {
    attackType: "SQL Injection",
    severity: "Critical",
    protocol: "HTTPS",
    destinationPort: 443,
    detectedBy: ["AI2B", "Suricata"],
    mitre: {
      technique_id: "T1190",
      technique_name: "Exploit Public-Facing Application",
      tactic: "Initial Access",
    },
    payload:
      "POST /login.php HTTP/1.1\nHost: app.internal.example.com\nContent-Type: application/x-www-form-urlencoded\n\nusername=admin' OR '1'='1'--&submit=Login",
    zeek: {
      uri: "/login.php?username=admin%27%20OR%20%271%27%3D%271%27--",
      method: "POST",
      user_agent: "Mozilla/5.0",
      service: "http",
    },
    suricata: {
      signature_id: "[1:2010935:2]",
      signature: "ET WEB_SERVER Possible SQL Injection Attempt",
      category: "Web Application Attack",
      severity: 1,
    },
  },
  {
    attackType: "XSS",
    severity: "High",
    protocol: "HTTP",
    destinationPort: 80,
    detectedBy: ["AI2B"],
    mitre: {
      technique_id: "T1189",
      technique_name: "Drive-by Compromise",
      tactic: "Initial Access",
    },
    payload:
      "GET /search?q=<script>alert(document.cookie)</script> HTTP/1.1\nHost: portal.internal.example.com",
    zeek: {
      uri: "/search?q=%3Cscript%3Ealert(document.cookie)%3C/script%3E",
      method: "GET",
      user_agent: "Firefox/124.0",
      service: "http",
    },
    suricata: undefined,
  },
  {
    attackType: "Port Scan",
    severity: "High",
    protocol: "TCP",
    destinationPort: 22,
    detectedBy: ["AI1", "AI2A", "Suricata"],
    mitre: {
      technique_id: "T1046",
      technique_name: "Network Service Discovery",
      tactic: "Discovery",
    },
    payload: undefined,
    zeek: {
      duration: "0.03",
      orig_bytes: 0,
      resp_bytes: 0,
      orig_pkts: 1,
      resp_pkts: 0,
      conn_state: "S0",
      service: "ssh",
    },
    suricata: {
      signature_id: "[1:2002911:5]",
      signature: "ET SCAN Nmap Scripting Engine User-Agent Detected",
      category: "Attempted Information Leak",
      severity: 2,
    },
  },
  {
    attackType: "DDoS",
    severity: "Critical",
    protocol: "UDP",
    destinationPort: 53,
    detectedBy: ["AI1", "AI2A"],
    mitre: {
      technique_id: "T1498",
      technique_name: "Network Denial of Service",
      tactic: "Impact",
    },
    payload: undefined,
    zeek: {
      duration: "1.41",
      orig_bytes: 48120,
      resp_bytes: 320,
      orig_pkts: 900,
      resp_pkts: 8,
      conn_state: "SF",
      service: "dns",
    },
    suricata: undefined,
  },
  {
    attackType: "Brute Force",
    severity: "Medium",
    protocol: "SSH",
    destinationPort: 22,
    detectedBy: ["AI1", "AI2A", "Suricata"],
    mitre: {
      technique_id: "T1110",
      technique_name: "Brute Force",
      tactic: "Credential Access",
    },
    payload: undefined,
    zeek: {
      duration: "4.92",
      orig_bytes: 8840,
      resp_bytes: 2034,
      orig_pkts: 65,
      resp_pkts: 42,
      conn_state: "RSTO",
      service: "ssh",
    },
    suricata: {
      signature_id: "[1:2001219:21]",
      signature: "ET SCAN Potential SSH Scan",
      category: "Attempted Administrator Privilege Gain",
      severity: 2,
    },
  },
];

const statuses = [
  AlertStatus.BLOCKING,
  AlertStatus.INVESTIGATING,
  AlertStatus.MONITORING,
  AlertStatus.RESOLVED,
];

function randomIp(publicRange = true) {
  if (!publicRange) {
    return `10.0.${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 240) + 10}`;
  }

  return `203.0.113.${Math.floor(Math.random() * 220) + 10}`;
}

export function generateMockAlertDTO(index = Date.now()): BackendAlertDTO {
  const profile = attackProfiles[index % attackProfiles.length];
  const confidenceScore = Number((0.72 + Math.random() * 0.27).toFixed(2));
  const riskScore =
    profile.severity === "Critical"
      ? Math.floor(88 + Math.random() * 12)
      : profile.severity === "High"
        ? Math.floor(72 + Math.random() * 15)
        : Math.floor(45 + Math.random() * 20);

  return {
    id: `INC-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${String(index).slice(-4)}`,
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 60000)).toISOString(),
    severity: profile.severity,
    attack_type: profile.attackType,
    source_ip: randomIp(),
    destination_ip: randomIp(false),
    source_port: Math.floor(20000 + Math.random() * 40000),
    destination_port: profile.destinationPort,
    protocol: profile.protocol,
    direction: "External -> Internal",
    confidence_score: confidenceScore,
    risk_score: riskScore,
    detected_by: profile.detectedBy,
    mitre: profile.mitre,
    raw_payload: profile.payload,
    zeek_evidence: profile.zeek,
    suricata_evidence: profile.suricata,
    ai_analysis: {
      ai1: {
        verdict: profile.attackType === "XSS" || profile.attackType === "SQL Injection" ? "NORMAL" : "ANOMALY",
        anomaly_score: Number((0.55 + Math.random() * 0.4).toFixed(2)),
      },
      ai2a: {
        attack_type: ["Port Scan", "DDoS", "Brute Force"].includes(profile.attackType)
          ? profile.attackType
          : "Normal",
        confidence_score: Number((0.68 + Math.random() * 0.26).toFixed(2)),
      },
      ai2b: {
        web_attack_type: ["XSS", "SQL Injection"].includes(profile.attackType)
          ? profile.attackType
          : "Normal",
        confidence_score: confidenceScore,
      },
      fusion: {
        confidence_score: confidenceScore,
        risk_score: riskScore,
        reason: `${profile.detectedBy.join(" + ")} evidence confirmed ${profile.attackType}`,
      },
    },
    decision_flow: [
      {
        stage: profile.zeek.uri ? "Zeek http.log" : "Zeek conn.log",
        output: profile.zeek.uri ? profile.zeek.uri : `${profile.zeek.service ?? "unknown"} ${profile.zeek.conn_state ?? "SF"}`,
      },
      {
        stage: profile.zeek.uri ? "AI2B HTTP Classifier" : "AI1/AI2A Network Models",
        output: profile.attackType,
        confidence: confidenceScore,
      },
      {
        stage: "Fusion Layer",
        output: `${profile.attackType} - ${profile.severity}`,
        confidence: confidenceScore,
      },
    ],
    status: statuses[index % statuses.length],
  };
}

export const mockAlertDTOs = Array.from({ length: 15 }, (_, index) =>
  generateMockAlertDTO(index + 1),
);

export const mockSummary: DashboardSummary = {
  totalNetworkFlows: 8420000,
  totalFusionAlerts: 1247,
  topThreat: "SQL Injection",
  flowChangePercent: 12.6,
  alertChangePercent: 23.8,
  classifiedAttackChangePercent: 15.3,
};

export const mockModelStatus: ModelStatus[] = [
  { name: "AI1 Anomaly Detection", status: "Active", accuracy: "94.7%", lastTrained: "2026-05-18 01:05 UTC" },
  { name: "AI2A Network Classifier", status: "Active", accuracy: "93.1%", lastTrained: "2026-05-18 01:40 UTC" },
  { name: "AI2B HTTP Semantic Detector", status: "Active", accuracy: "96.3%", lastTrained: "2026-05-18 02:15 UTC" },
];

export const mockDataSourceHealth: DataSourceHealth[] = [
  { name: "Zeek Logs", status: "Healthy", eps: "1.2K/s" },
  { name: "Suricata Alerts", status: "Healthy", eps: "850/s" },
  { name: "AWS SQS", status: "Healthy", eps: "320/s" },
  { name: "Fusion Layer", status: "Healthy", eps: "280/s" },
];

export function generateMockTrafficPoint(): TrafficData {
  const inboundBase = Math.floor(Math.random() * 150) + 150;
  const isAnomalyEvent = Math.random() > 0.85;
  const inbound = isAnomalyEvent ? Math.floor(Math.random() * 600) + 500 : inboundBase;

  return {
    timestamp: new Date().toISOString(),
    flows: Math.floor(Math.random() * 500) + 1200,
    anomalies: isAnomalyEvent ? 1 : 0,
    inbound,
    outbound: Math.floor(Math.random() * 200) + 100,
    isAnomaly: isAnomalyEvent,
    isPeak: isAnomalyEvent && inbound > 850,
  };
}
