import React from "react";
import { FolderKanban, ShieldCheck, PieChart, Clock } from "lucide-react";
import { OpenCasesMetrics } from "./types/dashboard.types";

interface OpenCasesSummaryProps {
  metrics: OpenCasesMetrics;
}

export const OpenCasesSummary: React.FC<OpenCasesSummaryProps> = React.memo(({ metrics }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col justify-between" id="open-cases-summary">
      <div>
        <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-4 select-none">
          <FolderKanban size={14} className="text-amber-500" />
          <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest font-mono">
            Active Case Management
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 font-mono select-none">
          {/* Open Cases count */}
          <div className="bg-secondary/15 border border-border/40 p-3 rounded-lg flex flex-col justify-between">
            <span className="text-[7.5px] font-black text-red-500 uppercase">
              Open Cases
            </span>
            <span className="text-lg font-black text-foreground mt-1 block">
              {metrics.open}
            </span>
          </div>

          {/* In Progress count */}
          <div className="bg-secondary/15 border border-border/40 p-3 rounded-lg flex flex-col justify-between">
            <span className="text-[7.5px] font-black text-purple-400 uppercase">
              In Progress
            </span>
            <span className="text-lg font-black text-foreground mt-1 block">
              {metrics.inProgress}
            </span>
          </div>

          {/* Resolved Today count */}
          <div className="bg-secondary/15 border border-border/40 p-3 rounded-lg flex flex-col justify-between">
            <span className="text-[7.5px] font-black text-emerald-550 dark:text-emerald-400 uppercase">
              Resolved Today
            </span>
            <span className="text-lg font-black text-foreground mt-1 block">
              {metrics.resolvedToday}
            </span>
          </div>

          {/* Connected Stream check */}
          <div className="bg-secondary/15 border border-border/40 p-3 rounded-lg flex flex-col justify-between">
            <span className="text-[7.5px] font-black text-cyan-400 uppercase">
              SLA Compliance
            </span>
            <span className="text-lg font-black text-cyan-400 mt-1 block">
              {metrics.slaCompliance}%
            </span>
          </div>
        </div>

        {/* SLA Progression Indicator */}
        <div className="space-y-1 font-mono text-[8px] select-none">
          <div className="flex items-center justify-between text-[7.5px] text-zinc-500 font-bold uppercase">
            <span>SLA Agreement Threshold</span>
            <span>90% Target</span>
          </div>
          <div className="h-1.5 w-full bg-secondary/80 rounded-full overflow-hidden border border-border/20">
            <div
              className="h-full bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.3)] transition-all duration-300"
              style={{ width: `${metrics.slaCompliance}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="text-[7.5px] text-zinc-500 font-mono mt-4 uppercase select-none border-t border-border/10 pt-2 flex items-center justify-between leading-none font-bold">
        <span>SLA Tracking: Operational</span>
        <span className="text-emerald-550 dark:text-emerald-400">Compliant</span>
      </div>
    </div>
  );
});
