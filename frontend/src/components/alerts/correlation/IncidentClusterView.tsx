import React from "react";
import { INCIDENT_CLUSTERS } from "./correlationConfig";
import { cn } from "../../../lib/utils";
import { AlertTriangle, ShieldCheck, Flame, Clock, Network } from "lucide-react";

export function IncidentClusterView() {
  return (
    <div className="space-y-4 select-none">
      {/* Header text */}
      <div className="flex items-center justify-between select-none leading-none">
        <div>
          <span className="text-[8px] text-muted-foreground uppercase tracking-widest block font-black">
            Correlated Cluster Nodes
          </span>
          <span className="text-[9.5px] font-black text-cyan-500 uppercase tracking-wider block mt-0.5">
            Active Multi-Alert Incident Groups
          </span>
        </div>
        <Network size={14} className="text-cyan-500 animate-pulse" />
      </div>

      {/* Grid of incidents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {INCIDENT_CLUSTERS.map((cur) => {
          const isCritical = cur.severity === "CRITICAL";
          const isHigh = cur.severity === "HIGH";

          return (
            <div 
              key={cur.id}
              className={cn(
                "border rounded-xl p-3 bg-background/35 flex flex-col justify-between h-38 leading-none transition-transform hover:scale-[1.015] duration-200 cursor-pointer",
                isCritical 
                  ? "border-red-500/30 bg-red-500/1.5 shadow-[0_0_8px_rgba(239,68,68,0.06)]"
                  : isHigh 
                    ? "border-orange-500/20 bg-orange-500/1"
                    : "border-border bg-muted/5"
              )}
            >
              <div className="flex justify-between items-start">
                <span className="text-[7.5px] font-mono text-muted-foreground uppercase font-black tracking-wider">
                  {cur.id} - {cur.primaryActor}
                </span>
                <span className={cn(
                  "text-[7px] font-black px-1.5 py-0.5 rounded border uppercase flex items-center gap-1",
                  isCritical ? "bg-red-500/10 border-red-500/25 text-red-500" :
                  isHigh ? "bg-orange-500/10 border-orange-500/25 text-orange-500" :
                  "bg-cyan-500/10 border-cyan-500/25 text-cyan-400"
                )}>
                  {isCritical && <Flame size={8} className="animate-pulse" />}
                  {cur.severity}
                </span>
              </div>

              <div className="space-y-1 my-2">
                <h4 className="text-[10px] font-black uppercase text-foreground truncate">{cur.name}</h4>
                <div className="flex items-center gap-1">
                  <span className="text-[6.5px] font-black text-[#06b6d4] uppercase font-mono tracking-wider">{cur.attackType}</span>
                </div>
              </div>

              {/* Subnet scope & Alert counter */}
              <div className="pt-2 border-t border-dashed border-border/60 flex items-center justify-between text-[7.5px] font-mono text-muted-foreground font-semibold">
                <div className="flex items-center gap-1.5">
                  <Clock size={10} className="text-muted-foreground/60" />
                  <span>{cur.durationMinutes}m duration</span>
                </div>

                <span className="text-foreground font-semibold bg-muted px-1.5 py-0.5 border rounded">
                  {cur.alertCount} FUSED ALERTS
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default IncidentClusterView;
