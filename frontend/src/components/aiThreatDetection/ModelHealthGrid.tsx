import React from "react";
import { CheckCircle2, Shield } from "lucide-react";

export function ModelHealthGrid() {
  return (
    <div className="space-y-3 animate-fadeIn">
      <div className="flex items-center gap-2 mb-3 px-1">
        <CheckCircle2 size={14} className="text-emerald-500" />
        <h3 className="text-xs font-black uppercase tracking-wider">
          Operational Core AI Models Health Index
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* AI1 Model Health */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                AI1 Network Anomaly
              </h4>
              <p className="text-[8px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase bg-cyan-500/10 px-1.5 py-0.2 rounded w-max mt-1">
                Isolation Forest
              </p>
            </div>
            <span className="text-[9px] font-mono font-black text-emerald-500 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded">
              HEALTHY
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[8.5px] font-mono text-muted-foreground pt-2 border-t border-border/80">
            <div>Version: <span className="font-bold text-foreground">1.0</span></div>
            <div>Latency: <span className="font-bold text-foreground">18ms</span></div>
            <div>Inferences: <span className="font-bold text-foreground">52,347</span></div>
            <div>Core Drift: <span className="font-bold text-emerald-500">Stable</span></div>
          </div>
        </div>

        {/* AI2A Model Health */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                AI2A Attack Classifier
              </h4>
              <p className="text-[8px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase bg-cyan-500/10 px-1.5 py-0.2 rounded w-max mt-1">
                XGBoost Ensemble
              </p>
            </div>
            <span className="text-[9px] font-mono font-black text-emerald-500 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded">
              HEALTHY
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[8.5px] font-mono text-muted-foreground pt-2 border-t border-border/80">
            <div>Version: <span className="font-bold text-foreground">1.0</span></div>
            <div>Latency: <span className="font-bold text-foreground">24ms</span></div>
            <div>Inferences: <span className="font-bold text-foreground">49,112</span></div>
            <div>Core Drift: <span className="font-bold text-emerald-500">Stable</span></div>
          </div>
        </div>

        {/* AI2B Model Health */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                AI2B HTTP Semantic
              </h4>
              <p className="text-[8px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase bg-cyan-500/10 px-1.5 py-0.2 rounded w-max mt-1">
                XGBoost Parser
              </p>
            </div>
            <span className="text-[9px] font-mono font-black text-emerald-500 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded">
              HEALTHY
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[8.5px] font-mono text-muted-foreground pt-2 border-t border-border/80">
            <div>Version: <span className="font-bold text-foreground">1.0</span></div>
            <div>Latency: <span className="font-bold text-foreground">22ms</span></div>
            <div>Inferences: <span className="font-bold text-foreground">51,023</span></div>
            <div>Core Drift: <span className="font-bold text-emerald-500">Stable</span></div>
          </div>
        </div>

        {/* Fusion Layer Health */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                Fusion Layer Decision
              </h4>
              <p className="text-[8px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase bg-amber-500/10 px-1.5 py-0.2 rounded w-max mt-1">
                Sensing correlation
              </p>
            </div>
            <span className="text-[9px] font-mono font-black text-emerald-500 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded">
              ACTIVE
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[8.5px] font-mono text-muted-foreground pt-2 border-t border-border/80">
            <div>Version: <span className="font-bold text-foreground">1.2 (Bayes)</span></div>
            <div>Process Time: <span className="font-bold text-foreground">4ms</span></div>
            <div>Total Decisions: <span className="font-bold text-foreground">5,412</span></div>
            <div>WAF Rules sent: <span className="font-bold text-foreground">1,241</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
