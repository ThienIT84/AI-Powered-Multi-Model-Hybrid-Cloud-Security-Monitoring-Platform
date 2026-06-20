import React, { useState, useMemo } from "react";
import { IOC } from "./types";
import { Search, Database, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface IOCIntelligenceTableProps {
  iocs: IOC[];
}

export function IOCIntelligenceTable({ iocs }: IOCIntelligenceTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Compact pagination size to satisfy "Avoid large DOM footprint"

  // Filter IOC dataset
  const filteredIocs = useMemo(() => {
    return iocs.filter((ioc) => {
      const matchSearch =
        searchTerm.trim() === "" ||
        ioc.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ioc.sourceFeed.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = selectedType === "ALL" || ioc.type === selectedType;
      const matchStatus = selectedStatus === "ALL" || ioc.status === selectedStatus;
      const matchSeverity = selectedSeverity === "ALL" || ioc.severity === selectedSeverity;

      return matchSearch && matchType && matchStatus && matchSeverity;
    });
  }, [iocs, searchTerm, selectedType, selectedStatus, selectedSeverity]);

  // Capped rendering logic (essentially windowed virtualization approach via paginated offset)
  const paginatedIocs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredIocs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredIocs, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredIocs.length / itemsPerPage));

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30";
      case "expired":
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-550/20";
      case "revoked":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
      default:
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev.toLowerCase()) {
      case "critical":
        return "text-red-600 dark:text-red-400 font-extrabold";
      case "high":
        return "text-amber-600 dark:text-amber-400 font-bold";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400 font-medium";
      default:
        return "text-blue-600 dark:text-blue-400 font-normal";
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col h-full" id="ioc-intelligence-panel border-box">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3 mb-3 select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Database size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-foreground tracking-wider font-mono">
              IOC Intelligence Center
            </h3>
            <p className="text-[10px] text-muted-foreground">
              Vetted indicators from real-time global security feeds
            </p>
          </div>
        </div>

        {/* Capped dataset indicator */}
        <span className="text-[8px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-mono uppercase font-black w-fit h-fit">
          MEM-DB: {filteredIocs.length} Mapped
        </span>
      </div>

      {/* Advanced Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-3">
        <div className="relative">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search IOC value..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-muted/40 border border-border focus:border-purple-500 rounded-lg pl-8 pr-2.5 py-1 text-[9px] uppercase placeholder:text-muted-foreground outline-hidden font-mono text-foreground"
          />
        </div>

        <div>
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-muted/40 border border-border focus:border-purple-500 rounded-lg px-2 py-1 text-[9px] font-black uppercase cursor-pointer outline-hidden font-mono text-foreground"
          >
            <option value="ALL">TYPE (ALL)</option>
            <option value="IP">IP Address</option>
            <option value="Domain">Domain CNAME</option>
            <option value="URL">Request URL</option>
            <option value="Hash">File SHA256</option>
            <option value="Email">Email Address</option>
          </select>
        </div>

        <div>
          <select
            value={selectedSeverity}
            onChange={(e) => {
              setSelectedSeverity(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-muted/40 border border-border focus:border-purple-500 rounded-lg px-2 py-1 text-[9px] font-black uppercase cursor-pointer outline-hidden font-mono text-foreground"
          >
            <option value="ALL">SEV (ALL)</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-muted/40 border border-border focus:border-purple-500 rounded-lg px-2 py-1 text-[9px] font-black uppercase cursor-pointer outline-hidden font-mono text-foreground"
          >
            <option value="ALL">STATUS (ALL)</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Revoked">Revoked</option>
          </select>
        </div>
      </div>

      {/* Main IOC Table Area (Capped rendering prevents heavy DOM trees) */}
      <div className="flex-1 overflow-x-auto border border-border/40 rounded-lg bg-muted/5">
        <table className="w-full text-left font-mono text-[9px] border-collapse min-w-175">
          <thead>
            <tr className="bg-muted/40 text-muted-foreground uppercase border-b border-border/60">
              <th className="py-2 px-2.5">Indicator Class</th>
              <th className="py-2 px-2.5">Observed Value</th>
              <th className="py-2 px-2.5 text-center">Confidence</th>
              <th className="py-2 px-2.5">Severity</th>
              <th className="py-2 px-2.5">Source Feed</th>
              <th className="py-2 px-2.5">First Seen / Last Seen</th>
              <th className="py-2 px-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedIocs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted-foreground italic text-[10px]">
                  No vetted IOC records match your selected filters.
                </td>
              </tr>
            ) : (
              paginatedIocs.map((ioc) => (
                <tr key={ioc.id} className="border-b border-border/30 hover:bg-muted/20 transition-all">
                  <td className="py-2 px-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                      ioc.type === "IP" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                      ioc.type === "Domain" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" :
                      ioc.type === "URL" ? "bg-pink-500/10 text-pink-600 dark:text-pink-400" :
                      ioc.type === "Hash" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" :
                      "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                    }`}>
                      {ioc.type}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 text-foreground font-semibold max-w-50 truncate uppercase text-[8.5px]" title={ioc.value}>
                    {ioc.value}
                  </td>
                  <td className="py-2 px-2.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                    {ioc.confidence}%
                  </td>
                  <td className="py-2 px-2.5 uppercase font-black text-[8px]">
                    <span className={getSeverityBadge(ioc.severity)}>{ioc.severity}</span>
                  </td>
                  <td className="py-2 px-2.5 text-muted-foreground text-[8px] uppercase font-semibold">
                    {ioc.sourceFeed}
                  </td>
                  <td className="py-2 px-2.5 text-[7.5px] text-slate-500 leading-normal font-sans">
                    <div>F: {ioc.firstSeen}</div>
                    <div>L: {ioc.lastSeen}</div>
                  </td>
                  <td className="py-2 px-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[7.5px] uppercase font-black font-mono ${getStatusBadge(ioc.status)}`}>
                      {ioc.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-3 select-none">
        <span className="text-[8.5px] font-mono text-muted-foreground">
          Showing {filteredIocs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
          {Math.min(currentPage * itemsPerPage, filteredIocs.length)} of {filteredIocs.length} records
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-2 py-1 bg-muted/65 border border-border/80 text-[8.5px] font-black uppercase rounded-md tracking-tight cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted"
          >
            Prev
          </button>
          <span className="px-2.5 py-1 text-[9px] font-mono font-bold align-middle bg-muted/20 border border-border/40 rounded-md">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-2 py-1 bg-muted/65 border border-border/80 text-[8.5px] font-black uppercase rounded-md tracking-tight cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
