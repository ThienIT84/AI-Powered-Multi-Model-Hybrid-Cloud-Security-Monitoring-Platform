/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SyslogEvent, LogSource, SeverityLevel } from "../components/network/NetworkConfig";
import { randomIP } from "./networkGenerator";

const HOSTNAMES = [
  "fw-edge-01.internal",
  "k8s-prod-node-03.internal",
  "auth-auth-ldap.internal",
  "dns-root-resolver.internal",
  "edr-win-endpoint-12",
  "edr-mac-laptop-42",
  "app-web-front-02",
  "db-replica-01.internal"
];

const TEMPLATES: {
  source: LogSource;
  severity: SeverityLevel;
  category: string;
  message: string;
}[] = [
  // ZEEK
  {
    source: LogSource.ZEEK,
    severity: SeverityLevel.INFO,
    category: "connection",
    message: "connection_established: state=S1 proto=tcp, outbound handshake finished"
  },
  {
    source: LogSource.ZEEK,
    severity: SeverityLevel.WARNING,
    category: "protocol_violation",
    message: "weird: protocol_violation, dynamic port mismatch detected"
  },
  
  // SURICATA
  {
    source: LogSource.SURICATA,
    severity: SeverityLevel.ALERT,
    category: "signature_match",
    message: "ET MALWARE Suspicious TLS SNI with dynamic DNS provider"
  },
  {
    source: LogSource.SURICATA,
    severity: SeverityLevel.CRITICAL,
    category: "exploit_attempt",
    message: "ET EXPLOIT Possible CVE-2023-34362 Log4j remote code execution check triggered"
  },

  // FIREWALL
  {
    source: LogSource.FIREWALL,
    severity: SeverityLevel.INFO,
    category: "policy_allow",
    message: "rule=default-allow-outbound action=accept protocols=TCP dest_port=443"
  },
  {
    source: LogSource.FIREWALL,
    severity: SeverityLevel.WARNING,
    category: "policy_deny",
    message: "rule=deny-all-ingress action=drop protocol=TCP source=185.190.140.85 dest_port=3389"
  },

  // DNS
  {
    source: LogSource.DNS,
    severity: SeverityLevel.INFO,
    category: "query",
    message: "dns_resolve: type=AAAA name=google.com. rcode=NOERROR"
  },
  {
    source: LogSource.DNS,
    severity: SeverityLevel.WARNING,
    category: "anomalous_query",
    message: "dns_entropy_spike: sub-domain complexity suggests Potential DNS Tunneling"
  },

  // SSH
  {
    source: LogSource.SSH,
    severity: SeverityLevel.INFO,
    category: "auth",
    message: "ssh_accepted: publickey for admin_user from local net auth_ok"
  },
  {
    source: LogSource.SSH,
    severity: SeverityLevel.ALERT,
    category: "brute_force",
    message: "ssh_failure: PAM secure_host authenticating root: Password authentication failed"
  },

  // HTTP
  {
    source: LogSource.HTTP,
    severity: SeverityLevel.INFO,
    category: "request",
    message: "GET /api/v1/health status=200 size=42 time=2.5ms"
  },
  {
    source: LogSource.HTTP,
    severity: SeverityLevel.WARNING,
    category: "request_error",
    message: "GET /administrator/index.php status=404 size=2048 client=suspicious_crawler"
  },

  // TLS
  {
    source: LogSource.TLS,
    severity: SeverityLevel.INFO,
    category: "handshake",
    message: "tls_handshake: cipher_suite=ECDHE-RSA-AES128-GCM-SHA256 version=TLS1.3"
  },
  {
    source: LogSource.TLS,
    severity: SeverityLevel.WARNING,
    category: "cert_validation",
    message: "tls_invalid_cert: untrusted anchor verified, domain validation failed"
  },

  // AUTH
  {
    source: LogSource.AUTH,
    severity: SeverityLevel.INFO,
    category: "session",
    message: "session_created: user=sec-ops-user role=administrator login_via=mfa"
  },
  {
    source: LogSource.AUTH,
    severity: SeverityLevel.CRITICAL,
    category: "unauthorized",
    message: "privilege_escalation: unauthorized sudo access trigger checked by wheel group"
  },

  // IDS
  {
    source: LogSource.IDS,
    severity: SeverityLevel.ALERT,
    category: "host_intrusion",
    message: "integrity_check: critical binary checksum mismatch detected on /bin/ps"
  },

  // EDR
  {
    source: LogSource.EDR,
    severity: SeverityLevel.INFO,
    category: "process",
    message: "process_spawned: binary=/usr/bin/node pid=25102 parent=systemd"
  },
  {
    source: LogSource.EDR,
    severity: SeverityLevel.CRITICAL,
    category: "malicious_activity",
    message: "malicious_script: raw PowerShell calling dynamic WebClient file download and execute"
  }
];

// Helper to get formatted precise timestamp with milliseconds
export function getPreciseTimestamp(date = new Date()): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  const ms = String(date.getMilliseconds()).padStart(3, "0");
  return `${h}:${m}:${s}.${ms}`;
}

export function generateSyslogEvent(forcedSeverity?: SeverityLevel): SyslogEvent {
  // Determine severity first or random
  let sev = forcedSeverity;
  if (!sev) {
    const random = Math.random();
    if (random < 0.65) sev = SeverityLevel.INFO;
    else if (random < 0.88) sev = SeverityLevel.WARNING;
    else if (random < 0.97) sev = SeverityLevel.ALERT;
    else sev = SeverityLevel.CRITICAL;
  }

  // Filter templates matching this severity
  const candidates = TEMPLATES.filter((t) => t.severity === sev);
  const choice = candidates.length > 0 
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : TEMPLATES[0];

  // Inject random elements into templates to make them ultra realistic
  let finalMessage = choice.message;
  if (choice.source === LogSource.FIREWALL && finalMessage.includes("source=")) {
    finalMessage = `rule=deny-all-ingress action=drop protocol=TCP source=${randomIP()} dest_port=${Math.floor(Math.random() * 50000) + 1024}`;
  } else if (choice.source === LogSource.SSH && choice.severity === SeverityLevel.ALERT) {
    finalMessage = `ssh_failure: PAM secure_host auth_fail root from ${randomIP(false)}: connection limit threshold exceeded`;
  } else if (choice.source === LogSource.HTTP && finalMessage.includes("crawler")) {
    finalMessage = `GET /wp-admin/login.php status=403 size=125 client=${randomIP(false)} agent="Nmap Scripting Engine"`;
  }

  const host = HOSTNAMES[Math.floor(Math.random() * HOSTNAMES.length)];

  return {
    id: `syslog_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`,
    timestamp: getPreciseTimestamp(),
    source: choice.source,
    severity: sev,
    message: finalMessage,
    host,
    category: choice.category
  };
}

export function generateInitialSyslogs(count = 25): SyslogEvent[] {
  const logs: SyslogEvent[] = [];
  const baseTime = Date.now();
  for (let i = count - 1; i >= 0; i--) {
    // stagger by a random amount of milliseconds
    const offset = i * 450 + Math.floor(Math.random() * 200);
    const date = new Date(baseTime - offset);
    const log = generateSyslogEvent();
    log.timestamp = getPreciseTimestamp(date);
    logs.push(log);
  }
  return logs.reverse();
}
