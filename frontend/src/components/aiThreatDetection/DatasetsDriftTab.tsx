import React from "react";
import { Database, Activity } from "lucide-react";

export function DatasetsDriftTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 leading-normal animate-fadeIn">
      {/* 11. DATASET INSIGHTS PANEL */}
      {/* Left block: Dataset summaries */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-1.5 pb-2 border-b border-border/60">
          <Database size={14} className="text-cyan-500" />
          <h3 className="text-xs font-black uppercase tracking-wider">
            Model Training Datasets Profile
          </h3>
        </div>

        <div className="space-y-4 divide-y divide-border/40">
          
          {/* Conn Dataset */}
          <div className="space-y-2 pt-1">
            <span className="text-[10.5px] font-mono font-black text-foreground block">
              Conn.log Baseline Dataset
            </span>
            <div className="grid grid-cols-3 gap-2 font-mono text-[8.5px] text-muted-foreground">
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-2 border border-border/60 rounded">
                Total Records: <strong className="text-foreground block mt-0.5">385,420</strong>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-2 border border-border/60 rounded">
                Unique Services: <strong className="text-foreground block mt-0.5">14 Services</strong>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-2 border border-border/60 rounded">
                Attack Profile: <strong className="text-foreground block mt-0.5">6 Labels</strong>
              </div>
            </div>
          </div>

          {/* HTTP Dataset */}
          <div className="space-y-2 pt-3">
            <span className="text-[10.5px] font-mono font-black text-foreground block">
              HTTP.log Semantic Dataset
            </span>
            <div className="grid grid-cols-4 gap-1.5 font-mono text-[8.5px] text-muted-foreground">
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-1.5 border border-border/60 rounded">
                Total Records: <strong className="text-foreground block mt-0.5">112,040</strong>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-1.5 border border-border/60 rounded">
                Unique URIs: <strong className="text-foreground block mt-0.5">12,850</strong>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-1.5 border border-border/60 rounded">
                XSS Samples: <strong className="text-foreground block mt-0.5">1,200</strong>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-1.5 border border-border/60 rounded">
                SQLi Samples: <strong className="text-foreground block mt-0.5">962</strong>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Right block: Covariate Shift / Drifts monitoring */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-1.5 pb-2 border-b border-border/60">
          <Activity size={14} className="text-cyan-500" />
          <h3 className="text-xs font-black uppercase tracking-wider">
            Model Drift &amp; Covariate Shift Monitoring
          </h3>
        </div>

        <p className="text-[8.5px] text-muted-foreground leading-normal font-mono uppercase">
          Calculates distribution mismatches between real-world stream signals and our static training validation split.
        </p>

        <div className="space-y-4 leading-normal font-mono text-[8.5px]">
          
          {/* Indicator 1: PSI */}
          <div className="p-3 border border-border/60 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-foreground block">PSI (Population Stability Index)</span>
              <span className="text-slate-500 text-[8px] uppercase">Threshold limits: &lt;0.10 indicates Stable</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-emerald-500 block">0.081</span>
              <span className="text-[7.5px] uppercase text-emerald-500/80 font-black bg-emerald-500/10 px-1 rounded">Stable Split</span>
            </div>
          </div>

          {/* Indicator 2: Domain Classifier Accuracy */}
          <div className="p-3 border border-border/60 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-foreground block">Domain Classifier Accuracy</span>
              <span className="text-slate-500 text-[8px] uppercase">Goal: ~50% (indicates zero dataset discrepancy)</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-emerald-500 block">51.2%</span>
              <span className="text-[7.5px] uppercase text-emerald-500/80 font-black bg-emerald-500/10 px-1 rounded">Aligned</span>
            </div>
          </div>

          <p className="text-[7px] text-muted-foreground">
            * Shift analysis recalculated nightly on cached batch dumps stored in the local cluster data stores.
          </p>

        </div>

      </div>
    </div>
  );
}
