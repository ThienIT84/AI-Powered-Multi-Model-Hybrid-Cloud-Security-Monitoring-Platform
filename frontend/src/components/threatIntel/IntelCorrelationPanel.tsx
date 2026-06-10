import React from "react";
import { IntelCorrelation } from "./types";
import { Link2, ShieldCheck, Tag, Cpu, RefreshCw } from "lucide-react";

interface IntelCorrelationPanelProps {
  correlations: IntelCorrelation[];
}

export function IntelCorrelationPanel({ correlations }: IntelCorrelationPanelProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col h-full" id="intel-correlation-panel">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-3 select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Link2 size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-foreground tracking-wider font-mono">
              External Intelligence Correlation
            </h3>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tight">
              Observed threat landscape bindings map without action triggers
            </p>
          </div>
        </div>
      </div>

      {/* Grid of correlation events */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {correlations.map((corr) => (
          <div
            key={corr.id}
            className="p-3 bg-muted/20 border border-border/50 rounded-xl flex flex-col justify-between font-mono text-[9px] hover:border-purple-500/20 transition-all select-none"
          >
            <div>
              <div className="flex items-center justify-between border-b border-border/25 pb-1.5 mb-2">
                <span className={`px-1.5 py-0.2 rounded text-[7.5px] uppercase font-black ${
                  corr.iocType === "IP" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                  corr.iocType === "Domain" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" :
                  corr.iocType === "URL" ? "bg-pink-500/10 text-pink-600 dark:text-pink-400" :
                  corr.iocType === "Hash" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" :
                  "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                }`}>
                  {corr.iocType} VALUE Match
                </span>
                <span className="text-[7.5px] text-slate-400 font-bold">
                  {corr.detectedTime.split(" ")[1] || "UTC"}
                </span>
              </div>

              {/* Observed indicator */}
              <div className="text-[10px] font-black text-foreground truncate select-all uppercase tracking-tight" title={corr.iocValue}>
                {corr.iocValue}
              </div>

              {/* Correlation nodes */}
              <div className="space-y-1.5 mt-2.5 font-sans">
                <div className="flex items-center justify-between text-[8px] border-b border-border/10 pb-1">
                  <span className="text-muted-foreground uppercase font-semibold">Linked Threat Actor:</span>
                  <span className="text-purple-600 dark:text-purple-400 font-extrabold uppercase font-mono">{corr.alignedActor}</span>
                </div>
                <div className="flex items-center justify-between text-[8px] border-b border-border/10 pb-1">
                  <span className="text-muted-foreground uppercase font-semibold">Malware Family:</span>
                  <span className="text-foreground font-semibold uppercase">{corr.malwareFamily}</span>
                </div>
                <div className="flex items-center justify-between text-[8px] border-b border-border/10 pb-1">
                  <span className="text-muted-foreground uppercase font-semibold">Active Campaign:</span>
                  <span className="text-foreground font-semibold uppercase">{corr.campaignName}</span>
                </div>
                <div className="flex items-center justify-between text-[8px]">
                  <span className="text-muted-foreground uppercase font-semibold">Source Feed:</span>
                  <span className="text-slate-400 uppercase font-bold text-[7.5px] font-mono leading-none">{corr.sourceFeed}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border/25 pt-2.5 mt-3 flex items-center justify-between text-[8px] font-mono select-none">
              <span className="text-slate-400 font-semibold uppercase">Confidence:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-black">{corr.confidence}% Correlated</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
