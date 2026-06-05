import React from "react";
import { CalculatedKPIs } from "./reportsConfig";

interface ExecutiveSummaryTabProps {
  calculatedKPIs: CalculatedKPIs;
  selectedAttackTypes: string[];
}

export function ExecutiveSummaryTab({
  calculatedKPIs,
  selectedAttackTypes,
}: ExecutiveSummaryTabProps) {
  return (
    <div className="space-y-6" id="executive-summary-view">
      {/* Decorative Banner */}
      <div className="bg-linear-to-r from-cyan-50 via-[#f8fafc] to-indigo-50 dark:from-cyan-950/30 dark:via-slate-950/15 dark:to-indigo-950/25 border border-cyan-100 dark:border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-2 py-0.5 bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-400/20 rounded text-[8px] font-mono font-black uppercase tracking-wider block w-fit">
              Strategic SOC Overview
            </span>
            <h3 className="text-lg md:text-xl font-bold font-sans text-slate-850 dark:text-neutral-100 flex items-center gap-2 tracking-tight uppercase">
              Executive Risk assessment Insights
            </h3>
            <p className="text-xs text-slate-600 dark:text-neutral-400 uppercase tracking-normal leading-relaxed max-w-2xl font-mono">
              Consolidated health KPIs indicating malicious traffic levels, machine learning decisions efficiency, and current threat mitigation states over the active target window.
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono">
            <div className="bg-[#f8fafc]/90 dark:bg-[#020617]/90 px-4 py-2.5 rounded-xl border border-border dark:border-slate-800 text-right">
              <span className="text-[8px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-widest block">System Status</span>
              <span className="text-xs uppercase text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" /> CONSENSUS STABLE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 8 GRID KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono select-none">
        {/* Item 1: Total Alerts */}
        <div className="bg-card border border-border rounded-xl p-4.5 space-y-2 relative group hover:border-cyan-500/30 transition-all duration-300">
          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest block">Total Alerts</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{calculatedKPIs.totalAlerts.toLocaleString()}</span>
            <span className="text-[10px] text-rose-500 font-extrabold select-none hover:opacity-90 group-hover:block">+12% vs LY</span>
          </div>
          <div className="text-[8.5px] uppercase text-slate-500 dark:text-slate-400">Flow-aggregates analyzed</div>
        </div>

        {/* Item 2: Critical Alerts */}
        <div className="bg-card border border-rose-500/10 rounded-xl p-4.5 space-y-2 relative group hover:border-rose-500/30 transition-all duration-300">
          <span className="text-[9px] text-rose-600 dark:text-rose-500 font-black uppercase tracking-widest block">Critical Alerts</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-500">{calculatedKPIs.criticalAlerts.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-500 font-extrabold select-none">-5% vs LY</span>
          </div>
          <div className="text-[8.5px] uppercase text-slate-500 dark:text-slate-400">Immediate Action Required</div>
        </div>

        {/* Item 3: High Alerts */}
        <div className="bg-card border border-amber-500/10 rounded-xl p-4.5 space-y-2 relative group hover:border-amber-500/30 transition-all duration-300">
          <span className="text-[9px] text-amber-600 dark:text-amber-500 font-black uppercase tracking-widest block">High Severity</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-500">{calculatedKPIs.highAlerts.toLocaleString()}</span>
            <span className="text-[10px] text-rose-500 font-extrabold select-none">+20% vs LY</span>
          </div>
          <div className="text-[8.5px] uppercase text-slate-500 dark:text-slate-400">WAF Filters Active</div>
        </div>

        {/* Item 4: Medium/Low aggregate */}
        <div className="bg-card border border-border/80 rounded-xl p-4.5 space-y-2 relative group hover:border-cyan-500/30 transition-all duration-300">
          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest block">Medium & Low</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-800 dark:text-slate-200">{(calculatedKPIs.mediumAlerts + calculatedKPIs.lowAlerts).toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold select-none">Stable</span>
          </div>
          <div className="text-[8.5px] uppercase text-slate-500 dark:text-slate-400">Simulated alerts filtered</div>
        </div>

        {/* Item 5: Top Threat */}
        <div className="bg-card border border-border rounded-xl p-4.5 space-y-2 relative group hover:border-purple-500/30 transition-all duration-300">
          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest block font-mono">Top Threat Type</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">{calculatedKPIs.topThreat}</span>
          </div>
          <div className="text-[8.5px] uppercase text-slate-500 dark:text-slate-400">Vector representation</div>
        </div>

        {/* Item 6: Average Risk Score */}
        <div className="bg-card border border-border rounded-xl p-4.5 space-y-2 relative group hover:border-rose-500/30 transition-all duration-300">
          <div className="flex justify-between">
            <span className="text-[9px] text-slate-505 dark:text-slate-405 font-black uppercase tracking-widest block">Average Risk Score</span>
            <span className="text-[9.5px] uppercase text-rose-500 font-bold block">Critical State</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-500">{calculatedKPIs.averageRisk}%</span>
            <span className="text-[10px] text-rose-500 font-semibold select-none">+4.5%</span>
          </div>
          <div className="text-[8.5px] uppercase text-slate-500 dark:text-slate-400">Core Assets Evaluated</div>
        </div>

        {/* Item 7: Mean Detection Latency */}
        <div className="bg-card border border-border rounded-xl p-4.5 space-y-2 relative group hover:border-emerald-500/30 transition-all duration-300">
          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest block">Mean detection latency</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{calculatedKPIs.meanLatency}s</span>
            <span className="text-[10px] text-emerald-500 font-extrabold select-none">-0.6s</span>
          </div>
          <div className="text-[8.5px] uppercase text-slate-500 dark:text-slate-400">Multi-Model Pipeline average</div>
        </div>

        {/* Item 8: Precision Score Index */}
        <div className="bg-card border border-border rounded-xl p-4.5 space-y-2 relative group hover:border-emerald-500/30 transition-all duration-300">
          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest block">Fusion Target Precision</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">98.9%</span>
            <span className="text-[10px] text-emerald-500 font-extrabold select-none">+0.5%</span>
          </div>
          <div className="text-[8.5px] uppercase text-slate-500 dark:text-slate-400">Logical Filter Consensus</div>
        </div>
      </div>

      {/* Highlights section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 space-y-3 font-mono text-[10px]">
          <span className="text-xs font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 block border-b border-border pb-2">
            SOC Recommendation Guidance
          </span>
          <ul className="space-y-2.5 list-disc list-inside uppercase font-semibold leading-relaxed text-slate-700 dark:text-slate-300">
            <li>Isolate IP <code className="text-rose-500 font-extrabold">185.220.101.5</code> immediately from application proxy - persistent high-latency SQLi payloads active.</li>
            <li>Rule validation maps high threat indicators to MITRE <code className="text-cyan-600 dark:text-cyan-400 font-extrabold">T1190</code> (Public-Facing Exploit vectors) targeting Customer HTTP servers.</li>
            <li>Web Attack Detector (AI2B) accuracy is stable at <code className="text-emerald-500 font-extrabold">98.5%</code>. Fusion consensus can safely continue automated block actions.</li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-3 font-mono text-[10px] flex flex-col justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 block border-b border-border pb-2">
              Core Performance Status
            </span>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[8.5px]">Overall Accuracy</p>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-1">98.4%</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[8.5px]">F1 Macro Average</p>
                <p className="text-lg font-black text-purple-600 dark:text-purple-400 mt-1">98.0%</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[8.5px]">Packet Loss Rate</p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">0.00%</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[8.5px]">Consensus Threshold</p>
                <p className="text-lg font-black text-amber-500 mt-1">85% Alert</p>
              </div>
            </div>
          </div>
          <div className="text-[8px] uppercase tracking-widest text-slate-500 dark:text-slate-400 border-t border-border dark:border-slate-805 pt-2 text-right">
            System clock sync active (1.8ms drift)
          </div>
        </div>
      </div>
    </div>
  );
}
