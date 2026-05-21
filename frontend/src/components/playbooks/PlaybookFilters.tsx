import React from "react";
import { Search, Plus, SlidersHorizontal, ToggleLeft, Activity, Layers } from "lucide-react";

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
    <div className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
      <div className="flex-1 flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search SOAR playbooks (e.g. Auto-Isolate, Block pfSense...)"
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors uppercase tracking-wider font-mono"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex gap-2">
          {/* Status Dropdown */}
          <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 hover:border-slate-700 transition">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as any)}
              className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-wider text-slate-300 cursor-pointer focus:ring-0 select-none pr-1"
            >
              <option value="all" className="bg-slate-950 text-slate-350">STATUS: ALL</option>
              <option value="active" className="bg-slate-950 text-emerald-400">STATUS: ACTIVE</option>
              <option value="inactive" className="bg-slate-950 text-red-400">STATUS: INACTIVE</option>
            </select>
          </div>

          {/* Trigger Type Dropdown */}
          <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 hover:border-slate-700 transition">
            <ToggleLeft className="w-3.5 h-3.5 text-slate-500 mr-2" />
            <select
              value={triggerFilter}
              onChange={(e) => onTriggerFilterChange(e.target.value as any)}
              className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-wider text-slate-300 cursor-pointer focus:ring-0 select-none pr-1"
            >
              <option value="all" className="bg-slate-950 text-slate-350">TRIGGER: ALL</option>
              <option value="automated" className="bg-slate-950 text-cyan-400">TRIGGER: AUTOMATED</option>
              <option value="manual" className="bg-slate-950 text-purple-400">TRIGGER: MANUAL</option>
            </select>
          </div>
        </div>
      </div>

      {/* Access/Create Button */}
      <button
        onClick={onCreateClick}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border border-blue-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.15)] active:scale-95"
      >
        <Plus className="w-4 h-4 text-white" />
        <span>CREATE PLAYBOOK</span>
      </button>
    </div>
  );
}
