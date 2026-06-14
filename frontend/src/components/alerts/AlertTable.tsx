import React from "react";
import { 
  ShieldX, 
  ChevronLeft, 
  ChevronRight,
  Search,
  ArrowUpDown,
  Sparkles,
  Info
} from "lucide-react";
import { Alert, Severity, AlertStatus } from "../../types";
import { cn } from "../../lib/utils";
import { AnimatePresence } from "motion/react";

interface AlertTableProps {
  alerts: Alert[];
  onSelectAlert: (alert: Alert | null) => void;
  selectedAlertId?: string | null;
  onUpdateAlert?: (alertId: string, updates: Partial<Alert>) => void;
}

export function AlertTable({ alerts, onSelectAlert, selectedAlertId, onUpdateAlert }: AlertTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 15; 

  // Table-level filters
  const [severityFilter, setSeverityFilter] = React.useState<string>("ALL");
  const [attackFilter, setAttackFilter] = React.useState<string>("ALL");
  const [ipFilter, setIpFilter] = React.useState<string>("");

  // Sorting state
  const [sortField, setSortField] = React.useState<"timestamp" | "confidence" | "severity">("timestamp");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  // Get distinct attack types for filter list
  const availableAttackTypes = React.useMemo(() => {
    const list = new Set(alerts.map(a => a.attackType));
    return Array.from(list).sort();
  }, [alerts]);

  // Handle local secondary filtering
  const filteredEvents = React.useMemo(() => {
    return alerts.filter(alert => {
      if (severityFilter !== "ALL" && alert.severity !== severityFilter) {
        return false;
      }
      if (attackFilter !== "ALL" && alert.attackType !== attackFilter) {
        return false;
      }
      if (ipFilter.trim() !== "") {
        const query = ipFilter.toLowerCase().trim();
        const srcIp = (alert.sourceIp || "").toLowerCase();
        const destIp = (alert.destinationIp || alert.destIp || "").toLowerCase();
        if (!srcIp.includes(query) && !destIp.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [alerts, severityFilter, attackFilter, ipFilter]);

  // Order of severity values for sorting scale
  const severityValue = (sev: Severity) => {
    switch (sev) {
      case Severity.CRITICAL: return 4;
      case Severity.HIGH: return 3;
      case Severity.MEDIUM: return 2;
      case Severity.LOW: return 1;
      default: return 0;
    }
  };

  // Sort filtered events
  const sortedEvents = React.useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      let comparison = 0;
      if (sortField === "timestamp") {
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortField === "confidence") {
        comparison = (a.confidenceScore || 0) - (b.confidenceScore || 0);
      } else if (sortField === "severity") {
        comparison = severityValue(a.severity) - severityValue(b.severity);
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });
  }, [filteredEvents, sortField, sortOrder]);

  // Reset pagination on filter or sort change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [severityFilter, attackFilter, ipFilter, sortField, sortOrder]);

  const totalEvents = sortedEvents.length;
  const totalPages = Math.ceil(totalEvents / pageSize) || 1;

  // Align active page inside boundaries
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const indexOfLastEvent = currentPage * pageSize;
  const indexOfFirstEvent = indexOfLastEvent - pageSize;
  const currentEvents = sortedEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const toggleSort = (field: "timestamp" | "confidence" | "severity") => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const headerSortIcon = (field: "timestamp" | "confidence" | "severity") => {
    if (sortField !== field) return <ArrowUpDown size={10} className="text-muted-foreground/35 ml-1.5 transition-colors" />;
    return <ArrowUpDown size={10} className="text-cyan-500 ml-1.5" />;
  };

  const mapStatusLabel = (status: string) => {
    const s = String(status).toLowerCase();
    if (s === "new" || s === "open") return "Open";
    if (s === "investigating") return "Investigating";
    if (s === "resolved" || s === "mitigated") return "Resolved";
    if (s === "blocking" || s === "blocked" || s === "false_positive") return "Blocked";
    return "Open";
  };

  const getStatusColorClass = (status: string) => {
    const s = mapStatusLabel(status);
    if (s === "Open") return "bg-red-500/10 border-red-500/20 text-red-500";
    if (s === "Investigating") return "bg-yellow-500/10 border-yellow-500/20 text-yellow-500";
    if (s === "Resolved") return "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 font-bold";
    return "bg-blue-500/10 border-blue-500/20 text-cyan-400";
  };

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col shadow-sm select-none w-full h-full overflow-hidden">
      
      {/* Table Header Section */}
      <div className="p-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/25 shrink-0 animate-fade-in">
        <div className="flex items-center gap-2">
           <span className="relative flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
           </span>
           <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-1.5">
             <Sparkles size={11} className="text-cyan-500" />
             REAL-TIME FUSION DECISION OUTPUT STREAM (SOC QUEUE)
           </h3>
        </div>
      </div>

      {/* FILTERS BAR */}
      <div className="p-2 border-b border-border flex flex-wrap items-center gap-3 bg-card font-bold text-[8.5px] shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground uppercase tracking-wider text-[7.5px] font-black">SEVERITY:</span>
          <select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-secondary/60 border border-border hover:bg-secondary rounded px-2.5 py-1 text-[9px] font-black uppercase text-foreground focus:outline-none focus:border-cyan-500/30"
          >
            <option value="ALL">ALL SEVERITIES</option>
            <option value="Critical">CRITICAL</option>
            <option value="High">HIGH</option>
            <option value="Medium">MEDIUM</option>
            <option value="Low">LOW</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground uppercase tracking-wider text-[7.5px] font-black">ATTACK TYPE:</span>
          <select 
            value={attackFilter} 
            onChange={(e) => setAttackFilter(e.target.value)}
            className="bg-secondary/60 border border-border hover:bg-secondary rounded px-2.5 py-1 text-[9px] font-black uppercase text-foreground focus:outline-none focus:border-cyan-500/30 font-mono"
          >
            <option value="ALL">ALL INCIDENTS</option>
            {availableAttackTypes.map(typ => (
              <option key={typ} value={typ}>{typ.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 flex-1 min-w-30">
          <span className="text-muted-foreground uppercase tracking-wider text-[7.5px] font-black shrink-0">IP ADDRESS:</span>
          <div className="relative w-full max-w-xs">
            <input 
              type="text" 
              placeholder="Source or destination host..." 
              value={ipFilter}
              onChange={(e) => setIpFilter(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded pl-6 pr-2 py-0.5 text-[9px] text-foreground focus:outline-none focus:border-cyan-500/30 font-mono"
            />
            <Search className="w-3 h-3 text-muted-foreground/60 absolute left-2 top-1.5" />
          </div>
        </div>
      </div>

      {/* Events Table details */}
      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar bg-card min-h-55 max-h-145">
        <table className="w-full text-left border-collapse table-fixed min-w-275">
          <thead>
            <tr className="border-b border-border bg-secondary/15 h-9">
              <th 
                className="px-3 py-1.5 text-[8.5px] font-black text-muted-foreground uppercase tracking-widest w-[11%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border cursor-pointer hover:text-foreground transition-colors"
                onClick={() => toggleSort("timestamp")}
              >
                <div className="flex items-center">
                  Timestamp {headerSortIcon("timestamp")}
                </div>
              </th>
              <th className="px-3 py-1.5 text-[8.5px] font-black text-muted-foreground uppercase tracking-widest text-center w-[8%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border">
                Severity
              </th>
              <th className="px-3 py-1.5 text-[8.5px] font-black text-muted-foreground uppercase tracking-widest w-[18%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border">
                Source IP → Destination IP
              </th>
              <th className="px-3 py-1.5 text-[8.5px] font-black text-muted-foreground uppercase tracking-widest w-[16%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border">
                Attack Type (Fusion Label)
              </th>
              <th 
                className="px-3 py-1.5 text-[8.5px] font-black text-muted-foreground uppercase tracking-widest w-[9%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border cursor-pointer hover:text-foreground transition-colors text-right"
                onClick={() => toggleSort("confidence")}
              >
                <div className="flex items-center justify-end pr-1">
                  Confidence {headerSortIcon("confidence")}
                </div>
              </th>
              <th className="px-3 py-1.5 text-[8.5px] font-black text-muted-foreground uppercase tracking-widest w-[12%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border text-center">
                MITRE ATT&CK ID
              </th>
              <th className="px-3 py-1.5 text-[8.5px] font-black text-muted-foreground uppercase tracking-widest w-[12%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border">
                Suricata Signature
              </th>
              <th className="px-3 py-1.5 text-[8.5px] font-black text-muted-foreground uppercase tracking-widest w-[8%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border text-center">
                Status
              </th>
              <th className="px-3 py-1.5 text-[8.5px] font-black text-muted-foreground uppercase tracking-widest w-[12%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {totalEvents === 0 ? (
                <tr className="h-48">
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 h-full">
                       <ShieldX className="w-8 h-8 text-muted/30" />
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No Events Intercepted</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentEvents.map((alert) => {
                  const isSelected = selectedAlertId === alert.id;
                  const isCritical = alert.severity === Severity.CRITICAL;
                  const isAnomaly = alert.riskScore > 35;
                  
                  // Compute dynamic Suricata Signature fallbacks
                  let suricataSig = alert.suricataData?.signatureId || "";
                  if (!suricataSig && isAnomaly) {
                    const baseSid = 2000000 + (alert.id.match(/\d+/) ? parseInt(alert.id.match(/\d+/)![0]) : 110);
                    suricataSig = `SID: ${baseSid}`;
                  }

                  return (
                     <tr 
                       key={alert.id} 
                       className={cn(
                         "border-b border-border/40 transition-all cursor-pointer h-9 text-[9.5px]",
                         isSelected 
                           ? "bg-cyan-500/5 dark:bg-cyan-500/[0.07] border-l-2 border-l-cyan-500" 
                           : "hover:bg-muted/40",
                         isCritical && "bg-red-500/2"
                       )}
                       onClick={() => onSelectAlert(isSelected ? null : alert)}
                     >
                       {/* Column 1: Timestamp */}
                       <td className="px-3 py-1">
                          <span className="font-mono text-[8.5px] text-muted-foreground/80">
                            {new Date(alert.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                          </span>
                       </td>

                       {/* Column 2: Severity */}
                       <td className="px-3 py-1">
                          <div className="flex justify-center select-none">
                            <span className={cn(
                              "text-[7px] font-black px-1.5 py-[0.5px] rounded border uppercase font-mono tracking-widest leading-none block text-center min-w-12.5",
                              alert.severity === Severity.CRITICAL ? "bg-red-500/10 border-red-500/25 text-red-500 font-extrabold" :
                              alert.severity === Severity.HIGH ? "bg-orange-500/10 border-orange-500/25 text-orange-400" :
                              alert.severity === Severity.MEDIUM ? "bg-yellow-500/10 border-yellow-500/25 text-yellow-500" :
                              "bg-blue-500/10 border-blue-500/25 text-cyan-400"
                            )}>
                              {alert.severity}
                            </span>
                          </div>
                       </td>

                       {/* Column 3: Source IP → Destination IP */}
                       <td className="px-3 py-1 font-mono text-[8px] text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <span className="text-foreground font-extrabold">{alert.sourceIp}</span>
                            <span className="text-cyan-500/60 font-bold">→</span>
                            <span className="text-foreground/90">{alert.destinationIp || "10.0.12.15"}</span>
                          </div>
                       </td>
                       
                       {/* Column 4: Attack Type */}
                       <td className="px-3 py-1 font-bold text-foreground">
                          {alert.attackType}
                       </td>
                       
                       {/* Column 5: Confidence score */}
                       <td className="px-3 py-1 text-right font-mono font-black text-cyan-500">
                          {Math.round(alert.confidenceScore * 100)}%
                       </td>

                       {/* Column 6: MITRE ATT&CK ID */}
                       <td className="px-3 py-1 text-center font-mono font-semibold text-foreground/80">
                          {alert.mitre?.techniqueId || "T1046"}
                       </td>

                       {/* Column 7: Suricata Signature */}
                       <td className="px-3 py-1 font-mono text-[7.5px] text-muted-foreground truncate">
                          {suricataSig || "NO MATCH"}
                       </td>

                       {/* Column 8: Status */}
                       <td className="px-3 py-1 text-center font-mono leading-none">
                          <span className={cn(
                            "text-[7px] font-black px-1.5 py-[0.5px] rounded border uppercase tracking-wider block text-center",
                            getStatusColorClass(alert.status)
                          )}>
                            {mapStatusLabel(alert.status)}
                          </span>
                       </td>

                       {/* Column 9: Quick Actions */}
                       <td className="px-3 py-1 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                             <button
                               onClick={() => onSelectAlert(alert)}
                               className="px-1.5 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500 text-cyan-500 hover:text-white border border-cyan-500/20 text-[7px] font-black uppercase transition-all"
                             >
                               <Info size={10} className="inline mr-0.5" />
                               Invest
                             </button>
                             <button
                               onClick={() => {
                                 if (onUpdateAlert) {
                                   onUpdateAlert(alert.id, { status: AlertStatus.RESOLVED });
                                 }
                               }}
                               className="px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 text-[7px] font-black uppercase transition-all"
                             >
                               Resolve
                             </button>
                          </div>
                       </td>
                     </tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      
      {/* Table Pagination */}
      <div className="p-2 border-t border-border flex items-center justify-between text-[7.5px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/15 h-9 shrink-0">
         <span>Page {currentPage} of {totalPages} ({totalEvents.toLocaleString()} Fusion Alerts In Queue)</span>
         <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={cn(
                "w-5 h-5 flex items-center justify-center rounded border border-border bg-background transition-all md:hover:bg-muted text-[9px] font-black",
                currentPage === 1 ? "opacity-35 pointer-events-none" : "text-foreground cursor-pointer"
              )}
            >
              <ChevronLeft size={10} className="stroke-[2.5]" />
            </button>
            <button
              disabled
              className="px-2 h-5 flex items-center justify-center rounded text-[8.5px] font-black border uppercase bg-secondary/40 text-foreground border-border"
            >
              {currentPage} / {totalPages}
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={cn(
                "w-5 h-5 flex items-center justify-center rounded border border-border bg-background transition-all md:hover:bg-muted text-[9px] font-black",
                currentPage === totalPages ? "opacity-35 pointer-events-none" : "text-foreground cursor-pointer"
              )}
            >
              <ChevronRight size={10} className="stroke-[2.5]" />
            </button>
         </div>
      </div>
    </div>
  );
}

export default AlertTable;
