import React from "react";
import { ListFilter, Shield } from "lucide-react";
import { MitreTechniqueSummaryItem } from "./mitreConfig";
import { cn } from "../../lib/utils";

interface MitreTechniqueSummaryProps {
  summaries: MitreTechniqueSummaryItem[];
  selectedTechniqueId: string | null;
  onSelectTechniqueId: (id: string) => void;
}

export function MitreTechniqueSummary({
  summaries,
  selectedTechniqueId,
  onSelectTechniqueId,
}: MitreTechniqueSummaryProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4 select-none h-full flex flex-col">
      <div className="flex items-center gap-1.5 border-b border-border/40 pb-2.5">
        <ListFilter size={13} className="text-[#06b6d4]" />
        <div>
          <h4 className="text-[9px] font-black text-foreground uppercase tracking-[0.2em]">
            TECHNIQUE SUMMARY
          </h4>
          <p className="text-[7.5px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">
            Detections mapped by threat vector
          </p>
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
        {summaries.map((tech) => {
          const isSelected = selectedTechniqueId === tech.techniqueId;
          return (
            <button
              key={tech.techniqueId}
              type="button"
              onClick={() => onSelectTechniqueId(tech.techniqueId)}
              className={cn(
                "w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between gap-1.5",
                isSelected
                  ? "bg-cyan-500/5 border-cyan-500/40 shadow-sm"
                  : "border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-border text-muted-foreground"
              )}
            >
              <div className="space-y-1 truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[9px] font-black text-cyan-400">
                    {tech.techniqueId}
                  </span>
                  <span className="text-[7px] font-mono font-black uppercase text-muted-foreground tracking-wider truncate">
                    {tech.tactic}
                  </span>
                </div>
                <h4 className="font-sans text-[10px] font-black uppercase tracking-wide text-foreground truncate">
                  {tech.techniqueName}
                </h4>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 pl-1.5 border-l border-border/40">
                <span className="font-mono text-xs font-black text-foreground">
                  {tech.alertCount}
                </span>
                <span className="text-[6.5px] font-mono text-muted-foreground uppercase tracking-widest font-black leading-none">
                  ALERTS
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
