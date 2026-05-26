import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  FileCode, 
  ArrowUpDown, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Unlock, 
  Lock, 
  Search, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { NetworkLog, Severity } from "../network/NetworkConfig";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface NetworkStreamTableProps {
  logs: NetworkLog[];
  selectedLogId?: string;
  onSelectLog: (log: NetworkLog) => void;
}

type SortField = "timestamp" | "origBytes" | "respPkts" | "threatScore" | "severity" | "protocol";
type SortOrder = "asc" | "desc";

export const NetworkStreamTable: React.FC<NetworkStreamTableProps> = React.memo(({
  logs,
  selectedLogId,
  onSelectLog
}) => {
  // Sort variables
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Search & Inner Filter variables
  const [innerQuery, setInnerQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [protocolFilter, setProtocolFilter] = useState<string>("ALL");

  // Expanded row details manager
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Safe handler to keep column sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Multi-column sorter mapping
  const sortedAndFilteredLogs = useMemo(() => {
    // 1. First apply filters
    let result = logs.filter(log => {
      const q = innerQuery.trim().toLowerCase();
      const matchQuery = !q || 
        log.srcIp.toLowerCase().includes(q) ||
        log.destIp.toLowerCase().includes(q) ||
        log.id.toLowerCase().includes(q) ||
        log.destPort.toString().includes(q);

      const matchSeverity = severityFilter === "ALL" || log.severity === severityFilter;
      const matchProtocol = protocolFilter === "ALL" || log.protocol === protocolFilter;

      return matchQuery && matchSeverity && matchProtocol;
    });

    // 2. Map severity hierarchy to facilitate sorting
    const severityMap: Record<Severity, number> = {
      INFO: 0,
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 4
    };

    // 3. Now apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      if (sortField === "severity") {
        comparison = severityMap[a.severity] - severityMap[b.severity];
      } else if (sortField === "timestamp") {
        comparison = a.timestamp.localeCompare(b.timestamp);
      } else if (sortField === "protocol") {
        comparison = a.protocol.localeCompare(b.protocol);
      } else {
        comparison = (a[sortField] as number) - (b[sortField] as number);
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    return result;
  }, [logs, sortField, sortOrder, innerQuery, severityFilter, protocolFilter]);

  // Pagination states matching Dashboard's AlertTable
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const lastSelectedIdRef = useRef<string | null | undefined>(selectedLogId);

  // Auto-adjust page to keep the selected log in active view when events update in real-time
  useEffect(() => {
    if (selectedLogId && selectedLogId !== lastSelectedIdRef.current) {
      const idx = sortedAndFilteredLogs.findIndex(l => l.id === selectedLogId);
      if (idx !== -1) {
        const targetPage = Math.floor(idx / pageSize) + 1;
        if (targetPage !== currentPage) {
          setCurrentPage(targetPage);
        }
      }
    }
    lastSelectedIdRef.current = selectedLogId;
  }, [selectedLogId, sortedAndFilteredLogs, currentPage]);

  const totalEvents = sortedAndFilteredLogs.length;
  const totalPages = Math.ceil(totalEvents / pageSize) || 1;

  // Ensure current page is within valid range when list size shrinks/changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const indexOfLastEvent = currentPage * pageSize;
  const indexOfFirstEvent = indexOfLastEvent - pageSize;
  const currentLogs = sortedAndFilteredLogs.slice(indexOfFirstEvent, indexOfLastEvent);

  const formatBytes = (bytes: number): string => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-black tracking-widest rounded bg-red-150 dark:bg-radial dark:from-red-950 dark:to-red-900/40 text-red-700 dark:text-red-400 border border-red-400 dark:border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.25)] animate-pulse uppercase">
            CRITICAL
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold tracking-widest rounded bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-500/30 uppercase">
            HIGH
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold tracking-widest rounded bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-500 border border-amber-300 dark:border-amber-800/20 uppercase">
            MEDIUM
          </span>
        );
      case "LOW":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold tracking-widest rounded bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/20 uppercase">
            LOW
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold tracking-widest rounded bg-cyan-100 dark:bg-cyan-950/25 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/10 uppercase">
            INFO
          </span>
        );
    }
  };

  const toggleExpandRow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedRowId(prev => (prev === id ? null : id));
  };

  return (
    <div 
      className="flex flex-col h-full bg-card border border-border rounded-lg shadow-sm overflow-hidden" 
      id="soc-stream-root"
    >
      {/* STREAM CONTROLS HEADER */}
      <div className="p-4 border-b border-border bg-secondary/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-pulse" />
          <h2 className="text-xs font-black text-foreground dark:text-cyan-400 tracking-widest uppercase font-mono">
            LIVE SIEM EVENT WORKBENCH
          </h2>
        </div>

        {/* Filters and Locks Panel */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Internal Quick Search IP */}
          <div className="relative">
            <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search stream IPs..."
              value={innerQuery}
              onChange={(e) => setInnerQuery(e.target.value)}
              className="pl-7 pr-2 py-1 w-36 bg-background border border-border text-[10px] rounded focus:outline-none focus:border-cyan-500 text-foreground"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-background border border-border text-[10px] rounded py-1 px-1.5 focus:outline-none focus:border-cyan-500 text-foreground font-mono cursor-pointer"
          >
            <option value="ALL">ALL SEVERITIES</option>
            <option value="INFO">INFO ONLY</option>
            <option value="LOW">LOW ONLY</option>
            <option value="MEDIUM">MEDIUM ONLY</option>
            <option value="HIGH">HIGH ONLY</option>
            <option value="CRITICAL">CRITICAL ONLY</option>
          </select>

          {/* Auto Refresh Active UI Label matching Dashboard */}
          <div className="flex items-center gap-2 bg-background border border-border px-2 py-1 h-6.5 rounded">
             <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Auto Refresh</span>
             <div className="w-6 h-3 bg-green-500/10 border border-green-500/30 rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             </div>
             <span className="text-[8px] font-black text-green-500 uppercase">ON</span>
          </div>
        </div>
      </div>

      {/* PAGINATED TABLE GRID */}
      <div className="overflow-x-auto overflow-y-hidden custom-scrollbar min-h-145 max-h-145 transition-all duration-300 bg-card">
        <div className="min-w-full inline-block align-middle">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-900 border-collapse">
            <thead className="bg-secondary/90 dark:bg-slate-900/90 sticky top-0 z-20 backdrop-blur-md text-left text-muted-foreground border-b border-border">
              <tr className="font-mono">
                <th className="px-3 py-2 text-[10px] font-black tracking-widest uppercase cursor-pointer" onClick={() => handleSort("timestamp")}>
                  <span className="flex items-center gap-1">
                    TIME_UTC <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className="px-3 py-2 text-[10px] font-black tracking-widest uppercase cursor-pointer" onClick={() => handleSort("protocol")}>
                  <span className="flex items-center gap-1">
                    PROTO <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className="px-3 py-2 text-[10px] font-black tracking-widest uppercase">SOURCE NODE</th>
                <th className="px-3 py-2 text-[10px] font-black tracking-widest uppercase">DEST NODE</th>
                <th className="px-3 py-2 text-[10px] font-black tracking-widest uppercase text-right cursor-pointer" onClick={() => handleSort("origBytes")}>
                  <span className="flex items-center justify-end gap-1">
                    SIZE <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className="px-3 py-2 text-[10px] font-black tracking-widest uppercase text-right cursor-pointer" onClick={() => handleSort("respPkts")}>
                  <span className="flex items-center justify-end gap-1">
                    PKTS <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className="px-3 py-2 text-[10px] font-black tracking-widest uppercase cursor-pointer" onClick={() => handleSort("severity")}>
                  <span className="flex items-center gap-1 justify-center">
                    SEVERITY <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className="px-3 py-2 text-[10px] font-black tracking-widest uppercase text-center cursor-pointer" onClick={() => handleSort("threatScore")}>
                  <span className="flex items-center justify-center gap-1">
                    THREAT <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            
            <tbody className="font-mono text-xs dark:text-slate-300">
              <AnimatePresence initial={false}>
                {currentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center text-slate-400">
                      No matching syslog packet sequences found in active stream queue.
                    </td>
                  </tr>
                ) : (
                  currentLogs.map(log => {
                    const isSelected = selectedLogId === log.id;
                    const isAnomaly = log.verdict === "ANOMALY";
                    const isRowExpanded = expandedRowId === log.id;

                    return (
                      <React.Fragment key={log.id}>
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => onSelectLog(log)}
                          className={cn(
                            "group border-b border-border transition-colors cursor-pointer text-left h-9",
                            isSelected 
                              ? "bg-cyan-500/5 dark:bg-cyan-950/20 shadow-inner" 
                              : isAnomaly 
                              ? "hover:bg-red-500/5 dark:hover:bg-red-950/15" 
                              : "hover:bg-cyan-500/5 dark:hover:bg-cyan-950/10"
                          )}
                        >
                          {/* TIMESTAMP */}
                          <td className="px-3 py-2 text-muted-foreground text-[11px] whitespace-nowrap font-medium">
                            {log.timestamp}
                          </td>

                          {/* PROTOCOL */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              log.protocol === "TCP"
                                ? "bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-450"
                                : log.protocol === "UDP"
                                ? "bg-indigo-105 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-450"
                                : "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-505"
                            }`}>
                              {log.protocol}
                            </span>
                          </td>

                          {/* IP SOURCE */}
                          <td className="px-3 py-2 whitespace-nowrap text-foreground">
                            <span className="font-semibold">{log.srcIp}</span>
                            <span className="text-muted-foreground font-medium">:{log.srcPort}</span>
                          </td>

                          {/* IP DESTINATION */}
                          <td className="px-3 py-2 whitespace-nowrap text-foreground">
                            <span className="font-semibold">{log.destIp}</span>
                            <span className="text-muted-foreground font-medium">:{log.destPort}</span>
                          </td>

                          {/* BYTES */}
                          <td className="px-3 py-2 text-right text-foreground whitespace-nowrap">
                            {formatBytes(log.origBytes)}
                          </td>

                          {/* PACKETS */}
                          <td className="px-3 py-2 text-right text-muted-foreground whitespace-nowrap">
                            {log.respPkts}
                          </td>

                          {/* SEVERITY STATUS BADGE */}
                          <td className="px-3 py-2 text-center whitespace-nowrap">
                            {getSeverityBadge(log.severity)}
                          </td>

                          {/* THREAT INDEX SCORE */}
                          <td className="px-3 py-2 text-center whitespace-nowrap">
                            <span className={`inline-block font-black text-center ${
                              log.threatScore > 80 
                                ? "text-red-500" 
                                : log.threatScore > 50 
                                ? "text-orange-500" 
                                : "text-slate-500"
                            }`}>
                              {log.threatScore}
                            </span>
                          </td>

                          {/* COLLAPSIBLE ROW BUTTON */}
                          <td className="px-2 py-2">
                            <button
                              onClick={(e) => toggleExpandRow(e, log.id)}
                              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                              title="Expand payload metadata details"
                            >
                              {isRowExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        </motion.tr>

                        {/* CONDITIONAL DETAILS DRAWER EXPANDED ROW */}
                        {isRowExpanded && (
                          <tr className="bg-secondary/40 dark:bg-slate-950/75" style={{ contentVisibility: "auto" }}>
                            <td colSpan={9} className="px-4 py-3 border-b border-border">
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs font-mono">
                                
                                {/* Left telemetry parameters */}
                                <div className="md:col-span-8 space-y-1.5 border-r border-border pr-4">
                                  <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-extrabold uppercase tracking-widest pb-1 border-b border-border">
                                    FLOW HANDSHAKE METADATA
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 leading-relaxed">
                                    <div>
                                      <span className="text-muted-foreground font-medium">FLOW IDENTIFICATION:</span>{" "}
                                      <span className="text-foreground font-semibold">{log.id}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground font-medium">GEO DESTINATION:</span>{" "}
                                      <span className="text-foreground font-semibold">{log.country || "US/INTERNAL"}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground font-medium">STREAM DURATION:</span>{" "}
                                      <span className="text-foreground font-semibold">{(log.duration / 1000).toFixed(2)} seconds</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground font-medium">AI CLASSIFICATION CONFIDENCE:</span>{" "}
                                      <span className="text-cyan-600 dark:text-cyan-400 font-bold">{log.confidence.toFixed(1)}%</span>
                                    </div>
                                  </div>
                                  <div className="mt-2.5 bg-background p-2 border border-border rounded">
                                    <div className="text-[9px] text-muted-foreground font-extrabold tracking-widest">SIEM ANALYST COGNITIVE LOG:</div>
                                    <p className="text-[11px] text-foreground mt-1 leading-relaxed font-sans font-medium">
                                      {log.reason}
                                    </p>
                                  </div>
                                </div>

                                {/* Right raw JSON copy block */}
                                <div className="md:col-span-4 flex flex-col justify-between">
                                  <div>
                                    <div className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest pb-1 border-b border-border">
                                      RAW JSON OBJECT
                                    </div>
                                    <pre className="mt-1.5 p-2 bg-background dark:bg-black/80 rounded border border-border text-[9px] text-indigo-600 dark:text-cyan-455 overflow-x-auto max-h-24 select-all leading-tight">
                                      {JSON.stringify({
                                        id: log.id,
                                        timestamp: log.timestamp,
                                        src_ip: log.srcIp,
                                        dest_ip: log.destIp,
                                        bytes: log.origBytes,
                                        urgency: log.severity,
                                        verdict: log.verdict
                                      }, null, 2)}
                                    </pre>
                                  </div>
                                  <div className="mt-2 flex justify-end">
                                    <button
                                      onClick={() => alert(`Copied metadata object hash id: ${btoa(log.id)}`)}
                                      className="px-2 py-1 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-[9px] font-black uppercase tracking-widest cursor-pointer"
                                    >
                                      Copy Packet Token
                                    </button>
                                  </div>
                                </div>

                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION CONTROLS */}
      <div className="p-3 border-t border-border flex items-center justify-between text-[8px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/20 h-12">
         <span>Showing {totalEvents === 0 ? 0 : indexOfFirstEvent + 1} to {Math.min(indexOfLastEvent, totalEvents)} of {totalEvents.toLocaleString()} events</span>
         <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded border border-border bg-background transition-all md:hover:bg-muted duration-150 text-[10px] font-black",
                currentPage === 1 ? "opacity-40 pointer-events-none" : "text-foreground cursor-pointer"
              )}
              title="PREVIOUS PAGE"
            >
              <ChevronLeft size={12} className="stroke-[2.5]" />
            </button>
            
            {(() => {
              const pages: (number | string)[] = [];
              if (totalPages <= 10) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                if (currentPage <= 6) {
                  for (let i = 1; i <= 8; i++) pages.push(i);
                  pages.push("...", totalPages);
                } else if (currentPage >= totalPages - 5) {
                  pages.push(1, "...");
                  for (let i = totalPages - 7; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1, "...");
                  for (let i = currentPage - 3; i <= currentPage + 3; i++) pages.push(i);
                  pages.push("...", totalPages);
                }
              }
              
              return pages.map((page, idx) => {
                if (page === "...") {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-1 text-[10px] text-muted-foreground/60 font-black">
                      ...
                    </span>
                  );
                }
                const isPageActive = currentPage === page;
                return (
                  <button
                    key={`page-${page}`}
                    onClick={() => setCurrentPage(Number(page))}
                    className={cn(
                      "w-7 h-7 flex items-center justify-center rounded text-[10px] font-black tracking-tighter uppercase transition-all duration-150 border",
                      isPageActive 
                        ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]" 
                        : "bg-background hover:bg-muted border-border text-muted-foreground hover:text-foreground cursor-pointer"
                    )}
                  >
                    {page}
                  </button>
                );
              });
            })()}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded border border-border bg-background transition-all md:hover:bg-muted duration-150 text-[10px] font-black",
                currentPage === totalPages ? "opacity-40 pointer-events-none" : "text-foreground cursor-pointer"
              )}
              title="NEXT PAGE"
            >
              <ChevronRight size={12} className="stroke-[2.5]" />
            </button>
         </div>
      </div>
    </div>
  );
});

NetworkStreamTable.displayName = "NetworkStreamTable";
