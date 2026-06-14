import React from "react";
import { Sparkles, CheckCircle, Percent, ShieldCheck } from "lucide-react";
import { FusionOverviewMetrics } from "./types/dashboard.types";

interface FusionOverviewPanelProps {
  metrics: FusionOverviewMetrics;
}

export const FusionOverviewPanel: React.FC<FusionOverviewPanelProps> = React.memo(({ metrics }) => {
  const cards = [
    {
      id: "alerts",
      label: "Fusion Alerts (24h)",
      value: metrics.fusionAlerts24h,
      suffix: " Alerts",
      icon: <Sparkles size={13} className="text-cyan-400" />,
      sub: "Neural core events triggered"
    },
    {
      id: "agreement",
      label: "AI Agreement Rate",
      value: metrics.aiAgreementRate,
      suffix: "%",
      icon: <CheckCircle size={13} className="text-emerald-400" />,
      sub: "Consensus between models"
    },
    {
      id: "fpr",
      label: "False Positive Reduction",
      value: metrics.falsePositiveReduction,
      suffix: "%",
      icon: <Percent size={13} className="text-sky-400" />,
      sub: "Noise filtration baseline"
    },
    {
      id: "confidence",
      label: "Average Confidence",
      value: metrics.averageConfidence,
      suffix: "%",
      icon: <ShieldCheck size={13} className="text-purple-400" />,
      sub: "Averaged correlation weight"
    }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col justify-between" id="fusion-overview-panel">
      <div>
        <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-4 select-none">
          <Sparkles size={14} className="text-cyan-500 animate-pulse" />
          <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest font-mono">
            Fusion Intelligence Summary
          </h3>
        </div>

        <div className="space-y-4 font-mono select-none">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-secondary/15 border border-border/40 hover:border-cyan-500/15 p-3 rounded-xl flex items-center justify-between gap-3 transition-colors"
            >
              <div className="space-y-0.5">
                <span className="text-[8px] font-black uppercase tracking-tight text-zinc-400 flex items-center gap-1">
                  {card.icon}
                  {card.label}
                </span>
                <span className="text-[7.5px] text-zinc-500 block leading-tight">
                  {card.sub}
                </span>
              </div>

              <div className="text-right">
                <span className="text-base md:text-lg font-black text-foreground tracking-tight leading-none">
                  {card.value}
                  <span className="text-[10px] text-zinc-500 font-bold">{card.suffix}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-[7.5px] text-zinc-500 font-mono mt-4 uppercase select-none border-t border-border/10 pt-2 flex items-center justify-between leading-none font-bold">
        <span>Evaluator state: operational</span>
        <span>Confidence sync: 100%</span>
      </div>
    </div>
  );
});
