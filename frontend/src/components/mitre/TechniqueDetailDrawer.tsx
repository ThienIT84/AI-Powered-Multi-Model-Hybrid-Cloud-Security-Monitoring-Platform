import React from "react";
import { Fingerprint, Shield, ShieldCheck } from "lucide-react";
import { MitreAlertMapping } from "./mitreConfig";
import { cn } from "../../lib/utils";

interface TechniqueDetailDrawerProps {
  techniqueId: string | null;
  techniqueName: string;
  tactic: string;
  detectionSources: string[];
  relatedAlerts: MitreAlertMapping[];
}

export function TechniqueDetailDrawer({
  techniqueId,
  techniqueName,
  tactic,
  detectionSources,
  relatedAlerts,
}: TechniqueDetailDrawerProps) {
  if (!techniqueId) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center h-full min-h-80 select-none">
        <Fingerprint size={32} className="text-muted-foreground/30 mb-2 animate-pulse" />
        <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">
          NO SELECTION
        </h4>
        <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest mt-2 max-w-xs leading-relaxed">
          Select any technique from the summary or the mapping stream to inspect alert details and active engines.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4 select-none animate-fade-in text-[10px] h-full flex flex-col justify-between min-h-80">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-1.5">
          <Shield size={12} className="text-[#06b6d4]" />
          <div>
            <h4 className="text-[9px] font-black text-foreground uppercase tracking-[0.2em] leading-none">
              TECHNIQUE DETAIL
            </h4>
            <span className="text-[7.5px] font-mono text-muted-foreground uppercase tracking-widest mt-1 block">
              Active threat correlation
            </span>
          </div>
        </div>
        <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded leading-none">
          MAPPED
        </span>
      </div>

      {/* Technique Identifier */}
      <div className="space-y-1 bg-muted/20 p-2.5 border border-border/40 rounded-lg">
        <span className="text-[10px] font-mono font-black text-cyan-400">
          {techniqueId}
        </span>
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wide leading-tight">
          {techniqueName}
        </h3>
        <span className="text-[7.5px] font-mono font-black text-muted-foreground uppercase tracking-wider block mt-0.5">
          TACTIC: {tactic}
        </span>
      </div>

      {/* Detection Sources */}
      <div className="space-y-1.5">
        <span className="text-[7px] font-mono font-black text-muted-foreground uppercase tracking-widest block">
          DETECTION SOURCES
        </span>
        <div className="flex flex-wrap gap-1">
          {detectionSources.length === 0 ? (
            <span className="text-red-400 font-bold font-mono text-[8px] uppercase tracking-wider">
              No Sensor Ingest Mapped
            </span>
          ) : (
            detectionSources.map((src) => (
              <span
                key={src}
                className="bg-[#020617] border border-cyan-500/20 text-cyan-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded"
              >
                {src}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Mapped Alerts */}
      <div className="space-y-1.5">
        <span className="text-[7px] font-mono font-black text-muted-foreground uppercase tracking-widest block">
          REAL-TIME MAPPED ALERTS ({relatedAlerts.length})
        </span>

        {relatedAlerts.length === 0 ? (
          <div className="p-4 border border-dashed border-border/50 rounded-lg text-center text-[7.5px] font-mono text-muted-foreground uppercase tracking-widest">
            No live trace alerts associated in stream
          </div>
        ) : (
          <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
            {relatedAlerts.map((alert) => (
              <div
                key={alert.alertId}
                className="flex items-center justify-between p-2 rounded bg-background border border-border/80"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[8px] font-black text-foreground">
                      {alert.alertId}
                    </span>
                    <span className="text-[7px] text-muted-foreground font-semibold font-mono">
                      {alert.timestamp}
                    </span>
                  </div>
                  <p className="text-[7.5px] font-mono text-muted-foreground uppercase font-bold truncate max-w-37.5">
                    {alert.fusionDecision}
                  </p>
                </div>
                <span className="text-[9px] font-mono font-black text-cyan-400 shrink-0">
                  {alert.confidence}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
