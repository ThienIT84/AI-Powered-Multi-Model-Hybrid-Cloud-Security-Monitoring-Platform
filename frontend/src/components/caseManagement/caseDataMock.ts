import { Case } from "./caseTypes";

export const INITIAL_CASES: Case[] = [
  {
    id: "CASE-2026-6081",
    title: "SQL Injection Footprint Detected on Core Auth Gateway",
    severity: "Critical",
    status: "In Progress",
    assignedTo: "Sarah Smith",
    timestamp: "2026-06-08T08:15:30Z",
    source_ip: "192.168.4.112",
    destination_ip: "10.0.12.15",
    attack_type: "SQL Injection (SQLi) Attempt",
    
    zeek: {
      conn_log: [
        "2026-06-08T08:15:30Z - conn_state: SF, resp_bytes: 4051, duration: 0.12s",
        "2026-06-08T08:15:31Z - conn_state: SF, resp_bytes: 3824, duration: 0.08s"
      ],
      http_log: [
        "METHOD: POST | URI: /api/v1/auth/gateway",
        "USER_AGENT: Mozilla/5.0 (PentestBot/1.0) | STATUS: 200",
        "PAYLOAD: admin' UNION SELECT NULL, username, password FROM users--"
      ],
      flows: 142
    },

    detection: {
      ai1: { label: "ANOMALY", score: 0.98 },
      ai2a: { class: "Web SQL Injection Attempt", confidence: 97 },
      ai2b: { class: "SQL Injection String Pattern Detected", confidence: 95 }
    },

    suricata: {
      signatures: [
        "SID: 2010915 - WEB-ATTACKS SQL injection attempt detected relative to auth DB",
        "SID: 2021154 - SQL injection - UNION SELECT command string detected"
      ]
    },

    timeline: {
      events: [
        "2026-06-08T08:15:30Z - Zeek http.log parsed SQL injection pattern at L7 boundary.",
        "2026-06-08T08:15:32Z - Suricata rule match SID 2010915 signature fired.",
        "2026-06-08T08:15:35Z - Fusion consensus scored threat with 97% confidence.",
        "2026-06-08T08:30:00Z - Case claimed and assigned to analyst Sarah Smith."
      ]
    },
    
    comments: [
      {
        id: "comm-1",
        author: "Sarah Smith",
        timestamp: "2026-06-08T09:00:00Z",
        text: "Checked source IP geolocation; looks like it belongs to a public VPN server provider."
      }
    ],
    notes: "Investigating potential leak of authentication tables. Rotate JWT keys if credential verification fails or user claims represent system accounts.",
    isIpBlocked: false
  },
  {
    id: "CASE-2026-6082",
    title: "Suspicious Large Exfiltration Payload to External Cloud Host",
    severity: "Critical",
    status: "Open",
    assignedTo: undefined,
    timestamp: "2026-06-08T09:20:00Z",
    source_ip: "10.0.12.80",
    destination_ip: "198.51.100.42",
    attack_type: "Data Exfiltration Over Network",

    zeek: {
      conn_log: [
        "2026-06-08T09:18:22Z - CONNECT 198.51.100.42:8080 SF",
        "2026-06-08T09:20:00Z - Transfer complete. Orig_bytes: 147820542, Resp_bytes: 45012, Duration: 125.4s"
      ],
      flows: 12
    },

    detection: {
      ai1: { label: "ANOMALY", score: 0.94 },
      ai2a: { class: "Data Egress Abnormality", confidence: 89 }
    },

    suricata: {
      signatures: [
        "SID: 2001880 - EXFILTRATION High volume data outbound transfers detected"
      ]
    },

    timeline: {
      events: [
        "2026-06-08T09:20:00Z - Zeek conn.log spotted unusual 147MB upload stream to unclassified foreign destination.",
        "2026-06-08T09:20:05Z - Outbound data exfiltration heuristics matches confidence factor 94."
      ]
    },

    comments: [],
    notes: "Unassigned high-risk data egress ticket. Requires rapid firewall rule enactment. No active analyst claim yet.",
    isIpBlocked: false
  },
  {
    id: "CASE-2026-6083",
    title: "Brute Force Authentication Spray Against Internal Domain Controller",
    severity: "High",
    status: "In Progress",
    assignedTo: "John Doe",
    timestamp: "2026-06-08T07:40:00Z",
    source_ip: "192.168.1.45",
    destination_ip: "10.0.1.2",
    attack_type: "Brute Force Authentication",

    zeek: {
      conn_log: [
        "2026-06-08T07:38:00Z - RDP port 3389 auth sequence initiated",
        "2026-06-08T07:40:00Z - Failed logins: 284 attempts | Last User: Administrator"
      ],
      flows: 284
    },

    detection: {
      ai1: { label: "ANOMALY", score: 0.81 },
      ai2a: { class: "Host Account Sprayer Anomaly", confidence: 82 }
    },

    suricata: {
      signatures: [
        "SID: 2003824 - BRUTE FORCE Multiple failed authentication attempts logged on domain host"
      ]
    },

    timeline: {
      events: [
        "2026-06-08T07:40:00Z - High-frequency credential failure audit detected by internal directory collectors.",
        "2026-06-08T08:00:00Z - john.doe (Analyst) assigned for diagnostic query."
      ]
    },

    comments: [
      {
        id: "comm-2",
        author: "John Doe",
        timestamp: "2026-06-08T08:05:00Z",
        text: "Confirmed that the local threshold trigger worked and blocked the IP from spawning further sessions."
      }
    ],
    notes: "Over 200 failed logon events. Active lockout policy has triggered, preventing domain compromise.",
    isIpBlocked: true
  },
  {
    id: "CASE-2026-6084",
    title: "Cross-Site Scripting (XSS) Footprints on User Profile Fields",
    severity: "Medium",
    status: "Resolved",
    assignedTo: "Emily Wilson",
    timestamp: "2026-06-07T14:30:00Z",
    source_ip: "192.168.99.10",
    destination_ip: "10.0.84.5",
    attack_type: "Cross-Site Scripting (XSS)",

    zeek: {
      conn_log: [
        "2026-06-07T14:29:55Z - HTTP port 80 handshake complete"
      ],
      http_log: [
        "METHOD: GET | URI: /profiles/view?user=<script>alert(document.cookie)</script>",
        "USER_AGENT: Chrome/104.0 | STATUS: 200 OK"
      ],
      flows: 48
    },

    detection: {
      ai1: { label: "ANOMALY", score: 0.62 },
      ai2a: { class: "Web Script Invalidation Profile", confidence: 75 }
    },

    suricata: {
      signatures: [
        "SID: 2018814 - WEB-ATTACKS XSS payload captured in GET request query strings"
      ]
    },

    timeline: {
      events: [
        "2026-06-07T14:30:00Z - L7 parser flags malicious JavaScript structure injection.",
        "2026-06-07T15:00:00Z - Claimed and evaluated by analyst Emily Wilson.",
        "2026-06-07T17:15:00Z - Input sanitization filters updated on public frontend gateway. Resolved."
      ]
    },

    comments: [],
    notes: "XSS attempts was safely mitigated by our gateway's WAF layer which substituted script tokens. Resolved case.",
    isIpBlocked: false
  }
];
