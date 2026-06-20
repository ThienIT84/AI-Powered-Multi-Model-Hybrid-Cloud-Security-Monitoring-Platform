import React from "react";
import { Link2, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";
import { SyncEvent } from "./types";
import { cn } from "../../lib/utils";

interface IntegrationEventFeedProps {
  events: SyncEvent[];
}

export function IntegrationEventFeed({ events }: IntegrationEventFeedProps) {
  const getStatusBadge = (status: SyncEvent["status"]) => {
    switch (status) {
      case "Success":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "Warning":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/20";
      case "Failure":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      case "Active":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 animate-pulse";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between select-none h-95">
      <div className="border-b border-border/40 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <RefreshCw size={12} className="text-cyan-500" />
          <div>
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] leading-none">
              Synchronization Events
            </h4>
            <span className="text-[7.5px] font-mono text-muted-foreground uppercase tracking-widest mt-1 block">
              Recent Data Source Synchronization and Pulse Verifications
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar my-2.5 space-y-1.5 min-h-0">
        {events.map((evt) => {
          return (
            <div
              key={evt.id}
              className="px-3 py-2 bg-muted/15 border border-border/40 hover:bg-muted/30 transition-colors rounded-lg flex items-center justify-between gap-3 font-mono text-[9px]"
            >
              <div className="flex flex-col gap-0.5 truncate flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[7.2px] text-muted-foreground uppercase shrink-0">
                    [{evt.timestamp}]
                  </span>
                  <span className="text-[8.5px] font-black text-foreground uppercase truncate">
                    {evt.integration}
                  </span>
                </div>
                <span className="text-muted-foreground text-[8px] truncate">
                  {evt.event}
                </span>
              </div>

              <div className="shrink-0 text-right">
                <span className={cn(
                  "text-[7px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider leading-none",
                  getStatusBadge(evt.status)
                )}>
                  {evt.status}
                </span>
              </div>
            </div>
          );
        })}

        {events.length === 0 && (
          <div className="py-20 text-center text-[8.5px] text-muted-foreground uppercase tracking-widest">
            No synchronization telemetry items recorded
          </div>
        )}
      </div>

      <div className="text-[7.5px] font-mono text-muted-foreground/50 uppercase tracking-widest border-t border-border/20 pt-1.5 text-center leading-none">
        System sync auditing in compliance with FCAJ v3.0 specs
      </div>
    </div>
  );
}
