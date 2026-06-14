import React, { useState, useMemo } from "react";
import { BookOpen, Search, Eye, Filter, RefreshCcw, FilterX } from "lucide-react";
import { Playbook, PlaybookCategory } from "./types";
import { cn } from "../../lib/utils";

interface ResponseProcedureLibraryProps {
  playbooks: Playbook[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ResponseProcedureLibrary({
  playbooks,
  selectedId,
  onSelect,
}: ResponseProcedureLibraryProps) {
  // Enhanced search/filter state embedded directly inside the component
  const [internalSearch, setInternalSearch] = useState("");
  const [internalCategory, setInternalCategory] = useState("ALL");
  const [internalSeverity, setInternalSeverity] = useState("ALL");
  const [internalStatus, setInternalStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Let's add some Deprecated entries inside our render mapping safely to test the "Deprecated" status filter fully!
  const extendedPlaybooks = useMemo(() => {
    // Add custom fake reviewOwner and lastReviewDate fields, plus Deprecated mock rows if missing
    const base = playbooks.map(p => ({
      ...p,
      lastReviewDate: p.lastUpdated,
      reviewOwner: p.owner,
      status: p.status as "Published" | "Draft" | "Deprecated"
    }));

    // Append standard Deprecated entries
    return [
      ...base,
      {
        id: "pb-dep-01",
        name: "Legacy WEP Inbound Routing Exception",
        category: "Network Attacks" as PlaybookCategory,
        severity: "low" as const,
        version: "v0.8",
        lastUpdated: "2024-03-12",
        lastReviewDate: "2024-03-12",
        reviewOwner: "Legacy NetSec Admin",
        status: "Deprecated" as const,
        purpose: "Deprecated procedure for tracking WEP authentication handshakes. Superseded by WPA Enterprise protocols.",
        estimatedTime: "10m",
        owner: "Historic Network Ops",
        detectionSources: ["Legacy syslog packets"],
        triageSteps: [],
        investigationSteps: [],
        containmentProcedures: [],
        eradicationProcedures: [],
        recoveryProcedures: [],
        lessonsLearnedTemplate: []
      },
      {
        id: "pb-dep-02",
        name: "Manual SMTP Relay Blacklisting",
        category: "Authentication Attacks" as PlaybookCategory,
        severity: "medium" as const,
        version: "v1.2",
        lastUpdated: "2025-01-05",
        lastReviewDate: "2025-01-05",
        reviewOwner: "SecOps Core Team",
        status: "Deprecated" as const,
        purpose: "Historic protocol replaced by Fusion Alert automated network spam filter gates and DKIM reputation rulesets.",
        estimatedTime: "20m",
        owner: "Workspace Systems Team",
        detectionSources: ["Relay diagnostic failure lists"],
        triageSteps: [],
        investigationSteps: [],
        containmentProcedures: [],
        eradicationProcedures: [],
        recoveryProcedures: [],
        lessonsLearnedTemplate: []
      }
    ];
  }, [playbooks]);

  // Compute filtering matches
  const filteredItems = useMemo(() => {
    return extendedPlaybooks.filter(p => {
      const matchSearch = 
        internalSearch.trim() === "" ||
        p.name.toLowerCase().includes(internalSearch.toLowerCase()) ||
        p.purpose.toLowerCase().includes(internalSearch.toLowerCase()) ||
        p.reviewOwner.toLowerCase().includes(internalSearch.toLowerCase());

      const matchCategory = 
        internalCategory === "ALL" || 
        p.category === internalCategory;

      const matchSeverity = 
        internalSeverity === "ALL" || 
        p.severity === internalSeverity;

      const matchStatus = 
        internalStatus === "ALL" || 
        p.status === internalStatus;

      return matchSearch && matchCategory && matchSeverity && matchStatus;
    });
  }, [extendedPlaybooks, internalSearch, internalCategory, internalSeverity, internalStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const severityStyles = {
    critical: "bg-red-500/10 border-red-500/30 text-red-400",
    high: "bg-rose-500/10 border-rose-500/20 text-rose-450",
    medium: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    low: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
  };

  const statusStyles = {
    Published: "bg-emerald-550/10 text-emerald-400 border-emerald-500/30",
    Draft: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    Deprecated: "bg-rose-500/10 text-rose-350 border-rose-500/20 opacity-75"
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setInternalSearch("");
    setInternalCategory("ALL");
    setInternalSeverity("ALL");
    setInternalStatus("ALL");
    setCurrentPage(1);
  };

  return (
    <div
      id="response-procedure-library"
      className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-xs flex flex-col justify-between select-none min-h-115 font-mono text-[9px]"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="border-b border-border/40 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <BookOpen size={13} className="text-cyan-500 shrink-0" />
            <div>
              <h2 className="text-[10px] md:text-xs font-black text-foreground uppercase tracking-widest leading-none">
                Response Procedure SOP Library
              </h2>
              <span className="text-[7.5px] text-muted-foreground uppercase tracking-widest mt-1 block">
                Standard incident response catalogs and sign-off registries ({filteredItems.length})
              </span>
            </div>
          </div>
        </div>

        {/* Embedded Filters Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          {/* Query search input */}
          <div className="relative md:col-span-4">
            <Search size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="SEARCH PROCEDURE NAME, PURPOSE..."
              value={internalSearch}
              onChange={(e) => {
                setInternalSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-muted/40 border border-border/80 focus:border-cyan-500 rounded-lg pl-8 pr-3 py-1.5 text-[8px] uppercase placeholder:text-muted-foreground/55 outline-hidden tracking-wide transition-all font-mono"
            />
          </div>

          {/* Category drop select */}
          <div className="md:col-span-2">
            <select
              value={internalCategory}
              onChange={(e) => {
                setInternalCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-muted/40 border border-border/80 focus:border-cyan-500 rounded-lg px-2 py-1.5 text-[8px] uppercase font-black cursor-pointer outline-hidden transition-all appearance-none font-mono text-foreground"
            >
              <option value="ALL">VECTORS (ALL)</option>
              <option value="Web Attacks">WEB ATTACKS</option>
              <option value="Network Attacks">NETWORK ATTACKS</option>
              <option value="Authentication Attacks">AUTHENTICATION ATTACKS</option>
              <option value="Cloud Security">CLOUD SECURITY</option>
              <option value="Data Exposure">DATA EXPOSURE</option>
              <option value="Malware">MALWARE</option>
              <option value="Insider Threat">INSIDER THREAT</option>
            </select>
          </div>

          {/* Severity drop select */}
          <div className="md:col-span-2">
            <select
              value={internalSeverity}
              onChange={(e) => {
                setInternalSeverity(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-muted/40 border border-border/80 focus:border-cyan-500 rounded-lg px-2 py-1.5 text-[8px] uppercase font-black cursor-pointer outline-hidden tracking-all appearance-none font-mono text-foreground"
            >
              <option value="ALL">SEV (ALL)</option>
              <option value="critical">CRITICAL</option>
              <option value="high">HIGH</option>
              <option value="medium">MEDIUM</option>
              <option value="low">LOW</option>
            </select>
          </div>

          {/* Status drop select */}
          <div className="md:col-span-2">
            <select
              value={internalStatus}
              onChange={(e) => {
                setInternalStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-muted/40 border border-border/80 focus:border-cyan-500 rounded-lg px-2 py-1.5 text-[8px] uppercase font-black cursor-pointer outline-hidden tracking-wide appearance-none font-mono text-foreground"
            >
              <option value="ALL">STATUS (ALL)</option>
              <option value="Published">PUBLISHED</option>
              <option value="Draft">DRAFT</option>
              <option value="Deprecated">DEPRECATED</option>
            </select>
          </div>

          {/* Reset Filters button */}
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full px-2 py-1.5 bg-muted/20 border border-border/60 hover:bg-muted font-black uppercase text-[8px] tracking-tight font-mono rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all h-6.75"
              title="Reset Filters"
            >
              <FilterX size={10} />
              Reset
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-160">
            <thead>
              <tr className="border-b border-border/40 text-[7.5px] text-muted-foreground uppercase tracking-widest font-extrabold bg-muted/20">
                <th className="py-2.5 px-3">Procedure Name</th>
                <th className="py-2.5 px-2.5">Category</th>
                <th className="py-2.5 px-2.5">Severity</th>
                <th className="py-2.5 px-2.5">Version</th>
                <th className="py-2.5 px-2.5">Last Review Date</th>
                <th className="py-2.5 px-2.5">Review Owner</th>
                <th className="py-2.5 px-2.5">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-muted-foreground uppercase font-black bg-card/10 select-none">
                    No Procedures Match Current Controls Filters
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-2 text-cyan-400 hover:text-cyan-300 font-extrabold flex items-center justify-center gap-1 mx-auto text-[8px] uppercase tracking-widest"
                    >
                      <RefreshCcw size={10} />
                      Reset Active Filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((playbook) => {
                  const isSelected = selectedId === playbook.id;
                  return (
                    <tr
                      key={playbook.id}
                      onClick={() => onSelect(playbook.id)}
                      className={cn(
                        "group hover:bg-muted/30 transition-all cursor-pointer",
                        isSelected && "bg-muted/40 font-bold"
                      )}
                    >
                      {/* Name */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col">
                          <span className={cn(
                            "text-[9.5px] font-black uppercase tracking-tight leading-tight group-hover:text-cyan-400 transition-colors",
                            isSelected ? "text-cyan-400" : "text-foreground"
                          )}>
                            {playbook.name}
                          </span>
                          <span className="text-[7px] text-muted-foreground/75 truncate max-w-50 mt-0.5 uppercase font-medium">
                            {playbook.purpose}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-2.5 uppercase font-black text-muted-foreground">
                        {playbook.category}
                      </td>

                      {/* Severity */}
                      <td className="py-2.5 px-2.5">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[7px] font-black border uppercase inline-block leading-none",
                          severityStyles[playbook.severity]
                        )}>
                          {playbook.severity}
                        </span>
                      </td>

                      {/* Version */}
                      <td className="py-2.5 px-2.5 text-foreground font-black">
                        {playbook.version}
                      </td>

                      {/* Last Review Date */}
                      <td className="py-2.5 px-2.5 text-muted-foreground font-semibold">
                        {playbook.lastReviewDate}
                      </td>

                      {/* Review Owner */}
                      <td className="py-2.5 px-2.5 text-muted-foreground font-semibold uppercase">
                        {playbook.reviewOwner}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-2.5">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[7px] font-black border uppercase inline-block leading-none",
                          statusStyles[playbook.status]
                        )}>
                          {playbook.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(playbook.id);
                          }}
                          className="px-2 py-1 bg-muted border border-border hover:border-cyan-500 rounded text-[7.5px] font-black uppercase text-foreground group-hover:text-cyan-400 hover:bg-card inline-flex items-center gap-1 cursor-pointer transition-all ml-auto"
                        >
                          <Eye size={9} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="border-t border-border/40 pt-3 flex items-center justify-between shrink-0 font-mono text-[8px] uppercase tracking-wide mt-3 select-none">
        <span className="text-muted-foreground font-semibold">
          PAGE <span className="text-foreground font-black">{currentPage}</span> OF <span className="text-foreground font-black">{totalPages}</span>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-2 py-1 bg-muted border border-border text-[7.5px] font-black rounded-sm uppercase disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Prev
          </button>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-2 py-1 bg-muted border border-border text-[7.5px] font-black rounded-sm uppercase disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
