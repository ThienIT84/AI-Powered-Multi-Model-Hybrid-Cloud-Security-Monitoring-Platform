import React from "react";
import { Sparkles, BarChart2, ShieldCheck, Activity, Terminal } from "lucide-react";
import { cn } from "../../lib/utils";

export function AIEvaluationPanel() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm select-none">
      <div className="flex items-center justify-between mb-4 border-b border-border/20 pb-2">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-cyan-400" />
          SECTION 36: CONCURRENT AI ENGINE EVALUATION PROFILE & VERDICT PERFORMANCE METRICS
        </h3>
        <span className="text-[7px] bg-[#06b6d4]/10 text-cyan-500 border border-cyan-500/15 px-2 py-0.5 rounded uppercase font-black font-mono">
          EVALUATOR ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 font-mono">
        
        {/* Module AI1 */}
        <div className="bg-[#0c0f14]/50 border border-border/70 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-border/15 pb-2 mb-2 leading-none">
              <span className="text-[9px] font-black text-foreground">AI1 GLOBAL OUTLIER</span>
              <span className="text-[7.2px] text-cyan-400 font-extrabold uppercase">COARSE FILTER</span>
            </div>

            <div className="space-y-1.5 text-[8.5px] leading-tight">
              <div className="flex justify-between border-b border-border/5 pb-1">
                <span className="text-muted-foreground font-medium">FALSE POSITIVE RATE:</span>
                <span className="text-foreground font-black">0.024% (FPR)</span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-1">
                <span className="text-muted-foreground font-medium">DETECTION RATE (TPR):</span>
                <span className="text-foreground font-black">98.42%</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-muted-foreground font-medium">ROC AUC SCORE:</span>
                <span className="text-cyan-400 font-black">0.9924</span>
              </div>
            </div>
          </div>

          <div className="text-[6.5px] text-muted-foreground border-t border-border/10 pt-2 mt-2 font-black uppercase text-center leading-normal">
            Coarse statistical anomaly detection limits
          </div>
        </div>

        {/* Module AI2A */}
        <div className="bg-[#0c0f14]/50 border border-border/70 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-border/15 pb-2 mb-2 leading-none">
              <span className="text-[9px] font-black text-foreground">AI2A FEATURES CLASSIFIER</span>
              <span className="text-[7.2px] text-cyan-400 font-extrabold uppercase">ZEEK LOG MODULE</span>
            </div>

            <div className="space-y-1.5 text-[8.5px] leading-tight">
              <div className="flex justify-between border-b border-border/5 pb-1">
                <span className="text-muted-foreground font-medium">PRECISION RATE:</span>
                <span className="text-foreground font-black">94.82%</span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-1">
                <span className="text-muted-foreground font-medium">RECALL SENSITIVITY:</span>
                <span className="text-foreground font-black">95.40%</span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-1">
                <span className="text-muted-foreground font-medium">HARMONIC F1 SCORE:</span>
                <span className="text-foreground font-black">0.9511</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-muted-foreground font-medium">CONFUSION MATRIX:</span>
                <span className="text-cyan-400 font-extrabold leading-tight text-right block truncate">
                  TP: 174k | FP: 9k | FN: 8k | TN: 820k
                </span>
              </div>
            </div>
          </div>

          <div className="text-[6.5px] text-muted-foreground border-t border-border/10 pt-2 mt-2 font-black uppercase text-center leading-normal">
            Local network protocol vector modeling
          </div>
        </div>

        {/* Module AI2B */}
        <div className="bg-[#0c0f14]/50 border border-border/70 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-border/15 pb-2 mb-2 leading-none">
              <span className="text-[9px] font-black text-foreground">AI2B FEATURE MATCHER</span>
              <span className="text-[7.2px] text-cyan-400 font-extrabold uppercase">PUBLIC LOG MODULE</span>
            </div>

            <div className="space-y-1.5 text-[8.5px] leading-tight">
              <div className="flex justify-between border-b border-border/5 pb-1">
                <span className="text-muted-foreground font-medium">PRECISION RATE:</span>
                <span className="text-foreground font-black">96.12%</span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-1">
                <span className="text-muted-foreground font-medium">RECALL SENSITIVITY:</span>
                <span className="text-foreground font-black">97.05%</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-muted-foreground font-medium">HARMONIC F1 SCORE:</span>
                <span className="text-cyan-400 font-black">0.9658</span>
              </div>
            </div>
          </div>

          <div className="text-[6.5px] text-muted-foreground border-t border-border/10 pt-2 mt-2 font-black uppercase text-center leading-normal">
             Global pattern correlation analysis
          </div>
        </div>

        {/* Module Fusion Layer */}
        <div className="bg-[#0c0f14]/50 border border-border/70 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-border/15 pb-2 mb-2 leading-none">
              <span className="text-[9px] font-black text-foreground">FUSION LAYER VERDICT</span>
              <span className="text-[7.2px] text-rose-500 font-extrabold uppercase">SYNAPSE INTEGRATOR</span>
            </div>

            <div className="space-y-1.5 text-[8.5px] leading-tight">
              <div className="flex justify-between border-b border-border/5 pb-1">
                <span className="text-muted-foreground font-medium">FALSE REJECTION REDUCTION:</span>
                <span className="text-emerald-500 font-extrabold">87.4% Reduction</span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-1">
                <span className="text-muted-foreground font-medium">FINAL CONSOLIDATED FPR:</span>
                <span className="text-emerald-500 font-extrabold">0.003% FPR Rate</span>
              </div>
              <div className="flex justify-between border-b border-border/5 pb-1">
                <span className="text-muted-foreground font-medium">ALERT TRUTH ACCUR:</span>
                <span className="text-foreground font-black">99.98% Accuracy</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-muted-foreground font-medium">VERDICT PROCESSING LATENCY:</span>
                <span className="text-cyan-400 font-black">0.52 ms</span>
              </div>
            </div>
          </div>

          <div className="text-[6.5px] text-muted-foreground border-t border-border/10 pt-2 mt-2 font-black uppercase text-center leading-normal">
            Neural consensus correlation decision metrics
          </div>
        </div>

      </div>
    </div>
  );
}

export default AIEvaluationPanel;
