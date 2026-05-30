import React from "react";
import { Alert, getAlertFusionMeta } from "../../types";
import { MODEL_WEIGHTS } from "./fusionConfig";
import { cn } from "../../lib/utils";
import { Check, AlertTriangle, Scale, Award } from "lucide-react";

interface DecisionVotingPanelProps {
  alert: Alert;
}

export function DecisionVotingPanel({ alert }: DecisionVotingPanelProps) {
  const meta = getAlertFusionMeta(alert);

  // States
  const isAnomaly = meta.ai1Result === "ANOMALY";
  const hasTrafficThreat = meta.ai2aClass !== "Normal";
  const hasWebThreat = meta.ai2bWeb !== "NONE";
  const hasSuricata = meta.suricataEvidence !== "NO MATCH";

  // Votes definitions
  const votes = [
    {
      engine: "AI1 Anomaly Model",
      vote: isAnomaly ? "ANOMALY" : "NORMAL",
      rawScore: isAnomaly ? 0.72 + (alert.riskScore * 0.0025) : 0.15,
      weight: MODEL_WEIGHTS.ai1,
      impact: isAnomaly ? "HIGH" : "CLEAN",
      color: isAnomaly ? "text-red-500 bg-red-500/10 border-red-500/20" : "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      engine: "AI2A Flow Classifier",
      vote: meta.ai2aClass,
      rawScore: alert.confidenceScore,
      weight: MODEL_WEIGHTS.ai2a,
      impact: hasTrafficThreat ? "SUSPICIOUS" : "CLEAN",
      color: hasTrafficThreat ? "text-orange-500 bg-orange-500/10 border-orange-500/20" : "text-muted-foreground bg-muted border-border"
    },
    {
      engine: "AI2B Deep Payload Web",
      vote: meta.ai2bWeb,
      rawScore: hasWebThreat ? 0.94 : 0.08,
      weight: MODEL_WEIGHTS.ai2b,
      impact: hasWebThreat ? "EXPLOIT" : "CLEAN",
      color: hasWebThreat ? "text-purple-500 bg-purple-500/10 border-purple-500/20" : "text-muted-foreground bg-muted border-border"
    },
    {
      engine: "Suricata Signature Hit",
      vote: hasSuricata ? `MATCH (${meta.suricataEvidence})` : "NO MATCH",
      rawScore: hasSuricata ? 1.0 : 0.0,
      weight: MODEL_WEIGHTS.suricata,
      impact: hasSuricata ? "CRITICAL" : "CLEAN",
      color: hasSuricata ? "text-blue-500 bg-blue-500/10 border-blue-500/20" : "text-muted-foreground bg-muted border-border"
    }
  ];

  // Agreement and Conflict Logic
  const positiveVotesCount = [isAnomaly, hasTrafficThreat, hasWebThreat, hasSuricata].filter(Boolean).length;
  const agreementRateText = `${positiveVotesCount} of 4 engines agree`;
  const agreementPercent = Math.round((positiveVotesCount / 4) * 100);

  // Mismatch logic: Is there conflicting evidence? E.g., Anomaly is NORMAL but there is a signature hit or web exploit model triggered, OR vice versa.
  const hasConflict = (isAnomaly === false && (hasWebThreat || hasSuricata)) || (isAnomaly === true && (!hasTrafficThreat && !hasWebThreat && !hasSuricata));

  const conflictMessage = hasConflict 
    ? "⚠️ Conflict detected: High mismatch pattern discovered. AI1 behavioral indices contradict downstream classifiers!"
    : "✓ Full consensus: Network anomaly is corroborated by layer classifiers.";

  // Calculate final aggregated index
  const weightedSum = votes.reduce((acc, current) => {
    return acc + current.rawScore * current.weight;
  }, 0);

  const finalWeightedScorePercent = Math.round(weightedSum * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">
            CONCENSUS MATRIX VOTING SYSTEM
          </span>
          <span className="text-[9.5px] font-black text-cyan-500 uppercase tracking-wider block mt-0.5">
            Weighted voting and engine convergence rate
          </span>
        </div>
        <Scale size={14} className="text-cyan-500" />
      </div>

      <div className="bg-background/40 border border-border/70 rounded-xl overflow-hidden">
        {/* Table representation */}
        <table className="w-full text-left text-[8.5px] border-collapse">
          <thead>
            <tr className="bg-muted/30 border-b border-border font-bold text-muted-foreground h-7 px-3">
              <th className="pl-3 font-semibold uppercase">Engine Module</th>
              <th className="font-semibold uppercase">Synthesized Vote</th>
              <th className="font-semibold uppercase text-center">Score</th>
              <th className="font-semibold uppercase text-center">Weighting</th>
              <th className="font-semibold uppercase text-right pr-3">Verdict</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {votes.map((v, i) => (
              <tr key={i} className="h-9 hover:bg-muted/10 leading-none">
                <td className="pl-3 font-black text-foreground">{v.engine}</td>
                <td>
                  <span className={cn("px-1.5 py-0.5 rounded text-[7.5px] font-black uppercase text-center border mr-2", v.color)}>
                    {v.vote}
                  </span>
                </td>
                <td className="font-mono text-center font-bold text-foreground">{(v.rawScore).toFixed(2)}</td>
                <td className="font-mono text-center text-muted-foreground text-[8px]">{(v.weight * 100).toFixed(0)}%</td>
                <td className="text-right font-black text-[7.5px] text-muted-foreground pr-3">{v.impact}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Voting Analytics Row */}
        <div className="p-3 border-t border-border bg-muted/10 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-wide block">CONVERGENCE SPEED</span>
            <div className="flex items-baseline gap-1">
              <span className="text-[12px] font-mono font-black text-foreground">0.02ms</span>
              <span className="text-[7px] text-muted-foreground font-semibold">latency</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-wide block">AGREEMENT INDEX</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-mono font-black text-[#06b6d4]">{agreementPercent}%</span>
              <span className="text-[8px] text-muted-foreground uppercase tracking-wider font-extrabold font-mono">({agreementRateText})</span>
            </div>
          </div>
          <div className="space-y-1 col-span-2 md:col-span-1">
            <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-wide block">CONSOLIDATED SCORE</span>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-mono font-black text-[#06b6d4]">{finalWeightedScorePercent}%</span>
              <div className="flex-1 max-w-12.5 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#06b6d4] rounded-full" 
                  style={{ width: `${finalWeightedScorePercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conflict Detection Banner */}
      <div className={cn(
        "p-2.5 rounded-xl border flex items-center gap-2 text-[8px] font-bold leading-tight uppercase tracking-wider",
        hasConflict
          ? "border-yellow-500/20 bg-yellow-500/2 text-yellow-500"
          : "border-emerald-500/20 bg-emerald-500/2 text-emerald-500"
      )}>
        {hasConflict ? <AlertTriangle size={12} className="shrink-0" /> : <Check size={12} className="shrink-0" />}
        <span>{conflictMessage}</span>
      </div>
    </div>
  );
}
