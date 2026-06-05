import React from "react";
import { 
  ShieldX, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Monitor,
  ArrowUpDown,
  Sparkles,
  Info,
  CheckCircle,
  XCircle,
  TrendingUp
} from "lucide-react";
import { Alert, Severity, AlertStatus, getAlertFusionMeta } from "../../types";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface AlertTableProps {
  alerts: Alert[];
  onSelectAlert: (alert: Alert | null) => void;
  selectedAlertId?: string | null;
  onUpdateAlert?: (alertId: string, updates: Partial<Alert>) => void;
}

export function AlertTable({ alerts, onSelectAlert, selectedAlertId, onUpdateAlert }: AlertTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 18; 

  // Table-level filters
  const [severityFilter, setSeverityFilter] = React.useState<string>("ALL");
  const [attackFilter, setAttackFilter] = React.useState<string>("ALL");
  const [ipFilter, setIpFilter] = React.useState<string>("");

  // Sorting state
  const [sortField, setSortField] = React.useState<"timestamp" | "riskScore" | "severity">("timestamp");
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
      } else if (sortField === "riskScore") {
        comparison = (a.riskScore || 0) - (b.riskScore || 0);
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

  const toggleSort = (field: "timestamp" | "riskScore" | "severity") => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const headerSortIcon = (field: "timestamp" | "riskScore" | "severity") => {
    if (sortField !== field) return <ArrowUpDown size={10} className="text-muted-foreground/35 ml-1.5 transition-colors" />;
    return <ArrowUpDown size={10} className="text-cyan-500 ml-1.5" />;
  };

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col shadow-sm select-none w-full h-full overflow-hidden">
      
      {/* Table Header Section */}
      <div className="p-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/25 shrink-0">
        <div className="flex items-center gap-2">
           <span className="relative flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
           </span>
           <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-1.5">
             <Sparkles size={11} className="text-cyan-500 animate-pulse" />
             AI FUSION LAYER DECISION CONSOLE
           </h3>
        </div>
        
        {/* Real-time status badge */}
        <div className="flex items-center gap-2 bg-background border border-border px-2.5 py-0.5 rounded shadow-sm text-[8px] font-black">
           <span className="text-muted-foreground uppercase tracking-widest opacity-60 font-mono">SOC REPORT STATS:</span>
           <span className="text-cyan-500 uppercase flex items-center gap-1.5 font-bold">
             <Monitor size={10} className="text-cyan-500" />
             AI DECISION MULTI-VECTOR COHERENCE
           </span>
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
          <span className="text-muted-foreground uppercase tracking-wider text-[7.5px] font-black">ATTACK:</span>
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
          <span className="text-muted-foreground uppercase tracking-wider text-[7.5px] font-black shrink-0">SOURCE:</span>
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

      {/* Events Table details with Vertical Scroll and Sticky Headers */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar bg-card">
        <table className="w-full text-left border-collapse table-fixed min-w-355">
          <thead>
            <tr className="border-b border-border bg-secondary/15 h-9">
              <th 
                className="px-3 py-1.5 text-[8.5px] font-black text-muted-foreground uppercase tracking-widest w-[8%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border cursor-pointer hover:text-foreground transition-colors"
                onClick={() => toggleSort("timestamp")}
              >
                <div className="flex items-center">
                  Timestamp {headerSortIcon("timestamp")}
                </div>
              </th>
              <th className="px-3 py-1.5 text-[8.5px] font-black text-muted-foreground uppercase tracking-widest text-center w-[5%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border">
                Severity
              </th>
              <th className="px-3 py-1.5 text-[8.5px] font-black text-muted-foreground uppercase tracking-widest w-[11%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border">
                Source → Destination
              </th>
              <th className="px-3 py-1.5 text-[8.5px] font-black text-muted-foreground uppercase tracking-widest w-[8%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border text-center">
                AI1_RESULT
              </th>
              <th className="px-3 py-1.5 text-[8.5px] font-black text-muted-foreground uppercase tracking-widest w-[8%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border/80">
                AI2A_CLASS
              </th>
              <th className="px-3 py-1.5 text-[8.5px] font-black text-muted-foreground uppercase tracking-widest w-[7%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border text-center">
                AI2B_WEB
              </th>
              <th className="px-3 py-1.5 text-[8.5px] font-black text-muted-foreground uppercase tracking-widest w-[11%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border">
                SURICATA_EVIDENCE
              </th>
              <th className="px-3 py-1.5 text-[8.5px] font-black text-muted-foreground uppercase tracking-widest w-[14%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border">
                FUSION_DECISION
              </th>
              <th 
                className="px-3 py-1.5 text-[8.5px] font-black text-muted-foreground uppercase tracking-widest w-[8%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border cursor-pointer hover:text-foreground transition-colors text-right"
                onClick={() => toggleSort("riskScore")}
              >
                <div className="flex items-center justify-end pr-1">
                  RISK_SCORE {headerSortIcon("riskScore")}
                </div>
              </th>
              <th className="px-3 py-1.5 text-[8.5px] font-black text-muted-foreground uppercase tracking-widest w-[6%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border text-center">
                GROUP
              </th>
              <th className="px-3 py-1.5 text-[8.5px] font-black text-muted-foreground uppercase tracking-widest w-[5%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border text-center">
                STATUS
              </th>
              <th className="px-3 py-1.5 text-[8.5px] font-black text-muted-foreground uppercase tracking-widest w-[9%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border text-center">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {totalEvents === 0 ? (
                <tr className="h-48">
                  <td colSpan={12} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 h-full">
                       <ShieldX className="w-8 h-8 text-muted/30" />
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No Events Intercepted</p>
                          <p className="text-[8px] text-muted-foreground/60 uppercase tracking-wider">Modify table-level filters or active legends</p>
                       </div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentEvents.map((alert) => {
                  const isSelected = selectedAlertId === alert.id;
                  const isCritical = alert.severity === Severity.CRITICAL;
                  
                  // Compute the dynamic Fusion fields on-the-fly
                  const meta = getAlertFusionMeta(alert);

                  // Map to mock Incident group
                  const incidentGroup = alert.attackType.includes("Scan") || alert.attackType.includes("Force") ? "INC-2051" : "INC-2049";

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
                       style={{
                         borderLeft: isSelected ? "3px solid var(--color-cyan-500)" : ""
                       }}
                       onClick={() => onSelectAlert(isSelected ? null : alert)}
                     >
                       {/* Column 1: Timestamp */}
                       <td className="px-3 py-1">
                          <div className="flex items-center gap-1.5 leading-none font-mono text-[8.5px] text-muted-foreground/80">
                            {isCritical && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)] shrink-0 animate-pulse" />}
                            <span>{new Date(alert.timestamp).toLocaleTimeString('en-US', { hour12: false })}</span>
                          </div>
                       </td>

                       {/* Column 2: Severity badge */}
                       <td className="px-3 py-1">
                          <div className="flex justify-center select-none">
                            <span className={cn(
                              "text-[7px] font-black px-1.5 py-[0.5px] rounded border uppercase font-mono tracking-widest leading-none block text-center min-w-10.5",
                              alert.severity === Severity.CRITICAL ? "bg-red-500/10 border-red-500/25 text-red-500 font-extrabold" :
                              alert.severity === Severity.HIGH ? "bg-orange-500/10 border-orange-500/25 text-orange-400" :
                              alert.severity === Severity.MEDIUM ? "bg-yellow-500/10 border-yellow-500/25 text-yellow-500" :
                              "bg-blue-500/10 border-blue-500/25 text-cyan-400"
                            )}>
                              {alert.severity}
                            </span>
                          </div>
                       </td>

                       {/* Column 3: Source -> Destination */}
                       <td className="px-3 py-1 font-mono text-[7.8px] text-muted-foreground font-semibold">
                          <div className="flex items-center gap-1 leading-none">
                            <span className="text-foreground font-black">{alert.sourceIp}</span>
                            <span className="text-cyan-500/60 font-black">→</span>
                            <span className="text-foreground/90">{alert.destinationIp}</span>
                          </div>
                       </td>
                       
                       {/* Column 4: AI1_RESULT */}
                       <td className="px-3 py-1 text-center select-none">
                          <div className="flex justify-center">
                            {meta.ai1Result === "ANOMALY" ? (
                              <span className="px-1.5 py-[0.5px] rounded border border-red-500/20 bg-red-500/10 text-red-500 font-mono text-[7px] font-black tracking-widest">
                                {meta.ai1Result}
                              </span>
                            ) : (
                              <span className="px-1.5 py-[0.5px] rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 font-mono text-[7px] font-black tracking-widest">
                                {meta.ai1Result}
                              </span>
                            )}
                          </div>
                       </td>
                       
                       {/* Column 5: AI2A_CLASS */}
                       <td className="px-3 py-1 select-none">
                          <div className="flex items-center gap-1">
                            {meta.ai2aClass === "PortScan" && (
                              <span className="px-1.5 py-[0.5px] rounded bg-orange-500/10 border border-orange-500/25 text-orange-500 font-bold text-[7.5px]">
                                {meta.ai2aClass}
                              </span>
                            )}
                            {meta.ai2aClass === "DoS" && (
                              <span className="px-1.5 py-[0.5px] rounded bg-red-500/10 border border-red-500/25 text-red-500 font-bold text-[7.5px]">
                                {meta.ai2aClass}
                              </span>
                            )}
                            {meta.ai2aClass === "BruteForce" && (
                              <span className="px-1.5 py-[0.5px] rounded bg-red-500/10 border border-red-500/25 text-red-400 font-bold text-[7.5px]">
                                {meta.ai2aClass}
                              </span>
                            )}
                            {meta.ai2aClass === "Normal" && (
                              <span className="px-1.5 py-[0.5px] rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-[7.5px]">
                                {meta.ai2aClass}
                              </span>
                            )}
                          </div>
                       </td>
                       
                       {/* Column 6: AI2B_WEB */}
                       <td className="px-3 py-1 text-center select-none">
                          <div className="flex justify-center">
                            {meta.ai2bWeb === "XSS" && (
                              <span className="px-1.5 py-[0.5px] rounded bg-red-500/10 border border-red-500/25 text-red-400 font-black text-[7.5px]">
                                {meta.ai2bWeb}
                              </span>
                            )}
                            {meta.ai2bWeb === "SQLi" && (
                              <span className="px-1.5 py-[0.5px] rounded bg-red-500/10 border border-red-500/25 text-red-400 font-black text-[7.5px]">
                                {meta.ai2bWeb}
                              </span>
                            )}
                            {meta.ai2bWeb === "NONE" && (
                              <span className="px-1.5 py-[0.5px] rounded bg-blue-500/5 border border-blue-500/10 text-muted-foreground/80 font-mono text-[7px]">
                                {meta.ai2bWeb}
                              </span>
                            )}
                          </div>
                       </td>

                       {/* Column 7: Suricata evidence */}
                       <td className="px-3 py-1">
                          <span className="font-mono text-[7px] font-black px-1.5 py-[0.5px] rounded bg-muted border border-border/80 text-muted-foreground truncate max-w-32.5 block">
                            {meta.suricataEvidence}
                          </span>
                       </td>
                       
                       {/* Column 8: FUSION_DECISION with glow */}
                       <td className="px-3 py-1 font-mono">
                          <div className={cn(
                            "flex items-center gap-1 px-1.5 py-0.5 bg-[#06b6d4]/5 rounded border leading-none max-w-42.5 truncate select-none",
                            isCritical 
                              ? "border-red-500/30 text-red-650 dark:text-red-400 hover:border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.12)] bg-red-500/5 dark:bg-red-950/20" 
                              : "border-cyan-500/20 text-cyan-650 dark:text-cyan-400 hover:border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.1)] bg-cyan-500/5 dark:bg-cyan-950/20"
                          )}>
                             <span className="text-[7.2px] font-black uppercase tracking-wider shrink-0">
                               {isCritical ? "CRIT" : String(alert.severity).toUpperCase()}:
                             </span>
                             <span className="text-[7.5px] font-bold uppercase truncate tracking-tight">{alert.attackType}</span>
                          </div>
                       </td>
                       
                       {/* Column 9: RISK_SCORE */}
                       <td className="px-3 py-1">
                          <div className="flex items-center justify-end gap-1.5 pr-1 select-none">
                             <span className={cn(
                               "font-mono font-bold text-[8.5px] w-9 text-right",
                               alert.riskScore > 75 ? "text-red-500" :
                               alert.riskScore > 40 ? "text-orange-500" : "text-emerald-500"
                             )}>
                               {alert.riskScore}/100
                             </span>
                             <div className="w-10 h-0.8 bg-muted/60 rounded overflow-hidden hidden md:block border border-border/20">
                                <div 
                                  className={cn(
                                    "h-full rounded transition-all duration-300", 
                                    alert.riskScore > 75 ? "bg-red-500" :
                                    alert.riskScore > 40 ? "bg-orange-500" : "bg-emerald-500"
                                  )} 
                                  style={{ width: `${alert.riskScore}%` }} 
                                />
                             </div>
                          </div>
                       </td>

                       {/* Column 10: INCIDENT_GROUP */}
                       <td className="px-3 py-1 text-center select-none font-mono text-[7px] font-bold">
                          <span className="px-1.5 py-[0.5px] rounded bg-muted border text-muted-foreground/80">
                            {incidentGroup}
                          </span>
                       </td>

                       {/* Column 11: STATUS */}
                       <td className="px-3 py-1 text-center select-none">
                          <span className={cn(
                            "text-[7px] font-black px-1.5 py-[0.5px] rounded border uppercase tracking-wider font-mono leading-none block text-center",
                            alert.status === AlertStatus.NEW ? "bg-red-500/10 border-red-500/20 text-red-500" :
                            alert.status === AlertStatus.INVESTIGATING ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" :
                            alert.status === AlertStatus.RESOLVED ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 font-bold" :
                            "bg-blue-500/10 border-blue-500/20 text-cyan-400"
                          )}>
                            {alert.status}
                          </span>
                       </td>

                       {/* SECTION 3 & 4: Quick Action column */}
                       <td className="px-3 py-1 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                             <button
                               onClick={() => onSelectAlert(alert)}
                               title="Investigate Detail"
                               className="px-1 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500 text-cyan-500 hover:text-white border border-cyan-500/20 text-[7px] font-black uppercase transition-all"
                             >
                               <Info size={10} className="inline mr-0.5" />
                               Invest
                             </button>
                             <button
                               onClick={() => {
                                 if (onUpdateAlert) {
                                   onUpdateAlert(alert.id, { status: AlertStatus.FALSE_POSITIVE });
                                 }
                               }}
                               className="px-1 py-0.5 rounded bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/20 text-[7px] font-black uppercase transition-all"
                             >
                               FP
                             </button>
                             <button
                               onClick={() => {
                                 if (onUpdateAlert) {
                                   onUpdateAlert(alert.id, { status: AlertStatus.RESOLVED });
                                 }
                               }}
                               className="px-1 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 text-[7px] font-black uppercase transition-all"
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
         <span>Page {currentPage} of {totalPages} ({totalEvents.toLocaleString()} Fusion Traces Loaded)</span>
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
