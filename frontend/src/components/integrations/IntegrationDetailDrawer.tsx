import React from "react";
import { X, CheckCircle, Database, Server, Compass, Clipboard } from "lucide-react";
import { Integration } from "./types";
import { cn } from "../../lib/utils";

interface IntegrationDetailDrawerProps {
  integration: Integration | null;
  onClose: () => void;
}

export function IntegrationDetailDrawer({ integration, onClose }: IntegrationDetailDrawerProps) {
  if (!integration) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col items-center justify-center select-none text-center h-95 font-mono">
        <Compass size={24} className="text-muted-foreground/30 mb-2.5 animate-pulse" />
        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
          No Profile Selected
        </h4>
        <p className="text-[7.5px] text-muted-foreground/60 uppercase tracking-widest mt-1.5 max-w-45">
          Select any telemetry provider or cloud resource item to display connected context rules
        </p>
      </div>
    );
  }

  const isWarning = integration.status === "Warning" || integration.health === "Warning";
  const isCritical = integration.status === "Disconnected" || integration.health === "Critical";

  // Split logs / types
  const logList = integration.dataType.split(", ").map(t => t.trim());

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col font-mono text-[10px] select-none text-foreground animate-fade-in w-full h-95 justify-between relative overflow-hidden">
      
      {/* Header section */}
      <div className="p-3.5 border-b border-border/40 flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-1.5 min-w-0">
          <Server size={11} className="text-cyan-500 shrink-0" />
          <div className="truncate">
            <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-wider block">
              {integration.category}
            </span>
            <span className="text-[10px] font-black text-foreground uppercase tracking-wider block truncate">
              {integration.name}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-md transition-colors shrink-0"
        >
          <X size={12} />
        </button>
      </div>

      {/* Main stats panels */}
      <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto custom-scrollbar min-h-0">
        {/* Description */}
        <div className="space-y-1">
          <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">
            Integration Description
          </span>
          <p className="text-[8px] text-foreground/80 lowercase leading-relaxed text-left pr-1 first-letter:capitalize">
            {integration.description}
          </p>
        </div>

        {/* Connectivity status & health metrics */}
        <div className="grid grid-cols-2 gap-2">
          {/* Status */}
          <div className="p-2 bg-muted/10 border border-border/40 rounded-lg">
            <span className="text-[6.5px] font-black text-muted-foreground uppercase block mb-1">
              Connection Status
            </span>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full inline-block",
                isCritical ? "bg-red-500 animate-ping" : isWarning ? "bg-amber-500" : "bg-emerald-500"
              )} />
              <span className="text-[9px] font-black uppercase text-foreground">
                {integration.status.toUpperCase()}
              </span>
            </div>
            {integration.region && (
              <span className="text-[6px] font-mono text-muted-foreground uppercase mt-0.5 block">
                Region: {integration.region}
              </span>
            )}
          </div>

          {/* Health */}
          <div className="p-2 bg-muted/10 border border-border/40 rounded-lg">
            <span className="text-[6.5px] font-black text-muted-foreground uppercase block mb-1">
              Synchronized Health
            </span>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "text-[7px] font-black uppercase px-2 py-0.5 rounded border leading-none",
                integration.health === "Healthy" 
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : integration.health === "Warning"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
              )}>
                {integration.health.toUpperCase()}
              </span>
            </div>
            <span className="text-[6px] font-mono text-muted-foreground uppercase mt-0.5 block">
              Sync Rate: {integration.lastSync}
            </span>
          </div>
        </div>

        {/* Log / Payload schema tags */}
        <div className="space-y-1">
          <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">
            Log / Data Fields Ingestion
          </span>
          <div className="flex flex-wrap gap-1">
            {logList.map((log) => (
              <span
                key={log}
                className="text-[7.5px] bg-muted py-0.5 px-2 border border-border rounded font-bold text-foreground"
              >
                {log}
              </span>
            ))}
          </div>
        </div>

        {/* Connected components references */}
        <div className="space-y-1">
          <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">
            Connected Ecosystem Services
          </span>
          <div className="flex flex-col gap-1">
            {integration.connectedServices.map((srv) => (
              <div
                key={srv}
                className="flex items-center gap-1.5 p-1 px-2 bg-muted/30 border border-border/30 rounded"
              >
                <div className="w-1 h-1 rounded-full bg-cyan-500 shrink-0" />
                <span className="text-[7.5px] font-bold text-foreground/80 truncate">
                  {srv}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer copyright block */}
      <div className="border-t border-border/20 p-2.5 bg-muted/10 text-center flex items-center justify-center gap-1">
        <Clipboard size={10} className="text-muted-foreground/50" />
        <span className="text-[6.5px] font-mono text-muted-foreground uppercase tracking-widest">
          Continuous Synchronization Active (No latency anomalies)
        </span>
      </div>
    </div>
  );
}
