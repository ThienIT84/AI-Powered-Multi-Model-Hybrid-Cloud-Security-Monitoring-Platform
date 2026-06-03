import React from "react";
import { Cpu, Database, Server } from "lucide-react";

interface NetworkMonitoringHeaderProps {
  isRunning: boolean;
  livePacketRate: number;
}

export const NetworkMonitoringHeader: React.FC<NetworkMonitoringHeaderProps> = ({
  isRunning,
  livePacketRate,
}) => {
  return (
    <div 
      id="soc-global-status-bar" 
      className="w-full bg-card border border-border rounded-lg p-3 flex flex-wrap items-center justify-between gap-4 shadow-sm text-[11px]"
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRunning ? "bg-emerald-400" : "bg-neutral-500"}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRunning ? "bg-emerald-500" : "bg-neutral-500"}`}></span>
          </span>
          <span className="text-muted-foreground font-bold">ZEEK_AGENT:</span>
          <span className={`font-black tracking-widest ${isRunning ? "text-emerald-500 dark:text-emerald-405" : "text-neutral-500"}`}>
            {isRunning ? "STREAMING" : "OFFLINE_LOCKED"}
          </span>
        </div>

        <div className="flex items-center gap-2 border-l border-border pl-4">
          <Cpu 
            className={`w-3.5 h-3.5 text-cyan-500 ${isRunning ? "animate-spin" : ""}`} 
            style={{ animationDuration: "25s" }} 
          />
          <span className="text-muted-foreground font-bold">COGNITIVE_AI:</span>
          <span className="font-extrabold text-cyan-600 dark:text-cyan-400">DECISION_HEURISTICS_A2</span>
        </div>

        <div className="flex items-center gap-2 border-l border-border pl-4">
          <Database className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 animate-pulse" />
          <span className="text-muted-foreground font-bold">DATASTORE:</span>
          <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono">SIEM_POSTGRES (ONLINE)</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-muted-foreground font-medium font-sans">THROUGHPUT:</span>
          <span className="font-extrabold text-foreground">
            {isRunning ? `${livePacketRate} pkts/s` : "0 pkts/s"}
          </span>
        </div>
      </div>
    </div>
  );
};
