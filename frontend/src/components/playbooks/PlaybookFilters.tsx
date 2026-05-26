import React from "react";
import { Search, Plus, SlidersHorizontal, ToggleLeft } from "lucide-react";

interface PlaybookFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (status: "all" | "active" | "inactive") => void;
  triggerFilter: "all" | "automated" | "manual";
  onTriggerFilterChange: (trigger: "all" | "automated" | "manual") => void;
  onCreateClick: () => void;
}

export function PlaybookFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  triggerFilter,
  onTriggerFilterChange,
  onCreateClick,
}: PlaybookFiltersProps) {
  return (
    <div className="bg-card border border-border p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl rounded-xl">
      <div className="flex-1 flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-cyan-500 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search SOAR orchestration playbooks (e.g., EC2, pfSense)..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-cyan-500 transition-all uppercase tracking-wider font-mono shadow-inner"
          />
        </div>

        {/* Filter Dropdowns with Wrap/Responsiveness support */}
        <div className="flex flex-wrap gap-2">
          {/* Status Dropdown */}
          <div className="relative flex items-center bg-background border border-border rounded-lg px-3 py-1.5 hover:border-foreground/20 transition duration-200">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as any)}
              className="bg-transparent border-none outline-none text-[10px] font-mono font-black uppercase tracking-wider text-foreground cursor-pointer focus:ring-0 select-none pr-3"
            >
              <option value="all" className="bg-card text-muted-foreground">STATE: ALL SYSTEMS</option>
              <option value="active" className="bg-card text-emerald-580 dark:text-emerald-400 font-bold">STATE: ACTIVE REMEDIATIONS</option>
              <option value="inactive" className="bg-card text-rose-580 dark:text-rose-450">STATE: STANDBY ONLY</option>
            </select>
          </div>

          {/* Trigger Type Dropdown */}
          <div className="relative flex items-center bg-background border border-border rounded-lg px-3 py-1.5 hover:border-foreground/20 transition duration-200">
            <ToggleLeft className="w-3.5 h-3.5 text-muted-foreground mr-2" />
            <select
              value={triggerFilter}
              onChange={(e) => onTriggerFilterChange(e.target.value as any)}
              className="bg-transparent border-none outline-none text-[10px] font-mono font-black uppercase tracking-wider text-foreground cursor-pointer focus:ring-0 select-none pr-3"
            >
              <option value="all" className="bg-card text-muted-foreground font-bold">RUN: ALL TRIGGERS</option>
              <option value="automated" className="bg-card text-cyan-550 dark:text-cyan-400 font-bold">RUN: FULLY AUTOMATED</option>
              <option value="manual" className="bg-card text-indigo-550 dark:text-indigo-400 font-bold">RUN: MANUAL/SECOPS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Access/Create Button with cyber neon properties */}
      <button
        onClick={onCreateClick}
        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-linear-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500 text-white rounded-lg text-[10px] font-mono font-black uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.15)] active:scale-95 border border-cyan-400/20 shrink-0"
      >
        <Plus className="w-4 h-4 text-white" />
        <span>PROVISION NEW PLAYBOOK</span>
      </button>
    </div>
  );
}
