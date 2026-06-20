import React, { useState, useMemo } from "react";
import { Activity, ShieldAlert, Search } from "lucide-react";
import { cn } from "../../lib/utils";
import { IncidentFCAJ } from "./endpointFCAJData";

interface EndpointIncidentsTableProps {
  incidents: IncidentFCAJ[];
  onSelectIncident: (inc: IncidentFCAJ) => void;
}

export const EndpointIncidentsTable: React.FC<EndpointIncidentsTableProps> = ({
  incidents,
  onSelectIncident,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter list
  const filteredIncidents = useMemo(() => {
    let list = [...incidents];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(inc => 
        inc.id.toLowerCase().includes(q) ||
        inc.hostname.toLowerCase().includes(q) ||
        inc.ip.toLowerCase().includes(q) ||
        inc.attackType.toLowerCase().includes(q)
      );
    }
    return list;
  }, [incidents, searchQuery]);

  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);

  const displayedIncidents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredIncidents.slice(start, start + itemsPerPage);
  }, [filteredIncidents, currentPage]);

  return (
    <div className="bg-card border border-border rounded-xl shadow-xs flex flex-col justify-between overflow-hidden" id="endpoint-incidents-table-container">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-border bg-muted/40 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-red-500 font-bold" />
            <h2 className="text-xs font-black uppercase tracking-wider">
              Fusion Consensus Threats Data Grid ({filteredIncidents.length})
            </h2>
          </div>
          <span className="text-[8px] font-mono bg-red-500/10 text-red-500 px-2 py-0.5 rounded uppercase font-bold animate-pulse">
            LIVE IDS MATCHING
          </span>
        </div>

        {/* Search row */}
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input 
            id="incidents-search-input"
            type="text" 
            placeholder="Search Incident, Host, IP or Attack Type..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-background text-foreground border border-border focus:border-red-505 outline-none rounded-lg font-mono placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Grid view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-[11px] min-w-175">
          <thead>
            <tr className="bg-muted/40 text-[10px] font-black text-muted-foreground uppercase tracking-wider border-b border-border">
              <th className="px-4 py-3">Incident ID</th>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Device Host</th>
              <th className="px-4 py-3">Destination IP</th>
              <th className="px-4 py-3">Tactical Attack Type</th>
              <th className="px-4 py-3 text-center">Threat Level</th>
              <th className="px-4 py-3 text-center">Fusion Score</th>
              <th className="px-4 py-3">Consensus Pipeline</th>
              <th className="px-4 py-3 text-right">Evidence Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
            {displayedIncidents.map(inc => (
              <tr 
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className="cursor-pointer group hover:bg-red-500/5 transition-all border-b border-border/50"
              >
                <td className="px-4 py-3 font-semibold text-red-550 dark:text-red-400 font-mono">
                  {inc.id}
                </td>
                <td className="px-4 py-3 text-muted-foreground font-sans text-[10.5px]">{inc.timestamp}</td>
                <td className="px-4 py-3 font-semibold text-foreground">{inc.hostname}</td>
                <td className="px-4 py-3 text-muted-foreground">{inc.ip}</td>
                <td className="px-4 py-3">
                  <span className="px-1.5 py-0.5 rounded text-[9.5px] bg-red-100 dark:bg-red-950/20 text-red-500 font-extrabold uppercase tracking-wide">
                    {inc.attackType}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider",
                    inc.severity === "Critical" ? "bg-red-550 text-white animate-pulse" : "bg-amber-500/10 text-amber-500"
                  )}>
                    {inc.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-center font-bold text-foreground">{inc.riskScore}%</td>
                <td className="px-4 py-3 text-muted-foreground font-sans text-[10px]">{inc.aiSource}</td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <button 
                    id={`view-incident-evidence-${inc.id}`}
                    onClick={() => onSelectIncident(inc)}
                    className="px-2 py-1 hover:bg-muted text-[9px] font-black text-indigo-650 dark:text-cyan-404 border border-border uppercase rounded flex items-center gap-1.5 ml-auto cursor-pointer"
                  >
                    <ShieldAlert size={10} /> View Evidence
                  </button>
                </td>
              </tr>
            ))}
            {displayedIncidents.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-slate-400 uppercase tracking-wider">
                  No matching threat logs compiled in recent buffer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Area */}
      <div className="p-4 border-t border-border flex items-center justify-between bg-muted/40 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        <span>Showing {Math.min(filteredIncidents.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(filteredIncidents.length, currentPage * itemsPerPage)} of {filteredIncidents.length} incidents</span>
        <div className="flex items-center gap-1">
          <button 
            id="incidents-prev-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="p-1 px-2.5 bg-background border border-border rounded disabled:opacity-20 cursor-pointer text-foreground hover:bg-muted transition-colors font-semibold"
          >
            Prev
          </button>
          <span className="font-extrabold text-foreground">Page {currentPage} of {totalPages || 1}</span>
          <button 
            id="incidents-next-btn"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            className="p-1 px-2.5 bg-background border border-border rounded disabled:opacity-20 cursor-pointer text-foreground hover:bg-muted transition-colors font-semibold"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
