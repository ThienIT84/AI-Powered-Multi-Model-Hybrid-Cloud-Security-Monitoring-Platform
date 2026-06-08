import React from "react";
import { ThreatEvent } from "./types";
import { ArrowRight, Eye, Server, Shield, BrainCircuit, Activity } from "lucide-react";
import { cn } from "../../lib/utils";

interface SOCThreatStreamProps {
  alertFeed: ThreatEvent[];
  selectedEventId?: string;
  onSelectEvent: (event: ThreatEvent) => void;
}

export const SOCThreatStream: React.FC<SOCThreatStreamProps> = ({
  alertFeed,
  selectedEventId,
  onSelectEvent,
}) => {
  return (
    <div className="bg-card border border-border rounded-xl flex flex-col font-mono text-[11px] overflow-hidden">
      {/* Title Header */}
      <div className="p-4 border-b border-border/70 flex items-center justify-between bg-muted/10">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            Real-Time Threat Detection Stream
          </span>
        </div>
        <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded tracking-widest uppercase">
          Live Feed Active
        </span>
      </div>

      {/* Table Area with Horizontal Scroll wrapper to avoid layout break */}
      <div className="overflow-x-auto w-full custom-scrollbar">
        <div className="min-w-225">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/85 bg-muted/20 text-muted-foreground uppercase text-[10px] font-black tracking-widest">
                <th className="py-3 px-4 w-22.5">Timestamp</th>
                <th className="py-3 px-4 w-27.5">Attack Type</th>
                <th className="py-3 px-3 w-21.25">Severity</th>
                <th className="py-3 px-4 w-47.5">Source &rarr; Target</th>
                <th className="py-3 px-4">Pipeline Detection Trace (Zeek &rarr; AI1 &rarr; AI2 &rarr; Fusion)</th>
                <th className="py-3 px-4 w-18.75">MITRE</th>
                <th className="py-3 px-4 w-15 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {alertFeed.map((event) => {
                const isSelected = selectedEventId === event.id;
                
                // Color mapping for attack type
                const attackTypeColors: Record<string, string> = {
                  SQLi: "text-amber-400 bg-amber-500/10 border-amber-500/10",
                  XSS: "text-purple-400 bg-purple-500/10 border-purple-500/10",
                  DoS: "text-red-400 bg-red-500/10 border-red-500/10",
                  "Port Scan": "text-cyan-400 bg-cyan-500/10 border-cyan-500/10",
                  "Brute Force": "text-orange-400 bg-orange-500/10 border-orange-500/10",
                  Botnet: "text-indigo-400 bg-indigo-500/10 border-indigo-500/10",
                };

                const threatClass = attackTypeColors[event.attack_type] || "text-slate-400 bg-slate-500/10 border-slate-500/10";

                return (
                  <tr
                    key={event.id}
                    onClick={() => onSelectEvent(event)}
                    className={cn(
                      "cursor-pointer transition-all duration-250 border-b border-border/30 hover:bg-secondary/40 select-none",
                      isSelected && "bg-secondary dark:bg-zinc-800/60 border-l-2 border-l-cyan-400"
                    )}
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                      {event.timestamp}
                    </td>

                    {/* Attack Type */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className={cn("px-2 py-0.5 rounded border font-black text-[10px]", threatClass)}>
                        {event.attack_type}
                      </span>
                    </td>

                    {/* Severity */}
                    <td className="py-2.5 px-3">
                      <span className={cn(
                        "inline-block px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase text-center w-full max-w-16.25 tracking-wide border",
                        event.severity === "Critical" && "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse",
                        event.severity === "High" && "bg-orange-500/10 text-orange-400 border-orange-500/20",
                        event.severity === "Medium" && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      )}>
                        {event.severity}
                      </span>
                    </td>

                    {/* Source & Destination */}
                    <td className="py-3 px-4 text-xs tracking-tight whitespace-nowrap">
                      <span className="text-foreground font-semibold">{event.src_ip}</span>
                      <ArrowRight className="inline-block w-2.5 h-2.5 mx-1.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{event.dst_ip}</span>
                    </td>

                    {/* Interactive Pipeline Trace */}
                    <td className="py-2 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                        {/* Zeek Node */}
                        <div className="flex items-center gap-1 bg-zinc-500/5 dark:bg-zinc-800/40 border border-border px-1.5 py-0.5 rounded text-foreground font-black">
                          <Server size={10} className="text-cyan-400" />
                          <span>Zeek</span>
                        </div>
                        
                        <span className="text-zinc-650 font-bold">&rarr;</span>

                        {/* AI1 Node */}
                        <div className="flex items-center gap-1 bg-zinc-500/5 dark:bg-zinc-800/40 border border-border px-1.5 py-0.5 rounded">
                          <BrainCircuit size={10} className="text-violet-400" />
                          <span>AI1:</span>
                          <span className={cn(
                            "font-bold",
                            event.pipeline.ai1 > 80 ? "text-red-400" : "text-amber-400"
                          )}>{event.pipeline.ai1}</span>
                        </div>

                        <span className="text-zinc-650 font-bold">&rarr;</span>

                        {/* AI2 Node */}
                        <div className="flex items-center gap-1 bg-zinc-500/5 dark:bg-zinc-800/40 border border-border px-1.5 py-0.5 rounded max-w-37.5 overflow-hidden truncate">
                          <BrainCircuit size={10} className="text-purple-400" />
                          <span>AI2:</span>
                          <span className="text-foreground shrink-0 font-bold">{event.pipeline.ai2a ? "Classifier" : "SCS"}</span>
                        </div>

                        <span className="text-zinc-650 font-bold">&rarr;</span>

                        {/* Fusion Layer Node */}
                        <div className="flex items-center gap-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-black">
                          <Shield size={9} />
                          <span>FUS: {event.pipeline.fusion_score}%</span>
                        </div>
                      </div>
                    </td>

                    {/* MITRE TAG */}
                    <td className="py-3 px-4 whitespace-nowrap text-cyan-400/90 hover:underline">
                      {event.mitre}
                    </td>

                    {/* Action button */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(event);
                        }}
                        className="p-1 rounded hover:bg-cyan-500/10 text-muted-foreground hover:text-cyan-400 transition-colors"
                      >
                        <Eye size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
