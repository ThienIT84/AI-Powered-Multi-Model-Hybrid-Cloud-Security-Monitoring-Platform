import React from "react";
import { Cpu } from "lucide-react";
import { cn } from "../../lib/utils";

interface AiInferenceMonitoringProps {
  isDarkMode: boolean;
  simulatedFailures: Record<string, boolean>;
}

export function AiInferenceMonitoring({ isDarkMode, simulatedFailures }: AiInferenceMonitoringProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card relative font-mono text-[9px]">
      <div className="flex gap-2 items-center mb-3 pb-2 border-b border-border/60">
        <Cpu size={14} className="text-indigo-400" />
        <h3 className="text-[10px] font-black uppercase tracking-wider">AI Inference & CPU Monitoring Panel</h3>
      </div>

      <div className="space-y-4">
        {/* AI1 */}
        <div className="space-y-1">
          <div className="flex justify-between font-black uppercase">
            <span className="text-cyan-405 text-cyan-400">AI1 Anomaly Model</span>
            <span>{simulatedFailures.ai1 ? "CRITICAL OUT" : "CPU: 24% | MEM: 1.2GB | Errors: 0%"}</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full", simulatedFailures.ai1 ? "bg-red-500 w-full animate-pulse" : "bg-cyan-505 bg-cyan-500 w-1/4")} />
          </div>
        </div>

        {/* AI2A */}
        <div className="space-y-1">
          <div className="flex justify-between font-black uppercase">
            <span className="text-emerald-400">AI2A Attack Engine</span>
            <span>{simulatedFailures.ai2a ? "CRITICAL OUT" : "CPU: 42% | MEM: 2.1GB | Errors: 0.1%"}</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full", simulatedFailures.ai2a ? "bg-red-500 w-full animate-pulse" : "bg-emerald-500 w-2/5")} />
          </div>
        </div>

        {/* AI2B */}
        <div className="space-y-1">
          <div className="flex justify-between font-black uppercase">
            <span className="text-indigo-405 text-indigo-400">AI2B Web Model</span>
            <span>{simulatedFailures.ai2b ? "CRITICAL OUT" : "CPU: 18% | MEM: 800MB | Errors: 0%"}</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full", simulatedFailures.ai2b ? "bg-red-500 w-full animate-pulse" : "bg-indigo-505 w-1/5")} />
          </div>
        </div>
      </div>
    </div>
  );
}
