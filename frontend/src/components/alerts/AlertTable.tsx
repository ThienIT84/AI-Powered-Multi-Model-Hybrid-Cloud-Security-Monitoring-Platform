import React from "react";
import { 
  ShieldAlert, 
  ShieldX, 
  Eye, 
  Filter, 
  Download,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Alert, Severity, AlertStatus } from "../../types";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface AlertTableProps {
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
  selectedAlertId?: string | null;
}

export function AlertTable({ alerts, onSelectAlert, selectedAlertId }: AlertTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 36;

  // Track the last selected alert ID to only adjust page alignment on a fresh/different alert selection
  const lastSelectedIdRef = React.useRef<string | null | undefined>(selectedAlertId);

  React.useEffect(() => {
    if (selectedAlertId && selectedAlertId !== lastSelectedIdRef.current) {
      const idx = alerts.findIndex(a => a.id === selectedAlertId);
      if (idx !== -1) {
        const targetPage = Math.floor(idx / pageSize) + 1;
        if (targetPage !== currentPage) {
          setCurrentPage(targetPage);
        }
      }
    }
    lastSelectedIdRef.current = selectedAlertId;
  }, [selectedAlertId, alerts, currentPage]);

  const totalEvents = alerts.length;
  const totalPages = Math.ceil(totalEvents / pageSize) || 1;

  // Ensure current page is within valid range when list size shrinks/changes
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const indexOfLastEvent = currentPage * pageSize;
  const indexOfFirstEvent = indexOfLastEvent - pageSize;
  const currentEvents = alerts.slice(indexOfFirstEvent, indexOfLastEvent);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col mb-4 shadow-sm transition-all duration-300">
      <div className="p-3 border-b border-border flex items-center justify-between bg-secondary/50">
        <div className="flex items-center gap-2">
           <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">REAL-TIME AI SECURITY EVENTS</h3>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 bg-background border border-border px-2 py-0.5 rounded">
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Auto Refresh</span>
              <div className="w-6 h-3 bg-green-500/10 border border-green-500/30 rounded-full relative">
                 <div className="absolute right-0.5 top-0.5 w-2 h-2 bg-green-500 rounded-full" />
              </div>
              <span className="text-[8px] font-black text-green-500 uppercase">ON</span>
           </div>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-hidden custom-scrollbar min-h-171 max-h-387 transition-all duration-300 bg-card">
        <table className="w-full text-left border-collapse table-fixed md:table-auto">
          <thead>
            <tr className="border-b border-border h-9">
              <th className="px-5 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest w-[11%]">TIMESTAMP</th>
              <th className="px-5 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center w-[12%]">SEVERITY</th>
              <th className="px-5 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest w-[25%]">SOURCE → DESTINATION</th>
              <th className="px-5 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest w-[18%]">ATTACK TYPE</th>
              <th className="px-5 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest w-[16%]">AI CONFIDENCE SCORE</th>
              <th className="px-5 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest w-[10%]">DETECTED BY</th>
              <th className="px-5 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest w-[8%]">MITRE ATT&CK</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {totalEvents === 0 ? (
                <tr className="h-72">
                  <td colSpan={7} className="px-5 py-10 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 h-full">
                       <ShieldX className="w-10 h-10 text-muted/30" />
                       <div className="space-y-1">
                          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">No Events Found</p>
                          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Try adjusting your search filters</p>
                       </div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentEvents.map((alert, idx) => {
                  const isSelected = selectedAlertId === alert.id;
                  return (
                     <motion.tr 
                       key={alert.id} 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       className={cn(
                         "border-b border-border transition-all group cursor-pointer relative h-9",
                         isSelected 
                           ? "bg-red-500/5 dark:bg-red-500/10 shadow-[inset_4px_0_0_0_#ef4444]" 
                           : "hover:bg-muted transition-all"
                       )}
                       onClick={() => onSelectAlert(alert)}
                     >
                       <td className="px-5 py-2">
                         <span className={cn(
                           "text-[10px] font-mono font-bold whitespace-nowrap",
                           isSelected ? "text-red-500" : "text-muted-foreground"
                         )}>
                           {new Date(alert.timestamp).toLocaleTimeString('en-US', { hour12: true })}
                         </span>
                       </td>
                       <td className="px-5 py-2">
                         <div className="flex justify-center">
                           <SeverityBadge severity={alert.severity} />
                         </div>
                       </td>
                       <td className="px-5 py-2">
                         <div className="flex items-center gap-2">
                            <span className={cn("text-[10px] font-mono font-bold tracking-tight", isSelected ? "text-foreground" : "text-foreground/80")}>{alert.sourceIp}</span>
                            <span className="text-muted-foreground/40 text-[10px]">→</span>
                            <span className="text-[10px] font-mono text-muted-foreground font-bold tracking-tight">{alert.destinationIp}</span>
                         </div>
                       </td>
                       <td className="px-5 py-2">
                         <span className={cn("text-[10px] font-bold tracking-tight", isSelected ? "text-red-500" : "text-foreground")}>{alert.attackType}</span>
                       </td>
                       <td className="px-5 py-2">
                          <div className="flex items-center gap-2 max-w-30">
                             <span className={cn("text-[10px] font-black font-mono w-8", isSelected ? "text-red-500" : "text-foreground")}>{(alert.confidenceScore * 100).toFixed(0)}%</span>
                             <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full", alert.confidenceScore > 0.9 ? "bg-red-500" : "bg-orange-500")} 
                                  style={{ width: `${alert.confidenceScore * 100}%` }} 
                                />
                             </div>
                          </div>
                       </td>
                       <td className="px-5 py-2">
                         <span className="text-[9px] font-bold text-muted-foreground italic">AI Model (NLP-SQLi)</span>
                       </td>
                       <td className="px-5 py-2">
                         <span className={cn(
                           "text-[9px] font-black px-2 py-0.5 rounded tracking-widest leading-none bg-red-500/10 border",
                           isSelected ? "text-red-500 border-red-500/30" : "text-red-500 border-red-500/10"
                         )}>
                           T1190
                         </span>
                       </td>
                     </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      
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
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const settings = {
    [Severity.CRITICAL]: { text: "CRITICAL", bg: "bg-red-500/10", color: "text-red-500", border: "border-red-500/30" },
    [Severity.HIGH]: { text: "HIGH", bg: "bg-orange-500/10", color: "text-orange-500", border: "border-orange-500/30" },
    [Severity.MEDIUM]: { text: "MEDIUM", bg: "bg-yellow-500/10", color: "text-yellow-600 dark:text-yellow-500", border: "border-yellow-500/30" },
    [Severity.LOW]: { text: "LOW", bg: "bg-emerald-500/10", color: "text-emerald-600 dark:text-emerald-500", border: "border-emerald-500/30" },
  };

  const config = settings[severity] || settings[Severity.LOW];

  return (
    <span className={cn(
      "text-[8px] font-black px-3 py-1 rounded border uppercase tracking-widest leading-none block w-fit shadow-sm",
      config.bg, config.color, config.border
    )}>
      {config.text}
    </span>
  );
}

function StatusBadge({ status }: { status: AlertStatus }) {
  const styles: Record<AlertStatus, string> = {
    [AlertStatus.NEW]: "text-blue-500",
    [AlertStatus.BLOCKING]: "text-red-500",
    [AlertStatus.INVESTIGATING]: "text-purple-500 dark:text-purple-400",
    [AlertStatus.MONITORING]: "text-yellow-500",
    [AlertStatus.MITIGATED]: "text-cyan-500",
    [AlertStatus.ESCALATED]: "text-orange-500",
    [AlertStatus.RESOLVED]: "text-emerald-500",
    [AlertStatus.FALSE_POSITIVE]: "text-muted-foreground",
  };

  return (
    <span className={cn("text-[9px] font-black uppercase tracking-widest leading-none", styles[status])}>
      {status.replace('_', ' ')}
    </span>
  );
}
