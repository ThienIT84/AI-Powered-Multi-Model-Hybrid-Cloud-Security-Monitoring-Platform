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
    { id: "all" as const, name: "All", icon: Layers, countLabel: "ALL" },
    { id: "inbound" as const, name: "Log Sources", icon: Database, countLabel: "LOGS" },
    { id: "notifications" as const, name: "Notifications", icon: Bell, countLabel: "NOTIFY" },
    { id: "security_actions" as const, name: "Containment Actions", icon: ShieldAlert, countLabel: "SOAR" },
  ];

  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-lg select-none">
      {/* Left side: Search Input */}
      <div className="relative flex-1 max-w-md">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <Search className="w-4 h-4 text-slate-500" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search native integrations..."
          className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-855 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors uppercase tracking-wider font-mono"
        />
      </div>

      {/* Right side: Tabs classification */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1 border border-slate-850 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                isActive
                  ? "bg-slate-800 text-cyan-400 border border-slate-700/50 shadow-[0_0_12px_rgba(6,182,212,0.05)]"
                  : "text-slate-500 hover:text-slate-300 border border-transparent"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
