import express from "express";
import path from "path";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";

const PORT = 3000;

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  // Mock Data Generator for real-time alerts
  const attackTypes = ["DDoS", "SQL Injection", "XSS", "Brute Force", "Port Scan", "Unauthorized Access"];
  const severities = ["Critical", "High", "Medium", "Low"];
  const protocols = ["HTTP", "HTTPS", "TCP", "UDP", "SSH", "SMB"];
  const statuses = ["blocking", "investigating", "monitoring", "resolved"];

  let alertCounter = 0;
  function generateAlert() {
    alertCounter++;
    const uniqueId = `THR-${110 + (alertCounter % 900)}`;
    const sourceIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const destIp = "10.0.0.45";
    const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const riskScore = Math.floor(Math.random() * 100);
    const confidence = (0.7 + Math.random() * 0.3).toFixed(2);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
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
      zeekData: {
        duration: (Math.random() * 10).toFixed(2),
        origBytes: Math.floor(Math.random() * 50000),
        respBytes: Math.floor(Math.random() * 20000),
        connState: "SF",
      },
      suricataData: {
        signatureId: `[1:201${Math.floor(Math.random() * 1000)}:2]`,
        category: "Attempted User Privilege Gain",
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
    
    // Send initial batch of logs
    const initialLogs = Array.from({ length: 15 }, () => generateAlert());
    ws.send(JSON.stringify({ type: "INITIAL_DATA", data: initialLogs }));

    // Stream new alerts
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "NEW_ALERT", data: generateAlert() }));
        
        // Also send traffic update
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

  // Vite integration
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

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
