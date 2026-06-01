import React from "react";
import { Database, AlertTriangle, HelpCircle, CheckCircle } from "lucide-react";
import { cn } from "../../lib/utils";

export function PublicVsZeekComparison() {
  const similarityScore = "94.2%";
  const distributionOverlap = "88.6%";

  const features = [
    { label: "Duration distribution", lab: "Avg 14.5s", public: "Avg 15.1s", diff: "+4.1%", state: "Match" },
    { label: "Packets count distribution", lab: "Avg 14 pkts", public: "Avg 15 pkts", diff: "+7.1%", state: "Match" },
    { label: "Bytes transfer distribution", lab: "Avg 3,824B", public: "Avg 4,110B", diff: "+7.4%", state: "Match" },
    { label: "Entropy score validation", lab: "Avg 4.8 H", public: "Avg 4.9 H", diff: "+2.0%", state: "Match" },
    { label: "URI requests length check", lab: "Avg 42 chars", public: "Avg 40 chars", diff: "-4.7%", state: "Match" }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm h-80 select-none">
      <div className="flex items-center justify-between mb-2 border-b border-border/20 pb-2 shrink-0">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.12em] flex items-center gap-1.5">
          <Database className="w-4 h-4 text-cyan-500" />
          PUBLIC CO-TRAINING VS ZEEK COMPARE
        </h3>
        <span className="text-[7.5px] bg-red-400/10 text-red-400 border border-red-500/15 px-2 py-0.5 rounded uppercase font-black tracking-widest leading-none font-mono flex items-center gap-1 animate-pulse">
          <AlertTriangle size={10} />
          DRIFT SAFE
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-3 p-1">
        
        {/* High level coherence overview */}
        <div className="grid grid-cols-2 gap-2 leading-none font-mono text-[8.5px] font-bold">
          <div className="bg-background/80 p-2 rounded-lg border border-border">
            <span className="text-muted-foreground text-[6px] uppercase block mb-1">SIMILARITY INDEX</span>
            <span className="text-cyan-400 text-sm font-black">{similarityScore}</span>
          </div>
          <div className="bg-background/80 p-2 rounded-lg border border-border">
            <span className="text-muted-foreground text-[6px] uppercase block mb-1">OVERLAP DENSITY</span>
            <span className="text-foreground text-sm font-black">{distributionOverlap}</span>
          </div>
        </div>

        {/* Features comparison table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar text-[8.5px] font-mono leading-none">
          <div className="grid grid-cols-12 pb-1.5 border-b border-border/20 text-[7px] font-black text-muted-foreground uppercase shrink-0">
            <span className="col-span-5">CO-TRAIN FEATURE</span>
            <span className="col-span-2.5 text-right">ZEEK LIVE</span>
            <span className="col-span-2.5 text-right">PUBLIC REF</span>
            <span className="col-span-2 text-right">STATUS</span>
          </div>

          <div className="space-y-2 py-1.5 font-bold">
            {features.map(f => (
              <div key={f.label} className="grid grid-cols-12 items-center text-foreground">
                <span className="col-span-5 text-[8px] truncate pr-1 text-muted-foreground uppercase">{f.label}</span>
                <span className="col-span-2.5 text-right font-black">{f.lab}</span>
                <span className="col-span-2.5 text-right">{f.public}</span>
                <span className="col-span-2 text-right font-semibold text-emerald-500">GOOD</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="pt-2 border-t border-border/10 flex items-center justify-between text-[7px] font-black text-muted-foreground uppercase opacity-55 shrink-0 font-mono">
        <span>PUBLIC SOURCE: CSE-CIC-IDS2018</span>
        <span>Alignment overlap verified</span>
      </div>
    </div>
  );
}

export default PublicVsZeekComparison;
