import React from "react";
import { ThreatEvent } from "./types";
import { X, ShieldAlert, Code, Server, Info, Terminal, Activity } from "lucide-react";
import { cn } from "../../lib/utils";

interface SOCThreatDetailDrawerProps {
  event: ThreatEvent | null;
  onClose: () => void;
}

export const SOCThreatDetailDrawer: React.FC<SOCThreatDetailDrawerProps> = ({
  event,
  onClose,
}) => {
  if (!event) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center select-none font-mono text-muted-foreground flex flex-col items-center justify-center h-full min-h-75">
        <Info className="w-8 h-8 mb-2 text-zinc-500 animate-pulse" />
        <p className="text-xs uppercase font-bold text-foreground">No Event Selected</p>
        <p className="text-[10px] uppercase mt-1">Select any row from the threat feed to trigger deep cyber-forensics details.</p>
      </div>
    );
  }

  // Action suggestions
  const recommendationActions: Record<string, string> = {
    SQLi: "Trigger automated WAF rate-limiting. Flag current user session ID on internal proxy gateway. Sanitize request body content parameters.",
    XSS: "Enforce Content-Security-Policy (CSP) headers. Invalidate cookies associated with session context. Scrutinize input formatting layers.",
    DoS: "Enable DDoS cloud-scrubbing. Trigger temporary router aggregation filters to drop SYN floods. Quarantine threat IP source space.",
    "Port Scan": "Analyze edge firewall connection threshold settings. Add source IP to the firewall's blackhole table for 24 hours.",
    "Brute Force": "Initiate automated security lock-out. Require Multi-Factor authentication challenge. Rate-limit authentication route handlers.",
    Botnet: "Immediately isolate node from internal networking routing groups. Begin secondary host scanning for persistence agents.",
  };

  const actionSuggested = recommendationActions[event.attack_type] || "Temporarily throttle connection bandwidth and flag target nodes for priority SOC inspection.";

  return (
    <div className="bg-card border border-border rounded-xl p-4.5 font-mono text-[11px] space-y-4 shadow-lg relative flex flex-col justify-between h-fit min-h-112.5">
      
      {/* Drawer Header Area Info */}
      <div className="flex items-center justify-between border-b border-border pb-3.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-foreground leading-none">Threat Forensics Intel</span>
            <span className="text-[8.5px] text-muted-foreground uppercase mt-0.5">{event.id}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          title="Dismiss details"
        >
          <X size={13} />
        </button>
      </div>

      {/* Critical stats summary */}
      <div className="space-y-3">
        {/* Core items */}
        <div className="bg-secondary/30 border border-border/40 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground uppercase">Attack Type:</span>
            <span className="font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded uppercase">
              {event.attack_type}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground uppercase font-semibold">Incident Severity:</span>
            <span className={cn(
              "font-black uppercase text-[9px] border px-2 py-0.5 rounded",
              event.severity === "Critical" && "bg-red-500/15 text-red-400 border-red-500/20 animate-pulse",
              event.severity === "High" && "bg-orange-500/10 text-orange-400 border-orange-500/20",
              event.severity === "Medium" && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
            )}>
              {event.severity}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground uppercase">Fusion Confidence:</span>
            <span className="font-black text-white bg-cyan-600 dark:bg-cyan-500 px-2 py-0.5 rounded">
              {event.confidence}%
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground uppercase">MITRE ATT&amp;CK Tag:</span>
            <span className="font-bold text-cyan-400 hover:underline cursor-pointer">
              {event.mitre}
            </span>
          </div>
        </div>

        {/* Network info */}
        <div className="space-y-1">
          <p className="text-[9.5px] uppercase font-bold text-muted-foreground">Source &amp; Destination:</p>
          <div className="bg-zinc-850 dark:bg-zinc-900/60 p-2.5 border border-border/80 rounded-lg space-y-1.5 font-mono text-[10px]">
            <div className="flex justify-between items-center text-foreground">
              <span className="text-muted-foreground">Source host:</span>
              <span className="font-bold">{event.src_ip}</span>
            </div>
            <div className="flex justify-between items-center text-foreground">
              <span className="text-muted-foreground">Target host:</span>
              <span className="font-bold">{event.dst_ip}</span>
            </div>
          </div>
        </div>

        {/* Pipeline validation detail */}
        <div className="space-y-1.5">
          <p className="text-[9.5px] uppercase font-bold text-muted-foreground flex items-center gap-1">
            <Activity size={12} className="text-violet-400" />
            Decision validation path:
          </p>
          <div className="bg-zinc-850 dark:bg-zinc-900/60 p-2.5 border border-border/80 rounded-lg space-y-2 font-mono text-[9.5px]">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">1. Zeek Telemetry logs:</span>
              <span className="text-emerald-400 font-bold uppercase">INGESTED</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">2. AI1 Anomaly score:</span>
              <span className="text-rose-400 font-bold">{event.pipeline.ai1}/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">3. AI2A Classifier Output:</span>
              <span className="text-purple-400 font-bold">{event.pipeline.ai2a || "Not Triggered"}</span>
            </div>
            {event.pipeline.ai2b && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">4. AI2B HTTP Payloads:</span>
                <span className="text-amber-400 font-bold truncate max-w-35">{event.pipeline.ai2b}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-border/40 pt-1.5">
              <span className="text-muted-foreground font-semibold">Fusion Consensus Final Score:</span>
              <span className="text-cyan-400 font-black">{event.pipeline.fusion_score}%</span>
            </div>
          </div>
        </div>

        {/* Suggestion box */}
        <div className="space-y-1">
          <p className="text-[9.5px] uppercase font-bold text-muted-foreground">SOC Remediation Guideline:</p>
          <div className="bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg text-[9.5px] text-zinc-300 dark:text-emerald-300/90 leading-normal">
            {actionSuggested}
          </div>
        </div>
      </div>

    </div>
  );
};
