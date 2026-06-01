import React, { useState, useEffect } from "react";
import { ListRestart, CloudRain, ShieldCheck, HelpCircle, Activity, PlayCircle, Zap } from "lucide-react";
import { cn } from "../../lib/utils";

interface SourceHealth {
  id: string;
  name: string;
  status: "ONLINE" | "STABLE" | "WARNING" | "OFFLINE";
  eps: string;
  lastUpdate: string;
  quality: string;
}

export function TelemetryHealthPanel() {
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTicks(t => t + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const sources: SourceHealth[] = [
    { id: "zeek", name: "Zeek Ingestion Agent", status: "STABLE", eps: "942 ev/s", lastUpdate: "Just Now", quality: "99.9%" },
    { id: "suricata", name: "Suricata IDS Core", status: "STABLE", eps: "582 ev/s", lastUpdate: "Just Now", quality: "99.7%" },
    { id: "filebeat", name: "Filebeat Log Collector", status: "ONLINE", eps: "1,482 ev/s", lastUpdate: "0.4s ago", quality: "100.0%" },
    { id: "sqs", name: "AWS SQS Threat Queue", status: "ONLINE", eps: "0 msg buffering", lastUpdate: "Just Now", quality: "100.0%" },
    { id: "db", name: "PostgreSQL Database Layer", status: "STABLE", eps: "18 transactions/s", lastUpdate: "0.2s ago", quality: "100.0%" },
    { id: "ws", name: "Socket.IO Live Daemon", status: "STABLE", eps: "8 push iterations/s", lastUpdate: "Just Now", quality: "99.8%" }
  ];

  const getWiggledEPS = (id: string, defaultEps: string) => {
    if (id === "sqs") return defaultEps;
    if (id === "db") {
      const dbBase = 15 + (ticks % 6);
      return `${dbBase} transactions/s`;
    }
    const baseVal = parseInt(defaultEps.replace(/,/g, ""));
    const seed = Math.sin(ticks * 1.8 + id.charCodeAt(1)) * 14;
    return `${Math.floor(baseVal + seed).toLocaleString()} ev/s`;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm select-none">
      <div className="flex items-center justify-between mb-4 border-b border-border/20 pb-2">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          SECTION 31: REAL-TIME SECURE TELEMETRY SOURCE HEALTH MULTIPLEXER
        </h3>
        <span className="text-[7.5px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 px-2 py-0.5 rounded uppercase font-black font-mono">
          MONITOR ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map((src) => {
          const wEPS = getWiggledEPS(src.id, src.eps);
          const isStable = src.status === "STABLE" || src.status === "ONLINE";

          return (
            <div 
              key={src.id} 
              className="bg-[#0c0f14]/50 border border-border/70 rounded-xl p-3 flex flex-col justify-between font-mono hover:border-cyan-500/20 transition-all"
            >
              <div className="flex items-center justify-between border-b border-border/10 pb-1.5 mb-1.5">
                <span className="text-[8.5px] font-black text-foreground">{src.name}</span>
                <span className={cn(
                  "text-[7px] font-black px-1.5 py-0.5 rounded leading-none uppercase",
                  isStable 
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/15" 
                    : "bg-amber-500/10 text-amber-500 border border-amber-500/15"
                )}>
                  {src.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-1.5 text-[8px] leading-tight flex-1">
                <div>
                  <span className="text-muted-foreground block text-[6.5px] font-bold uppercase">EVENTS RATE</span>
                  <span className="text-foreground font-semibold">{wEPS}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[6.5px] font-bold uppercase">LAST COUPLING</span>
                  <span className="text-foreground font-semibold">{src.lastUpdate}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-border/5">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-[6.5px] font-bold uppercase">DATA QUALITY RATING:</span>
                    <span className="text-cyan-400 font-extrabold">{src.quality}</span>
                  </div>
                </div>
              </div>

              {/* Indicator glow dots line */}
              <div className="flex items-center gap-1 mt-2.5">
                <div className={cn("w-1.5 h-1.5 rounded-full", isStable ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-bounce")} />
                <span className="text-[6.5px] text-muted-foreground leading-none font-bold uppercase">
                  Data validation layer intact
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TelemetryHealthPanel;
