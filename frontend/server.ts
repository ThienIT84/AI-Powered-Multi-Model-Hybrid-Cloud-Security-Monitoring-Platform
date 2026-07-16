import express from "express";
import path from "path";
import os from "os";
import { createServer } from "http";
import { createServer as createViteServer } from "vite";

const PORT = parseInt(process.env.PORT || "3001", 10);

async function startServer() {
  const app = express();
  const server = createServer(app);

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
