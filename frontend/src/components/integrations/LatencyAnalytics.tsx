import React from "react";
import { Clock } from "lucide-react";
import { cn } from "../../lib/utils";

interface LatencyStage {
  name: string;
  avg: number;
  p95: number;
  max: number;
}

interface LatencyStagesSummary {
  stages: LatencyStage[];
  avg: number;
  p95: number;
  p99: number;
  max: number;
}

interface LatencyAnalyticsProps {
  isDarkMode: boolean;
  computedLatencyStages: LatencyStagesSummary;
}

export function LatencyAnalytics({ isDarkMode, computedLatencyStages }: LatencyAnalyticsProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card relative font-mono">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/60">
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-cyan-400" />
          <h3 className="text-xs font-black uppercase tracking-wider">End-To-End Latency Profile Analytics</h3>
        </div>
        <span className="text-[8px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-500 dark:text-slate-400 uppercase font-black rounded font-mono">P99 SLA Target: 500ms</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="p-3 rounded-lg bg-muted/65 dark:bg-slate-950/40 border border-border dark:border-slate-800 text-center">
          <span className="text-[8px] text-slate-400 block mb-1">AGGREGATE MEAN</span>
          <span className="text-sm font-black text-slate-850 dark:text-slate-100">{computedLatencyStages.avg} ms</span>
        </div>
        <div className="p-3 rounded-lg bg-muted/65 dark:bg-slate-950/40 border border-border dark:border-slate-800 text-center">
          <span className="text-[8px] text-amber-600 dark:text-amber-500 block mb-1">P95 SLA STATUS</span>
          <span className="text-sm font-black text-amber-600 dark:text-amber-550">{computedLatencyStages.p95} ms</span>
        </div>
        <div className="p-3 rounded-lg bg-muted/65 dark:bg-slate-950/40 border border-border dark:border-slate-800 text-center">
          <span className="text-[8px] text-red-600 dark:text-red-500 block mb-1">P99 CRITICAL BOUND</span>
          <span className="text-sm font-black text-red-600 dark:text-red-500">{computedLatencyStages.p99} ms</span>
        </div>
        <div className="p-3 rounded-lg bg-muted/65 dark:bg-slate-950/40 border border-border dark:border-slate-800 text-center animate-pulse">
          <span className="text-[8px] text-red-600 dark:text-red-500 block mb-1">MAX HANDSHAKE RECORD</span>
          <span className="text-sm font-black text-red-600 dark:text-red-500">{computedLatencyStages.max} ms</span>
        </div>
      </div>

      <div className="space-y-2 text-[9px]">
        {computedLatencyStages.stages.map(st => {
          const ratio = Math.min(100, Math.max(5, (st.avg / 500) * 100));
          return (
            <div key={st.name} className="space-y-1">
              <div className="flex justify-between items-center text-slate-400">
                <span className="font-black uppercase">{st.name}</span>
                <span>MEAN: {st.avg}ms • P95: {st.p95}ms • MAX: {st.max}ms</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    st.avg > 300 ? "bg-red-500" : st.avg > 100 ? "bg-amber-400" : "bg-cyan-500"
                  )}
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
