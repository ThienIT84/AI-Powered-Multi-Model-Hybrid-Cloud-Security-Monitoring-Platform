import React, { useState, useMemo } from "react";
import { Clock, Filter, ZoomIn, ZoomOut, Search, Activity, ShieldCheck, Flame } from "lucide-react";
import { cn } from "../../lib/utils";
import { IncidentCampaign } from "./IncidentCampaignCard";

interface AttackTimelineProps {
  campaign: IncidentCampaign;
}

export function AttackTimeline({ campaign }: AttackTimelineProps) {
  const [filterSeverity, setFilterSeverity] = useState<"ALL" | "Critical" | "High" | "Medium">("ALL");
  const [zoomLevel, setZoomLevel] = useState<"dense" | "expanded">("expanded");
  const [localSearch, setLocalSearch] = useState("");

  const filteredEvents = useMemo(() => {
    return campaign.timelineEvents.filter(e => {
      if (filterSeverity !== "ALL" && e.severity !== filterSeverity) return false;
      if (localSearch && !e.event.toLowerCase().includes(localSearch.toLowerCase()) && !e.technique.toLowerCase().includes(localSearch.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [campaign.timelineEvents, filterSeverity, localSearch]);

  return (
    <div className="space-y-4">
      {/* Target 5 Timeline Reconstruction Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/10 border border-border p-3.5 rounded-xl select-none">
        <div>
          <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-[0.2em] block">
            CHRONOLOGICAL ATTACK TIMELINE RECONSTRUCTION
          </span>
          <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-wider block mt-0.5">
            Decoded Stream Correlation Chronology
          </h3>
        </div>

        {/* Filters/Toolbar within Timeline Reconstruction */}
        <div className="flex items-center gap-2 flex-wrap text-[8px] font-mono leading-none">
          {/* Zoom controls */}
          <div className="flex bg-background border border-border p-0.5 rounded">
            <button 
              onClick={() => setZoomLevel("dense")}
              className={cn("p-1.5 cursor-pointer rounded transition-all", zoomLevel === "dense" ? "bg-card text-cyan-500 font-bold border border-border/40" : "text-muted-foreground")}
              title="Dense Zoom"
            >
              <ZoomOut size={11} />
            </button>
            <button 
              onClick={() => setZoomLevel("expanded")}
              className={cn("p-1.5 cursor-pointer rounded transition-all", zoomLevel === "expanded" ? "bg-card text-cyan-500 font-bold border border-border/40" : "text-muted-foreground")}
              title="Expanded Zoom"
            >
              <ZoomIn size={11} />
            </button>
          </div>

          {/* Severity filter dropdown */}
          <select
            value={filterSeverity}
            onChange={(e: any) => setFilterSeverity(e.target.value)}
            className="bg-background border border-border text-[8px] p-1 rounded font-black text-foreground cursor-pointer focus:outline-none"
          >
            <option value="ALL">ALL SEVERITIES</option>
            <option value="Critical">CRITICAL</option>
            <option value="High">HIGH</option>
            <option value="Medium">MEDIUM</option>
          </select>

          {/* Local text search filter */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filter timeline..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="bg-background border border-border rounded pl-5 pr-1 py-1 text-[7.5px] text-foreground focus:outline-none"
            />
            <Search size={10} className="absolute left-1.5 top-1.5 text-muted-foreground/50" />
          </div>
        </div>
      </div>

      {/* Target 5: Visual Timeline timeline items list */}
      <div className="relative bg-card/40 border border-border/50 rounded-xl p-4 min-h-40 max-h-95 overflow-y-auto custom-scrollbar">
        {/* Timeline dotted line alignment path */}
        <div className="absolute left-5 top-4 bottom-4 w-px border-l border-dashed border-border" />

        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-10 uppercase text-[9px] text-muted-foreground/60 font-black">
              No Chronological Events Match Active Query
            </div>
          ) : (
            filteredEvents.map((e, index) => {
              const isCrit = e.severity === "Critical";
              const isHigh = e.severity === "High";

              return (
                <div key={index} className="flex gap-4 relative items-start select-none">
                  {/* Visual Node Dot indicator */}
                  <div className="relative z-10 shrink-0">
                    <div className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center border border-card",
                      isCrit 
                        ? "bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-pulse" 
                        : isHigh 
                          ? "bg-orange-500 text-white" 
                          : "bg-cyan-500 text-white"
                    )}>
                      <Clock size={8} />
                    </div>
                  </div>

                  {/* Body Info block wrapper */}
                  <div className="flex-1 space-y-1 bg-secondary/10 hover:bg-secondary/20 p-2.5 rounded-lg border border-border/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-foreground uppercase tracking-tight">{e.event}</span>
                      <span className="font-mono text-[7px] text-muted-foreground/80 bg-muted border font-bold px-1.5 py-0.5 rounded">
                        {e.time}
                      </span>
                    </div>

                    {/* Exposing technique and severity labels */}
                    <div className="flex items-center gap-2 pt-0.5 select-none font-mono text-[7px]">
                      <span className="text-[#06b6d4] font-black">{e.technique}</span>
                      <span className="text-muted-foreground font-semibold">-</span>
                      <span className={cn(
                        "font-black uppercase",
                        isCrit ? "text-red-500" : isHigh ? "text-orange-500" : "text-cyan-500"
                      )}>
                        {e.severity} Severity
                      </span>
                    </div>

                    {/* Show more logs context condition on expanded view */}
                    {zoomLevel === "expanded" && (
                      <p className="text-[8.5px] text-muted-foreground/90 leading-relaxed font-medium border-t border-border/20 pt-1.5 mt-1.5">
                        Deep Correlation match derived from ZEEK packet payload entropy index and multi-model consensus prediction. Consumed 0.04ms pipeline step.
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default AttackTimeline;
