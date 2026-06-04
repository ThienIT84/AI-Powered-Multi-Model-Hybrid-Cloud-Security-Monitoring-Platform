import React from "react";
import { Radio, RotateCcw } from "lucide-react";
import { cn } from "../../lib/utils";

interface HeaderSectionProps {
  isDarkMode: boolean;
  systemTime: string;
  onAutoHeal: () => void;
}

export function HeaderSection({ isDarkMode, systemTime, onAutoHeal }: HeaderSectionProps) {
  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 p-5 rounded-xl border border-border bg-card">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Radio className="w-5 h-5 text-cyan-500 animate-pulse" />
          <h1 className="text-base font-black uppercase tracking-widest leading-none font-mono">
            FCAJ v3.0 Live Integration Center
          </h1>
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
          Full-Stack Pipeline Monitoring • AWS SQS Buffer • Machine Learning Feature Routing • Auto-Recover Systems
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="px-3.5 py-1.5 rounded-lg border border-border bg-muted font-mono text-[10px] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-semibold text-cyan-500 dark:text-cyan-400">{systemTime}</span>
        </div>

        <button 
          onClick={onAutoHeal}
          className="px-4 py-1.5 bg-linear-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-[10px] uppercase font-black tracking-widest rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg transition-transform active:scale-95"
        >
          <RotateCcw size={12} /> Auto-Heal Systems
        </button>
      </div>
    </div>
  );
}
