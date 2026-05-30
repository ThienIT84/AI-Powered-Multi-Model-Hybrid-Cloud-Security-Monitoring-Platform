import React from "react";
import { ShieldCheck, Layers, GitCommit } from "lucide-react";
import { MOCK_ALERTS_COUNT_MERGED, MOCK_ALERTS_COUNT_SUPPRESSED } from "../alertsConfig";

export function AlertDeduplicationPanel() {
  const mergedCount = MOCK_ALERTS_COUNT_MERGED;
  const suppressedCount = MOCK_ALERTS_COUNT_SUPPRESSED;

  return (
    <div className="space-y-4 select-none leading-none">
      <div className="flex items-center justify-between select-none leading-none">
        <div>
          <span className="text-[8px] text-muted-foreground uppercase tracking-widest block font-black">
            DEDUPLICATION & FLOOD PREVENTION
          </span>
          <span className="text-[9.5px] font-black text-cyan-500 uppercase tracking-wider block mt-0.5">
            Event Deduplication and Suppression
          </span>
        </div>
        <Layers size={13} className="text-cyan-500 animate-pulse" />
      </div>

      <div className="bg-background/40 border border-border/70 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-around gap-4 select-none">
        <div className="text-center space-y-1 select-none">
          <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-wider">Merged alerts</span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-[18px] font-mono font-black text-red-500">{mergedCount}</span>
            <span className="text-[7px] text-muted-foreground">alerts</span>
          </div>
          <p className="text-[6.8px] text-muted-foreground italic font-medium">Grouped into single campaign index</p>
        </div>

        <div className="h-10 w-px bg-border border-l border-dashed border-border/60 hidden sm:block" />

        <div className="text-center space-y-1 select-none">
          <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-wider">Suppressed duplicates</span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-[18px] font-mono font-black text-cyan-500">{suppressedCount}</span>
            <span className="text-[7px] text-muted-foreground">events</span>
          </div>
          <p className="text-[6.8px] text-muted-foreground italic font-medium">Suppressed at deep router layer</p>
        </div>
      </div>
    </div>
  );
}
export default AlertDeduplicationPanel;
