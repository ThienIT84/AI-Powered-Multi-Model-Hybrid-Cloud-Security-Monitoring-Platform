import React from "react";
import { EndpointAsset } from "./endpointConfig";
import { cn } from "../../lib/utils";
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface EndpointSecurityTabProps {
  endpoint: EndpointAsset;
}

export function EndpointSecurityTab({ endpoint }: EndpointSecurityTabProps) {
  const threats = endpoint.threatHistory;

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "HIGH":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "MEDIUM":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default:
        return "text-cyan-500 bg-cyan-500/10 border-cyan-500/20";
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Title block */}
      <span className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest block px-1">
        Detailed Security Timeline Events ({threats.length})
      </span>

      {threats.length === 0 ? (
        <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 text-center rounded-xl font-mono select-none">
          <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-3.5 animate-pulse" />
          <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">
            THREAT PROFILE CLEANLY VERIFIED
          </h4>
          <p className="text-[8.5px] text-muted-foreground uppercase tracking-wide mt-2">
            No threat hooks or signature footprints match current active threat patterns
          </p>
        </div>
      ) : (
        <div className="relative border-l border-border/80 pl-4 ml-2.5 space-y-5">
          {threats.map((t, idx) => {
            const isMitigated = t.mitigated;
            return (
              <div key={t.id} className="relative z-10 font-mono text-[9.5px]">
                {/* Timeline status dot */}
                <div className={cn(
                  "absolute -left-5.25 top-1 w-2.5 h-2.5 rounded-full border border-background",
                  isMitigated ? "bg-emerald-500" : "bg-red-500 animate-pulse"
                )} />

                <div className="bg-muted/30 border border-border rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border",
                        getSeverityStyles(t.severity)
                      )}>
                        {t.severity}
                      </span>
                      
                      <span className="text-foreground font-black uppercase tracking-wide">
                        {t.eventClass}
                      </span>
                    </div>

                    <span className="text-[8.5px] text-muted-foreground uppercase font-black tracking-widest">
                      {t.timestamp}
                    </span>
                  </div>

                  <p className="text-muted-foreground leading-normal uppercase text-[9px]">
                    {t.description}
                  </p>

                  <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/40 text-[8.5px] text-muted-foreground">
                    <div>
                      <span className="font-bold">MITRE CLASS: </span>
                      <span className="text-cyan-500 uppercase font-black">{t.mitreTechId} ({t.mitreTechName})</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 select-none">
                      {isMitigated ? (
                        <>
                          <CheckCircle2 size={11} className="text-emerald-500" />
                          <span className="text-emerald-500 font-black uppercase tracking-widest">MITIGATED</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={11} className="text-red-500" />
                          <span className="text-red-500 font-extrabold uppercase tracking-widest animate-pulse">ACTIVE ATTACK</span>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
