import React from "react";
import { Eye } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ThreatEvent, GraphColors } from "./types";
import { SeverityBadge } from "./SeverityBadge";
import { cn } from "../../lib/utils";

export interface RealtimeFeedProps {
  alertFeed: ThreatEvent[];
  setSelectedEvent: (evt: ThreatEvent) => void;
  selectedEventId?: string;
  graphColors: GraphColors;
}

export function RealtimeFeed({ alertFeed, setSelectedEvent, selectedEventId, graphColors }: RealtimeFeedProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm animate-fadeIn">
      <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <h3 className="text-xs font-black uppercase tracking-wider">
            Realtime System Threat Detection Log Feed
          </h3>
        </div>
        <div className="flex items-center gap-1.5 bg-red-500/10 text-red-500 border border-red-500/20 text-[8px] font-mono px-2 py-0.5 rounded uppercase font-black tracking-widest">
          Live streaming
        </div>
      </div>

      {/* LIST DISPLAY */}
      <div className="space-y-2.5 max-h-95 overflow-y-auto custom-scrollbar pr-1">
        <AnimatePresence initial={false}>
          {alertFeed.map((evt) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: -15, y: -5 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedEvent(evt)}
              className={cn(
                "group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border hover:border-cyan-500/40 transition-all rounded-xl cursor-pointer relative overflow-hidden",
                selectedEventId === evt.id 
                  ? "border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10 shadow-[inset_0_0_12px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30"
                  : "border-border bg-zinc-50 hover:bg-zinc-100/50 dark:bg-zinc-900/40 dark:hover:bg-zinc-900"
              )}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"
                style={{
                  backgroundColor:
                    evt.severity === "Critical"
                      ? graphColors.red
                      : evt.severity === "High"
                      ? graphColors.amber
                      : graphColors.cyan,
                }}
              />

              {/* Left: General metadata */}
              <div className="flex items-center gap-3 ml-1.5">
                <div className="text-[10px] font-mono text-muted-foreground w-12 shrink-0">
                  {evt.timestamp}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-805 dark:text-zinc-150">
                      {evt.attackType}
                    </span>
                    <SeverityBadge severity={evt.severity} />
                  </div>
                  <div className="flex items-center gap-2 text-[8px] font-mono text-muted-foreground mt-0.5 uppercase tracking-wider">
                    <span>
                      Src: <strong className="text-foreground/80">{evt.source}</strong>
                    </span>
                    <span>
                      Dst: <strong className="text-foreground/85">{evt.destination}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Risk index and buttons */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-4 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-muted-foreground uppercase">Path:</span>
                  <span className="text-[8.5px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-645 dark:text-zinc-305">
                    {evt.detectionPath}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className="text-[12px] font-black tracking-tighter"
                    style={{
                      color: evt.riskScore > 90 ? graphColors.red : graphColors.amber,
                    }}
                  >
                    Intens: {evt.riskScore}%
                  </span>
                </div>
                <button className="px-2.5 py-1 rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-cyan-500 hover:text-slate-950 transition border-none text-[8.5px] font-black uppercase flex items-center gap-1">
                  <Eye size={10} /> Inspect
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
