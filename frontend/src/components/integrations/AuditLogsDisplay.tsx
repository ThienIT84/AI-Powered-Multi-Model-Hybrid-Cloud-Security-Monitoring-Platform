import React from "react";
import { cn } from "../../lib/utils";
import { AuditLogItem } from "./integrationFCAJData";

interface AuditLogsDisplayProps {
  isDarkMode: boolean;
  auditLogs: AuditLogItem[];
}

export function AuditLogsDisplay({ isDarkMode, auditLogs }: AuditLogsDisplayProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-500">
          System Central Audit Logs Timeline & Telemetry Alerts
        </h3>
        <span className="text-[8px] uppercase tracking-widest text-slate-404 text-slate-400">Ingested by phutd0212</span>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden p-2">
        <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar font-mono text-[9px]">
          {auditLogs.map((log, index) => {
            const categoryBadge = 
              log.status === "Success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
              log.status === "Failure" ? "bg-red-500/10 text-red-500 border border-red-500/30 animate-pulse" :
              "bg-blue-500/10 text-blue-400 border border-blue-500/30";

            return (
              <div 
                key={index} 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2 hover:bg-slate-800/10 rounded transition-colors border border-transparent hover:border-slate-800/30"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={cn("px-1 rounded font-black text-[8px] uppercase shrink-0", categoryBadge)}>{log.status}</span>
                  <span className="text-cyan-400 font-black uppercase shrink-0">[{log.component}]</span>
                  <span className="text-slate-350 dark:text-slate-300 font-semibold">{log.action}</span>
                </div>
                <span className="text-slate-500 font-sans text-[8.5px] italic self-end sm:self-auto uppercase">{log.user} (admin)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
