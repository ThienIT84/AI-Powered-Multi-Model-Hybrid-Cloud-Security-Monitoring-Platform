import React from "react";
import { Shield } from "lucide-react";
import { cn } from "../../lib/utils";

interface EndpointPageHeaderProps {
  activeSegment: "inventory" | "incidents";
  setActiveSegment: (segment: "inventory" | "incidents") => void;
}

export const EndpointPageHeader: React.FC<EndpointPageHeaderProps> = ({
  activeSegment,
  setActiveSegment,
}) => {
  return (
    <div 
      id="endpoint-page-header"
      className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/60 backdrop-blur-md p-4 rounded-xl border border-border"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-indigo-650 dark:text-cyan-400 animate-pulse" />
          <h1 className="text-sm font-black text-foreground uppercase tracking-widest leading-none">
            Endpoint Intelligence Center
          </h1>
        </div>
        <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
          FCAJ v3.0 Compliance Console • Extreme Risk Profiling, Flow Investigation & Realtime Threat Sprints
        </p>
      </div>

      {/* Sync badge and quick view selectors */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-indigo-500/10 dark:bg-cyan-500/10 border border-indigo-500/20 dark:border-cyan-500/20 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-cyan-400 animate-ping" />
          <span className="text-[9px] font-mono font-black text-indigo-600 dark:text-cyan-400 tracking-wider uppercase">
            FUSION SYNC: SECURE
          </span>
        </div>
        <div className="flex bg-muted p-1 rounded-lg border border-border">
          <button 
            id="switch-to-inventory"
            onClick={() => setActiveSegment("inventory")}
            className={cn(
              "px-2.5 py-1 text-[9px] font-black tracking-widest uppercase rounded cursor-pointer transition-all",
              activeSegment === "inventory" ? "bg-card text-indigo-600 dark:text-cyan-400 shadow-xs" : "text-muted-foreground"
            )}
          >
            Inventory
          </button>
          <button 
            id="switch-to-incidents"
            onClick={() => setActiveSegment("incidents")}
            className={cn(
              "px-2.5 py-1 text-[9px] font-black tracking-widest uppercase rounded cursor-pointer transition-all",
              activeSegment === "incidents" ? "bg-card text-indigo-600 dark:text-cyan-400 shadow-xs" : "text-muted-foreground"
            )}
          >
            Incident Logs
          </button>
        </div>
      </div>
    </div>
  );
};
