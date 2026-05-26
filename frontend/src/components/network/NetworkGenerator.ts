import { NetworkLog, Severity } from "../network/NetworkConfig";

const SRC_IPS = [
  "192.168.1.45",
  "192.168.1.109",
  "10.0.12.3",
  "10.0.12.24",
  "192.168.2.14",
  "192.168.1.15",
  "10.0.4.52",
  "192.168.1.18",
  "172.16.5.90",
  "172.16.5.112",
  "10.0.10.100",
  "192.168.8.85"
];

const DEST_IPS_MAP = [
  { ip: "8.8.8.8", country: "US", flag: "🇺🇸", as: "Google LLC" },
  { ip: "142.250.64.46", country: "US", flag: "🇺🇸", as: "Google LLC" },
  { ip: "34.120.177.200", country: "US", flag: "🇺🇸", as: "Google Cloud" },
  { ip: "13.224.29.89", country: "SG", flag: "🇸🇬", as: "Amazon Cloudfront" },
  { ip: "185.220.101.5", country: "NL", flag: "🇳🇱", as: "Tor Exit Node Relay" },
  { ip: "104.244.42.1", country: "US", flag: "🇺🇸", as: "Twitter Inc." },
  { ip: "172.217.16.142", country: "SG", flag: "🇸🇬", as: "Google Inc" },
  { ip: "23.21.224.150", country: "UA", flag: "🇺🇦", as: "Host Pro Service" },
  { ip: "45.227.254.12", country: "CN", flag: "🇨🇳", as: "Chinonet Telecom" },
  { ip: "91.198.174.192", country: "RU", flag: "🇷🇺", as: "Clover Intermedia" },
  { ip: "77.247.110.120", country: "DE", flag: "🇩🇪", as: "Herausgeber Gmbh" }
];

const PORTS = [443, 80, 53, 22, 8080, 3389, 9001];
const PROTOCOLS: ("TCP" | "UDP" | "ICMP")[] = ["TCP", "UDP", "ICMP"];

export const getMockPayloadDescription = (log: NetworkLog): string => {
  if (log.verdict === "ANOMALY") {
    if (log.destPort === 22) {
      return `[SECV_ALRT] Reconnaissance: SSH brute-forcing attack detected. Detected 45 continuous auth retries from source IP. Severity matched ${log.severity}.`;
    }
    if (log.destPort === 53) {
      return `[EXFL_ALRT] DNS Tunnel Injection: Suspicious outbound payload hidden within TXT query payload frames. Total bytes: ${log.origBytes.toLocaleString()}.`;
    }
    if (log.destPort === 9001) {
      return `[COMM_ALRT] TOR Proxy relay exchange requested with classified dark node [${log.destIp}]. Tunnel secured outside local core firewall rules.`;
    }
    if (log.origBytes > 50000000) {
      return `[DATA_LEAK] Critical Exfiltration Event: Gigantic payload size outbound to suspect hosting server. Encrypted split boundaries observed.`;
    }
    return `[HEUR_DETEC] AI Cognitive Model matched payload anomaly footprint. Unsigned reverse shell payload or socket pooling attempt. Confidence: ${log.confidence.toFixed(1)}%.`;
  }

  if (log.destPort === 443) return "Standard SSL/TLS 1.3 encrypted secure application socket communications stream (HTTPS).";
  if (log.destPort === 80) return "Plaintext HTTP-1/1 transaction stream. Standard user-agent headers with session details.";
  if (log.destPort === 53) return "Domain Name System (UDP Resolver) query exchange for system service endpoints routing.";
  return "Local area ICMP Echo Telemetry / Ping status diagnostics payload loop.";
};

export const getMockHexDump = (log: NetworkLog): string => {
  const isAnomaly = log.verdict === "ANOMALY";
  const bytes: string[] = [];

  if (isAnomaly) {
    bytes.push("1f", "8b", "08", "00"); // Gzip archive header
    if (log.destPort === 22) {
      // "root:adminPassWD"
      bytes.push("72", "6f", "6f", "74", "3a", "61", "64", "6d", "69", "6e", "50", "61", "73", "73", "57", "44");
    } else if (log.destPort === 53) {
      // "dns_t_u_n_n_e_l"
      bytes.push("64", "6e", "73", "5f", "74", "75", "6e", "6e", "65", "6c", "5f", "61", "6c", "65", "72", "74");
    } else {
      // "cmd.exe --reverse"
      bytes.push("63", "6d", "64", "2e", "65", "78", "65", "20", "2d", "2d", "72", "65", "76", "65", "72", "73");
    }
  } else {
    // Normal packet header (IPv4 standard structure)
    bytes.push("45", "00", "00", "28", "1a", "2f", "40", "00", "40", "06", "7c", "cd", "0a", "00", "0c", "03");
  }

  while (bytes.length < 48) {
    const val = Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
    bytes.push(val);
  }

  const rows: string[] = [];
  for (let i = 0; i < bytes.length; i += 16) {
    const offset = (i).toString(16).padStart(4, "0").toUpperCase();
    const chunk = bytes.slice(i, i + 16);
    const hexSlice = chunk.join(" ");
    const asciiSlice = chunk.map(h => {
      const code = parseInt(h, 16);
      return (code >= 32 && code <= 126) ? String.fromCharCode(code) : ".";
    }).join("");
    rows.push(`${offset}  ${hexSlice.padEnd(47, " ")}  |${asciiSlice}|`);
  }
  return rows.join("\n");
};

export const generateRandomLog = (isForceAnomaly = false): NetworkLog => {
  const protocol = PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)];
  const srcIp = SRC_IPS[Math.floor(Math.random() * SRC_IPS.length)];
  const destItem = DEST_IPS_MAP[Math.floor(Math.random() * DEST_IPS_MAP.length)];
  const destIp = destItem.ip;
  const country = destItem.country;

  const srcPort = Math.floor(Math.random() * 60000) + 1024;
  let destPort = PORTS[Math.floor(Math.random() * PORTS.length)];
  if (protocol === "ICMP") {
    destPort = 0;
  }

  const isAnomaly = isForceAnomaly || Math.random() < 0.12;
  const origBytes = isAnomaly
    ? Math.floor(Math.random() * 85000000) + 8000000 // 8M to 93M bytes
    : Math.floor(Math.random() * 85000) + 64; // 64B to 85KB bytes
  const respPkts = isAnomaly
    ? Math.floor(Math.random() * 3200) + 300
    : Math.floor(Math.random() * 45) + 2;

  // Let's refine the threat score & severity mapping
  let threatScore = 0;
  let severity: Severity = "INFO";
  let confidence = 0;
  let reason = "Routine stream packet exchange verified successful.";

  if (isAnomaly) {
    threatScore = Math.floor(Math.random() * 40) + 61; // 61-100
    confidence = Math.floor(Math.random() * 20) + 79; // 79-99%

    if (threatScore >= 90) {
      severity = "CRITICAL";
      reason = "Critical attack signatures identified: Direct remote code exfiltration pipeline open.";
    } else if (threatScore >= 80) {
      severity = "HIGH";
      reason = "Severe behavior mismatch: Network-wide anomalous host probe sequences flagged.";
    } else {
      severity = "MEDIUM";
      reason = "Medium warning: Port reconnaissance scanners identified matching attack heuristics.";
    }
  } else {
    threatScore = Math.floor(Math.random() * 15) + 1; // 1-15
    confidence = Math.floor(Math.random() * 10) + 90; // high confidence it is normal
    
    if (origBytes > 50000) {
      severity = "LOW";
      reason = "Unusually larger size normal volume session. Verified secure SSL connection.";
    } else {
      severity = "INFO";
      reason = "System handshake stream established and monitored.";
    }
  }

  const now = new Date();
  const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`;

  const duration = isAnomaly ? Math.floor(Math.random() * 120000) + 20000 : Math.floor(Math.random() * 5000) + 100;

  const partialLog: Omit<NetworkLog, "hexDump" | "reason"> = {
    id: `flow_${Math.random().toString(36).substring(2, 11)}`,
    timestamp,
    srcIp,
    srcPort,
    destIp,
    destPort,
    protocol,
    origBytes,
    respPkts,
    verdict: isAnomaly ? "ANOMALY" : "NORMAL",
    severity,
    threatScore,
    confidence,
    country,
    duration
  };

  const finalLog: NetworkLog = {
    ...partialLog,
    reason,
    hexDump: ""
  };
  finalLog.hexDump = getMockHexDump(finalLog);
  return finalLog;
};

export const generateInitialLogsList = (count = 50): NetworkLog[] => {
  const result: NetworkLog[] = [];
  for (let i = 0; i < count; i++) {
    result.push(generateRandomLog(i < 8)); // inject 8 anomalies at the start
  }
  return result;
};
