import React, { useState, useEffect, useRef } from "react";
import { Activity, Radio, Cpu, Sparkles, Terminal } from "lucide-react";
import { cn } from "../../../lib/utils";

interface StreamLog {
  time: string;
  engine: "ZEEK" | "AI1" | "AI2A" | "AI2B" | "SURICATA" | "FUSION";
  message: string;
  severity: "LOW" | "NORMAL" | "WARNING" | "CRITICAL";
}

export function FusionRealtimeStream() {
  const [logs, setLogs] = useState<StreamLog[]>([
    { time: "10:09:41", engine: "ZEEK", message: "POST /login HTTP/1.1 stream mapped with 1,489 bytes", severity: "NORMAL" },
    { time: "10:09:41", engine: "AI1", message: "Inference checks raw anomaly value 0.76 (anomaly priority bounds hit)", severity: "WARNING" },
    { time: "10:09:42", engine: "AI2B", message: "Web payload deep audit: identified raw parameter resembling T1190 injection pattern", severity: "CRITICAL" },
    { time: "10:09:42", engine: "FUSION", message: "CONVERGENCE COMPLETED -> escalated severity of target stream to CRITICAL (Risk 89/100)", severity: "CRITICAL" },
    { time: "10:09:45", engine: "ZEEK", message: "Established inbound TCP socket on VLAN Gateway boundary 10.0.8.1:443", severity: "NORMAL" }
  ]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messages = [
      { engine: "ZEEK", message: "Established raw outbound socket frame to cloud boundary on 54.210.12.5", severity: "NORMAL" },
      { engine: "AI1", message: "Deep forest scoring completed: connection is NORMAL (confidence index 0.94)", severity: "NORMAL" },
      { engine: "AI2A", message: "Packet rate sweeps match passive discovery footprints: category resolved as PortScan", severity: "WARNING" },
      { engine: "SURICATA", message: "Matched pre-compiled signature SID 2010935 ([ET SCAN NMAP OS Sweep])", severity: "CRITICAL" },
      { engine: "FUSION", message: "Weighted voting triggers full consensus: escalated threat to HIGH", severity: "CRITICAL" },
      { engine: "AI2B", message: "Web payload deep audit: resolved zero script tags inside parameter tree", severity: "NORMAL" }
    ] as const;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
      const picked = messages[Math.floor(Math.random() * messages.length)];
      
      setLogs(prev => {
        const next = [...prev, { time: timeStr, ...picked }];
        if (next.length > 30) {
          next.shift();
        }
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case "CRITICAL": return "text-red-500 font-black";
      case "WARNING": return "text-orange-400 font-bold";
      case "LOW": return "text-blue-400";
      default: return "text-emerald-500";
    }
  };

  const getEngineBadge = (eng: string) => {
    switch (eng) {
      case "ZEEK": return "bg-cyan-500/10 border-cyan-500/20 text-cyan-400";
      case "AI1": return "bg-red-500/10 border-red-500/20 text-red-400";
      case "AI2A": return "bg-orange-500/10 border-orange-500/20 text-orange-400";
      case "AI2B": return "bg-purple-500/10 border-purple-500/20 text-purple-400";
      case "SURICATA": return "bg-blue-500/10 border-blue-500/20 text-blue-400";
      case "FUSION": return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
      default: return "bg-muted border-border text-muted-foreground";
    }
  };

  return (
    <div className="space-y-3">
      {/* Header Info */}
      <div className="flex items-center justify-between select-none leading-none">
        <div className="flex items-center gap-2">
          <Terminal size={13} className="text-cyan-500" />
          <span className="text-[9.5px] text-foreground uppercase tracking-wider block font-black">
            Decision Stream Ingest
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
          </span>
          <span className="text-[7px] font-mono font-black text-muted-foreground uppercase">[SYS LIVE]</span>
        </div>
      </div>

      {/* Terminal Terminal View block */}
      <div className="bg-black/80 border border-border rounded-xl p-3 h-62.5 flex flex-col font-mono text-[8px] leading-relaxed relative overflow-hidden">
        
        {/* Ambient grid bg lines */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

        {/* Console scrolling logs */}
        <div 
          ref={containerRef} 
          className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1 relative z-10 select-all"
        >
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2.5 hover:bg-white/3 transition-colors py-0.5 rounded px-1">
              <span className="text-muted-foreground/60 shrink-0 select-none">[{log.time}]</span>
              
              <span className={cn(
                "px-1 py-[0.5px] rounded border text-[7px] font-black tracking-wider shrink-0 select-none font-sans",
                getEngineBadge(log.engine)
              )}>
                {log.engine}
              </span>

              <span className={cn("flex-1 text-muted-foreground", getSeverityStyle(log.severity))}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default FusionRealtimeStream;
