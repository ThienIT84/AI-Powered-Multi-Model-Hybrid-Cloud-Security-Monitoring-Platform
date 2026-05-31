import React from "react";
import { Alert, getAlertFusionMeta } from "../../types";
import { Scale, Check, AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "../../lib/utils";

interface ConfidenceVotingPanelProps {
  alert: Alert;
}

export function ConfidenceVotingPanel({ alert }: ConfidenceVotingPanelProps) {
  const meta = getAlertFusionMeta(alert);

  // States
  const isAnomaly = meta.ai1Result === "ANOMALY";
  const hasTrafficThreat = meta.ai2aClass !== "Normal";
  const hasWebThreat = meta.ai2bWeb !== "NONE";
  const hasSuricata = meta.suricataEvidence !== "NO MATCH";

  const ai1Weight = 25;
  const ai2aWeight = 30;
  const ai2bWeight = 25;
  const suricataWeight = 20;
  const fusionWeight = 100;

  const engines = [
    {
      name: "AI1 Anomaly Det",
      prediction: meta.ai1Result,
      confidence: isAnomaly ? 91 : 94,
      weight: ai1Weight,
      color: "bg-cyan-500",
      textColor: "text-cyan-400",
      influence: isAnomaly ? "Significant Anomaly" : "Baseline Clean",
      supported: isAnomaly
    },
    {
      name: "AI2A Flow Class",
      prediction: meta.ai2aClass,
      confidence: meta.ai2aClass !== "Normal" ? 89 : 96,
      weight: ai2aWeight,
      color: "bg-orange-500",
      textColor: "text-orange-400",
      influence: meta.ai2aClass !== "Normal" ? "Attack Profile Match" : "Clean Flow",
      supported: meta.ai2aClass !== "Normal"
    },
    {
      name: "AI2B Payload Det",
      prediction: meta.ai2bWeb,
      confidence: meta.ai2bWeb !== "NONE" ? 92 : 98,
      weight: ai2bWeight,
      color: "bg-purple-500",
      textColor: "text-purple-400",
      influence: meta.ai2bWeb !== "NONE" ? "Semantic Threat Hit" : "No Code Inj",
      supported: meta.ai2bWeb !== "NONE"
    },
    {
      name: "Suricata Signature",
      prediction: hasSuricata ? "ID MATCH" : "BYPASSED",
      confidence: hasSuricata ? 95 : 0,
      weight: suricataWeight,
      color: "bg-blue-500",
      textColor: "text-blue-400",
      influence: hasSuricata ? "Known Threat Rule" : "No Hard Sig",
      supported: hasSuricata
    }
  ];

  // Agreement rates and calculations
  const totalWeight = ai1Weight + ai2aWeight + ai2bWeight + suricataWeight;
  const supportedWeight = engines
    .filter(e => e.supported)
    .reduce((sum, e) => sum + e.weight, 0);

  const finalScorePercent = Math.round((supportedWeight / totalWeight) * 100);

  // Mismatch check (e.g. AI1 says normal, Suricata triggers, etc.)
  const hasConflict = (isAnomaly === false && (hasWebThreat || hasSuricata)) || (isAnomaly === true && (!hasTrafficThreat && !hasWebThreat && !hasSuricata));

  return (
    <div className="space-y-4">
      {/* Target 12. Panel Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-[0.2em] block">
            CONFIDENCE VOTING CORE
          </span>
          <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-wider block mt-0.5">
            Statistical Contribution & Combined Voting Analysis
          </h3>
        </div>
        <Scale size={12} className="text-cyan-500" />
      </div>

      <div className="bg-secondary/15 border border-border/50 rounded-xl p-3.5 space-y-4">
        {/* Dynamic Stacked Bar representing individual engine weight contributions to the final decision */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[8px] font-mono uppercase font-bold text-muted-foreground">
            <span>Model Consensus Weights Stack</span>
            <span className="text-foreground">Total: {totalWeight}% weight distribution</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden flex border border-border/20">
            {engines.map(engine => (
              <div
                key={engine.name}
                className={cn("h-full transition-all duration-300", engine.supported ? engine.color : "bg-muted-foreground/10")}
                style={{ width: `${(engine.weight / totalWeight) * 100}%` }}
                title={`${engine.name}: ${engine.weight}% weight`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[7px] font-mono text-muted-foreground font-semibold">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> AI1 (25%)</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> AI2A (30%)</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> AI2B (25%)</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Suricata (20%)</span>
          </div>
        </div>

        {/* Weights & Prediction Matrix table */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[8px]">
          {engines.map(e => (
            <div key={e.name} className="border border-border/40 bg-card rounded-lg p-2 flex flex-col justify-between">
              <span className="font-bold text-muted-foreground truncate uppercase">{e.name}</span>
              <div className="mt-1.5 space-y-1">
                <span className={cn("text-[9px] font-mono font-black", e.supported ? e.textColor : "text-muted-foreground/60")}>
                  {e.prediction}
                </span>
                <div className="flex justify-between text-[7px] font-semibold text-muted-foreground/60 leading-none">
                  <span>Wt: {e.weight}%</span>
                  <span>Conf: {e.confidence}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected final path reasoning */}
        <div className="p-2.5 bg-background/50 border border-border-cyan/10 rounded-lg flex items-start gap-2.5 text-[8.5px] uppercase tracking-wider font-bold">
          <ShieldCheck size={14} className="text-cyan-500 mt-0.5 shrink-0" />
          <div className="leading-relaxed">
            <span className="text-[7.5px] font-black text-muted-foreground block">Fusion Level Synthesized Logic</span>
            <p className="text-muted-foreground/90 mt-0.5 leading-normal">
              Final Fusion evaluation reached <span className="text-[#06b6d4] font-black">{finalScorePercent}% certainty</span>. Consensus is derived from the active corroboration of {engines.filter(e => e.supported).length} out of 4 independent detection systems.
            </p>
          </div>
        </div>

        {/* Conflict warning if there are contradicting features */}
        {hasConflict && (
          <div className="p-2 bg-yellow-500/5 text-yellow-500 border border-yellow-500/20 rounded-md text-[7px] font-bold tracking-widest uppercase flex items-center gap-1.5">
            <AlertTriangle size={11} className="shrink-0" />
            <span>WARNING: Contradicting metrics observed across active classifier layers</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConfidenceVotingPanel;
