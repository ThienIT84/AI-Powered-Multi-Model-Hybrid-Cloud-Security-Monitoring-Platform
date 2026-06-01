import React from "react";
import { Database, ShieldAlert, Cpu, Heart, CheckCircle2, TrendingDown } from "lucide-react";
import { cn } from "../../lib/utils";

export function DatasetHealthPanel() {
  const psiScore = 0.08; // Ideal stable range (< 0.1)

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm h-80 select-none">
      <div className="flex items-center justify-between mb-2 border-b border-border/20 pb-2 shrink-0">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-cyan-500 animate-pulse" />
          FCAJ DATASET HEALTH MONITOR
        </h3>
        <span className="text-[7.5px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 px-2 py-0.5 rounded uppercase font-black tracking-widest leading-none font-mono">
          STABLE FEED
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-4 p-1">
        
        {/* PSI score large readout */}
        <div className="bg-background/80 p-3 rounded-lg border border-border flex items-center justify-between leading-none font-mono">
          <div>
            <span className="text-[7px] font-black text-muted-foreground uppercase block mb-1">PSI DRIFT INDEX</span>
            <span className="text-xl font-black text-emerald-500">{psiScore.toFixed(2)}</span>
          </div>
          <div className="text-right">
             <span className="px-2 py-0.5 text-[8.5px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 rounded-md font-black uppercase">
               Ideal Stable
             </span>
             <span className="text-[7px] text-muted-foreground block mt-1.5 uppercase font-medium">Population Drift Factor</span>
          </div>
        </div>

        {/* Breakdown parameters */}
        <div className="space-y-2.5 text-[8.5px] font-mono leading-none font-bold">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">FEATURE DIST DRIFT:</span>
            <span className="text-foreground">0.03 (Nominal)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">DOMAIN SIMILARITY:</span>
            <span className="text-cyan-400 font-black">98.2%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">PUBLIC DATASET CO-INTEGRITY:</span>
            <span className="text-foreground">Active (CIC-IDS-2017)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">LATEST RETRAIN SEQUENCE:</span>
            <span className="text-muted-foreground/60 font-semibold uppercase">12 Hours Ago</span>
          </div>
        </div>

        {/* Feature stability progress slider */}
        <div className="select-none">
          <div className="flex justify-between text-[7.5px] font-black text-muted-foreground uppercase mb-1 leading-none">
             <span>SAMPLE POPULATION ENTROPY</span>
             <span className="text-foreground font-semibold">1.42 bits/symbol</span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
             <div className="h-full bg-cyan-500 rounded-full" style={{ width: "88%" }} />
          </div>
        </div>

      </div>

      <div className="pt-2 border-t border-border/10 flex items-center justify-between text-[7px] font-black text-muted-foreground uppercase opacity-55 shrink-0 font-mono">
        <span>COLLECTED SAMPLE ROWS: 4.8M</span>
        <span>Dataset Health Console</span>
      </div>
    </div>
  );
}

export default DatasetHealthPanel;
