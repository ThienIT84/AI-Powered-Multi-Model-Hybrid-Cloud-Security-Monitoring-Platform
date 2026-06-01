import React from "react";
import { Layers, Crosshair, Cpu, ArrowRight, Zap, Target, Lock, Play, Key } from "lucide-react";
import { cn } from "../../lib/utils";

export function MultiStageAttackGraph() {
  const steps = [
    { name: "RECONNAISSANCE", desc: "Port Scan Analysis", icon: Crosshair, status: "Active", val: "94% Match", severity: "Low" },
    { name: "INITIAL ACCESS", desc: "Brute Force Logins", icon: Key, status: "Active", val: "92% Match", severity: "Medium" },
    { name: "EXECUTION & EXPLOIT", desc: "XSS Text Script Injection", icon: Lock, status: "Escalated", val: "98% Match", severity: "Critical" },
    { name: "PERSISTENCE BEACONING", desc: "Continuous C2 Beacon", icon: Zap, status: "Inactive", val: "Pending", severity: "High" },
    { name: "DATA EXFILTRATION", desc: "Structured SQL Dump", icon: Target, status: "Inactive", val: "Pending", severity: "Critical" }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm h-80 select-none">
      <div className="flex items-center justify-between mb-2 border-b border-border/20 pb-2 shrink-0">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-cyan-500 animate-pulse" />
          MULTI-STAGE MITRE ATT&CK CAMPAIGN PROGRESSION
        </h3>
        <span className="text-[7px] bg-[#06b6d4]/10 text-cyan-500 border border-cyan-500/15 px-2 py-0.5 rounded uppercase font-black font-mono">
          PROGRESS MAP
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-3.5 select-none font-mono text-[8.5px] leading-none">
        
        {/* Horizontal or Vertical flow visualization */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 h-full items-center">
          {steps.map((s, idx) => (
            <div 
              key={s.name}
              className={cn(
                "p-3 rounded-xl border flex flex-col justify-between tracking-wide leading-relaxed h-47.5 select-none text-left transition-all relative overflow-hidden",
                s.status === "Active" 
                  ? "bg-cyan-950/15 border-cyan-500/30 text-cyan-400 hover:border-cyan-400/50" 
                  : s.status === "Escalated"
                    ? "bg-red-950/20 border-red-500/40 text-red-500 animate-pulse hover:border-red-400/70 shadow-[0_0_8px_rgba(239,68,68,0.1)]"
                    : "bg-muted/15 border-border/30 text-muted-foreground opacity-45"
              )}
            >
              <div className="flex items-start justify-between">
                <span className="text-[7.5px] font-extrabold block text-muted-foreground/60 uppercase">STAGE_0{idx + 1}</span>
                {s.status !== "Inactive" && (
                  <span className={cn(
                    "px-1.5 py-[0.5px] text-[6.5px] font-black rounded uppercase",
                    s.status === "Escalated" ? "bg-red-500/15 text-red-500" : "bg-cyan-500/15 text-cyan-400"
                  )}>
                    {s.status}
                  </span>
                )}
              </div>

              <div className="flex flex-col flex-1 justify-center items-center text-center my-3 gap-1">
                 <div className={cn(
                   "p-2 rounded-lg border",
                   s.status === "Active" ? "bg-cyan-500/10 border-cyan-500/20" : s.status === "Escalated" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-muted border-border"
                 )}>
                    <s.icon className="w-5 h-5 stroke-[1.8]" />
                 </div>
                 <span className="text-[9px] font-black uppercase text-foreground leading-none tracking-tight block mt-1.5">{s.name}</span>
                 <span className="text-[7.5px] text-muted-foreground leading-none block uppercase tracking-wide mt-1 line-clamp-1">{s.desc}</span>
              </div>

              <div className="flex justify-between items-center text-[7.5px] leading-none shrink-0 border-t border-border/10 pt-2 font-black">
                <span className="uppercase text-muted-foreground">MATCH RATIO</span>
                <span className="text-foreground">{s.val}</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      <div className="pt-2 border-t border-border/10 flex items-center justify-between text-[7px] font-black text-muted-foreground uppercase opacity-55 shrink-0 font-mono">
        <span>MITRE ATT&CK REALTIME GRAPH MATRIX SECTOR</span>
        <span>Consensus graph verified</span>
      </div>
    </div>
  );
}

export default MultiStageAttackGraph;
