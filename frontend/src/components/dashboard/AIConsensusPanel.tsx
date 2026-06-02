import React from "react";
import { Layers } from "lucide-react";
import { cn } from "../../lib/utils";

export function AIConsensusPanel() {
  const agreementRate = "94.6%";
  const disagreementRate = "5.4%";
  
  // Realtime model consensus scenarios list
  const consensusScenarios = [
    {
      scenario: "AI1 + AI2A Agree; AI2B Disagrees",
      verdict: "Anomaly Confirmed",
      confidence: "82%",
      action: "Consensus Override Accepted",
      color: "border-cyan-200 dark:border-cyan-500/25 bg-cyan-100/30 dark:bg-[#111720]/80 text-cyan-800 dark:text-cyan-400",
      descColor: "text-cyan-600/90 dark:text-cyan-400/80"
    },
    {
      scenario: "All AI Engines Agree Unanimously",
      verdict: "High-Confidence Threat",
      confidence: "99%",
      action: "Immediate Host Isolation Triggered",
      color: "border-red-200 dark:border-red-500/25 bg-red-100/30 dark:bg-[#201111]/80 text-red-800 dark:text-red-400",
      descColor: "text-red-600/90 dark:text-red-400/80"
    },
    {
      scenario: "Suricata Signature Only (AI1 Normal)",
      verdict: "Policy Violation Logged",
      confidence: "65%",
      action: "Heuristic Signature Suppressed",
      color: "border-amber-200 dark:border-amber-500/25 bg-amber-100/30 dark:bg-[#201b11]/80 text-amber-805 dark:text-amber-400/90",
      descColor: "text-amber-600/90 dark:text-amber-400/80"
    }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm h-80 select-none">
      <div className="flex items-center justify-between mb-2 border-b border-border/20 pb-2 shrink-0">
        <h3 className="text-[10px] font-extrabold text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          AI CONSENSUS & VOTING PANEL
        </h3>
        <span className="text-[7.5px] bg-cyan-500/10 dark:bg-[#06b6d4]/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/15 dark:border-cyan-500/15 px-2.5 py-0.5 rounded font-extrabold tracking-widest font-mono">
          STABLE FEED
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-3 p-1">
        {/* Consensus Metrics Gauge / Voting Bars */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-100/60 dark:bg-slate-900/40 p-2.5 rounded-lg border border-border">
            <div className="flex justify-between text-[7px] font-extrabold uppercase tracking-widest text-muted-foreground mb-1.5 leading-none">
              <span>AGREEMENT RATE</span>
              <span className="text-emerald-600 dark:text-emerald-500 font-extrabold">{agreementRate}</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "94.6%" }} />
            </div>
          </div>

          <div className="bg-slate-100/60 dark:bg-slate-900/40 p-2.5 rounded-lg border border-border">
            <div className="flex justify-between text-[7px] font-extrabold uppercase tracking-widest text-muted-foreground mb-1.5 leading-none">
              <span>DISAGREEMENT INDEX</span>
              <span className="text-red-700 dark:text-red-400 font-extrabold">{disagreementRate}</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: "5.4%" }} />
            </div>
          </div>
        </div>

        {/* Voting Scenario list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-0.5">
          {consensusScenarios.map((item, idx) => (
            <div key={idx} className={cn("p-2 rounded-lg border border-l-[3.5px] font-mono leading-none flex flex-col gap-1.5 select-none", item.color)}>
              <div className="flex justify-between items-center text-[8.5px] font-extrabold uppercase">
                <span>{item.scenario}</span>
                <span className="text-[9px] font-extrabold">{item.confidence}</span>
              </div>
              <div className={cn("flex justify-between items-center text-[7.5px] font-extrabold leading-none", item.descColor)}>
                <span>Verdict: <strong className="text-foreground font-extrabold">{item.verdict}</strong></span>
                <span className="italic font-extrabold">{item.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-border/10 flex items-center justify-between text-[7px] font-extrabold text-muted-foreground uppercase opacity-80 shrink-0 font-mono">
        <span>OVERRIDE COMPATIBILITY: LEVEL 3 ENABLED</span>
        <span>Consensus Rules Engine</span>
      </div>
    </div>
  );
}

export default AIConsensusPanel;
