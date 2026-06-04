import React from "react";
import { cn } from "../../lib/utils";
import { FCAJIntegrationItem } from "./integrationFCAJData";

interface IntegrationGridSectionProps {
  computedIntegrations: FCAJIntegrationItem[];
  isDarkMode: boolean;
  onSelect: (item: FCAJIntegrationItem) => void;
}

export function IntegrationGridSection({ computedIntegrations, isDarkMode, onSelect }: IntegrationGridSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-500">
          Core Integrations Status Grid ({computedIntegrations.length})
        </h3>
        <span className="text-[8px] uppercase tracking-widest font-bold text-slate-400">
          Click any card for full specs & dependencies modal
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {computedIntegrations.map(itm => {
          const colors = 
            itm.status === "Healthy" ? "border-emerald-500 bg-emerald-500/5 text-emerald-555 text-emerald-500" :
            itm.status === "Warning" ? "border-amber-400 bg-amber-500/5 text-amber-550 text-amber-550 text-amber-500" :
            "border-red-500 bg-red-500/5 text-red-550 text-red-500";

          return (
            <div 
              key={itm.id}
              onClick={() => onSelect(itm)}
              className="p-4 rounded-xl border border-border bg-card flex flex-col justify-between cursor-pointer hover:border-slate-400 dark:hover:border-slate-700 transition-all shadow-sm active:scale-[0.99]"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-foreground font-mono uppercase">{itm.name}</p>
                    <span className="text-[8px] font-mono text-muted-foreground font-bold uppercase">{itm.category} • {itm.version}</span>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded text-[8.5px] font-black uppercase border tracking-wider", colors)}>
                    {itm.status}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground font-sans uppercase line-clamp-2 mb-3">
                  {itm.description}
                </p>
              </div>

              <div className="border-t pt-2 border-border/60 grid grid-cols-3 gap-2 font-mono text-[9px]">
                <div>
                  <span className="text-slate-400 uppercase text-[8px] font-bold block mb-0.5">Last Sync</span>
                  <span className="font-bold uppercase text-slate-600 dark:text-zinc-300">{itm.lastSync}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[8px] font-bold block mb-0.5">Latency</span>
                  <span className={cn(
                    "font-bold",
                    itm.latencyMs > 100 ? "text-red-500" : "text-slate-600 dark:text-zinc-300"
                  )}>{itm.latencyMs}ms</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[8px] font-bold block mb-0.5">Health Score</span>
                  <span className={cn(
                    "font-black font-mono px-1 py-0.5 rounded",
                    itm.healthScore >= 95 ? "bg-emerald-500/10 text-emerald-500" :
                    itm.healthScore >= 60 ? "bg-amber-500/10 text-amber-500" :
                    "bg-red-500/10 text-red-500 animate-pulse"
                  )}>{itm.healthScore}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
