import React from "react";
import { cn } from "../../../lib/utils";

interface AssetRiskBadgeProps {
  score: number;
}

export function AssetRiskBadge({ score }: AssetRiskBadgeProps) {
  const isHigh = score > 75;
  const isMed = score > 40;

  return (
    <span className={cn(
      "text-[7px] font-black px-1.5 py-0.5 rounded border uppercase text-center font-mono tracking-widest leading-none select-none",
      isHigh 
        ? "bg-red-500/10 border-red-500/25 text-red-500" 
        : isMed 
          ? "bg-orange-500/10 border-orange-500/25 text-orange-400" 
          : "bg-emerald-500/10 border-emerald-500/25 text-emerald-500"
    )}>
      RISK: {score}/100
    </span>
  );
}
export default AssetRiskBadge;
