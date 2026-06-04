import React from "react";
import { Alert, getAlertFusionMeta } from "../../../types";
import { cn } from "../../../lib/utils";
import { GitCommit, Activity, Server, Zap } from "lucide-react";

interface FusionDecisionSummaryProps {
  alert: Alert;
}

export function FusionDecisionSummary({ alert }: FusionDecisionSummaryProps) {
  const meta = getAlertFusionMeta(alert);

  return (
    <div className="space-y-3.5 bg-background/30 p-3.5 rounded-xl border border-border/70 select-none">
      <div className="flex items-center justify-between">
        <span className="text-[8.5px] text-[#06b6d4] uppercase tracking-widest font-black block">
          Decision Convergence Summary
        </span>
        <Zap size={11} className="text-cyan-500" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-0.5 leading-none">
          <span className="text-[7.5px] font-black text-muted-foreground uppercase">Correlation Matrix</span>
          <p className="text-[10px] font-mono font-black text-foreground uppercase">{alert.protocol} Flow Stream</p>
        </div>

        <div className="space-y-0.5 leading-none">
          <span className="text-[7.5px] font-black text-muted-foreground uppercase">Aggregation Target</span>
          <p className="text-[10px] font-mono font-black text-foreground lowercase">port {alert.destinationPort}</p>
        </div>

        <div className="space-y-0.5 leading-none">
          <span className="text-[7.5px] font-black text-muted-foreground uppercase">Tactical Resolution</span>
          <p className="text-[10px] font-black text-cyan-400 uppercase truncate">{alert.attackType}</p>
        </div>

        <div className="space-y-0.5 leading-none">
          <span className="text-[7.5px] font-black text-muted-foreground uppercase">Active Bounds Status</span>
          <p className="text-[10px] font-mono font-black text-red-400 uppercase">{alert.status.toUpperCase()}</p>
        </div>
      </div>

      {/* Narrative block */}
      <p className="text-[8.5px] text-muted-foreground leading-normal border-t border-border/30 pt-2 font-medium">
        Decision consolidation verified by multi-class classifiers. Deep network check on {alert.sourceIp} registers alert confidence at <span className="text-foreground font-semibold">{(alert.confidenceScore * 100).toFixed(0)}%</span>.
      </p>
    </div>
  );
}
export default FusionDecisionSummary;
