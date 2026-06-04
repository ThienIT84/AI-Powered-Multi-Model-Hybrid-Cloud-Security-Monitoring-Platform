import React from "react";
import { Terminal, Layers, Activity } from "lucide-react";

export interface HeaderSectionProps {
  activeTab: "overview" | "workspace" | "analytics";
  setActiveTab: (tab: "overview" | "workspace" | "analytics") => void;
  utcTime: string;
}

export function HeaderSection({ activeTab, setActiveTab, utcTime }: HeaderSectionProps) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between pb-4 border-b border-border/80 gap-4" id="playbooks-header-section">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-[10px] font-mono font-black tracking-[0.2em] text-cyan-550 dark:text-cyan-400 uppercase">
            FCAJ SECURITY RESPONSE OPERATIONS CENTER v3.0
          </span>
        </div>
        <h2 className="text-2xl font-mono font-black tracking-tight uppercase leading-none">
          Playbooks & SOC Incident Workspace
        </h2>
      </div>

      {/* CLOCK & CONTROLS CONTAINER */}
      <div className="flex flex-wrap items-center gap-3">
        {/* NAVIGATION TAB CONTROLLER */}
        <div className="bg-muted/70 p-1 rounded-lg border border-border flex gap-1">
          <button 
            type="button"
            onClick={() => setActiveTab("workspace")}
            className={`px-3 py-1.5 rounded-md font-mono text-[10.5px] font-black uppercase transition ${activeTab === "workspace" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground/80 hover:text-foreground"}`}
          >
            <Terminal className="w-3.5 h-3.5 inline mr-1.5" /> Workspace Hub
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-md font-mono text-[10.5px] font-black uppercase transition ${activeTab === "overview" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground/80 hover:text-foreground"}`}
          >
            <Layers className="w-3.5 h-3.5 inline mr-1.5" /> Mitchell Library
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1.5 rounded-md font-mono text-[10.5px] font-black uppercase transition ${activeTab === "analytics" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground/80 hover:text-foreground"}`}
          >
            <Activity className="w-3.5 h-3.5 inline mr-1.5" /> SIEM Intelligence
          </button>
        </div>

        <div className="bg-card border border-border rounded-lg px-4 py-1.5 font-mono text-right shrink-0">
          <span className="text-[8px] font-extrabold tracking-widest text-muted-foreground block uppercase">
            SOC MASTER COORDINATION CLOCK
          </span>
          <span className="text-xs font-black text-cyan-600 dark:text-cyan-400">
            {utcTime || "2026-06-04 10:31:51 UTC"}
          </span>
        </div>
      </div>
    </div>
  );
}
