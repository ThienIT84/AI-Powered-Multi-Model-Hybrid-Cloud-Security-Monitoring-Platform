import React, { useState } from "react";
import { CORRELATION_TIMELINE, TimelineStep } from "./correlationConfig";
import { cn } from "../../lib/utils";
import { Clock, CheckCircle, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function IncidentTimeline() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const getMarkerColor = (status: string) => {
    switch (status) {
      case "CRITICAL": return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)] border-red-500";
      case "WARNING": return "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.7)] border-orange-500";
      default: return "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.7)] border-cyan-500";
    }
  };

  return (
    <div className="space-y-4">
      {/* Timeline Header block */}
      <div className="flex items-center justify-between select-none">
        <div>
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">
            CHRONOLOGICAL ANALYSIS TIMELINE
          </span>
          <span className="text-[9.5px] font-black text-[#06b6d4] uppercase tracking-wider block mt-0.5">
            Correlated Event Timeline
          </span>
        </div>
        <Clock size={13} className="text-cyan-500" />
      </div>

      {/* Main Horizontal Timeline Frame */}
      <div className="bg-background/40 border border-border/70 rounded-xl p-4 relative overflow-hidden select-none">
        
        {/* Horizontal connect-thread line */}
        <div className="absolute left-10 right-10 top-10 h-px bg-border border-t border-dashed border-border" />

        <div className="grid grid-cols-4 gap-4 relative z-10">
          {CORRELATION_TIMELINE.map((step, idx) => {
            const isHovered = hoveredIdx === idx;
            const MarkerIcon = step.status === "CRITICAL" 
              ? AlertTriangle 
              : step.status === "WARNING" 
                ? AlertTriangle 
                : CheckCircle;

            return (
              <div 
                key={idx} 
                className="flex flex-col items-center text-center cursor-pointer relative"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Milestone timestamp label */}
                <span className="text-[7.5px] font-mono text-muted-foreground/70 uppercase">
                  {step.timeAgo}
                </span>

                {/* Event node marker */}
                <div className="my-3">
                  <motion.div
                    animate={{ scale: isHovered ? 1.25 : 1 }}
                    className={cn(
                      "w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-background z-20 text-white cursor-pointer relative",
                      getMarkerColor(step.status)
                    )}
                  >
                    <MarkerIcon size={10} className="stroke-white" />
                  </motion.div>
                </div>

                {/* Stepper info text */}
                <div className="space-y-1 mt-0.5 leading-none max-w-27.5">
                  <span className="text-[8px] font-black text-foreground uppercase tracking-wide block truncate">
                    {step.title}
                  </span>
                  <span className="text-[6.5px] text-[#06b6d4] uppercase tracking-wider font-mono font-black">
                     {step.engine}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Step Inspection Tooltip box */}
      <AnimatePresence mode="wait">
        {(() => {
          const activeIdx = hoveredIdx !== null ? hoveredIdx : 3; // default to final fusion decision
          const step = CORRELATION_TIMELINE[activeIdx];
          return (
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 3 }}
              transition={{ duration: 0.12 }}
              className="p-3 bg-secondary/15 border border-border rounded-xl flex items-start gap-2.5 leading-normal"
            >
              <div className={cn(
                "p-1.5 rounded-lg border leading-none self-start shrink-0 mt-px",
                step.status === "CRITICAL" ? "bg-red-500/10 border-red-500/25 text-red-500" :
                step.status === "WARNING" ? "bg-orange-500/10 border-orange-500/25 text-orange-500" :
                "bg-cyan-500/10 border-cyan-500/25 text-cyan-500"
              )}>
                <CheckCircle size={12} />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-foreground uppercase">
                    Chronology Detail: {step.title}
                  </span>
                  <span className="font-mono text-[7px] text-muted-foreground font-black uppercase">
                    TIME AGO: {step.timeAgo}
                  </span>
                </div>
                <p className="text-[8px] text-muted-foreground font-medium leading-normal">
                  {step.description}. The telemetry layer passed through multi-class decoders with total priority weighting.
                </p>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
