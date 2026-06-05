import React from "react";
import { cn } from "../../lib/utils";

interface PlatformHealthScoreProps {
  isDarkMode?: boolean;
  pipelineHealthScore: number;
}

export function PlatformHealthScore({ isDarkMode, pipelineHealthScore }: PlatformHealthScoreProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card relative font-mono text-center flex flex-col items-center justify-center">
      <div className="w-full text-left mb-3 pb-2 border-b border-border/60">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 text-center">FCAJ v3.0 Overall Platform Health</h3>
      </div>
      
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle 
            cx="50" cy="50" r="40" 
            className="stroke-slate-200 dark:stroke-slate-800" 
            strokeWidth="8" fill="transparent" 
          />
          <circle 
            cx="50" cy="50" r="40" 
            stroke={pipelineHealthScore >= 80 ? "#10b981" : pipelineHealthScore >= 50 ? "#f59e0b" : "#ef4444"} 
            strokeWidth="8" fill="transparent" 
            strokeDasharray="251.2"
            strokeDashoffset={251.2 - (251.2 * pipelineHealthScore) / 100}
            className="transition-all duration-500"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col justify-center items-center">
          <span className="text-3xl font-black">{pipelineHealthScore}%</span>
          <span className={cn(
            "text-[8.5px] uppercase tracking-widest font-black mt-1",
            pipelineHealthScore >= 85 ? "text-emerald-500" : pipelineHealthScore >= 60 ? "text-amber-500 animate-pulse" : "text-red-500 animate-bounce"
          )}>
            {pipelineHealthScore >= 85 ? "OPTIMAL RATE" : pipelineHealthScore >= 60 ? "WARNING RANGE" : "SEVER COMPROMISED"}
          </span>
        </div>
      </div>
    </div>
  );
}
