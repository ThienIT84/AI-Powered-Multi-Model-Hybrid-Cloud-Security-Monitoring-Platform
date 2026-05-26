import express from "express";
import path from "path";
import os from "os";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { generateMockAlertDTO, generateMockTrafficPoint } from "./src/mocks/securityData";

const PORT = 3000;

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  let alertCounter = 0;
  function generateAlert() {
    alertCounter++;
    return generateMockAlertDTO(alertCounter);
  }

  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket");

    const initialLogs = Array.from({ length: 15 }, () => generateAlert());
    ws.send(JSON.stringify({ type: "INITIAL_DATA", data: initialLogs }));

    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "NEW_ALERT", data: generateAlert() }));
        ws.send(JSON.stringify({
          type: "TRAFFIC_UPDATE",
          data: generateMockTrafficPoint(),
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
