import { GraphColors } from "./types";

export const anomalyTimeline = [
  { hour: "00:00", anomalies: 140 },
  { hour: "02:00", anomalies: 120 },
  { hour: "04:00", anomalies: 180 },
  { hour: "06:00", anomalies: 320 },
  { hour: "08:00", anomalies: 512 },
  { hour: "10:00", anomalies: 410 },
  { hour: "12:00", anomalies: 380 },
  { hour: "14:00", anomalies: 490 },
  { hour: "16:00", anomalies: 540 },
  { hour: "18:00", anomalies: 470 },
  { hour: "20:00", anomalies: 310 },
  { hour: "22:00", anomalies: 210 }
];

export const anomalyScoreDistribution = [
  { score: "0.0-0.2 (Normal)", count: 42000 },
  { score: "0.2-0.4 (Trace)", count: 2500 },
  { score: "0.4-0.6 (Warning)", count: 810 },
  { score: "0.6-0.8 (Anom L1)", count: 340 },
  { score: "0.8-1.0 (Anom L2)", count: 180 }
];

export const anomalousServices = [
  { service: "HTTP", anomalies: 1240 },
  { service: "SSH", anomalies: 842 },
  { service: "DNS", anomalies: 512 },
  { service: "FTP", anomalies: 182 },
  { service: "SMTP", anomalies: 91 }
];

export const getAi2aDistribution = (colors: GraphColors) => [
  { name: "Normal", value: 43210, color: colors.emerald },
  { name: "Port Scan", value: 3120, color: colors.cyan },
  { name: "DoS", value: 1480, color: colors.red },
  { name: "Brute Force", value: 890, color: colors.amber },
  { name: "Botnet C2", value: 412, color: colors.violet }
];

export const ai2aConfidenceDist = [
  { bucket: ">90% Conf", count: 47210 },
  { bucket: "80-90% Conf", count: 1240 },
  { bucket: "70-80% Conf", count: 542 },
  { bucket: "<70% Conf", count: 120 }
];

export const labelsList = ["Normal", "Port Scan", "DoS", "Brute Force", "Botnet"];

export const matrixData = [
  [99.7, 0.1, 0.1, 0.1, 0.0],  // True Normal
  [0.8, 98.4, 0.5, 0.3, 0.0],  // True Port Scan
  [0.4, 0.3, 99.1, 0.2, 0.0],  // True DoS
  [1.1, 0.9, 0.2, 97.5, 0.3],  // True Brute Force
  [0.5, 0.8, 0.0, 1.4, 97.3]   // True Botnet
];

export const getAi2bDistribution = (colors: GraphColors) => [
  { name: "Normal", value: 29061, color: colors.emerald },
  { name: "Cross-Site Scripting (XSS)", value: 1120, color: colors.red },
  { name: "SQL Injection (SQLi)", value: 842, color: colors.cyan },
  { name: "Command Injection", value: 310, color: colors.amber },
  { name: "Path Traversal", value: 190, color: colors.violet }
];

export const fusionSources = [
  { name: "AI1 Only (Anomaly)", count: 210 },
  { name: "AI2A Only (Network Classifier)", count: 480 },
  { name: "AI2B Only (HTTP Semantic)", count: 540 },
  { name: "AI + Suricata Signature", count: 1812 },
  { name: "Multi-Source Ensemble", count: 2370 }
];

export const ai2aSHAP = [
  { feature: "duration", weight: 0.32 },
  { feature: "orig_bytes", weight: 0.28 },
  { feature: "resp_bytes", weight: 0.24 },
  { feature: "packet_rate", weight: 0.18 },
  { feature: "service", weight: 0.12 }
];

export const ai2bSHAP = [
  { feature: "uri_length", weight: 0.42 },
  { feature: "entropy", weight: 0.38 },
  { feature: "has_script", weight: 0.35 },
  { feature: "has_alert", weight: 0.29 },
  { feature: "special_char_ratio", weight: 0.21 }
];
