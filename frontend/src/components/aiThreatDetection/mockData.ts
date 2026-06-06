import { ThreatEvent } from "./types";

export const PRESEEDED_THREAT_EVENTS: ThreatEvent[] = [
  {
    id: "evt-001",
    timestamp: "10:52:04",
    attackType: "SQL Injection",
    source: "203.0.113.82",
    destination: "10.0.4.1",
    detectionPath: "AI2B → Fusion",
    riskScore: 95,
    severity: "Critical",
    zeekEvidence: {
      logType: "http.log",
      fields: { method: "POST", uri: "/api/checkout", user_agent: "Mozilla/5.0", req_body_len: 245, payload: "' UNION SELECT username, password FROM users --" }
    },
    aiResults: {
      ai1AnomalyScore: 48,
      ai2aClassifier: { label: "Normal", prob: 91.2 },
      ai2bHttpSemantic: { label: "SQLi Attempt", prob: 98.6 }
    },
    suricataEvidence: {
      alert: "ET WEB-ACTIVE SQL UNION SELECT keyword matched",
      sid: 2018242,
      matched: true
    },
    fusionDecision: {
      consensusConfidence: 97.4,
      classificationOverride: false,
      mitreTechnique: "Exploit Public-Facing Application",
      mitreId: "T1190",
      remediationAction: "Temporarily quarantine source IP on Web Application Firewall side."
    }
  },
  {
    id: "evt-002",
    timestamp: "10:48:12",
    attackType: "TCP Port Scan",
    source: "185.220.101.44",
    destination: "10.0.2.0/24",
    detectionPath: "AI1 → AI2A → Fusion",
    riskScore: 91,
    severity: "High",
    zeekEvidence: {
      logType: "conn.log",
      fields: { duration: 0.04, proto: "tcp", orig_bytes: 40, resp_bytes: 0, conn_state: "S0", missed_bytes: 0, scan_connections: 1240 }
    },
    aiResults: {
      ai1AnomalyScore: 96.2,
      ai2aClassifier: { label: "Port Scan", prob: 98.4 },
      ai2bHttpSemantic: { label: "Normal", prob: 99.8 }
    },
    suricataEvidence: {
      alert: "None (evaded threshold alert rule patterns)",
      sid: 0,
      matched: false
    },
    fusionDecision: {
      consensusConfidence: 94.8,
      classificationOverride: true,
      mitreTechnique: "Active Scanning: IP Addresses",
      mitreId: "T1595.001",
      remediationAction: "Apply immediate temporary port 22/80 rate limiting filters on Edge Firewall."
    }
  },
  {
    id: "evt-003",
    timestamp: "10:44:19",
    attackType: "SYN Flood DoS",
    source: "84.22.109.11",
    destination: "10.0.1.10",
    detectionPath: "AI1 + AI2A + Suricata → Fusion",
    riskScore: 98,
    severity: "Critical",
    zeekEvidence: {
      logType: "conn.log",
      fields: { duration: 1.84, proto: "tcp", orig_packets: 450000, resp_packets: 0, conn_state: "S0", syn_ratio: 1.0 }
    },
    aiResults: {
      ai1AnomalyScore: 99.8,
      ai2aClassifier: { label: "DoS Flood", prob: 99.9 },
      ai2bHttpSemantic: { label: "Normal", prob: 99.7 }
    },
    suricataEvidence: {
      alert: "ET DOS TCP Syn Flood (450K syn packets detected)",
      sid: 2014882,
      matched: true
    },
    fusionDecision: {
      consensusConfidence: 99.6,
      classificationOverride: false,
      mitreTechnique: "Network Denial of Service",
      mitreId: "T1498.001",
      remediationAction: "Enable SYN cookie-based endpoint protection and route source to a blackhole."
    }
  },
  {
    id: "evt-004",
    timestamp: "10:39:55",
    attackType: "XSS Injection",
    source: "192.168.4.15",
    destination: "10.0.2.55",
    detectionPath: "AI2B → Fusion",
    riskScore: 96,
    severity: "Critical",
    zeekEvidence: {
      logType: "http.log",
      fields: { method: "GET", uri: "/index.php?query=<script>alert(document.cookie)</script>", user_agent: "Curl/7.68.0", resp_mime: "text/html" }
    },
    aiResults: {
      ai1AnomalyScore: 54.3,
      ai2aClassifier: { label: "Normal", prob: 94.1 },
      ai2bHttpSemantic: { label: "Cross-Site Scripting", prob: 97.4 }
    },
    suricataEvidence: {
      alert: "ET WEB-ACTIVE Active Javascript injection pattern within URI",
      sid: 2011142,
      matched: true
    },
    fusionDecision: {
      consensusConfidence: 96.9,
      classificationOverride: false,
      mitreTechnique: "Exploit Public-Facing Application: XSS",
      mitreId: "T1190",
      remediationAction: "Sanitize HTTP responses and flag the session token for invalidation."
    }
  },
  {
    id: "evt-005",
    timestamp: "10:31:02",
    attackType: "Botnet Beaconing",
    source: "10.0.2.14",
    destination: "8.8.4.4",
    detectionPath: "AI1 → AI2A → Fusion",
    riskScore: 89,
    severity: "High",
    zeekEvidence: {
      logType: "conn.log",
      fields: { duration: 0.01, proto: "tcp", orig_bytes: 64, resp_bytes: 128, pps: 2.1, beacons_interval: "30.00s" }
    },
    aiResults: {
      ai1AnomalyScore: 91.5,
      ai2aClassifier: { label: "Botnet C2", prob: 92.4 },
      ai2bHttpSemantic: { label: "Normal", prob: 99.8 }
    },
    suricataEvidence: {
      alert: "None (zero signatures trigger on customized IRC beacons)",
      sid: 0,
      matched: false
    },
    fusionDecision: {
      consensusConfidence: 91.2,
      classificationOverride: true,
      mitreTechnique: "Command and Control: Web Protocols",
      mitreId: "T1071.001",
      remediationAction: "Isolate local asset 10.0.2.14 immediately from external DNS routing namespaces."
    }
  }
];
