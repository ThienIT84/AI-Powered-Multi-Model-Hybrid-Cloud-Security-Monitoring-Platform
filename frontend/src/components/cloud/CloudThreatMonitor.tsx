import React, { useState, useMemo } from "react";
import { CloudThreat } from "./types";
import { AlertCircle, ShieldAlert, Cpu, RefreshCw, Layers } from "lucide-react";

interface CloudThreatMonitorProps {
  threats: CloudThreat[];
}

export function CloudThreatMonitor({ threats }: CloudThreatMonitorProps) {
  const [activeTab, setActiveTab] = useState<"all" | "active">("all");

  const filteredThreats = useMemo(() => {
    if (activeTab === "active") {
      return threats.filter((t) => t.status === "Active" || t.status === "Investigating");
    }
    return threats;
  }, [threats, activeTab]);

  const getSeverityBadge = (sev: string) => {
    switch (sev.toLowerCase()) {
      case "critical":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/25 font-black";
      case "high":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 font-bold";
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-450 border border-yellow-500/20 font-semibold";
      default:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10 font-normal";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-red-550/15 text-red-500 border border-red-500/30 animate-pulse font-black";
      case "investigating":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25";
      default:
        return "bg-zinc-550/10 text-zinc-650 dark:text-zinc-400 border border-zinc-500/25";
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col h-full" id="cloud-threat-monitor">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3 mb-3">
        <div className="flex items-center gap-2 select-none">
          <div className="p-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
            <ShieldAlert size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-foreground tracking-wider font-mono">
              Cloud Threat Monitoring
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Live CloudTrail & GuardDuty security telemetry alerts
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 bg-muted/30 border border-border/80 p-0.5 rounded-lg max-w-fit self-end font-mono">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-md cursor-pointer ${
              activeTab === "all" ? "bg-card text-foreground border border-border/40 shadow-xs" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            All Alerts
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-md cursor-pointer ${
              activeTab === "active" ? "bg-red-500/10 text-red-500 border border-red-500/35" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Unresolved
          </button>
        </div>
      </div>

      {/* Threats alert logger list */}
      <div className="space-y-1.5 flex-1 overflow-y-auto max-h-75">
        {filteredThreats.length === 0 ? (
          <p className="text-[10px] font-mono italic text-center p-4 text-muted-foreground">
            No threat signals matched in this view.
          </p>
        ) : (
          filteredThreats.map((threat) => (
            <div
              key={threat.id}
              className="p-2.5 bg-muted/15 border border-border/60 rounded-lg hover:border-red-500/10 transition-all font-mono text-[9px] leading-relaxed flex flex-col justify-between gap-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black text-foreground uppercase tracking-tight block truncate">
                      {threat.threatType}
                    </span>
                    <span className={`text-[7px] font-black uppercase px-1.5 py-0.2 rounded font-mono ${getSeverityBadge(threat.severity)}`}>
                      {threat.severity}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[7.5px] text-slate-500 font-bold font-sans uppercase">
                    <span>Target: </span>
                    <span className="text-zinc-650 dark:text-zinc-300 font-mono text-[8px] uppercase">{threat.asset}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className={`px-1.5 py-0.5 rounded text-[7.5px] uppercase font-black font-mono inline-block ${getStatusBadge(threat.status)}`}>
                    {threat.status}
                  </span>
                </div>
              </div>

              {/* Threat Technical Source & Timestamp */}
              <div className="border-t border-border/10 pt-2 flex items-center justify-between text-[7.5px] text-zinc-500 flex-wrap gap-1 leading-none">
                <span className="truncate">Source: {threat.source.toUpperCase()}</span>
                <span className="font-semibold text-right">{threat.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export default CloudThreatMonitor;
