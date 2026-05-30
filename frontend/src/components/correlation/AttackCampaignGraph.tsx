import React from "react";
import { ATTACK_CAMPAIGN_STAGES } from "./correlationConfig";
import { cn } from "../../lib/utils";
import { ArrowRight, Trophy, Shield, UserX, ScanEye } from "lucide-react";

export function AttackCampaignGraph() {
  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between select-none leading-none">
        <div>
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">
            THREAT ACTOR LIFECYCLE PROGRESSION
          </span>
          <span className="text-[9.5px] font-black text-cyan-500 uppercase tracking-wider block mt-0.5">
            Active Campaign Stages (Directed Cyber Kill Chain)
          </span>
        </div>
        <ScanEye size={14} className="text-cyan-500" />
      </div>

      {/* Cyber Kill Chain stages display with responsive linking thread */}
      <div className="bg-background/40 border border-border/70 rounded-xl p-4 space-y-3.5 relative overflow-hidden select-none">
        
        {/* Horizontal sequential kill-chain directed visual nodes */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 relative z-10">
          {ATTACK_CAMPAIGN_STAGES.map((stage, idx) => {
            const isCompletedOrActive = stage.active;

            return (
              <React.Fragment key={stage.stage}>
                {/* Kill chain Stage Card Node */}
                <div 
                  className={cn(
                    "flex-1 w-full border rounded-xl p-2.5 transition-all text-center leading-none space-y-2 relative overflow-hidden",
                    isCompletedOrActive 
                      ? "border-red-500/30 bg-red-500/2" 
                      : "border-border/60 bg-muted/10 opacity-40 hover:opacity-60"
                  )}
                >
                  {/* Subtle progress indicator */}
                  <div className="flex items-center justify-between text-[7px] font-black uppercase text-muted-foreground">
                    <span>STAGE 0{idx + 1}</span>
                    <span className={cn(
                      "font-mono font-black",
                      isCompletedOrActive ? "text-red-500" : "text-muted-foreground"
                    )}>
                      {isCompletedOrActive ? "CONFIRMED" : "CLEAR"}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-[9.5px] font-black uppercase text-foreground leading-snug">{stage.stage}</h4>
                    <span className="text-[7.2px] text-muted-foreground font-mono font-bold">
                      {stage.logCount > 0 ? `${stage.logCount} triggers` : "0 hits"}
                    </span>
                  </div>

                  {/* Colored progress line matching weight */}
                  <div className="h-0.5 w-full bg-muted rounded overflow-hidden mt-1.5">
                    <div 
                      className={cn("h-full rounded", isCompletedOrActive ? "bg-red-500" : "bg-muted-foreground")} 
                      style={{ width: `${stage.score}%` }}
                    />
                  </div>
                </div>

                {/* SVG Directed arrow connector between columns (hidden on mobile) */}
                {idx < ATTACK_CAMPAIGN_STAGES.length - 1 && (
                  <ArrowRight size={13} className="text-muted-foreground/35 hidden md:block shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Narrative analytics summary breakdown */}
        <div className="p-3 bg-secondary/15 rounded-xl border border-border/80 text-[8.5px] leading-relaxed flex items-start gap-2 select-none">
          <Trophy size={14} className="text-red-500 shrink-0 mt-px" />
          <div className="space-y-1">
            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest block">
              CAMPAIGN KILL-CHAIN ATTRIBUTION REPORT
            </span>
            <p className="text-muted-foreground leading-normal font-medium">
               Attribution engine assesses adversarial progress at <span className="text-foreground font-semibold">STAGE 03 (EXPLOIT)</span>. Recon activity and port sweeps (2k+ logs) matching 
               APT-29 profiles initiated on the subnet before launching payload injections, successfully checked by our hybrid AI classifiers. 
               No lateral jumps or SSH modifications have triggered, confirming lateral bounds remain isolated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AttackCampaignGraph;
