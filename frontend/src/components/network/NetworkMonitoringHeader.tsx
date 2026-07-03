import React, { useMemo } from "react";
import { Database, Server, Radio } from "lucide-react";

interface NetworkMonitoringHeaderProps {
  isRunning: boolean;
  livePacketRate: number | null;
}

export const NetworkMonitoringHeader: React.FC<NetworkMonitoringHeaderProps> = ({
  isRunning,
  livePacketRate,
}) => {
  const dynamicLatency = useMemo(() => {
    if (!isRunning) return "0.0 ms";
    if (livePacketRate === null || livePacketRate <= 0) return "Unavailable";
    return `${Math.max(1, Math.min(250, Math.round(1000 / Math.max(1, livePacketRate))))}.0 ms`;
  }, [isRunning, livePacketRate]);

  return (
    <div 
      id="soc-global-status-bar" 
      className="w-full bg-card border border-border rounded-lg p-3 flex flex-wrap items-center justify-between gap-4 shadow-sm text-[11px]"
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* ZEEK AGENT FEEDS CONTAINER */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRunning ? "bg-emerald-400" : "bg-neutral-500"}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRunning ? "bg-emerald-500" : "bg-neutral-500"}`}></span>
          </span>
          <span className="text-muted-foreground font-bold uppercase tracking-wider">ZEEK_SENSOR:</span>
          <span className={`font-black tracking-widest ${isRunning ? "text-emerald-500 dark:text-emerald-405" : "text-neutral-500"}`}>
            {isRunning ? "STREAMING" : "WAITING"}
          </span>
        </div>

        {/* NETWORK LATENCY */}
        <div className="flex items-center gap-2 border-l border-border pl-4">
          <Radio className="w-3.5 h-3.5 text-cyan-500" />
          <span className="text-muted-foreground font-bold uppercase tracking-wider">LATENCY:</span>
          <span className="font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">{dynamicLatency}</span>
        </div>

        {/* LOG STORAGE DATASTORE */}
        <div className="flex items-center gap-2 border-l border-border pl-4">
          <Database className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 animate-pulse" />
          <span className="text-muted-foreground font-bold uppercase tracking-wider">LOCAL DATASTORE:</span>
          <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono">{isRunning ? "CONN_BUFFER_RAM" : "Unavailable"}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-muted-foreground font-medium font-sans uppercase tracking-wide">THROUGHPUT:</span>
          <span className="font-extrabold text-foreground font-mono">
            {isRunning ? (livePacketRate === null ? "Unavailable" : `${livePacketRate} pkts/s`) : "0 pkts/s"}
          </span>
        </div>
      </div>
    </div>
  );
};
