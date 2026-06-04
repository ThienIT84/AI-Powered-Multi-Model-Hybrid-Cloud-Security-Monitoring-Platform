import React from "react";
import { Activity, GitFork, Clock, Flame, Monitor, Server } from "lucide-react";
import { cn } from "../../lib/utils";
import { EndpointFCAJItem } from "./endpointFCAJData";

interface EndpointTelemetryRowProps {
  selectedEndpointObj: EndpointFCAJItem | undefined;
  timelineZoom: number;
  setTimelineZoom: (val: number) => void;
}

export const EndpointTelemetryRow: React.FC<EndpointTelemetryRowProps> = ({
  selectedEndpointObj,
  timelineZoom,
  setTimelineZoom,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="endpoint-telemetry-row">
      {/* 13. ENDPOINT HEALTH SCORE */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-xs space-y-3">
        <div className="flex gap-2 items-center border-b border-border pb-2">
          <Activity size={13} className="text-indigo-650 dark:text-cyan-400" />
          <h3 className="text-[10px] font-black uppercase tracking-wider">Telemetry Health Gauge</h3>
        </div>
        {selectedEndpointObj ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center pt-2 relative">
              {/* Ring score */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="currentColor" className="text-muted/40" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="56" 
                    cy="56" 
                    r="48" 
                    stroke={
                      selectedEndpointObj.healthScore >= 90 ? "#10b981" :
                      selectedEndpointObj.healthScore >= 70 ? "#f59e0b" :
                      selectedEndpointObj.healthScore >= 50 ? "#f97316" : "#ef4444"
                    } 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray="301.59"
                    strokeDashoffset={301.59 - (301.59 * selectedEndpointObj.healthScore) / 100}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute text-center bg-background w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-inner">
                  <span className="text-lg font-black font-mono tracking-tighter text-foreground">{selectedEndpointObj.healthScore}%</span>
                  <span className="text-[7.5px] text-muted-foreground font-bold uppercase tracking-widest leading-none">Global Health</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-[9px] font-mono leading-none">
              <div className="bg-muted p-2 border border-border rounded-lg">
                <p className="text-muted-foreground mb-1 uppercase text-[7px] font-bold">Severity Level</p>
                <p className={cn(
                  "font-black uppercase tracking-wider",
                  selectedEndpointObj.healthScore >= 90 ? "text-emerald-500" :
                  selectedEndpointObj.healthScore >= 70 ? "text-amber-500" :
                  selectedEndpointObj.healthScore >= 50 ? "text-orange-500" :
                  "text-red-500 animate-pulse"
                )}>
                  {selectedEndpointObj.healthScore >= 90 ? "Healthy" :
                   selectedEndpointObj.healthScore >= 70 ? "Warning" :
                   selectedEndpointObj.healthScore >= 50 ? "High Risk" : "Critical"}
                </p>
              </div>
              <div className="bg-muted p-2 border border-border rounded-lg">
                <p className="text-muted-foreground mb-1 uppercase text-[7px] font-bold">Mitre Score</p>
                <p className="font-extrabold text-foreground uppercase">{selectedEndpointObj.timeline.length} Records</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-[10px] text-slate-400 font-mono text-center py-6">Select a host node in our index directory grid.</p>
        )}
      </div>

      {/* 9. ATTACK PATH VISUALIZATION GRAPH */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-xs space-y-3">
        <div className="flex gap-2 items-center border-b border-border pb-2 justify-between">
          <div className="flex items-center gap-1.5">
            <GitFork size={13} className="text-indigo-650" />
            <h3 className="text-[10px] font-black uppercase tracking-wider">Attack Tree Graph Visualization</h3>
          </div>
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
        </div>

        {/* Graphical rendering area using flex blocks and linking SVGs */}
        <div className="space-y-4 font-mono text-[9px] relative py-2">
          {/* Node 1: Attacker Kali VM */}
          <div className="flex flex-col items-center">
            <div className="p-2 border border-red-500/30 bg-red-500/10 text-red-500 rounded-lg text-center tracking-widest uppercase font-extrabold flex items-center gap-1">
              <Flame size={12} className="animate-bounce" /> Kali Attacker (192.168.1.99)
            </div>
          </div>

          {/* Animated Arrow 1 */}
          <div className="flex justify-center -my-2">
            <svg className="w-6 h-8 text-red-405 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* Node 2: Target Target Web Host */}
          <div className="flex flex-col items-center">
            <div className={cn(
              "p-2 border rounded-lg text-center tracking-widest uppercase font-mono flex items-center gap-1 w-5/6 justify-center",
              selectedEndpointObj?.status === "Critical" ? "border-red-500 bg-red-500/10 text-red-500" :
              selectedEndpointObj?.status === "Warning" ? "border-amber-500 bg-amber-500/10 text-amber-550" :
              "border-border bg-muted text-foreground"
            )}>
              <Monitor size={12} /> {selectedEndpointObj?.hostname || "Target Victim"}
            </div>
          </div>

          {/* Animated Arrow 2 */}
          <div className="flex justify-center -my-2">
            <svg className="w-6 h-8 text-muted-foreground/50 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* Node 3: Affected Core services e.g. SQL Database */}
          <div className="flex flex-col items-center">
            <div className="p-2 border border-purple-505 bg-purple-500/10 text-purple-400 rounded-lg text-center tracking-widest uppercase w-4/5 flex items-center gap-1 justify-center">
              <Server size={12} /> Target database Sub (3306)
            </div>
          </div>

          <p className="text-[8px] text-center text-muted-foreground uppercase leading-none">Attack sequence triggered via Drupal API route exploitation vectors.</p>
        </div>
      </div>

      {/* 7. ENDPOINT TIMELINE */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-cyan-405" />
            <h3 className="text-[10px] font-black uppercase tracking-wider">Device Chronicle Timeline</h3>
          </div>
          {/* Zoom range controller */}
          <div className="flex items-center gap-1">
            <span className="text-[7.5px] uppercase font-mono text-muted-foreground">Scale zoom</span>
            <input 
              id="timeline-zoom-slider"
              type="range" 
              min="30" 
              max="100" 
              value={timelineZoom}
              onChange={(e) => setTimelineZoom(Number(e.target.value))}
              className="w-16 h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-cyan-404"
            />
          </div>
        </div>

        {selectedEndpointObj ? (
          <div className="relative pl-6 space-y-3 font-mono text-[10px] overflow-y-auto max-h-47.5 pr-1">
            {/* Timeline line */}
            <div className="absolute left-2.75 top-1.5 bottom-1.5 w-px bg-border" />
            {selectedEndpointObj.timeline
              .slice(0, Math.ceil(selectedEndpointObj.timeline.length * (timelineZoom / 100)))
              .map((item) => (
                <div key={item.id} className="relative group/time">
                  {/* Circle marker */}
                  <span className={cn(
                    "absolute -left-4.25 top-1 w-2 h-2 rounded-full",
                    item.severity === "Critical" ? "bg-red-500" :
                    item.severity === "High" ? "bg-amber-500" : "bg-indigo-500"
                  )} />
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-muted-foreground font-medium">{item.time}</span>
                    <p className="font-extrabold text-foreground leading-snug uppercase">{item.event}</p>
                    <span className={cn(
                      "text-[7.5px] border rounded px-1.5 py-0.2 uppercase font-black tracking-widest",
                      item.severity === "Critical" ? "border-red-500/30 bg-red-500/10 text-red-500" :
                      "border-border text-muted-foreground bg-muted"
                    )}>
                      {item.severity} Level
                    </span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-[10px] font-mono text-muted-foreground text-center py-6">Highlight target vm node below.</p>
        )}
      </div>
    </div>
  );
};
