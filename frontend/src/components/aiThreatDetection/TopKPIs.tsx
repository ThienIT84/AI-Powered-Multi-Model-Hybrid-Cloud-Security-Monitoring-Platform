import React from "react";
import { Check, Activity, ShieldAlert, AlertTriangle, Zap, TrendingUp } from "lucide-react";

export interface TopKPIsProps {
  liveInferences: number;
  liveDetections: number;
  liveFusionAlerts: number;
  liveLatency: number;
}

export function TopKPIs({
  liveInferences,
  liveDetections,
  liveFusionAlerts,
  liveLatency,
}: TopKPIsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* KPI: Pipeline Health */}
      <div className="bg-card border border-border/80 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-2 right-2 p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
          <Check size={12} />
        </div>
        <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
          Pipeline Health
        </span>
        <div className="mt-2.5">
          <span className="text-[10px] text-emerald-500 font-bold block uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded w-max">
            Healthy
          </span>
          <span className="text-sm font-black text-slate-800 dark:text-zinc-100 block mt-1 uppercase font-mono">
            3 / 3 Online
          </span>
        </div>
      </div>

      {/* KPI: Total Inferences */}
      <div className="bg-card border border-border/80 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-2 right-2 p-1.5 bg-cyan-500/10 text-cyan-500 rounded-lg">
          <Activity size={12} />
        </div>
        <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
          Total Inferences
        </span>
        <div className="mt-2.5">
          <span className="text-xl font-mono font-black text-slate-800 dark:text-zinc-100 leading-none">
            {liveInferences.toLocaleString()}
          </span>
          <span className="text-[8px] font-mono text-muted-foreground block mt-0.5 uppercase tracking-widest">
            Last 24h Aggregated
          </span>
        </div>
      </div>

      {/* KPI: Total Detections */}
      <div className="bg-card border border-border/80 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-2 right-2 p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
          <ShieldAlert size={12} />
        </div>
        <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
          Total Detections
        </span>
        <div className="mt-2.5">
          <span className="text-xl font-mono font-black text-slate-800 dark:text-zinc-100 leading-none">
            {liveDetections.toLocaleString()}
          </span>
          <span className="text-[8px] font-mono text-muted-foreground block mt-0.5 uppercase tracking-widest">
            AI Classified Signals
          </span>
        </div>
      </div>

      {/* KPI: Fusion Alerts */}
      <div className="bg-card border border-border/80 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-500 rounded-lg">
          <AlertTriangle size={12} />
        </div>
        <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
          Fusion Alerts
        </span>
        <div className="mt-2.5">
          <span className="text-xl font-mono font-black text-slate-800 dark:text-zinc-100 leading-none">
            {liveFusionAlerts.toLocaleString()}
          </span>
          <span className="text-[8px] font-mono text-muted-foreground block mt-0.5 uppercase tracking-widest">
            Dispatched to SIEM/WAF
          </span>
        </div>
      </div>

      {/* KPI: Average Latency */}
      <div className="bg-card border border-border/80 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-2 right-2 p-1.5 bg-violet-500/10 text-violet-500 rounded-lg">
          <Zap size={12} />
        </div>
        <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
          Average Latency
        </span>
        <div className="mt-2.5">
          <span className="text-xl font-mono font-black text-slate-800 dark:text-zinc-100 leading-none">
            {liveLatency}ms
          </span>
          <span className="text-[8px] font-mono text-muted-foreground block mt-0.5 uppercase tracking-widest">
            End-to-End Core Pipeline
          </span>
        </div>
      </div>

      {/* KPI: FP Reduction */}
      <div className="bg-card border border-border/80 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-2 right-2 p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
          <TrendingUp size={12} />
        </div>
        <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
          F.P. Reduction
        </span>
        <div className="mt-2.5">
          <span className="text-xl font-mono font-black text-slate-800 dark:text-zinc-100 leading-none">
            38%
          </span>
          <span className="text-[8px] font-mono text-muted-foreground block mt-0.5 uppercase tracking-widest">
            vs Suricata-only Setup
          </span>
        </div>
      </div>
    </div>
  );
}
