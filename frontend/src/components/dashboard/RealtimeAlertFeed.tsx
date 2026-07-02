import React, { useState, useMemo } from "react";
import { Alert, Severity, AlertStatus } from "../../types";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldAlert, 
  ArrowUpDown, 
  Search, 
  MapPin, 
  Cpu, 
  Flame, 
  Clock, 
  Zap,
  Tag,
  Crosshair
} from "lucide-react";

interface RealtimeAlertFeedProps {
  alerts: Alert[];
  onSelectAlert?: (alert: Alert | null) => void;
  selectedAlertId?: string | null;
}

export function RealtimeAlertFeed({ alerts = [], onSelectAlert, selectedAlertId }: RealtimeAlertFeedProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [filterQuery, setFilterQuery] = useState("");

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const q = filterQuery.toLowerCase();
      return (
        a.sourceIp.includes(q) ||
        a.destinationIp.includes(q) ||
        (a.attackType || "").toLowerCase().includes(q) ||
        String(a.severity).toLowerCase().includes(q)
      );
    });
  }, [alerts, filterQuery]);

  const paginatedAlerts = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredAlerts.slice(startIdx, startIdx + pageSize);
  }, [filteredAlerts, currentPage]);

  const totalPages = Math.ceil(filteredAlerts.length / pageSize) || 1;

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col shadow-sm select-none w-full h-full overflow-hidden">
      
      {/* Feed search filter header */}
      <div className="p-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/15 shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.16em] flex items-center gap-1.5">
            <Flame size={12} className="text-red-500 animate-pulse" />
            REALTIME INCIDENT ALERTS CONSOLE STREAM
          </h3>
        </div>

        {/* Realtime filter input */}
        <div className="relative w-full max-w-xs">
          <input 
            type="text" 
            placeholder="Search stream (IP, service, attack)..." 
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-secondary/60 border border-border rounded pl-6 pr-2 py-0.5 text-[9px] text-foreground focus:outline-none focus:border-cyan-500/30 font-mono font-bold"
          />
          <Search className="w-3 h-3 text-muted-foreground absolute left-2 top-1.5" />
        </div>
      </div>

      {/* Main Alerts Stream list */}
      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar bg-card min-h-35 max-h-180">
        <table className="w-full text-left border-collapse table-fixed min-w-275">
          <thead>
            <tr className="border-b border-border bg-secondary/5 h-8 font-mono text-[7.5px] font-black text-muted-foreground uppercase tracking-widest">
              <th className="px-3 py-1 w-[16%]">Timestamp</th>
              <th className="px-3 py-1 w-[8%] text-center">Severity</th>
              <th className="px-3 py-1 w-[12%]">Source Ip</th>
              <th className="px-3 py-1 w-[12%]">Destination</th>
              <th className="px-3 py-1 w-[15%]">Attack Stage</th>
              <th className="px-3 py-1 w-[9%] text-right font-mono">RISK SCORE</th>
              <th className="px-3 py-1 w-[9%] text-right font-mono">CONFIDENCE</th>
              <th className="px-3 py-1 w-[10%]">MITRE ATT&CK</th>
              <th className="px-3 py-1 w-[9%] text-center">CAMPAIGN ID</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {paginatedAlerts.length === 0 ? (
                <tr className="h-44">
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground/60 text-[10px] font-mono leading-relaxed">
                     NO ACTIVE DETECTIONS STREAMING - MONITORING SEC_OBS PIPELINE
                  </td>
                </tr>
              ) : (
                paginatedAlerts.map(alert => {
                  const isSelected = selectedAlertId === alert.id;
                  const mitreName = alert.mitre?.techniqueId || "T1595";
                  const campaignId = alert.attackType.includes("Scan") || alert.attackType.includes("Force") ? "CAMP-201" : "CAMP-202";
                  
                  const formattedTime = (() => {
                    const d = new Date(alert.timestamp);
                    const pad = (num: number) => String(num).padStart(2, "0");
                    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
                  })();

                  return (
                    <tr 
                      key={alert.id}
                      onClick={() => onSelectAlert && onSelectAlert(isSelected ? null : alert)}
                      className={cn(
                        "border-b border-border/30 transition-all cursor-pointer h-9 text-[9.5px]",
                        isSelected ? "bg-cyan-500/5" : "hover:bg-muted/30"
                      )}
                    >
                      {/* Timestamp */}
                      <td className="px-3 py-1 font-mono text-[8.5px] text-muted-foreground">
                        {formattedTime}
                      </td>

                      {/* Severity */}
                      <td className="px-3 py-1 select-none text-center">
                        <span className={cn(
                          "text-[6.8px] font-black px-1.5 py-[0.5px] rounded tracking-wide leading-none uppercase inline-block min-w-10.5",
                          alert.severity === Severity.CRITICAL ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                          alert.severity === Severity.HIGH ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                          "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        )}>
                          {alert.severity}
                        </span>
                      </td>

                      {/* Source */}
                      <td className="px-3 py-1 font-mono font-bold text-foreground truncate pr-1">
                        {alert.sourceIp}
                      </td>

                      {/* Destination */}
                      <td className="px-3 py-1 font-mono text-muted-foreground truncate pr-1">
                        {alert.destinationIp || alert.destIp}
                      </td>

                      {/* Attack Stage Type */}
                      <td className="px-3 py-1 text-foreground font-black truncate pr-1 uppercase">
                        {alert.attackType}
                      </td>

                      {/* Risk Score */}
                      <td className="px-3 py-1 text-right font-mono font-black text-red-400">
                        {alert.riskScore}/100
                      </td>

                      {/* Confidence */}
                      <td className="px-3 py-1 text-right font-mono text-cyan-400 font-extrabold">
                        {((alert.confidenceScore || 0.8) * 100).toFixed(0)}%
                      </td>

                      {/* MITRE */}
                      <td className="px-3 py-1 select-none font-mono">
                        <span className="px-1.5 py-[0.5px] rounded bg-muted border text-muted-foreground text-[8px] font-bold">
                          {mitreName}
                        </span>
                      </td>

                      {/* Campaign ID */}
                      <td className="px-3 py-1 select-none text-center font-mono">
                        <span className="px-1.5 py-[0.5px] rounded border border-purple-500/15 bg-purple-500/10 text-purple-400 text-[8px] font-bold">
                          {campaignId}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="p-2 border-t border-border flex items-center justify-between text-[7px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/15 h-8 shrink-0">
         <span>Page {currentPage} of {totalPages} ({filteredAlerts.length} alarms indexed)</span>
         <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-0.5 rounded border border-border bg-background hover:bg-muted text-[8px] font-black cursor-pointer uppercase disabled:opacity-35 disabled:pointer-events-none"
            >
              Prev
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2 py-0.5 rounded border border-border bg-background hover:bg-muted text-[8px] font-black cursor-pointer uppercase disabled:opacity-35 disabled:pointer-events-none"
            >
              Next
            </button>
         </div>
      </div>
    </div>
  );
}

export default RealtimeAlertFeed;
