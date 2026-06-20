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

  // Middleware
  app.use(express.json({ limit: "256kb" }));
  const clients: Set<WebSocket> = new Set();

  let mockAlertCounter = 0;
  const nextMockAlert = () => generateMockAlertDTO(++mockAlertCounter);

  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket");
    clients.add(ws);

    const initialLogs = Array.from({ length: 35 }, () => nextMockAlert());
    ws.send(JSON.stringify({ type: "INITIAL_DATA", data: initialLogs }));

    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "NEW_ALERT", data: nextMockAlert() }));

        ws.send(JSON.stringify({
          type: "TRAFFIC_UPDATE",
          data: generateMockTrafficPoint()
        }));
      }
    }, 2000);

    ws.on("close", () => {
      clearInterval(interval);
      clients.delete(ws);
    });
  });

  // API endpoint to receive SOC logs (e.g. from a Python script)
  app.post("/api/soc-logs", (req: import("express").Request, res: import("express").Response) => {
    const apiKey = process.env.SOC_LOGS_API_KEY;

    // In production, require an API key (deny-by-default if not configured)
    if (process.env.NODE_ENV === "production") {
      const providedKey = req.header("x-api-key");
      if (!apiKey || providedKey !== apiKey) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
    }

    const body = (req.body ?? {}) as Record<string, any>;

    // Normalize common snake_case/camelCase variants to the shape expected by the frontend mapper
    const normalized = {
      ...body,
      id: body.id ?? `API-${Date.now()}`,
      timestamp: body.timestamp ?? new Date().toISOString(),
      sourceIp: body.sourceIp ?? body.source_ip ?? "unknown",
      destIp: body.destIp ?? body.dest_ip ?? body.destinationIp ?? body.destination_ip ?? "unknown",
      destPort: body.destPort ?? body.dest_port ?? body.destinationPort ?? body.destination_port ?? 0,
      attackType: body.attackType ?? body.attack_type ?? "Unknown",
      severity: body.severity ?? body.severity_level ?? "Medium",
      payload: body.payload ?? body.raw_payload ?? body.rawPayload ?? "",
      rawPayload: body.rawPayload ?? body.raw_payload ?? body.payload ?? "",
    };

    // Best-effort logging (avoid dumping entire payloads to logs)
    console.log(
      `Received SOC log: ${normalized.sourceIp} -> ${normalized.destIp} (${normalized.attackType})`
    );

    // Broadcast data to all WebSocket clients
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "NEW_ALERT",
            data: normalized,
          })
        );
      }
    });

    return res.json({ success: true, message: "Log received successfully" });
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
