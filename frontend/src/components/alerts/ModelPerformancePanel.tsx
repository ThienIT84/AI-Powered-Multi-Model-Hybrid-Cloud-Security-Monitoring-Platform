import React from "react";
import { Brain, BarChart2, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";

export function ModelPerformancePanel() {
  const modelStats = [
    {
      name: "AI1 Anomaly Det (Forest)",
      accuracy: 94.2,
      f1Score: 0.92,
      thresholdAccuracy: 90.0,
      thresholdF1: 0.85,
      status: "PASSING"
    },
    {
      name: "AI2A Attack Classifier",
      accuracy: 91.5,
      f1Score: 0.89,
      thresholdAccuracy: 90.0,
      thresholdF1: 0.85,
      status: "PASSING"
    },
    {
      name: "AI2B Deep Payload Web",
      accuracy: 88.4,
      f1Score: 0.82,
      thresholdAccuracy: 90.0,
      thresholdF1: 0.85,
      status: "DEGRADED"
    }
  ];

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-1.5">
          <Brain size={14} className="text-cyan-500" />
          <h3 className="text-[10px] font-black uppercase tracking-wider text-foreground leading-none">
            Longitudinal Accuracy & F1 Performance Metrics
          </h3>
        </div>
        <Sparkles size={11} className="text-cyan-500 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modelStats.map((ms, i) => {
          const accuracyDegraded = ms.accuracy < ms.thresholdAccuracy;
          const f1Degraded = ms.f1Score < ms.thresholdF1;
          const isDegraded = accuracyDegraded || f1Degraded;

          return (
            <div 
              key={i} 
              className={cn(
                "p-4 border rounded-xl bg-card space-y-4 transition-all hover:border-border/80 relative overflow-hidden",
                isDegraded 
                  ? "border-red-500 bg-red-950/2" 
                  : "border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-black uppercase text-foreground leading-none truncate max-w-42.5">{ms.name}</span>
                <span className={cn(
                  "font-mono text-[6.5px] font-black px-1.5 py-0.5 border rounded uppercase",
                  isDegraded 
                    ? "border-red-500 bg-red-500/10 text-red-500 ring-2 ring-red-500/10" 
                    : "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                )}>
                  {isDegraded ? "Degraded" : "Passing"}
                </span>
              </div>

              {/* Degradation Threshold Warning Alert (SECTION 18 Requirement) */}
              {isDegraded && (
                <div className="p-2 border border-red-500/20 bg-red-500/5 text-red-500 rounded text-[7.5px] uppercase font-bold tracking-wide flex items-center gap-1.5 leading-snug">
                  <ShieldAlert size={12} className="shrink-0 text-red-500" />
                  <span>Model metrics are below SOC SLAs! Retraining pipeline recommended.</span>
                </div>
              )}

              {/* Visual mini gauges for stats */}
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between font-mono text-[8px] uppercase font-semibold">
                    <span className="text-muted-foreground">Model Accuracy</span>
                    <span className={cn("font-bold", accuracyDegraded ? "text-red-400" : "text-foreground")}>{ms.accuracy}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden border border-border/10">
                    <div 
                      className={cn("h-full transition-all duration-300", accuracyDegraded ? "bg-red-500" : "bg-cyan-500")}
                      style={{ width: `${ms.accuracy}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between font-mono text-[8px] uppercase font-semibold">
                    <span className="text-muted-foreground">F1 Score Index</span>
                    <span className={cn("font-bold", f1Degraded ? "text-red-400" : "text-foreground")}>{ms.f1Score.toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden border border-border/10">
                    <div 
                      className={cn("h-full transition-all duration-300", f1Degraded ? "bg-red-500" : "bg-purple-500")}
                      style={{ width: `${ms.f1Score * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[7px] font-mono text-muted-foreground/60 uppercase font-black pt-1 leading-none">
                <span>Min SLA Acc: {ms.thresholdAccuracy}%</span>
                <span>Min SLA F1: {ms.thresholdF1}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ModelPerformancePanel;
