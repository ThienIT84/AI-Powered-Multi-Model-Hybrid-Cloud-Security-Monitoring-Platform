import React from "react";
import { 
  ShieldX, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter,
  Monitor,
  CheckCircle2
} from "lucide-react";
import { Alert, Severity, AlertStatus } from "../../types";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface AlertTableProps {
  alerts: Alert[];
  onSelectAlert: (alert: Alert | null) => void;
  selectedAlertId?: string | null;
}

export function AlertTable({ alerts, onSelectAlert, selectedAlertId }: AlertTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 26; // Adjusted page size for better vertical layout fitting

  // Table-level precise filters
  const [severityFilter, setSeverityFilter] = React.useState<string>("ALL");
  const [attackFilter, setAttackFilter] = React.useState<string>("ALL");
  const [ipFilter, setIpFilter] = React.useState<string>("");

  // Get distinct attack types for filter list
  const availableAttackTypes = React.useMemo(() => {
    const list = new Set(alerts.map(a => a.attackType));
    return Array.from(list).sort();
  }, [alerts]);

  // Handle local secondary filtering
  const filteredEvents = React.useMemo(() => {
    return alerts.filter(alert => {
      // 1. Severity filter check
      if (severityFilter !== "ALL" && alert.severity !== severityFilter) {
        return false;
      }
      // 2. Attack Type filter check
      if (attackFilter !== "ALL" && alert.attackType !== attackFilter) {
        return false;
      }
      // 3. IP address check (either Source IP or Dest IP)
      if (ipFilter.trim() !== "") {
        const query = ipFilter.toLowerCase().trim();
        const srcIp = (alert.sourceIp || "").toLowerCase();
        const destIp = (alert.destinationIp || alert.destinationIp || "").toLowerCase();
        if (!srcIp.includes(query) && !destIp.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [alerts, severityFilter, attackFilter, ipFilter]);

  // Reset pagination on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [severityFilter, attackFilter, ipFilter]);

  const totalEvents = filteredEvents.length;
  const totalPages = Math.ceil(totalEvents / pageSize) || 1;

  // Align active page inside boundaries
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const indexOfLastEvent = currentPage * pageSize;
  const indexOfFirstEvent = indexOfLastEvent - pageSize;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col mb-4 shadow-sm select-none">
      
      {/* Table Header Section */}
      <div className="p-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/25 shrink-0">
        <div className="flex items-center gap-2">
           <span className="relative flex h-1.5 w-1.5">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
           </span>
           <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">INTELLIGENCE INCIDENT LOGS</h3>
        </div>
        
        {/* Real-time status badge */}
        <div className="flex items-center gap-2 bg-background border border-border px-2.5 py-0.5 rounded shadow-sm text-[8px] font-black">
           <span className="text-muted-foreground uppercase tracking-widest opacity-60">FEED:</span>
           <span className="text-emerald-500 uppercase flex items-center gap-1.5 font-bold animate-pulse">
             <Monitor size={10} className="text-emerald-500" />
             LIVE INTERCEPT
           </span>
        </div>
      </div>

      {/* FILTERS BAR (Severity, Attack Type, IP search) */}
      <div className="p-2 border-b border-border flex flex-wrap items-center gap-3 bg-card font-bold text-[8.5px] shrink-0">
        {/* Severity dropdown selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground uppercase tracking-wider text-[7.5px]">SEVERITY:</span>
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

        {/* Attack Type select dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground uppercase tracking-wider text-[7.5px]">ATTACK:</span>
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

        {/* IP Search bar filter */}
        <div className="flex items-center gap-1.5 flex-1 min-w-30">
          <span className="text-muted-foreground uppercase tracking-wider text-[7.5px] shrink-0">SOURCE:</span>
          <div className="relative w-full max-w-xs">
            <input 
              type="text" 
              placeholder="Source or destination..." 
              value={ipFilter}
              onChange={(e) => setIpFilter(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded pl-6 pr-2 py-0.5 text-[9px] text-foreground focus:outline-none focus:border-cyan-500/30 font-mono"
            />
            <Search className="w-3 h-3 text-muted-foreground/60 absolute left-2 top-1.5" />
          </div>
        </div>
      </div>

      {/* Events Table details with Vertical Scroll and Sticky Headers */}
      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar bg-card max-h-188">
        <table className="w-full text-left border-collapse table-fixed min-w-162.5">
          <thead>
            <tr className="border-b border-border bg-secondary/15 h-8">
              <th className="px-3 py-1.5 text-[8px] font-black text-muted-foreground uppercase tracking-widest w-[12%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border">UTC TIME</th>
              <th className="px-3 py-1.5 text-[8px] font-black text-muted-foreground uppercase tracking-widest text-center w-[12%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border">SEVERITY</th>
              <th className="px-3 py-1.5 text-[8px] font-black text-muted-foreground uppercase tracking-widest w-[28%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border">SOURCE ⟶ IP</th>
              <th className="px-3 py-1.5 text-[8px] font-black text-muted-foreground uppercase tracking-widest w-[20%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border">ATTACK HEURISTIC</th>
              <th className="px-3 py-1.5 text-[8px] font-black text-muted-foreground uppercase tracking-widest w-[16%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border">CONFIDENCE</th>
              {!selectedAlertId && (
                <th className="px-3 py-1.5 text-[8px] font-black text-muted-foreground uppercase tracking-widest w-[12%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border hidden lg:table-cell">DETECTION VIA</th>
              )}
              {!selectedAlertId && (
                <th className="px-3 py-1.5 text-[8px] font-black text-muted-foreground uppercase tracking-widest w-[10%] sticky top-0 bg-secondary/95 dark:bg-card/95 backdrop-blur-sm z-10 border-b border-border">MITRE ID</th>
              )}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {totalEvents === 0 ? (
                <tr className="h-56">
                  <td colSpan={selectedAlertId ? 5 : 7} className="px-4 py-12 text-center">
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
                  const detectedStr = alert.detectedBy ? alert.detectedBy[0] : "AI Engine";

                  return (
                     <tr 
                       key={alert.id} 
                       className={cn(
                         "border-b border-border/40 transition-all cursor-pointer h-7 text-[9.5px]",
                         isSelected 
                           ? "bg-red-500/10 dark:bg-red-500/15 border-l-2 border-l-red-500" 
                           : "hover:bg-muted/70"
                       )}
                       onClick={() => onSelectAlert(isSelected ? null : alert)}
                     >
                       <td className="px-3 py-1">
                          <span className={cn(
                            "font-mono font-bold whitespace-nowrap",
                            isSelected ? "text-red-500" : "text-muted-foreground/80"
                          )}>
                            {new Date(alert.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                          </span>
                       </td>
                       
                       <td className="px-3 py-1">
                          <div className="flex justify-center">
                            <SeverityBadge severity={alert.severity} />
                          </div>
                       </td>
                       
                       <td className="px-3 py-1">
                          <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold tracking-tight">
                             <span className={isSelected ? "text-red-500 font-bold" : "text-foreground"}>{alert.sourceIp}</span>
                             <span className="text-muted-foreground/30">→</span>
                             <span className="text-muted-foreground/70">{alert.destinationIp || alert.destinationIp || "10.0.12.15"}</span>
                          </div>
                       </td>
                       
                       <td className="px-3 py-1">
                          <span className={cn("font-black tracking-tight uppercase text-[9px]", isSelected ? "text-red-500 font-bold" : "text-foreground")}>{alert.attackType}</span>
                       </td>
                       
                       {/* AI Confidence progress */}
                       <td className="px-3 py-1">
                          <div className="flex items-center gap-2 max-w-27.5">
                             <span className={cn("font-bold font-mono w-7", isSelected ? "text-red-500" : "text-foreground")}>{(alert.confidenceScore * 100).toFixed(0)}%</span>
                             <div className="flex-1 h-0.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full rounded-full", alert.confidenceScore > 0.9 ? "bg-red-500" : "bg-orange-500")} 
                                  style={{ width: `${alert.confidenceScore * 100}%` }} 
                                />
                             </div>
                          </div>
                       </td>
                       
                       {!selectedAlertId && (
                         <td className="px-3 py-1 hidden lg:table-cell">
                           <span className="text-[8px] font-bold text-muted-foreground/90 uppercase tracking-wide truncate max-w-22.5 block">{detectedStr}</span>
                         </td>
                       )}
                       
                       {!selectedAlertId && (
                         <td className="px-3 py-1">
                           <span className="text-[8px] font-black px-1 py-0.5 rounded tracking-wider leading-none bg-red-500/10 border border-red-500/20 text-red-500 font-mono">
                             {alert.mitre?.techniqueId || alert.mitreAttack?.id || "T1190"}
                           </span>
                         </td>
                       )}
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
         <span>Page {currentPage} of {totalPages} ({totalEvents.toLocaleString()} Events Buffered)</span>
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

function SeverityBadge({ severity }: { severity: Severity }) {
  const settings = {
    [Severity.CRITICAL]: { text: "CRITICAL", bg: "bg-red-500/10", color: "text-red-500", border: "border-red-500/25" },
    [Severity.HIGH]: { text: "HIGH", bg: "bg-orange-500/10", color: "text-orange-500", border: "border-orange-500/25" },
    [Severity.MEDIUM]: { text: "MEDIUM", bg: "bg-yellow-500/10", color: "text-yellow-600 dark:text-yellow-500", border: "border-yellow-500/25" },
    [Severity.LOW]: { text: "LOW", bg: "bg-blue-500/10", color: "text-blue-500", border: "border-blue-500/25" },
  };

  const config = settings[severity] || settings[Severity.LOW];

  return (
    <span className={cn(
      "text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest leading-none block w-fit shadow-xs font-sans",
      config.bg, config.color, config.border
    )}>
      {config.text}
    </span>
  );
}
