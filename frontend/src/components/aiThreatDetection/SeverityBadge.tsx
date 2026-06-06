import React from "react";
import { cn } from "../../lib/utils";

export interface SeverityBadgeProps {
  severity: string;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const map: Record<string, string> = {
    Critical: "bg-red-500/10 text-red-500 border-red-500/30 dark:bg-red-950/20",
    High:     "bg-orange-500/10 text-orange-500 border-orange-500/30",
    Medium:   "bg-amber-500/10 text-amber-500 border-amber-500/30",
    Low:      "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  };
  return (
    <span className={cn("text-[9px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded border", map[severity] ?? "bg-muted")}>
      {severity}
    </span>
  );
}
