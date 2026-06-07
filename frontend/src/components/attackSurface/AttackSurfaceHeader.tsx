import React from "react";

interface AttackSurfaceHeaderProps {
  secondsSinceUpdate: number;
  averageExposureMultiplier: number;
}

export function AttackSurfaceHeader({
  secondsSinceUpdate,
  averageExposureMultiplier
}: AttackSurfaceHeaderProps) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-gray-800/80 gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 dark:bg-emerald-400"></span>
          </span>
          <span className="text-[10px] font-mono tracking-widest text-[#38BDF8] dark:text-[#38BDF8] uppercase font-bold">
            SOC Attack Surface &amp; Exposure Agent
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-none bg-linear-to-r from-slate-900 via-slate-700 to-slate-550 dark:from-white dark:via-gray-300 dark:to-gray-500 bg-clip-text text-transparent">
          Attack Surface &amp; Exposure Intelligence
        </h1>
        <p className="text-[10px] sm:text-[11px] text-slate-505 dark:text-gray-400 font-mono tracking-wide uppercase mt-1">
          Real-time Threat Modeling, Telemetry mapping, &amp; Bayesian fusion validation
        </p>
      </div>

      {/* Real-time Indicator Widget */}
      <div className="flex items-center gap-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-800 p-2 rounded-lg shrink-0 shadow-sm dark:shadow-none">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-slate-400 dark:text-gray-500 uppercase">SYS TELEMETRY FEED</span>
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-mono px-1.5 py-0.5 rounded border border-emerald-500/20 font-black animate-pulse">
              LIVE
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-700 dark:text-gray-300 font-bold mt-0.5">
            Updated {secondsSinceUpdate}s ago
          </span>
        </div>
        <div className="h-8 w-px bg-slate-200 dark:bg-gray-800" />
        <div className="text-right">
          <span className="text-[9px] font-mono text-slate-450 dark:text-gray-500 block uppercase">FUSION INDEX</span>
          <span className="text-sm font-black text-rose-500 dark:text-rose-400 font-mono">{averageExposureMultiplier}/100</span>
        </div>
      </div>
    </div>
  );
}
