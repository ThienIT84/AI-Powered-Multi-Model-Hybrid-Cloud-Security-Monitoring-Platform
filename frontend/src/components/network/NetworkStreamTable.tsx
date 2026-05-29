import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  FileCode, 
  ArrowUpDown, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { NetworkLog, Severity } from "../network/NetworkConfig";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface NetworkStreamTableProps {
  logs: NetworkLog[];
  selectedLogId?: string;
  onSelectLog: (log: NetworkLog) => void;
  isRunning: boolean;
}

type SortField = "timestamp" | "origBytes" | "respPkts" | "threatScore" | "severity" | "protocol";
type SortOrder = "asc" | "desc";

export const NetworkStreamTable: React.FC<NetworkStreamTableProps> = React.memo(({
  logs,
  selectedLogId,
  onSelectLog,
  isRunning
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
  const pageSize = 30; // Increased to show about 28-35 rows in high density workspace
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

  const getProtocolBadge = (protocol: string) => {
    switch (protocol) {
      case "TCP":
        return <span className="px-1.5 py-0.5 rounded text-[8.5px] font-black bg-blue-500/10 text-blue-500 border border-blue-500/15">TCP</span>;
      case "UDP":
        return <span className="px-1.5 py-0.5 rounded text-[8.5px] font-black bg-purple-500/10 text-purple-500 border border-purple-500/15">UDP</span>;
      case "ICMP":
        return <span className="px-1.5 py-0.5 rounded text-[8.5px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/15">ICMP</span>;
      case "DNS":
        return <span className="px-1.5 py-0.5 rounded text-[8.5px] font-black bg-pink-500/10 text-pink-500 border border-pink-500/15">DNS</span>;
      case "TLS":
        return <span className="px-1.5 py-0.5 rounded text-[8.5px] font-black bg-teal-500/10 text-teal-500 border border-teal-500/15">TLS</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[8.5px] font-black bg-neutral-500/10 text-neutral-550 border border-neutral-500/15">{protocol}</span>;
    }
  };

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 text-[8.5px] font-black tracking-wider rounded bg-red-950/40 text-red-400 border border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.2)] uppercase">
            ● CRITICAL
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 text-[8.5px] font-black tracking-wider rounded bg-orange-950/30 text-orange-400 border border-orange-500/20 uppercase">
            ● HIGH
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 text-[8.5px] font-black tracking-wider rounded bg-amber-950/20 text-amber-400 border border-amber-500/15 uppercase">
            ● MEDIUM
          </span>
        );
      case "LOW":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 text-[8.5px] font-black tracking-wider rounded bg-emerald-950/15 text-emerald-400 border border-emerald-500/15 uppercase">
            ● LOW
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 text-[8.5px] font-black tracking-wider rounded bg-blue-950/15 text-blue-400 border border-blue-500/15 uppercase">
            ● INFO
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
      className="flex flex-col h-full bg-card border border-border rounded-lg shadow-xs overflow-hidden" 
      id="soc-stream-root"
    >
      {/* STREAM CONTROLS HEADER */}
      <div className="p-3 border-b border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-3.5 h-3.5 text-emerald-500" />
          <h2 className="text-[10px] font-black text-foreground dark:text-emerald-400 tracking-widest uppercase font-mono">
            LIVE SIEM EVENT WORKBENCH
          </h2>
        </div>

        {/* Filters, locks and Live status badges */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status Indicator inside header bar as demanded */}
          <div className="flex items-center gap-1.5 pr-2 mr-2 border-r border-border">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              isRunning ? "bg-emerald-505 animate-pulse" : "bg-red-500"
            )} />
            <span className={cn(
              "text-[8px] font-black tracking-widest uppercase font-mono",
              isRunning ? "text-emerald-505" : "text-red-500"
            )}>
              {isRunning ? "LIVE STREAM ACTIVE" : "DISCONNECTED"}
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground/50" />
            <input
              type="text"
              placeholder="Filter IPs..."
              value={innerQuery}
              onChange={(e) => setInnerQuery(e.target.value)}
              className="pl-7 pr-2 py-1 w-28 bg-background border border-border text-[9px] rounded focus:outline-none focus:border-cyan-500 text-foreground"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-background border border-border text-[9px] rounded py-1 px-1.5 focus:outline-none focus:border-cyan-500 text-foreground font-mono cursor-pointer"
          >
            <option value="ALL">ALL SEVS</option>
            <option value="INFO">INFO</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
      </div>

      {/* PAGINATED TABLE GRID (Increased max container boundaries to show many rows concurrently) */}
      <div className="overflow-x-auto custom-scrollbar overflow-y-auto max-h-145 bg-card flex-1">
        <table className="min-w-full divide-y divide-border border-collapse">
          <thead className="bg-muted/95 dark:bg-black/40 sticky top-0 z-25 backdrop-blur-md text-left text-muted-foreground border-b border-border">
            <tr className="font-mono text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              <th className="px-3 py-1.5 cursor-pointer" onClick={() => handleSort("timestamp")}>
                <span className="flex items-center gap-0.5">
                  Time_UTC <ArrowUpDown className="w-2.5 h-2.5 text-slate-500" />
                </span>
              </th>
              <th className="px-3 py-1.5 cursor-pointer" onClick={() => handleSort("protocol")}>
                <span className="flex items-center gap-0.5">
                  Proto <ArrowUpDown className="w-2.5 h-2.5 text-slate-500" />
                </span>
              </th>
              <th className="px-3 py-1.5">Source Node</th>
              <th className="px-3 py-1.5">Dist Node</th>
              <th className="px-3 py-1.5 text-right cursor-pointer" onClick={() => handleSort("origBytes")}>
                <span className="flex items-center justify-end gap-0.5">
                  Size <ArrowUpDown className="w-2.5 h-2.5 text-slate-500" />
                </span>
              </th>
              <th className="px-3 py-1.5 text-right cursor-pointer" onClick={() => handleSort("respPkts")}>
                <span className="flex items-center justify-end gap-0.5">
                  Pkts <ArrowUpDown className="w-2.5 h-2.5 text-slate-500" />
                </span>
              </th>
              <th className="px-3 py-1.5 cursor-pointer" onClick={() => handleSort("severity")}>
                <span className="flex items-center gap-0.5 justify-center">
                  Severity <ArrowUpDown className="w-2.5 h-2.5 text-slate-500" />
                </span>
              </th>
              <th className="px-3 py-1.5 text-center cursor-pointer" onClick={() => handleSort("threatScore")}>
                <span className="flex items-center justify-center gap-0.5">
                  Threat <ArrowUpDown className="w-2.5 h-2.5 text-slate-500" />
                </span>
              </th>
              <th className="w-8 py-1.5"></th>
            </tr>
          </thead>
          
          <tbody className="font-mono text-[10px] divide-y divide-border/40">
            <AnimatePresence initial={false}>
              {currentLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500 italic">
                    No matching SIEM network stream packets currently generated in active memory queue.
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
                        initial={{ opacity: 0, y: -2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => onSelectLog(log)}
                        className={cn(
                          "group transition-all cursor-pointer h-7 text-left border-b border-border/10",
                          isSelected 
                            ? "bg-[#10b981]/5 border-l-2 border-l-emerald-500" 
                            : isAnomaly 
                            ? "hover:bg-red-500/3 bg-red-500/1" 
                            : "hover:bg-muted/40"
                        )}
                      >
                        {/* TIMESTAMP */}
                        <td className="px-3 py-1 text-muted-foreground whitespace-nowrap">
                          {log.timestamp}
                        </td>

                        {/* PROTOCOL */}
                        <td className="px-3 py-1 whitespace-nowrap">
                          {getProtocolBadge(log.protocol)}
                        </td>

                        {/* SOURCE IP */}
                        <td className="px-3 py-1 font-bold whitespace-nowrap text-foreground/90">
                          {log.srcIp}<span className="text-muted-foreground/60 font-semibold font-mono">:{log.srcPort}</span>
                        </td>

                        {/* DEST PORT */}
                        <td className="px-3 py-1 font-bold whitespace-nowrap text-foreground/90">
                          {log.destIp}<span className="text-muted-foreground/60 font-semibold font-mono">:{log.destPort}</span>
                        </td>

                        {/* SIZE */}
                        <td className="px-3 py-1 text-right text-foreground font-semibold whitespace-nowrap">
                          {formatBytes(log.origBytes)}
                        </td>

                        {/* RESP PACKETS */}
                        <td className="px-3 py-1 text-right text-muted-foreground/85 whitespace-nowrap">
                          {log.respPkts}
                        </td>

                        {/* SEVERITY BADGES */}
                        <td className="px-3 py-1 text-center whitespace-nowrap">
                          {getSeverityBadge(log.severity)}
                        </td>

                        {/* THREAT SCORE WITH LIVE PROGRESS FILL */}
                        <td className="px-3 py-1 text-center whitespace-nowrap">
                          <div className="flex items-center gap-2 justify-center max-w-20 mx-auto">
                            <span className={cn(
                              "font-black text-[9.5px]",
                              log.threatScore > 80 
                                ? "text-red-500 animate-pulse font-extrabold" 
                                : log.threatScore > 50 
                                ? "text-orange-500" 
                                : "text-muted-foreground"
                            )}>
                              {log.threatScore}
                            </span>
                            {/* Threat rating score fill bar */}
                            <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden border border-border/10 hidden sm:block">
                              <div 
                                className={cn(
                                  "h-full rounded-full",
                                  log.threatScore > 80 
                                    ? "bg-red-500" 
                                    : log.threatScore > 50 
                                    ? "bg-orange-500" 
                                    : "bg-emerald-500"
                                )}
                                style={{ width: `${log.threatScore}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* CHEVRON COLLAPSIBLE BUTTON */}
                        <td className="px-2 py-1 text-center">
                          <button
                            onClick={(e) => toggleExpandRow(e, log.id)}
                            className="p-0.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Metadata Details"
                          >
                            {isRowExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                          </button>
                        </td>
                      </motion.tr>

                      {/* CONDITIONAL COMPACT GRID DRAWER */}
                      {isRowExpanded && (
                        <tr className="bg-muted/30 border-b border-border/30">
                          <td colSpan={9} className="px-4 py-2 text-[10px] font-mono leading-relaxed">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                              <div className="md:col-span-8 space-y-1 pr-4 border-r border-border/20">
                                <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest border-b border-border/20 pb-0.5 flex items-center gap-1">
                                  <Sparkles size={10} /> HANDSHAKE META FORENSICS
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-muted-foreground">
                                  <div>
                                    Flow ID: <strong className="text-foreground">{log.id}</strong>
                                  </div>
                                  <div>
                                    Node Country: <strong className="text-foreground">{log.country || "INTERNAL"}</strong>
                                  </div>
                                  <div>
                                    Trace Duration: <strong className="text-foreground">{(log.duration / 1000).toFixed(3)}s</strong>
                                  </div>
                                  <div>
                                    AI Confidence Match: <strong className="text-emerald-450">{log.confidence.toFixed(1)}%</strong>
                                  </div>
                                </div>
                                <div className="mt-1.5 bg-background border border-border/40 p-1.5 rounded text-[10px] font-medium font-sans">
                                  <span className="text-[8px] font-black font-mono text-muted-foreground uppercase tracking-widest block">SIEM Verdict reason:</span>
                                  <p className="text-foreground/90 mt-0.5 leading-normal">{log.reason}</p>
                                </div>
                              </div>

                              <div className="md:col-span-4 flex flex-col justify-between">
                                <div>
                                  <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/20 pb-0.5">
                                    SIEM EXPORT BUFFER
                                  </div>
                                  <pre className="mt-1 p-1 bg-black/40 text-[#10b981] font-mono text-[8.5px] rounded overflow-x-auto max-h-20">
                                    {JSON.stringify({
                                      id: log.id,
                                      src: `${log.srcIp}:${log.srcPort}`,
                                      dst: `${log.destIp}:${log.destPort}`,
                                      protocol: log.protocol,
                                      bytes: log.origBytes,
                                      score: log.threatScore
                                    }, null, 2)}
                                  </pre>
                                </div>
                                <div className="mt-1 flex justify-end">
                                  <button
                                    onClick={() => alert(`Raw SIEM payload reference ID copied.`)}
                                    className="px-2 py-0.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-[8px] font-extrabold uppercase rounded border border-border"
                                  >
                                    Copy Reference Token
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

      {/* FOOTER BAR WITH PAGINATION */}
      <div className="p-2 border-t border-border flex items-center justify-between text-[8px] font-black text-muted-foreground uppercase tracking-widest bg-muted/10 h-10 shrink-0">
        <span>Showing {totalEvents === 0 ? 0 : indexOfFirstEvent + 1} - {Math.min(indexOfLastEvent, totalEvents)} of {totalEvents.toLocaleString()} Flows</span>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={cn(
              "w-6 h-6 flex items-center justify-center rounded border border-border/80 bg-background transition-colors hover:bg-muted",
              currentPage === 1 ? "opacity-35 pointer-events-none" : "text-foreground cursor-pointer"
            )}
          >
            <ChevronLeft size={10} className="stroke-3" />
          </button>
          
          <span className="px-2 text-muted-foreground">PAGE {currentPage} OF {totalPages}</span>

          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={cn(
              "w-6 h-6 flex items-center justify-center rounded border border-border/80 bg-background transition-colors hover:bg-muted",
              currentPage === totalPages ? "opacity-35 pointer-events-none" : "text-foreground cursor-pointer"
            )}
          >
            <ChevronRight size={10} className="stroke-3" />
          </button>
        </div>
      </div>
    </div>
  );
});

NetworkStreamTable.displayName = "NetworkStreamTable";
