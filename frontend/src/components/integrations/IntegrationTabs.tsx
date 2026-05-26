import React from "react";
import { Search, Grid, Database, Bell, ShieldAlert, Layers } from "lucide-react";

interface IntegrationTabsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: "all" | "inbound" | "notifications" | "security_actions";
  onTabChange: (tab: "all" | "inbound" | "notifications" | "security_actions") => void;
}

export function IntegrationTabs({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
}: IntegrationTabsProps) {
  const tabs = [
    { id: "all" as const, name: "ALL PLATFORM NODES", icon: Layers, accent: "border-cyan-500/20" },
    { id: "inbound" as const, name: "LOG INGESTION STREAM", icon: Database, accent: "border-blue-500/20" },
    { id: "notifications" as const, name: "INCIDENT WARNING dispatch", icon: Bell, accent: "border-purple-500/20" },
    { id: "security_actions" as const, name: "SOAR EXECUTION PIPES", icon: ShieldAlert, accent: "border-rose-500/20" },
  ];

  return (
    <div className="bg-card/80 backdrop-blur-md rounded-xl border border-border p-4.5 flex flex-col lg:flex-row lg:items-center justify-between gap-4.5 shadow-sm select-none">
      {/* Search Input Box */}
      <div className="relative flex-1 max-w-lg">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <Search className="w-4 h-4 text-muted-foreground group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="SEARCH TELEMETRY & FIREWALL CHANNELS..."
          className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-xs text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-cyan-500/50 transition-colors uppercase tracking-widest font-mono"
        />
        {searchQuery && (
          <button 
            onClick={() => onSearchChange("")} 
            className="absolute right-3 top-2 text-[8px] font-mono font-bold text-muted-foreground hover:text-foreground uppercase"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Tabs Classification Row */}
      <div className="flex flex-wrap items-center gap-1.5 bg-muted p-1 border border-border rounded-lg overflow-x-auto custom-scrollbar scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.8 rounded-md text-[9.5px] font-black uppercase tracking-widest pointer-events-auto transition-all duration-300 whitespace-nowrap border shrink-0 cursor-pointer ${
                isActive
                  ? "bg-card text-cyan-600 dark:text-cyan-400 border-cyan-500/30 shadow-sm"
                  : "text-muted-foreground hover:text-foreground border-transparent hover:bg-card/50 hover:border-border"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-600 dark:text-cyan-405" : "text-muted-foreground"}`} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
