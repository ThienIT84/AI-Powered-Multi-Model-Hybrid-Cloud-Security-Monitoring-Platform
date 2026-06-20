import React from "react";
import { Search, Download } from "lucide-react";
import { CaseSeverity, CaseStatus } from "./caseTypes";

interface CaseManagementHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  severityFilter: string;
  setSeverityFilter: (sev: string) => void;
  statusFilter: string;
  setStatusFilter: (stat: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (assignee: string) => void;
  onExport: () => void;
  assignees: string[];
}

export function CaseManagementHeader({
  searchQuery,
  setSearchQuery,
  severityFilter,
  setSeverityFilter,
  statusFilter,
  setStatusFilter,
  assigneeFilter,
  setAssigneeFilter,
  onExport,
  assignees,
}: CaseManagementHeaderProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4 select-none">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-mono font-black tracking-[0.25em] text-cyan-500 uppercase">
              Incident Response Workspace (V3)
            </span>
          </div>
          <h2 className="text-lg font-black text-foreground tracking-tight uppercase leading-none">
            CASE RECONNAISSANCE & TRIAGE
          </h2>
          <p className="text-xs text-muted-foreground font-medium font-mono uppercase tracking-wider text-[9px]">
            Real-time zeek audit streams & threat lifecycle controls
          </p>
        </div>

        {/* Export Trigger */}
        <button
          onClick={onExport}
          className="self-start sm:self-center bg-secondary hover:bg-muted border border-border text-[9px] font-black uppercase tracking-widest text-[#06b6d4] px-3.5 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all leading-none focus:outline-none"
        >
          <Download size={12} className="text-[#06b6d4]" />
          EXPORT RECORDS (.JSON)
        </button>
      </div>

      {/* Control Filters Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 pt-2 border-t border-border/40">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search host IP, case ID, threat, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border text-xs font-semibold text-foreground pl-8 pr-3 py-2 rounded-lg placeholder:text-muted-foreground/45 focus:outline-none focus:border-cyan-500/45 text-[10px]"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full bg-background border border-border text-xs font-black uppercase text-foreground px-2.5 py-2 rounded-lg cursor-pointer focus:outline-none focus:border-cyan-500/40 text-[9.5px]"
          >
            <option value="ALL">ALL SEVERITIES</option>
            <option value="Critical">CRITICAL SEVERITY</option>
            <option value="High">HIGH SEVERITY</option>
            <option value="Medium">MEDIUM SEVERITY</option>
            <option value="Low">LOW SEVERITY</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-background border border-border text-xs font-black uppercase text-foreground px-2.5 py-2 rounded-lg cursor-pointer focus:outline-none focus:border-cyan-500/40 text-[9.5px]"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="Open">STATUS: OPEN</option>
            <option value="In Progress">STATUS: IN PROGRESS</option>
            <option value="Resolved">STATUS: RESOLVED</option>
            <option value="Pending Review">STATUS: PENDING REVIEW</option>
          </select>
        </div>

        {/* Assignee Filter */}
        <div className="flex items-center gap-1.5">
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="w-full bg-background border border-border text-xs font-black uppercase text-foreground px-2.5 py-2 rounded-lg cursor-pointer focus:outline-none focus:border-cyan-500/40 text-[9.5px]"
          >
            <option value="ALL">ALL ASSIGNEES</option>
            <option value="UNASSIGNED">UNASSIGNED ONLY</option>
            {assignees.map((a) => (
              <option key={a} value={a}>
                ASSIGNEE: {a.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
