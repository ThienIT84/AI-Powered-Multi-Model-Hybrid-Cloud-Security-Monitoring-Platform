import React from "react";
import { Database, Radio } from "lucide-react";
import { cn } from "../../lib/utils";

interface DbAndSocketMonitorProps {
  isDarkMode: boolean;
  simulatedFailures: Record<string, boolean>;
}

export function DbAndSocketMonitor({ isDarkMode, simulatedFailures }: DbAndSocketMonitorProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card relative font-mono text-[9px] space-y-4">
      {/* DB Panel */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-slate-400 uppercase text-[9px] font-black border-b border-border/60 pb-1">
          <div className="flex items-center gap-1 text-slate-800 dark:text-slate-100">
            <Database size={11} className="text-emerald-400" />
            <span>PostgreSQL Database RDS Info</span>
          </div>
          <span className={simulatedFailures.database ? "text-red-500 animate-pulse" : "text-emerald-500"}>
            {simulatedFailures.database ? "CRIPPLED" : "Healthy"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-slate-400 font-sans">
          <div>Active SQL Connections: <span className="font-mono text-slate-900 dark:text-white font-black">{simulatedFailures.database ? "0" : "52"}</span></div>
          <div>Storage Space Util: <span className="font-mono text-slate-900 dark:text-white font-black">24.2 GB</span></div>
          <div>Writes Today: <span className="font-mono text-slate-900 dark:text-white font-black">1.1M Recs</span></div>
          <div>Read Queries Speed: <span className="font-mono text-slate-900 dark:text-white font-black">1.2ms</span></div>
        </div>
      </div>

      {/* Socket client Monitor */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-slate-400 uppercase text-[9px] font-black border-b border-slate-200 dark:border-slate-850 pb-1">
          <div className="flex items-center gap-1 text-slate-800 dark:text-slate-100">
            <Radio size={11} className="text-indigo-400" />
            <span>WebSocket Gateway RFC6455 Monitor</span>
          </div>
          <span className={simulatedFailures.websocket ? "text-red-550 text-red-500 animate-pulse" : "text-emerald-555 text-emerald-500"}>
            {simulatedFailures.websocket ? "Offline" : "Healthy"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-slate-400 font-sans">
          <div>Connected Analysts: <span className="font-mono text-slate-900 dark:text-white font-black">{simulatedFailures.websocket ? "0" : "14"}</span></div>
          <div>Sent Frames Rate: <span className="font-mono text-slate-900 dark:text-white font-black">{simulatedFailures.websocket ? "0p/s" : "48p/s"}</span></div>
          <div>Dropped Frame Rate: <span className="font-mono text-slate-900 dark:text-white font-black">{simulatedFailures.websocket ? "100%" : "0.00%"}</span></div>
          <div>Socket Health Status: <span className="font-mono text-slate-900 dark:text-white font-black">{simulatedFailures.websocket ? "0%" : "100%"}</span></div>
        </div>
      </div>
    </div>
  );
}
