import React from "react";
import { EndpointAsset } from "./endpointConfig";
import { cn } from "../../lib/utils";
import { Shield, Settings, CheckCircle, AlertOctagon, Heart, Radio } from "lucide-react";

interface EndpointAgentTabProps {
  endpoint: EndpointAsset;
}

export function EndpointAgentTab({ endpoint }: EndpointAgentTabProps) {
  const isInstalled = endpoint.agentStatus === "INSTALLED";
  const isOutdated = endpoint.agentStatus === "OUTDATED";
  const isMissing = endpoint.agentStatus === "MISSING";

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Upper overview card */}
      <div className={cn(
        "p-4 rounded-xl border font-mono text-[9.5px] items-center gap-4 flex flex-row",
        isInstalled ? "bg-emerald-500/5 border-emerald-500/15 text-emerald-500" :
        isOutdated ? "bg-amber-500/5 border-amber-500/15 text-amber-500" :
        "bg-red-500/5 border-red-500/15 text-red-500"
      )}>
        <div className={cn(
          "p-2.5 rounded-lg border shrink-0",
          isInstalled ? "bg-emerald-500/10 border-emerald-500/20" :
          isOutdated ? "bg-amber-500/10 border-amber-500/20" :
          "bg-red-500/10 border-red-500/20"
        )}>
          {isInstalled ? <CheckCircle size={18} /> : <AlertOctagon size={18} />}
        </div>
        
        <div className="space-y-1">
          <h4 className="text-[10px] font-black uppercase tracking-wider">
            TELEMETRY REAPER DECRIPTION
          </h4>
          <p className="text-muted-foreground uppercase text-[9px] tracking-wide leading-relaxed">
            {isInstalled ? "The micro-agent daemon is healthy, enforcing active memory shield protections and real-time process auditing." :
             isOutdated ? "A legacy version version of the agent is running. Version updates are pending command center release approvals." :
             "CRITICAL: Telemetry is unmonitored. No logging reapers are currently authorized or running on this host core."}
          </p>
        </div>
      </div>

      {/* Structured agent parameters */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3 font-mono text-[10px] select-none">
        
        {/* Agent Version */}
        <div className="flex items-center justify-between py-1.5 border-b border-border/40">
          <span className="text-muted-foreground uppercase font-semibold">AGENT BINARY VERSION</span>
          <span className="text-foreground font-bold">{endpoint.agentVersion}</span>
        </div>

        {/* Heartbeat Interval */}
        <div className="flex items-center justify-between py-1.5 border-b border-border/40">
          <span className="text-muted-foreground uppercase font-semibold">HEARTBEAT BROADCAST</span>
          <span className="text-foreground font-bold flex items-center gap-1.5">
            <Radio size={12} className={cn("text-emerald-500 animate-pulse", endpoint.status === "OFFLINE" && "text-zinc-500 opacity-50")} />
            {endpoint.lastSeen}
          </span>
        </div>

        {/* Tamper Protection */}
        <div className="flex items-center justify-between py-1.5 border-b border-border/40">
          <span className="text-muted-foreground uppercase font-semibold">TAMPER FORCE PROTECTION</span>
          <span className={cn(
            "font-black uppercase tracking-wider",
            isInstalled ? "text-emerald-500" : "text-zinc-500"
          )}>
            {isInstalled ? "OPERATIONAL (LOCK)" : "DEACTIVATED"}
          </span>
        </div>

        {/* Local Isolation hook ready */}
        <div className="flex items-center justify-between py-1.5">
          <span className="text-muted-foreground uppercase font-semibold">VPC SYSTEM PARALYSIS SYSTEM</span>
          <span className={cn(
            "font-black uppercase tracking-wider",
            endpoint.status !== "OFFLINE" ? "text-cyan-500" : "text-zinc-500"
          )}>
            {endpoint.status !== "OFFLINE" ? "BOOT LOADER READY" : "DEPRECATED"}
          </span>
        </div>

      </div>

    </div>
  );
}
