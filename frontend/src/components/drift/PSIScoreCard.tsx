import React from "react";
import { DRIFT_METRICS_DUMMY } from "./driftConfig";
import { cn } from "../../lib/utils";
import { AlertTriangle, CheckCircle, ShieldAlert, Zap } from "lucide-react";

export function PSIScoreCard() {
  const getPsiMeta = (score: number) => {
    if (score < 0.1) {
      return {
        label: "STABLE",
        colorZone: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        message: "Distribution is stable. No retraining necessary.",
        icon: CheckCircle
      };
    } else if (score <= 0.25) {
      return {
        label: "MODERATE DRIFT",
        colorZone: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
        message: "Slight feature shift detected. Queue for recheck.",
        icon: AlertTriangle
      };
    } else {
      return {
        label: "CRITICAL SHIFT",
        colorZone: "text-red-500 bg-red-500/10 border-red-500/20",
        message: "Significant feature drift. Retraining mandatory!",
        icon: ShieldAlert
      };
    }
  };

  const models = [
    { name: "AI1 Anomaly Model", key: "ai1", score: DRIFT_METRICS_DUMMY.psiScoreAI1 },
    { name: "AI2A Grid Classifier", key: "ai2a", score: DRIFT_METRICS_DUMMY.psiScoreAI2a },
    { name: "AI2B Web Payload Engine", key: "ai2b", score: DRIFT_METRICS_DUMMY.psiScoreAI2b }
  ];

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">
          MODEL PERFORMANCE INDICES
        </span>
        <Zap size={13} className="text-cyan-500 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {models.map(m => {
          const meta = getPsiMeta(m.score);
          const Icon = meta.icon;

          return (
            <div 
              key={m.key} 
              className="bg-background/40 border border-border/70 rounded-xl p-3.5 flex flex-col justify-between hover:border-border transition-all select-none leading-none"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-black uppercase text-foreground truncate max-w-30">{m.name}</span>
                  <span className={cn(
                    "text-[7px] font-black px-1.5 py-0.5 rounded border uppercase font-mono text-center tracking-widest",
                    meta.colorZone
                  )}>
                    {meta.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-[20px] font-mono font-black text-foreground">
                    {m.score.toFixed(2)}
                  </span>
                  <span className="text-[7.5px] text-muted-foreground uppercase tracking-wider font-extrabold font-mono">
                    PSI Index
                  </span>
                </div>
              </div>

              <div className="mt-3.5 pt-2 border-t border-border/40 flex items-start gap-1.5">
                <Icon size={12} className={cn("shrink-0 mt-px", meta.colorZone.split(" ")[0])} />
                <p className="text-[7.5px] text-muted-foreground leading-tight">{meta.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
