import React from "react";
import { Search, Database, Bell, ShieldAlert, Layers } from "lucide-react";
import { motion } from "motion/react";

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
    { id: "all" as const, name: "ALL PLATFORM NODES", icon: Layers },
    { id: "inbound" as const, name: "LOG INGESTION STREAM", icon: Database },
    { id: "notifications" as const, name: "INCIDENT WARNING DISPATCH", icon: Bell },
    { id: "security_actions" as const, name: "SOAR EXECUTION PIPES", icon: ShieldAlert },
  ];

  return (
    <div className="bg-card/85 backdrop-blur-md rounded-xl border border-border p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm select-none" id="integration-tabs-bar">
      {/* Search Input Box */}
      <div className="relative flex-1 max-w-lg">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <Search className="w-4 h-4 text-muted-foreground transition-colors group-hover:text-cyan-500" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search telemetry, cloud nodes or SOAR pipes..."
          id="search-telemetry-inputs"
          className="w-full pl-10 pr-12 py-2 bg-background border border-border rounded-lg text-xs text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-cyan-500/50 transition-colors uppercase tracking-widest font-mono"
        />
        {searchQuery && (
          <button 
            onClick={() => onSearchChange("")} 
            className="absolute right-3 top-2.5 text-[8.5px] font-mono font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest cursor-pointer"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Tabs Classification Row with sliding animation */}
      <div className="flex flex-wrap items-center gap-1.5 bg-muted p-1 border border-border rounded-lg overflow-x-auto custom-scrollbar scrollbar-none relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-md text-[9.5px] font-black uppercase tracking-widest pointer-events-auto transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer relative"
              id={`tab-to-${tab.id}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicatorSlider"
                  className="absolute inset-0 bg-card rounded-md border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.1)] z-0"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="flex items-center gap-2 relative z-10">
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-600 dark:text-cyan-400" : "text-muted-foreground"}`} />
                <span className={isActive ? "text-cyan-600 dark:text-cyan-400" : "text-muted-foreground"}>
                  {tab.name}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

