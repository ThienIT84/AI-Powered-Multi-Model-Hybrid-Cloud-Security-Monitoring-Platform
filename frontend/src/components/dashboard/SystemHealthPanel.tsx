import React, { useState, useEffect } from "react";
import { 
  Wifi, 
  Database, 
  Cpu, 
  Clock, 
  Activity, 
  Server, 
  RefreshCw,
  Layers,
  CheckCircle,
  Network
} from "lucide-react";

interface SystemHealthPanelProps {
  isConnected: boolean;
}

export function SystemHealthPanel({ isConnected }: SystemHealthPanelProps) {
  const [time, setTime] = useState(new Date());
  const [env, setEnv] = useState<"Production" | "Staging" | "Lab">("Production");

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // System sub-states
  const sqsStatus: "Healthy" | "Warning" | "Offline" = isConnected ? "Healthy" : "Offline";
  const dbStatus: "Connected" | "Degraded" = isConnected ? "Connected" : "Connected"; // Stay connected or degrade gracefully

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Environment Profile */}
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/10 p-2.5 rounded-lg border border-cyan-500/15">
            <Layers className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-foreground tracking-wider uppercase font-mono">HYBRID SOC COMMAND CENTER</h2>
              <span className="px-2 py-0.5 text-[8px] font-black tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded">
                SEC_OPS v3.0
              </span>
            </div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono mt-0.5">
              ZEEK TELEMETRY & MULTI-MODEL AI RECONSTRUCT
            </p>
          </div>
        </div>

        {/* Live Connectivity Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-secondary/15 p-2 rounded-lg border border-border/40">
          
          {/* WebSocket Status */}
          <div className="flex items-center gap-2 px-2 py-1 bg-background/50 border border-border/40 rounded">
            <Wifi className={`w-3.5 h-3.5 ${isConnected ? "text-cyan-500 animate-pulse" : "text-red-500"}`} />
            <div className="leading-none">
              <span className="text-[7.5px] font-black text-muted-foreground block uppercase">WEBSOCKET</span>
              <span className="text-[9px] font-bold font-mono uppercase text-foreground">
                {isConnected ? "CONNECTED" : "DISCONNECTED"}
              </span>
            </div>
          </div>

          {/* AWS SQS Status */}
          <div className="flex items-center gap-2 px-2 py-1 bg-background/50 border border-border/40 rounded">
            <Network className={`w-3.5 h-3.5 ${sqsStatus === "Healthy" ? "text-cyan-500" : "text-amber-500 animate-bounce"}`} />
            <div className="leading-none">
              <span className="text-[7.5px] font-black text-muted-foreground block uppercase">AWS SQS</span>
              <span className="text-[9px] font-bold font-mono uppercase text-foreground">
                {sqsStatus}
              </span>
            </div>
          </div>

          {/* Database Status */}
          <div className="flex items-center gap-2 px-2 py-1 bg-background/50 border border-border/40 rounded">
            <Database className="w-3.5 h-3.5 text-cyan-500" />
            <div className="leading-none">
              <span className="text-[7.5px] font-black text-muted-foreground block uppercase">DATABASE</span>
              <span className="text-[9px] font-bold font-mono uppercase text-foreground">
                {dbStatus}
              </span>
            </div>
          </div>

          {/* Current Env */}
          <div className="flex items-center gap-2 px-2 py-1 bg-background/50 border border-border/40 rounded">
            <Server className="w-3.5 h-3.5 text-purple-500" />
            <div className="leading-none">
              <span className="text-[7.5px] font-black text-muted-foreground block uppercase">PROFILE</span>
              <select 
                value={env} 
                onChange={(e) => setEnv(e.target.value as any)}
                className="bg-transparent border-none p-0 text-[10px] text-foreground font-black uppercase tracking-wider font-mono focus:ring-0 cursor-pointer"
              >
                <option value="Production" className="bg-card">PROD</option>
                <option value="Staging" className="bg-card">STAGING</option>
                <option value="Lab" className="bg-card">LAB</option>
              </select>
            </div>
          </div>

        </div>

        {/* Current Time Widget */}
        <div className="flex items-center gap-3 bg-muted/20 px-3 py-2 rounded-lg border border-border select-none shrink-0 font-mono">
          <Clock className="w-4 h-4 text-cyan-500 animate-pulse" />
          <div className="text-right leading-none">
             <div className="text-xs font-black text-foreground">
               {time.toISOString().slice(0, 19).replace("T", " ")}
             </div>
             <div className="text-[7.5px] text-muted-foreground uppercase font-black tracking-widest mt-1">
               UTC TIMEZONE • LIVE COORDINATOR
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SystemHealthPanel;
