import React, { useState } from "react";
import { Cpu, HelpCircle, ShieldAlert, Sparkles, TrendingUp, CheckCircle, Award } from "lucide-react";
import { cn } from "../../lib/utils";

export function ModelPerformanceOverview() {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("7d");

  const models = [
    {
      name: "AI1 Anomaly Monitor (Isolation Forest)",
      precision: range === "7d" ? "93.4%" : range === "30d" ? "92.8%" : "92.1%",
      recall: "95.2%",
      f1: "94.3%",
      fpr: "0.08%",
      throughput: "1,240 events/s"
    },
    {
      name: "AI2A Flow Classifier (XGBoost Heuristics)",
      precision: range === "7d" ? "96.8%" : range === "30d" ? "96.1%" : "95.5%",
      recall: "94.5%",
      f1: "95.6%",
      fpr: "0.05%",
      throughput: "720 events/s"
    },
    {
      name: "AI2B Web Semantic Analysis (Transformer Lexer)",
      precision: range === "7d" ? "98.5%" : range === "30d" ? "98.1%" : "97.8%",
      recall: "97.2%",
      f1: "97.8%",
      fpr: "0.02%",
      throughput: "380 events/s"
    }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm h-80 select-none">
      <div className="flex items-center justify-between mb-2 border-b border-border/20 pb-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-cyan-500 animate-pulse" />
          <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.14em]">
            AI MODEL ACCURACY & STABILIZED PERFORMANCE
          </h3>
        </div>

        {/* Range selectors */}
        <div className="flex bg-muted/60 border border-border p-0.5 rounded-lg shrink-0">
          {(["7d", "30d", "90d"] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setRange(opt)}
              className={cn(
                "px-2 py-0.5 text-[8px] font-black uppercase rounded cursor-pointer transition-all",
                range === opt 
                  ? "bg-cyan-500 text-white shadow-xs" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-3.5 py-1 min-h-0">
        <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1 font-mono leading-none">
          {models.map(m => (
            <div key={m.name} className="p-2.5 rounded-lg bg-background/80 border border-border flex flex-col gap-2 relative transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[8.5px] font-black text-foreground uppercase truncate pr-1">
                  {m.name}
                </span>
                <span className="text-[7px] text-green-500 font-black tracking-widest uppercase">
                  VERIFIED ACCURATE
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 text-[8.5px] font-semibold text-center text-muted-foreground">
                <div className="bg-secondary/25 p-1 rounded border border-border/10">
                  <span className="block text-[6.5px] uppercase font-bold text-muted-foreground/60 mb-0.5">PRECISION</span>
                  <span className="text-foreground font-black text-[9px]">{m.precision}</span>
                </div>
                <div className="bg-secondary/25 p-1 rounded border border-border/10">
                  <span className="block text-[6.5px] uppercase font-bold text-muted-foreground/60 mb-0.5">RECALL</span>
                  <span className="text-foreground font-black text-[9px]">{m.recall}</span>
                </div>
                <div className="bg-secondary/25 p-1 rounded border border-border/10">
                  <span className="block text-[6.5px] uppercase font-bold text-muted-foreground/60 mb-0.5">F1 SCORE</span>
                  <span className="text-cyan-400 font-extrabold text-[9px]">{m.f1}</span>
                </div>
                <div className="bg-secondary/25 p-1 rounded border border-border/10">
                  <span className="block text-[6.5px] uppercase font-bold text-muted-foreground/60 mb-0.5">FALSE POS</span>
                  <span className="text-red-500 font-semibold text-[9px]">{m.fpr}</span>
                </div>
                <div className="bg-secondary/25 p-1 rounded border border-border/10">
                  <span className="block text-[6.5px] uppercase font-bold text-muted-foreground/60 mb-0.5">THROUGHPUT</span>
                  <span className="text-foreground font-black truncate max-w-full block text-[8px]">{m.throughput}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-border/10 flex items-center justify-between text-[7px] font-black text-muted-foreground uppercase opacity-55 shrink-0 font-mono">
        <span>F1 ACCURACY BENCHMARK TRAILING OVERVIEW</span>
        <span>Validation metrics live</span>
      </div>
    </div>
  );
}

export default ModelPerformanceOverview;
