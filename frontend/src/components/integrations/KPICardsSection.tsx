import React from "react";
import { Activity } from "lucide-react";
import { cn } from "../../lib/utils";

interface KPICardsSectionProps {
  isDarkMode: boolean;
  topMetrics: {
    total: number;
    healthy: number;
    warning: number;
    failed: number;
    latency: number;
  };
  totalProcessedMessages: number;
}

export function KPICardsSection({ isDarkMode, topMetrics, totalProcessedMessages }: KPICardsSectionProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
      {/* KPI 1: Total Integrations */}
      <div className="p-4 rounded-xl border border-border bg-card relative overflow-hidden group hover:scale-[1.01] transition-all">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider font-mono">Total Pipelines</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
        </div>
        <div className="flex items-baseline justify-between">
          <p className="text-xl font-black font-mono">{topMetrics.total}</p>
          <span className="text-[9px] text-emerald-500 font-mono font-black">100% Config</span>
        </div>
        <div className="h-4 w-full mt-2">
          <svg viewBox="0 0 100 20" className="w-full h-full stroke-cyan-500 stroke-[1.5] fill-none">
            <path d="M 0 10 Q 25 15 50 5 T 100 12" />
          </svg>
        </div>
      </div>

      {/* KPI 2: Healthy Integrations */}
      <div className="p-4 rounded-xl border border-border bg-card relative overflow-hidden group hover:scale-[1.01] transition-all">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider font-mono">Healthy Nodes</span>
          <span className={cn(
            "w-1.5 h-1.5 rounded-full animate-pulse",
            topMetrics.failed === 0 ? "bg-emerald-500" : "bg-amber-500"
          )} />
        </div>
        <div className="flex items-baseline justify-between">
          <p className={cn(
            "text-xl font-black font-mono",
            topMetrics.failed === 0 ? "text-emerald-500" : "text-amber-500"
          )}>{topMetrics.healthy}</p>
          <span className="text-[9px] text-slate-400 font-mono">Online</span>
        </div>
        <div className="h-4 w-full mt-2">
          <svg viewBox="0 0 100 20" className="w-full h-full stroke-emerald-500 stroke-[1.5] fill-none">
            <path d="M 0 12 L 20 8 L 40 14 L 60 4 L 80 18 L 100 10" />
          </svg>
        </div>
      </div>

      {/* KPI 3: Warning Integrations */}
      <div className="p-4 rounded-xl border border-border bg-card relative overflow-hidden group hover:scale-[1.01] transition-all">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider font-mono">Warnings</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        </div>
        <div className="flex items-baseline justify-between">
          <p className="text-xl font-black font-mono text-amber-550 text-amber-500">{topMetrics.warning}</p>
          <span className="text-[9px] text-amber-500 font-mono font-black">+1 Active</span>
        </div>
        <div className="h-4 w-full mt-2">
          <svg viewBox="0 0 100 20" className="w-full h-full stroke-amber-550 stroke-[1.5] fill-none">
            <path d="M 0 15 Q 30 2 60 18 T 100 8" />
          </svg>
        </div>
      </div>

      {/* KPI 4: Failed Integrations */}
      <div className="p-4 rounded-xl border border-border bg-card relative overflow-hidden group hover:scale-[1.01] transition-all">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider font-mono">Failed Nodes</span>
          <span className={cn(
            "w-1.5 h-1.5 rounded-full animate-bounce",
            topMetrics.failed > 0 ? "bg-red-500 animate-ping" : "bg-slate-400"
          )} />
        </div>
        <div className="flex items-baseline justify-between">
          <p className={cn(
            "text-xl font-black font-mono",
            topMetrics.failed > 0 ? "text-red-500 animate-pulse" : "text-slate-400"
          )}>{topMetrics.failed}</p>
          <span className="text-[9px] text-slate-450 font-mono">Severed</span>
        </div>
        <div className="h-4 w-full mt-2">
          <svg viewBox="0 0 100 20" className="w-full h-full stroke-red-500 stroke-[1.5] fill-none">
            <path d={topMetrics.failed > 0 ? "M 0 12 L 20 2 Q 40 18 60 6 L 80 18 L 100 2" : "M 0 15 L 100 15"} />
          </svg>
        </div>
      </div>

      {/* KPI 5: Average Latency */}
      <div className="p-4 rounded-xl border border-border bg-card relative overflow-hidden group hover:scale-[1.01] transition-all">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider font-mono">Transit Latency</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-404 bg-cyan-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <p className="text-xl font-black font-mono text-cyan-400">{topMetrics.latency} ms</p>
          <span className="text-[9px] text-slate-400 font-mono">P95 Mean</span>
        </div>
        <div className="h-4 w-full mt-2">
          <svg viewBox="0 0 100 20" className="w-full h-full stroke-indigo-505 stroke-indigo-500 stroke-[1.5] fill-none">
            <path d="M 0 5 Q 40 18 80 2 T 100 12" />
          </svg>
        </div>
      </div>

      {/* KPI 6: Messages Processed Today */}
      <div className="p-4 rounded-xl border border-border bg-card relative overflow-hidden group hover:scale-[1.01] transition-all">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider font-mono">Ingested Logs</span>
          <Activity size={10} className="text-emerald-500 animate-spin" />
        </div>
        <div className="flex items-baseline justify-between">
          <p className="text-lg font-black font-mono text-emerald-400">{totalProcessedMessages.toLocaleString()} M</p>
          <span className="text-[8px] text-emerald-505 text-emerald-500 font-mono font-black">+142/s</span>
        </div>
        <div className="h-4 w-full mt-2">
          <svg viewBox="0 0 100 20" className="w-full h-full stroke-emerald-400 stroke-[1.5] fill-none">
            <path d="M 0 18 L 10 14 L 30 18 L 50 12 L 70 16 L 90 2 L 100 6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
