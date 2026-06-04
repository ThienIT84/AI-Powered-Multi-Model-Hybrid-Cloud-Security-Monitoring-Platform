import React from "react";
import { Sliders, Clock } from "lucide-react";
import { cn } from "../../lib/utils";

interface RecoveryPlaybookTimelineProps {
  isDarkMode: boolean;
  isOutageSimulated: boolean;
}

export function RecoveryPlaybookTimeline({ isDarkMode, isOutageSimulated }: RecoveryPlaybookTimelineProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card relative font-mono text-[9px]">
      <div className="flex gap-1 items-center pb-2 border-b border-border/60 mb-3 justify-between">
        <div className="flex items-center gap-1.5">
          <Sliders size={13} className="text-cyan-500" />
          <h3 className="text-[10px] font-black uppercase tracking-wider">SOAR Automated Incident Recovery Playbook</h3>
        </div>
        <span className="text-[8px] bg-emerald-500/10 text-emerald-404 text-emerald-400 px-2 py-0.5 rounded font-black uppercase">Active</span>
      </div>

      <div className="space-y-4 relative pl-3.5 border-l border-slate-350 dark:border-slate-800">
        
        {/* Failure */}
        <div className="relative">
          <span className={cn(
            "absolute left-[-19.5px] top-0.5 w-2.5 h-2.5 rounded-full",
            isOutageSimulated ? "bg-red-500 animate-ping" : "bg-emerald-500"
          )} />
          <p className="font-extrabold uppercase">1/ System Failure Detection</p>
          <p className="text-slate-400">
            {isOutageSimulated ? "Outage event captured by central keepalive probes." : "All keepalive signals passing normally."}
          </p>
          <span className="text-[8.5px] text-zinc-500 block mt-0.5">Milli-Latency: {isOutageSimulated ? "1.2ms triage" : "0ms"}</span>
        </div>

        {/* Alert */}
        <div className="relative">
          <span className={cn(
            "absolute left-[-19.5px] top-0.5 w-2.5 h-2.5 rounded-full",
            isOutageSimulated ? "bg-amber-500 animate-pulse" : "bg-slate-700"
          )} />
          <p className="font-extrabold uppercase">2/ Slack Alert Payload Dispatched</p>
          <p className="text-slate-400">
            {isOutageSimulated ? "Critical webhook payload sent to enterprise SOC Slack channel." : "System standby state."}
          </p>
        </div>

        {/* Action Recovery Run */}
        <div className="relative">
          <span className={cn(
            "absolute left-[-19.5px] top-0.5 w-2.5 h-2.5 rounded-full",
            isOutageSimulated ? "bg-indigo-500 animate-spin" : "bg-slate-700"
          )} />
          <p className="font-extrabold uppercase">3/ Auto-Healing Container Restarter</p>
          <p className="text-slate-400 text-[8.5px]">
            {isOutageSimulated ? "Orchestrator restarting severed Docker processes..." : "Health stable. Idle standby."}
          </p>
        </div>

        {/* Back to Healthy */}
        <div className="relative">
          <span className={cn(
            "absolute left-[-19.5px] top-0.5 w-2.5 h-2.5 rounded-full",
            isOutageSimulated ? "bg-slate-700" : "bg-emerald-500"
          )} />
          <p className="font-extrabold uppercase text-emerald-500">4/ Full Service Restored (Healthy)</p>
          <p className="text-emerald-500">
            {isOutageSimulated ? "Waiting for simulate clear keys." : "FCAJ pipeline verified at 100% telemetry status."}
          </p>
        </div>
      </div>
    </div>
  );
}
