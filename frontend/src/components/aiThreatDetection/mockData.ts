import { ThreatEvent } from "./types";

export const PRESEEDED_THREAT_EVENTS: ThreatEvent[] = [
  {
    id: "evt-001",
    timestamp: "08:44:12",
    src_ip: "203.0.113.82",
    dst_ip: "10.0.4.1",
    attack_type: "SQLi",
    severity: "Critical",
    confidence: 97,
    pipeline: {
      zeek: true,
      ai1: 88,
      ai2a: "SQL Injection Probe",
      ai2b: "Malicious SQL Payload Detected",
      fusion_score: 97
    },
    mitre: "T1190" // Exploit Public-Facing Application
  },
  {
    id: "evt-002",
    timestamp: "08:42:55",
    src_ip: "185.220.101.44",
    dst_ip: "10.0.2.115",
    attack_type: "Port Scan",
    severity: "High",
    confidence: 94,
    pipeline: {
      zeek: true,
      ai1: 96,
      ai2a: "TCP Port Scanning Pattern",
      ai2b: "Clean",
      fusion_score: 94
    },
    mitre: "T1595" // Active Scanning
  },
  {
    id: "evt-003",
    timestamp: "08:39:18",
    src_ip: "84.22.109.11",
    dst_ip: "10.0.1.10",
    attack_type: "DoS",
    severity: "Critical",
    confidence: 99,
    pipeline: {
      zeek: true,
      ai1: 99,
      ai2a: "SYN Flood DoS attack",
      ai2b: "Clean",
      fusion_score: 99
    },
    mitre: "T1498" // Network Denial of Service
  },
  {
    id: "evt-004",
    timestamp: "08:35:04",
    src_ip: "192.168.4.15",
    dst_ip: "10.0.2.55",
    attack_type: "XSS",
    severity: "High",
    confidence: 92,
    pipeline: {
      zeek: true,
      ai1: 45,
      ai2a: "Cross-Site Scripting Probe",
      ai2b: "Malicious Javascript Script Tag Detected",
      fusion_score: 92
    },
    mitre: "T1190" // Exploit Public-Facing Application
  },
  {
    id: "evt-005",
    timestamp: "08:29:41",
    src_ip: "45.124.89.2",
    dst_ip: "10.0.3.18",
    attack_type: "Botnet",
    severity: "High",
    confidence: 89,
    pipeline: {
      zeek: true,
      ai1: 91,
      ai2a: "Botnet Command and Control Beacon",
      ai2b: "Suspicious HTTP Header Format",
      fusion_score: 89
    },
    mitre: "T1071" // Application Layer Protocol (C2)
  },
  {
    id: "evt-006",
    timestamp: "08:22:15",
    src_ip: "10.100.1.4",
    dst_ip: "198.51.100.22",
    attack_type: "Brute Force",
    severity: "Medium",
    confidence: 85,
    pipeline: {
      zeek: true,
      ai1: 72,
      ai2a: "SSH credential stuffing attempt",
      ai2b: "Clean",
      fusion_score: 85
    },
    mitre: "T1110" // Brute Force
  }
];
