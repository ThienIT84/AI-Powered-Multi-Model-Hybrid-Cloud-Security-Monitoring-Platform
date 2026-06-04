import React, { useState } from "react";
import { INCIDENT_CLUSTERS, IncidentCluster } from "./correlationConfig";
import { cn } from "../../lib/utils";
import { Network, FolderKanban, ShieldAlert, BadgeInfo, Users, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function IncidentClusterView() {
  const [selectedIncident, setSelectedIncident] = useState<string | null>("INC-2049");

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "CRITICAL": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "HIGH": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "MEDIUM": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default: return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <div className="space-y-4">
      {/* Target header */}
      <div className="flex items-center justify-between select-none">
        <div>
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">
            INCIDENT AGGREGATOR ENGINE
          </span>
          <span className="text-[9.5px] font-black text-cyan-500 uppercase tracking-wider block mt-0.5">
            Aggregated Incident Clusters (Reduction rate: 84%)
          </span>
        </div>
        <Network size={14} className="text-cyan-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Incident Lists Left Side Column */}
        <div className="lg:col-span-1 space-y-2.5">
          {INCIDENT_CLUSTERS.map(inc => {
            const isSelected = selectedIncident === inc.id;

            return (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc.id)}
                className={cn(
                  "border rounded-xl p-3 cursor-pointer transition-all select-none space-y-2.5 leading-none",
                  isSelected 
                    ? "bg-cyan-500/4 border-cyan-500/40 shadow-inner" 
                    : "bg-card hover:bg-muted/10 border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black text-foreground">
                    #{inc.id}
                  </span>
                  <span className={cn("text-[7px] font-black px-1.5 py-0.5 rounded border uppercase", getSeverityColor(inc.severity))}>
                    {inc.severity}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[9.5px] font-black uppercase text-foreground leading-snug">{inc.name}</h4>
                  <p className="text-[7.5px] text-muted-foreground font-semibold uppercase">{inc.attackType}</p>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[7px] text-muted-foreground uppercase tracking-wider font-extrabold">
                  <span>{inc.alertCount} Grouped Alerts</span>
                  <span>•</span>
                  <span>{inc.durationMinutes}m dur</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Detail Card Right Side Multi-column */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedIncident ? (
              (() => {
                const inc = INCIDENT_CLUSTERS.find(i => i.id === selectedIncident);
                if (!inc) return null;

                return (
                  <motion.div
                    key={inc.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="bg-card border border-border rounded-xl p-4 space-y-4 h-full flex flex-col justify-between"
                  >
                    <div>
                      {/* Detailed head */}
                      <div className="flex items-start justify-between border-b border-border/40 pb-3">
                        <div className="space-y-1 leading-none">
                          <span className="text-[8px] font-black text-[#06b6d4] uppercase tracking-widest block">
                            ACTIVE SECURITY INCIDENT PROFILE
                          </span>
                          <h3 className="text-[11.5px] font-black uppercase text-foreground">
                            {inc.name} ({inc.id})
                          </h3>
                        </div>

                        <span className={cn("text-[8px] font-black px-2 py-0.5 rounded border uppercase font-mono", getSeverityColor(inc.severity))}>
                          {inc.status}
                        </span>
                      </div>

                      {/* Descriptive list info of requested items */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-4 select-none">
                        <div className="space-y-1 leading-none">
                          <span className="text-[7.2px] font-black text-muted-foreground uppercase tracking-wide block">Grouped volume</span>
                          <span className="text-[14px] font-mono font-bold text-foreground">
                            {inc.alertCount} <span className="text-[7.5px] text-muted-foreground uppercase">alarms</span>
                          </span>
                        </div>

                        <div className="space-y-1 leading-none">
                          <span className="text-[7.2px] font-black text-muted-foreground uppercase tracking-wide block">Inc duration</span>
                          <span className="text-[14px] font-mono font-bold text-foreground">
                            {inc.durationMinutes} <span className="text-[7.5px] text-muted-foreground uppercase">mins</span>
                          </span>
                        </div>

                        <div className="space-y-1 leading-none col-span-2">
                          <span className="text-[7.2px] font-black text-muted-foreground uppercase tracking-wide block">Tactical Target Subnet</span>
                          <span className="text-[11px] font-mono font-black text-[#06b6d4]">
                            {inc.targetSubnet}
                          </span>
                        </div>
                      </div>

                      {/* Detailed narrative paragraph */}
                      <div className="mt-4 p-3 bg-secondary/15 rounded-xl border border-border/60">
                        <span className="text-[7.5px] font-black text-[#06b6d4] uppercase tracking-widest block mb-1">
                          Consolidated Threat Intelligence Summary
                        </span>
                        <p className="text-[9px] text-muted-foreground leading-relaxed">
                          Incidents clustering engines grouped {inc.alertCount} deep flow telemetry triggers from host vectors on the subnet {inc.targetSubnet}. 
                          Network actions correspond closely to signature profiles aligned with known actor <span className="text-foreground font-semibold">{inc.primaryActor}</span>. 
                          The sequence duration of {inc.durationMinutes} minutes suggests aggressive cyclic sweeping rather than slow-burn stealth.
                        </p>
                      </div>
                    </div>

                    {/* Operational Action Footer controls */}
                    <div className="pt-3 border-t border-border/40 flex items-center justify-between text-[8px] font-black uppercase tracking-wider text-muted-foreground">
                       <span className="flex items-center gap-1">
                         <Users size={11} className="text-cyan-500" />
                          Assigned SOC Team: Red Response Alpha
                       </span>

                       <button className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-black tracking-widest cursor-pointer leading-normal">
                         Escalate Incident Frame
                       </button>
                    </div>
                  </motion.div>
                );
              })()
            ) : (
              <div className="bg-card border border-border border-dashed rounded-xl h-full flex items-center justify-center p-6 text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                Select an Incident ID left to view detailed campaign logs grouping
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
