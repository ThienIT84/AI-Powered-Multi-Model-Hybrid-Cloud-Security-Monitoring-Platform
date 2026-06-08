import React, { useMemo } from "react";
import { Case, CaseSeverity, CaseStatus } from "./caseTypes";
import { User, ShieldAlert, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";

interface CaseQueuePanelProps {
  cases: Case[];
  selectedCaseId: string | null;
  onSelectCase: (caseId: string) => void;
}

export function CaseQueuePanel({
  cases,
  selectedCaseId,
  onSelectCase,
}: CaseQueuePanelProps) {

  // Memoize getting risk info purely from severity
  const getRiskDetails = (sev: CaseSeverity) => {
    switch (sev) {
      case "Critical":
        return { color: "text-red-500 bg-red-500/10 border-red-500/25", label: "CRIT RISK" };
      case "High":
        return { color: "text-orange-500 bg-orange-500/10 border-orange-500/25", label: "HIGH RISK" };
      case "Medium":
        return { color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/25", label: "MED RISK" };
      case "Low":
        return { color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25", label: "LOW RISK" };
    }
  };

  const getStatusClass = (stat: CaseStatus) => {
    switch (stat) {
      case "Open":
        return "bg-red-500/10 border-red-500/20 text-red-500";
      case "In Progress":
        return "bg-amber-500/10 border-amber-500/20 text-amber-500";
      case "Resolved":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-500";
      case "Pending Review":
        return "bg-purple-500/10 border-purple-500/20 text-purple-400";
    }
  };

  // Sort cases dynamically (e.g., Critical/High severity first, then newer timestamps)
  const sortedCases = useMemo(() => {
    const severityWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    return [...cases].sort((a, b) => {
      const weightA = severityWeight[a.severity] || 0;
      const weightB = severityWeight[b.severity] || 0;
      if (weightA !== weightB) return weightB - weightA;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [cases]);

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col shadow-sm select-none h-fit overflow-hidden w-full">
      {/* Header section of left list */}
      <div className="p-3 border-b border-border bg-secondary/15 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldAlert size={12} className="text-cyan-500 animate-pulse" />
          <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em]">
            SOC TARGET QUEUE
          </h3>
        </div>
        <span className="font-mono text-[8px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded border border-border/85 animate-fade-in">
          COUNT: {sortedCases.length}
        </span>
      </div>

      {/* Ticket List queue */}
      <div className="flex-1 overflow-y-auto custom-scrollbar max-h-1555 min-h-75">
        {sortedCases.length === 0 ? (
          <div className="p-12 text-center text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">
            No active incident records found
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {sortedCases.map((c) => {
              const isSelected = selectedCaseId === c.id;
              const risk = getRiskDetails(c.severity);
              return (
                <div
                  key={c.id}
                  id={`case-card-${c.id}`}
                  onClick={() => onSelectCase(c.id)}
                  className={cn(
                    "p-2.5 transition-all duration-150 cursor-pointer text-left flex flex-col gap-1.5 border-l-2",
                    isSelected
                      ? "bg-cyan-500/4 border-l-cyan-500 dark:bg-cyan-500/6"
                      : "border-l-transparent hover:bg-muted/40"
                  )}
                >
                  {/* Row 1: ID, status, severity tag */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[9px] font-black text-[#06b6d4]">
                        {c.id}
                      </span>
                      <span className="text-[7px] text-muted-foreground font-semibold font-mono">
                        {new Date(c.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className={cn(
                        "text-[6.5px] font-black px-1 py-[0.5px] rounded border uppercase tracking-wider leading-none",
                        risk.color
                      )}>
                        {c.severity}
                      </span>
                      <span className={cn(
                        "text-[6.5px] font-black px-1 py-[0.5px] rounded border uppercase tracking-wider leading-none",
                        getStatusClass(c.status)
                      )}>
                        {c.status}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Title */}
                  <h4 className="text-[9.5px] font-bold text-foreground line-clamp-1 leading-snug">
                    {c.title}
                  </h4>

                  {/* Row 3: Assignee and RISK Indicator */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/15 text-[8px]">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User size={8} className="text-muted-foreground/60" />
                      <span className="font-semibold truncate max-w-30 text-foreground/80">
                        {c.assignedTo ? (
                          c.assignedTo
                        ) : (
                          <span className="text-red-400 font-extrabold uppercase text-[6.5px] tracking-wider animate-pulse">
                            Unassigned
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Minimal risk indicator (small badge only, no progress meters or charts) */}
                    <span className={cn(
                      "text-[6px] font-extrabold px-1 py-0.5 rounded border uppercase tracking-widest font-mono",
                      c.severity === "Critical" ? "text-red-500 bg-red-950/20 border-red-500/30" : 
                      c.severity === "High" ? "text-orange-500 bg-orange-950/20 border-orange-500/30" :
                      c.severity === "Medium" ? "text-yellow-500 bg-yellow-950/20 border-yellow-500/30" :
                      "text-cyan-400 bg-cyan-950/20 border-cyan-500/30"
                    )}>
                      {risk.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
