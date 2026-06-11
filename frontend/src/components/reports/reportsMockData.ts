import { AlertRecord } from "./types";

export const MOCK_IP_ALERTS: AlertRecord[] = [
  {
    id: "AL-8942",
    timestamp: "2026-06-04 12:15:34 UTC",
    sourceIp: "185.220.101.5",
    destinationService: "HTTPS",
    severity: "critical",
    attackType: "SQLi",
    country: "RU",
    riskScore: 94,
    aiSources: ["AI1", "AI2A", "Fusion Layer"],
    latency: 1.4,
    affectedAsset: "aws-prod-db-rds-01 (MySQL Customer Store)",
    mitreMapping: ["T1190 - Exploit Public-Facing Application", "T1046 - Network Service Scanning"],
    evidence: "POST /v3/api/auth/login HTTP/1.1; Host: app.secure.fcaj.internal; User-Agent: sqlmap/1.4.12; Payload: UNION SELECT ALL NULL,NULL,NULL,concat(0x7170767a71,ifnull(cast(schema_name AS CHAR),0x20))--",
    aiDecisions: {
      ai1: { label: "Anomaly Detected", confidence: 99.1 },
      ai2a: { label: "SQL Injection Probe", confidence: 98.4 },
      ai2b: { label: "SQLi Signature Active", confidence: 95.2 },
      fusion: { risk: 94, action: "AUTO_ISOLATE_IP" }
    }
  },
  {
    id: "AL-1102",
    timestamp: "2026-06-04 11:43:10 UTC",
    sourceIp: "192.168.1.20",
    destinationService: "HTTP",
    severity: "critical",
    attackType: "XSS",
    country: "VN",
    riskScore: 89,
    aiSources: ["AI1", "AI2B", "Fusion Layer"],
    latency: 1.8,
    affectedAsset: "web-gateway-k8s-pod-x92 (Customer Web Shell)",
    mitreMapping: ["T1190 - Exploit Public-Facing Application"],
    evidence: "GET /query?q=%3Cscript%3Ealert(document.cookie)%3C/script%3E HTTP/1.1; Host: internal.portal.vn",
    aiDecisions: {
      ai1: { label: "Anomaly Detected", confidence: 92.5 },
      ai2a: { label: "Normal Web Request", confidence: 12.4 },
      ai2b: { label: "XSS Injected Payload", confidence: 99.4 },
      fusion: { risk: 89, action: "DROP_AND_TRIGGER_WAF" }
    }
  },
  {
    id: "AL-3419",
    timestamp: "2026-06-04 10:29:45 UTC",
    sourceIp: "10.0.0.8",
    destinationService: "SSH",
    severity: "high",
    attackType: "Brute Force",
    country: "US",
    riskScore: 81,
    aiSources: ["AI2A", "Fusion Layer"],
    latency: 1.2,
    affectedAsset: "aws-ec2-prod-bastion (Jump-host Secure Shell)",
    mitreMapping: ["T1110 - Brute Force"],
    evidence: "SSH connection attempt failed on port 22: PAM validation error. User: root. Tried 45 credentials inside 2 seconds.",
    aiDecisions: {
      ai1: { label: "Marginal Anomaly", confidence: 54.0 },
      ai2a: { label: "Brute Force Attack Detected", confidence: 97.6 },
      ai2b: { label: "Normal Path", confidence: 4.1 },
      fusion: { risk: 81, action: "RATE_LIMIT_IP" }
    }
  },
  {
    id: "AL-5892",
    timestamp: "2026-06-04 09:12:03 UTC",
    sourceIp: "45.122.90.15",
    destinationService: "DNS",
    severity: "medium",
    attackType: "Port Scan",
    country: "DE",
    riskScore: 56,
    aiSources: ["AI1", "AI2A"],
    latency: 2.1,
    affectedAsset: "dns-primary-bind9 (Core Domain Resolver)",
    mitreMapping: ["T1046 - Network Service Scanning"],
    evidence: "Rapid sequential port sweeps on UDP/53 & TCP/53. Found 12 closed ports within a duration of 350-miliseconds",
    aiDecisions: {
      ai1: { label: "Anomaly Detected", confidence: 85.3 },
      ai2a: { label: "Port Sweep Signatures", confidence: 88.0 },
      ai2b: { label: "Normal Service Usage", confidence: 21.0 },
      fusion: { risk: 56, action: "LOG_EVENT_SOC" }
    }
  },
  {
    id: "AL-7712",
    timestamp: "2026-06-04 08:35:59 UTC",
    sourceIp: "109.231.42.110",
    destinationService: "HTTPS",
    severity: "high",
    attackType: "DoS",
    country: "CN",
    riskScore: 78,
    aiSources: ["AI1", "AI2A", "Fusion Layer"],
    latency: 1.5,
    affectedAsset: "alb-external-ingress (Application Load Balancer)",
    mitreMapping: ["T1498 - Network Denial of Service"],
    evidence: "TCP flood incoming with spoofed window values. Packets/sec: 14,000. Aggregated volume: 1.2Gbps",
    aiDecisions: {
      ai1: { label: "High Anomaly Spike", confidence: 98.7 },
      ai2a: { label: "Denial of Service Signature", confidence: 96.0 },
      ai2b: { label: "Normal Web Request", confidence: 2.0 },
      fusion: { risk: 78, action: "ROUTE_TO_DDoS_SCRUBBER" }
    }
  },
  {
    id: "AL-2294",
    timestamp: "2026-06-04 07:04:15 UTC",
    sourceIp: "123.4.15.22",
    destinationService: "HTTP",
    severity: "medium",
    attackType: "Unknown Anomaly",
    country: "VN",
    riskScore: 64,
    aiSources: ["AI1", "Fusion Layer"],
    latency: 1.9,
    affectedAsset: "aws-prod-s3-compliance-bucket",
    mitreMapping: ["T1083 - File and Directory Discovery"],
    evidence: "Suspicious continuous headers query without API keys. Out-of-bounds binary payloads detected on endpoint API logs.",
    aiDecisions: {
      ai1: { label: "High Anomaly Spike", confidence: 89.2 },
      ai2a: { label: "Classifier Abstained", confidence: 100.0 },
      ai2b: { label: "Web Scan Signature", confidence: 35.0 },
      fusion: { risk: 64, action: "FLAG_TO_ENGINEER" }
    }
  },
  {
    id: "AL-1941",
    timestamp: "2026-06-03 14:22:11 UTC",
    sourceIp: "55.190.22.45",
    destinationService: "FTP",
    severity: "low",
    attackType: "Port Scan",
    country: "US",
    riskScore: 35,
    aiSources: ["AI2A"],
    latency: 2.5,
    affectedAsset: "aws-ftp-backup-sever",
    mitreMapping: ["T1046 - Network Service Scanning"],
    evidence: "Sequential probe of port 21, 20. Host responded with Connection Refused.",
    aiDecisions: {
      ai1: { label: "No Anomaly Detected", confidence: 15.0 },
      ai2a: { label: "Port Sweep Signatures", confidence: 64.0 },
      ai2b: { label: "Normal Path", confidence: 2.0 },
      fusion: { risk: 35, action: "LOG_ONLY" }
    }
  }
];

export const THREAT_DISTRIBUTION_DATA = [
  { name: "XSS", value: 3412, color: "#f43f5e" },
  { name: "SQLi", value: 2125, color: "#22d3ee" },
  { name: "Port Scan", value: 1890, color: "#eab308" },
  { name: "DoS", value: 2845, color: "#3b82f6" },
  { name: "Brute Force", value: 1621, color: "#a855f7" },
  { name: "Unknown Anomaly", value: 650, color: "#10b981" }
];

export const ALERT_TREND_DATA = [
  { time: "00:00", total: 420, critical: 15, high: 60 },
  { time: "04:00", total: 380, critical: 10, high: 45 },
  { time: "08:00", total: 610, critical: 45, high: 120 },
  { time: "12:00", total: 950, critical: 80, high: 230 },
  { time: "16:00", total: 1120, critical: 110, high: 290 },
  { time: "20:00", total: 840, critical: 50, high: 180 },
  { time: "24:00", total: 540, critical: 25, high: 90 }
];

export const DESTINATION_SERVICES_DATA = [
  { name: "HTTP", count: 4890, fill: "#22d3ee" },
  { name: "HTTPS", count: 3201, fill: "#3b82f6" },
  { name: "DNS", count: 1845, fill: "#10b981" },
  { name: "SSH", count: 911, fill: "#a855f7" },
  { name: "FTP", count: 652, fill: "#f43f5e" }
];

export const ANOMALY_SCORE_HISTOGRAM = [
  { scoreRange: "0.0 - 0.2", count: 35412, fill: "#10b981" },
  { scoreRange: "0.2 - 0.4", count: 12104, fill: "#3b82f6" },
  { scoreRange: "0.4 - 0.6", count: 2841, fill: "#eab308" },
  { scoreRange: "0.6 - 0.8", count: 1450, fill: "#f97316" },
  { scoreRange: "0.8 - 1.0", count: 981, fill: "#ef4444" }
];

export const CONFUSION_MATRIX = [
  { actual: "Normal", predNormal: 98.4, predPortScan: 0.8, predDoS: 0.2, predBruteForce: 0.5, predBotnet: 0.1 },
  { actual: "Port Scan", predNormal: 1.2, predPortScan: 97.6, predDoS: 0.5, predBruteForce: 0.3, predBotnet: 0.4 },
  { actual: "DoS", predNormal: 0.5, predPortScan: 1.0, predDoS: 98.1, predBruteForce: 0.1, predBotnet: 0.3 },
  { actual: "Brute Force", predNormal: 0.7, predPortScan: 0.2, predDoS: 0.1, predBruteForce: 98.8, predBotnet: 0.2 },
  { actual: "Botnet", predNormal: 0.9, predPortScan: 1.5, predDoS: 0.4, predBruteForce: 0.2, predBotnet: 97.0 }
];

export const LAB_VS_PUBLIC_DATASET = [
  { metric: "Port Scan (PSI)", lab: 0.04, public: 0.18 },
  { metric: "XSS Detection (F1)", lab: 98.9, public: 92.4 },
  { metric: "MySQLi Detection (F1)", lab: 99.4, public: 91.1 },
  { metric: "Botnet Classifier (Recall)", lab: 97.5, public: 89.6 },
  { metric: "Average Drift", lab: 0.02, public: 0.14 }
];
