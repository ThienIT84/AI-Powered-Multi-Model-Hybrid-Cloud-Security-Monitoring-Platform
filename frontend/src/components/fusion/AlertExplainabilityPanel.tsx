import React from "react";
import { Alert, getAlertFusionMeta } from "../../types";
import { getExplainabilityFeatures } from "./fusionConfig";
import { cn } from "../../lib/utils";
import { HelpCircle, Sparkles, TrendingUp, TrendingDown } from "lucide-react";

interface AlertExplainabilityPanelProps {
  alert: Alert;
}

export function AlertExplainabilityPanel({ alert }: AlertExplainabilityPanelProps) {
  const features = getExplainabilityFeatures(alert);
  const meta = getAlertFusionMeta(alert);

  // Math totals to find contribution percentage
  const maxContribution = Math.max(...features.map(f => Math.abs(f.weight)));

  return (
    <div className="space-y-4">
      {/* Explainability Core Title */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">
            SHAP MODEL EXPLAINABILITY
          </span>
          <span className="text-[9.5px] font-black text-cyan-500 uppercase tracking-wider block mt-0.5">
            Key telemetry dimensions driving verdict
          </span>
        </div>
        <Sparkles size={14} className="text-cyan-500" />
      </div>

      {/* SHAP Chart Box */}
      <div className="bg-background/40 border border-border/70 rounded-xl p-3.5 space-y-3.5">
        <h4 className="text-[8.5px] font-black text-foreground uppercase tracking-widest flex items-center gap-1.5 leading-none">
          <TrendingUp size={11} className="text-cyan-400" />
          Feature Contribution Weights (SHAP value)
        </h4>

        {/* CSS/Tailwind Horizontal Bar Importance Chart */}
        <div className="space-y-3">
          {features.map((item, index) => {
            const isPositive = item.direction === "positive";
            const ratio = (Math.abs(item.weight) / maxContribution) * 100;

            return (
              <div key={index} className="space-y-1 select-none leading-none">
                <div className="flex items-center justify-between text-[8px]">
                  <span className="font-extrabold text-foreground uppercase tracking-wide">
                    {item.feature}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className={cn(
                      "font-black text-[8.5px]",
                      isPositive ? "text-red-400" : "text-emerald-400"
                    )}>
                      {isPositive ? "+" : ""}{item.weight}
                    </span>
                    <span className="text-muted-foreground/60 text-[7px] uppercase font-semibold">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Simulated Custom Progress bar */}
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex relative border border-border/30">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isPositive 
                        ? "bg-linear-to-r from-red-600/60 to-red-500/90 shadow-[0_0_8px_rgba(239,68,68,0.3)]" 
                        : "bg-linear-to-r from-emerald-600/60 to-emerald-500/90"
                    )}
                    style={{ width: `${ratio}%` }}
                  />
                </div>

                <p className="text-[7.2px] text-muted-foreground leading-normal italic pl-1">
                  Reason: {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Interpret text box as requested: High outbound byte ratio + abnormal duration -> AI1 anomaly triggered */}
        <div className="p-2.5 bg-secondary/10 border border-border/80 rounded-lg space-y-1.5 leading-normal">
          <span className="text-[7.5px] font-black tracking-widest text-[#06b6d4] uppercase block">
            AI VIRTUALLY DERIVED INTERPRETATION
          </span>
          <p className="text-[8px] text-muted-foreground font-medium">
             Anomalous outbound bytes ratio (<span className="text-red-400 font-bold">{alert.zeekData?.origBytes || "45,212"} bytes</span>) paired with an 
             abnormal session duration (<span className="text-red-400 font-bold">{alert.zeekData?.duration || "12.4s"}</span>) triggers deep forest behavioral anomalies. 
             Rule scanning and AI classification convergence resolves as <span className="text-[#06b6d4] font-black">{alert.attackType}</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
