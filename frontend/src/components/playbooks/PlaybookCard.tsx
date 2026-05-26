import React from "react";
import { Playbook } from "./playbooksConfig";
import { 
  Zap, 
  Clock, 
  Gauge,
  Activity
} from "lucide-react";

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
        return {
          badge: "text-rose-400 border-rose-500/20 bg-rose-500/10",
          glow: "group-hover:shadow-rose-500/10",
          text: "text-rose-400"
        };
      case "high":
        return {
          badge: "text-orange-400 border-orange-500/20 bg-orange-500/10",
          glow: "group-hover:shadow-orange-500/10",
          text: "text-orange-400"
        };
      case "medium":
        return {
          badge: "text-amber-400 border-amber-500/20 bg-amber-500/10",
          glow: "group-hover:shadow-amber-500/10",
          text: "text-amber-400"
        };
      default:
        return {
          badge: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
          glow: "group-hover:shadow-cyan-500/10",
          text: "text-cyan-400"
        };
    }
  };

  const styles = getSeverityStyles(playbook.severity);

  // Border & shadow styling depending on status and priority
  let borderStyle = "border-border/80 hover:border-foreground/20";
  let shadowStyle = "shadow-md shadow-neutral-900/5 dark:shadow-black/40";
  
  if (isCurrentlyActive) {
    if (playbook.severity === "critical") {
      borderStyle = "border-rose-500/30 hover:border-rose-500/50";
      shadowStyle = "shadow-[0_0_15px_-3px_rgba(244,63,94,0.15)] dark:shadow-black/40";
    } else {
      borderStyle = "border-emerald-500/30 hover:border-emerald-500/50";
      shadowStyle = "shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)] dark:shadow-black/40";
    }
  } else {
    borderStyle = "border-border/50 opacity-65";
    shadowStyle = "shadow-none";
  }

  return (
    <div
      onClick={() => onCardClick(playbook)}
      className={`bg-card border rounded-xl p-5 select-none transition-all duration-300 cursor-pointer relative overflow-hidden group hover:-translate-y-1 ${borderStyle} ${shadowStyle} ${styles.glow}`}
    >
      {/* Decorative Corner Grid lines / light reflection for premium cyber feel */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-white/2 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-1 h-8 bg-linear-to-b from-cyan-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Top section: Title & Actions & Badges */}
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Severity priority badge */}
            <span className={`text-[8px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded border ${styles.badge}`}>
              {playbook.severity}
            </span>
            
            {/* Trigger type status */}
            <span className={`text-[8px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
              playbook.triggerType === "automated" 
                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" 
                : "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
            }`}>
              {playbook.triggerType}
            </span>

            {/* Micro active pulse */}
            {isCurrentlyActive && (
              <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8px] font-mono tracking-widest">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                ACTIVE
              </span>
            )}
          </div>

          <h3 className="text-xs font-mono font-bold uppercase text-foreground tracking-widest group-hover:text-cyan-550 dark:group-hover:text-cyan-400 transition-colors line-clamp-1 mt-1">
            {playbook.name}
          </h3>
          <p className="text-[10px] text-muted-foreground font-medium leading-relaxed font-sans line-clamp-2 uppercase tracking-wide">
            {playbook.description}
          </p>
        </div>

        {/* Custom Togglers Slider Switch */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={handleToggle}
            type="button"
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-all duration-305 focus:outline-none ${
              isCurrentlyActive 
                ? "bg-linear-to-r from-emerald-600 to-teal-500 shadow-[0_0_10px_-2px_rgba(16,185,129,0.5)]" 
                : "bg-muted border border-border"
            }`}
            aria-label="Toggle Playbook Status"
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-300 ease-in-out ${
                isCurrentlyActive ? "translate-x-4" : "translate-x-0.5 bg-muted-foreground"
              } mt-0.5`}
            />
          </button>
          
          <span className={`text-[8px] font-black uppercase tracking-widest font-mono ${isCurrentlyActive ? "text-emerald-500 dark:text-emerald-450" : "text-muted-foreground"}`}>
            {isCurrentlyActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>
      </div>

      {/* Cyber Trigger Logic Panel (TRIGGER ENGINE EXPERIENCE) */}
      <div className={`mt-4 mb-3.5 p-3 rounded-lg border border-dashed transition-all duration-300 ${isCurrentlyActive ? 'bg-amber-500/2' : 'bg-muted/10 border-border'} ${playbook.severity === 'critical' && isCurrentlyActive ? 'border-rose-500/25' : 'border-amber-500/25'}`}>
        <div className="flex items-center justify-between mb-1.5 border-b border-border/10 pb-1">
          <div className="flex items-center gap-1.5">
            <Zap className={`w-3.5 h-3.5 ${isCurrentlyActive ? 'text-amber-550 dark:text-amber-400 animate-pulse' : 'text-muted-foreground'}`} />
            <span className="text-[8px] font-black text-muted-foreground tracking-widest uppercase font-mono">
              TRIGGER DECISION RULE
            </span>
          </div>
          <span className="text-[7.5px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase">
            {playbook.avgDurationMs ? `${playbook.avgDurationMs}ms latency` : "75ms latency"}
          </span>
        </div>
        
        {/* The big highlighted 'IF' logic rule */}
        <p className="text-[9px] font-mono font-bold text-amber-600 dark:text-amber-300 truncate uppercase mt-1">
          <span className="text-amber-600 dark:text-amber-550 font-extrabold pr-1 tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded mr-1.5 select-none text-[8.5px]">IF</span>
          {playbook.triggerCondition}
        </p>

        {/* Dynamic Condition Chips for Extra Cyber feel */}
        <div className="flex flex-wrap gap-1 mt-2.5">
          <span className={`text-[7px] font-mono uppercase bg-muted border border-border px-1.5 py-0.5 rounded ${isCurrentlyActive ? 'text-cyan-600 dark:text-cyan-400/85 border-cyan-500/15' : 'text-muted-foreground'}`}>
            COF &gt; {(playbook.confidenceThreshold || 90)}%
          </span>
          <span className={`text-[7px] font-mono uppercase bg-muted border border-border px-1.5 py-0.5 rounded ${isCurrentlyActive ? 'text-rose-600 dark:text-rose-400/85 border-rose-500/15' : 'text-muted-foreground'}`}>
            RISK &gt; {(playbook.riskScoreThreshold || 75)}
          </span>
          <span className="text-[7px] font-mono uppercase bg-muted tracking-wide px-1.5 py-0.5 rounded text-muted-foreground/60 select-none">
            REMEDIATE MODE
          </span>
        </div>
      </div>

      {/* Cyber pipeline meta (Action sequence mini visualizer) */}
      <div className="flex items-center gap-2 mb-4">
        <div className="text-[8px] font-black text-muted-foreground tracking-widest uppercase font-mono shrink-0">
          PIPELINE ({playbook.actions.length} STEPS):
        </div>
        <div className="flex items-center gap-1 overflow-hidden">
          {playbook.actions.map((act, idx) => (
            <React.Fragment key={act.id}>
              {idx > 0 && <span className="text-muted-foreground/40 text-[9px] font-mono">-</span>}
              <span className={`text-[8px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border shrink-0 text-muted-foreground uppercase ${isCurrentlyActive ? 'group-hover:border-foreground/20' : ''}`}>
                ST-{act.step}: {act.type === "aws_iam" ? "IAM" : act.type}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Footnote data: Executions, UpdatedAt, and live response state */}
      <div className="border-t border-border pt-3.5 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-cyan-550 dark:text-cyan-500/80" />
          <span className="uppercase tracking-widest font-black text-[9px]">
            EXECUTIONS: <strong className="text-foreground font-bold font-mono">{playbook.executions}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="uppercase tracking-widest text-[8px] font-semibold text-muted-foreground/80">
            {playbook.lastExecutedTime ? `LAST RUN: ${playbook.lastExecutedTime}` : `UPDATED: ${playbook.updatedAt}`}
          </span>
        </div>
      </div>
    </div>
  );
}
