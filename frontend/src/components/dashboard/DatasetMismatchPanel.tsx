import React from "react";
import { RefreshCw, ShieldAlert, CheckCircle2, AlertTriangle, Cpu } from "lucide-react";
import { cn } from "../../lib/utils";

export function DatasetMismatchPanel() {
  const psiValue = 0.042; // Low drift (< 0.1 is stable)
  const ksDistance = 0.021; // Small distance
  const domainClassifierScore = 0.505; // 0.5 is ideal (cannot differentiate source vs destination context)
  const similarityScore = "98.8%";
  const riskLevel = "NEGLIGIBLE DRIFT";
  const status: "Safe To Merge" | "Monitor" | "Do Not Merge" = "Safe To Merge";

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm select-none">
      <div className="flex items-center justify-between mb-4 border-b border-border/20 pb-2">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4 text-cyan-400" />
          SECTION 37: COGNITIVE DATASET MISMATCH & COVARIATE DRIFT ANALYSIS (PSI/KS)
        </h3>
        <span className="text-[7.2px] bg-[#06b6d4]/10 text-cyan-500 border border-cyan-500/15 px-2 py-0.5 rounded uppercase font-black font-mono">
          STABILITY VERIFIED
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
        
        {/* Metric PSI */}
        <div className="bg-[#0c0f14]/50 border border-border/70 p-3 rounded-lg flex flex-col justify-between">
          <div>
            <span className="text-muted-foreground block text-[7px] uppercase font-bold mb-1">POPULATION STABILITY (PSI)</span>
            <span className="text-foreground text-xl font-black">{psiValue}</span>
          </div>
          <div className="text-[6.5px] text-emerald-500 font-extrabold uppercase mt-2 border-t border-border/5 pt-1.5">
            ≤ 0.1 Ideal stability
          </div>
        </div>

        {/* Metric KS Distance */}
        <div className="bg-[#0c0f14]/50 border border-border/70 p-3 rounded-lg flex flex-col justify-between">
          <div>
             <span className="text-muted-foreground block text-[7px] uppercase font-bold mb-1">KOLMOGOROV-SMIRNOV (KS)</span>
             <span className="text-foreground text-xl font-black">{ksDistance}</span>
          </div>
          <div className="text-[6.5px] text-emerald-500 font-extrabold uppercase mt-2 border-t border-border/5 pt-1.5">
             No distribution deviation
          </div>
        </div>

        {/* Metric Similarity & Classifier */}
        <div className="bg-[#0c0f14]/50 border border-border/70 p-3 rounded-lg flex flex-col justify-between">
          <div>
             <span className="text-muted-foreground block text-[7px] uppercase font-bold mb-1">DOMAIN CLASSIFIER SCORE</span>
             <span className="text-foreground text-xl font-black">{domainClassifierScore}</span>
             <div className="text-[7.5px] text-cyan-400 mt-1">Similarity Index: <strong className="text-foreground">{similarityScore}</strong></div>
          </div>
          <div className="text-[6.5px] text-emerald-500 font-extrabold uppercase mt-2 border-t border-border/5 pt-1.5">
             Covariate space matched
          </div>
        </div>

        {/* Merge status decision rule panel */}
        <div className={cn(
          "border rounded-lg p-3 flex flex-col justify-between",
          status === "Safe To Merge" ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-500" :
          status === "Monitor" ? "bg-amber-950/20 border-amber-500/30 text-amber-500" :
          "bg-rose-950/20 border-rose-500/30 text-rose-500"
        )}>
          <div>
             <span className="text-muted-foreground block text-[7px] uppercase font-bold mb-1">STABLE INTEGRATION MERGE RESOLVER</span>
             <div className="flex items-center gap-1.5 mt-1">
               <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
               <span className="text-base font-black uppercase tracking-wider">{status}</span>
             </div>
          </div>
          <div className="text-[6.5px] text-emerald-400 font-black uppercase mt-2 border-t border-emerald-500/10 pt-1.5">
             RISK PROFILE: {riskLevel}
          </div>
        </div>

      </div>
    </div>
  );
}

export default DatasetMismatchPanel;
