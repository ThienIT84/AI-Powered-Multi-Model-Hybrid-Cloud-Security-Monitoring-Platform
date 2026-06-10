import React, { useState } from "react";
import { ComplianceFramework } from "./types";
import { Award, ShieldCheck, AlertCircle, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface CloudCompliancePanelProps {
  frameworks: ComplianceFramework[];
}

export function CloudCompliancePanel({ frameworks }: CloudCompliancePanelProps) {
  const [expandedFramework, setExpandedFramework] = useState<string>("CIS AWS Foundations");

  const toggleExpand = (name: string) => {
    setExpandedFramework((prev) => (prev === name ? "" : name));
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col h-full" id="cloud-compliance-monitor">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-3 select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Award size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-foreground tracking-wider font-mono">
              Compliance Monitor
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Workload alignment with industry regulatory paradigms
            </p>
          </div>
        </div>
      </div>

      {/* Framework Accordion */}
      <div className="space-y-2 flex-1 overflow-y-auto max-h-75">
        {frameworks.map((framework) => {
          const isExpanded = expandedFramework === framework.name;
          const isHealthy = framework.passRate >= 85;

          return (
            <div
              key={framework.name}
              className={`p-2.5 rounded-lg border transition-all ${
                isExpanded
                  ? "bg-muted/30 border-cyan-500/30"
                  : "bg-muted/10 border-border/40 hover:bg-muted/20"
              }`}
            >
              {/* Accordion header click wrapper */}
              <button
                type="button"
                onClick={() => toggleExpand(framework.name)}
                className="w-full text-left flex items-start justify-between gap-3 font-mono cursor-pointer"
              >
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-foreground uppercase tracking-tight">
                    {framework.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[7.5px] text-slate-500 font-bold uppercase leading-none">
                    <span className="flex items-center gap-0.5 text-red-500">
                      Failed: {framework.failedControls}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-amber-500">
                      Warn: {framework.warnings}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[7px] text-zinc-400 block uppercase font-bold leading-none">Pass Rate</span>
                    <span className={`text-[11px] font-black ${isHealthy ? "text-emerald-550 dark:text-emerald-400" : "text-amber-500"}`}>
                      {framework.passRate}%
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp size={12} className="text-muted-foreground" /> : <ChevronDown size={12} className="text-muted-foreground" />}
                </div>
              </button>

              {/* Accordion dropdown body */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-dashed border-border/30 font-mono text-[8.5px] space-y-2 select-none">
                  <div className="text-[7.5px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                    <Sparkles size={10} className="text-cyan-500" />
                    Security Recommendations
                  </div>
                  <div className="space-y-1.5 leading-relaxed pl-1">
                    {framework.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-zinc-650 dark:text-zinc-300">
                        <span className="text-cyan-500 font-black font-mono select-none">&#8250;</span>
                        <p className="text-[8.5px] uppercase tracking-wide font-sans font-medium line-clamp-2">
                          {rec}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default CloudCompliancePanel;
