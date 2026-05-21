import React from "react";
import { Playbook } from "./playbooksConfig";
import { Play, PlayCircle, ShieldAlert, Zap, Hourglass, CalendarRange } from "lucide-react";

interface PlaybookCardProps {
  key?: string;
  playbook: Playbook;
  onCardClick: (playbook: Playbook) => void;
  onToggleStatus: (id: string, newStatus: "active" | "inactive") => void;
}

export function PlaybookCard({ playbook, onCardClick, onToggleStatus }: PlaybookCardProps) {
  const isCurrentlyActive = playbook.status === "active";

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering card click
    onToggleStatus(playbook.id, isCurrentlyActive ? "inactive" : "active");
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-500 border-red-500/20 bg-red-500/10";
      case "high":
        return "text-orange-500 border-orange-500/20 bg-orange-500/10";
      case "medium":
        return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10";
      default:
        return "text-cyan-500 border-cyan-500/20 bg-cyan-500/10";
    }
  };

  return (
    <div
      onClick={() => onCardClick(playbook)}
      className={`bg-slate-900/60 backdrop-blur-md border rounded-xl p-5 shadow-lg group select-none transition-all duration-300 cursor-pointer hover:scale-[1.01] hover:bg-slate-900/80 hover:shadow-cyan-500/[0.02] ${
        isCurrentlyActive 
          ? "border-slate-800 shadow-[0_0_15px_rgba(16,185,129,0.02)]" 
          : "border-slate-800/60 opacity-75"
      }`}
    >
      <div className="flex justify-between items-start gap-3">
        {/* Playbook Info */}
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${getSeverityStyles(playbook.severity)}`}>
              {playbook.severity} priority
            </span>
            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
              playbook.triggerType === "automated" 
                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" 
                : "bg-purple-500/10 text-purple-400 border-purple-500/30"
            }`}>
              {playbook.triggerType}
            </span>
          </div>

          <h3 className="text-xs font-black uppercase text-white tracking-widest group-hover:text-cyan-400 transition-colors font-mono line-clamp-1 mt-1">
            {playbook.name}
          </h3>
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed font-sans line-clamp-2 uppercase tracking-wide">
            {playbook.description}
          </p>
        </div>

        {/* Custom Togglers Slider Switch */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={handleToggle}
            type="button"
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-250 ease-in-out focus:outline-none ${
              isCurrentlyActive ? "bg-emerald-600" : "bg-slate-850"
            }`}
            aria-label="Toggle Playbook Status"
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-250 ease-in-out ${
                isCurrentlyActive ? "translate-x-4" : "translate-x-0.5"
              } mt-[1px]`}
            />
          </button>
          
          <span className={`text-[8px] font-black uppercase tracking-widest font-mono ${isCurrentlyActive ? "text-emerald-500" : "text-slate-500"}`}>
            {isCurrentlyActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>
      </div>

      {/* Trigger Logic Display */}
      <div className="bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-lg my-3.5">
        <div className="flex items-center gap-1.5 mb-1">
          <Zap className="w-3 h-3 text-amber-500" />
          <span className="text-[8px] font-black text-slate-500 tracking-widest uppercase font-mono">
            Trigger condition
          </span>
        </div>
        <p className="text-[9px] font-mono font-bold text-amber-400 truncate uppercase tracking-wider">
          {playbook.triggerCondition}
        </p>
      </div>

      {/* Footnote data: Executions, UpdatedAt */}
      <div className="border-t border-slate-800/60 pt-3.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-1.5">
          <PlayCircle className="w-3.5 h-3.5 text-cyan-500" />
          <span className="uppercase tracking-widest font-black">
            Executions: <strong className="text-slate-300 font-bold">{playbook.executions} runs</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarRange className="w-3.5 h-3.5 text-slate-500" />
          <span className="uppercase tracking-widest text-[9px]">
            {playbook.updatedAt}
          </span>
        </div>
      </div>
    </div>
  );
}
