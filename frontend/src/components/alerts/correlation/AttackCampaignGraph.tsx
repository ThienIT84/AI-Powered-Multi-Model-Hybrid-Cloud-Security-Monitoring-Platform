import React, { useState } from "react";
import { ATTACK_CAMPAIGN_STAGES } from "./correlationConfig";
import { cn } from "../../../lib/utils";
import { ArrowLeftRight, ChevronRight, Zap, Target } from "lucide-react";
import { motion } from "motion/react";

export function AttackCampaignGraph() {
  const [activeStage, setActiveStage] = useState<string>("Exploit");

  return (
    <div className="space-y-4 select-none leading-none">
      {/* 1. Header block */}
      <div className="flex items-center justify-between select-none leading-none">
        <div>
          <span className="text-[8px] text-muted-foreground uppercase tracking-widest block font-black">
            ATTACK CAMPAIGN PHASES GRAPH
          </span>
          <span className="text-[9.5px] font-black text-cyan-500 uppercase tracking-wider block mt-0.5">
            Lateral escalation nodes and threat severity mapping
          </span>
        </div>
        <Target size={14} className="text-cyan-500 animate-pulse" />
      </div>

      {/* 2. Visual nodes horizontal row */}
      <div className="bg-background/40 border border-border/70 rounded-xl p-4 flex flex-col md:flex-row items-stretch gap-3 relative overflow-hidden select-none">
        {ATTACK_CAMPAIGN_STAGES.map((s, idx) => {
          const isSelected = activeStage === s.stage;
          const isTriggered = s.active;

          return (
            <React.Fragment key={s.stage}>
              {/* Card wrapper */}
              <motion.div
                whileHover={{ scale: 1.015 }}
                onClick={() => isTriggered && setActiveStage(s.stage)}
                className={cn(
                  "flex-1 border rounded-lg p-3 flex flex-col justify-between h-24.5 transition-all cursor-pointer relative",
                  isTriggered 
                    ? (isSelected 
                        ? "border-[#06b6d4] bg-cyan-500/10 dark:bg-cyan-950/25 text-cyan-650 dark:text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.18)]" 
                        : "border-border hover:border-border/80 bg-background/50 text-muted-foreground/90")
                    : "border-border/30 opacity-40 hover:opacity-50 pointer-events-none select-none text-muted-foreground/30 bg-secondary/10"
                )}
              >
                <div className="flex justify-between items-start leading-none select-none">
                  <span className="text-[7.5px] font-mono tracking-wider font-extrabold uppercase text-muted-foreground/75">STAGE-0{idx + 1}</span>
                  {isTriggered && <Zap size={10} className={isSelected ? "text-cyan-600 dark:text-cyan-400 fill-current animate-pulse" : "text-muted-foreground/40"} />}
                </div>

                <div className="space-y-0.5 leading-none select-none">
                  <span className="text-[9px] font-black uppercase text-foreground block">{s.stage}</span>
                  <p className="text-[7.2px] font-mono font-bold text-[#06b6d4] tracking-wide uppercase leading-none block mt-0.5">
                    {isTriggered ? `Risk Profile ${s.score}%` : "INACTIVE"}
                  </p>
                </div>
              </motion.div>

              {/* In-between directed arrow */}
              {idx < ATTACK_CAMPAIGN_STAGES.length - 1 && (
                <div className="hidden md:flex items-center justify-center text-muted-foreground/35 select-none shrink-0 self-center">
                  <ChevronRight size={10} className="stroke-[2.5]" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* 3. Stage details box panel */}
      {(() => {
        const matching = ATTACK_CAMPAIGN_STAGES.find(s => s.stage === activeStage) || ATTACK_CAMPAIGN_STAGES[2];
        return (
          <div className="p-3 bg-secondary/15 border border-border/80 rounded-xl leading-normal space-y-1.5 shadow-inner">
            <span className="text-[7.5px] tracking-widest text-[#06b6d4] uppercase block font-black">
              Campaign Stage details: {matching.stage.toUpperCase()} PHASES
            </span>
            <p className="text-[8.2px] text-muted-foreground font-semibold leading-normal">
              {matching.description} It registers an intensity index of <span className="text-foreground font-black">{matching.score}%</span> on aggregated logs count (<span className="text-foreground font-black">{matching.logCount} packets correlated</span>).
            </p>
          </div>
        );
      })()}
    </div>
  );
}
export default AttackCampaignGraph;
