import React from "react";
import { ShieldX } from "lucide-react";
import { Alert, Severity, AlertStatus } from "../types";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface AlertTableProps {
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
  selectedAlertId?: string | null;
}

export function AlertTable({ alerts, onSelectAlert, selectedAlertId }: AlertTableProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col mb-4 shadow-sm transition-all duration-300">
      <div className="p-3 border-b border-border flex items-center justify-between bg-secondary/50">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">REAL-TIME AI SECURITY EVENTS</h3>
        <div className="flex items-center gap-2 bg-background border border-border px-2 py-0.5 rounded">
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Auto Refresh</span>
          <div className="w-6 h-3 bg-green-500/10 border border-green-500/30 rounded-full relative">
            <div className="absolute right-0.5 top-0.5 w-2 h-2 bg-green-500 rounded-full" />
          </div>
          <span className="text-[8px] font-black text-green-500 uppercase">ON</span>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">TIMESTAMP</th>
              <th className="px-5 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">SEVERITY</th>
              <th className="px-5 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">SOURCE -&gt; DESTINATION</th>
              <th className="px-5 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">ATTACK TYPE</th>
              <th className="px-5 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">AI CONFIDENCE SCORE</th>
              <th className="px-5 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">DETECTED BY</th>
              <th className="px-5 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">MITRE ATT&CK</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <ShieldX className="w-10 h-10 text-muted/30" />
                      <div className="space-y-1">
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">No Events Found</p>
                        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Try adjusting your search filters</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                alerts.slice(0, 8).map((alert) => {
                  const isSelected = selectedAlertId === alert.id;
                  return (
                    <motion.tr
                      key={alert.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "border-b border-border transition-all group cursor-pointer relative",
                        isSelected
                          ? "bg-red-500/5 dark:bg-red-500/10 shadow-[inset_4px_0_0_0_#ef4444]"
                          : "hover:bg-muted transition-all"
                      )}
                      onClick={() => onSelectAlert(alert)}
                    >
                      <td className="px-5 py-2.5">
                        <span className={cn(
                          "text-[10px] font-mono font-bold whitespace-nowrap",
                          isSelected ? "text-red-500" : "text-muted-foreground"
                        )}>
                          {new Date(alert.timestamp).toLocaleTimeString("en-US", { hour12: true })}
                        </span>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex justify-center">
                          <SeverityBadge severity={alert.severity} />
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-[10px] font-mono font-bold tracking-tight", isSelected ? "text-foreground" : "text-foreground/80")}>{alert.sourceIp}</span>
                          <span className="text-muted-foreground/40 text-[10px]">-&gt;</span>
                          <span className="text-[10px] font-mono text-muted-foreground font-bold tracking-tight">{alert.destinationIp}:{alert.destinationPort}</span>
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <span className={cn("text-[10px] font-bold tracking-tight", isSelected ? "text-red-500" : "text-foreground")}>{alert.attackType}</span>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2 max-w-[120px]">
                          <span className={cn("text-[10px] font-black font-mono w-8", isSelected ? "text-red-500" : "text-foreground")}>{Math.round(alert.confidenceScore * 100)}%</span>
                          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn("h-full", alert.confidenceScore > 0.9 ? "bg-red-500" : "bg-orange-500")}
                              style={{ width: `${alert.confidenceScore * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <span className="text-[9px] font-bold text-muted-foreground italic">{alert.detectedBy.join(" + ") || "Unknown"}</span>
                      </td>
                      <td className="px-5 py-2.5">
                        <span className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded tracking-widest leading-none bg-red-500/10 border",
                          isSelected ? "text-red-500 border-red-500/30" : "text-red-500 border-red-500/10"
                        )}>
                          {alert.mitre.techniqueId}
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

      <div className="p-3 border-t border-border flex items-center justify-between text-[8px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/20">
        <span>Showing 1 to {Math.min(alerts.length, 8)} of {alerts.length} events</span>
        <div className="flex items-center gap-1">
          <button className="px-1.5 py-1 hover:text-foreground transition-colors">{"<"}</button>
          <button className="w-5 h-5 flex items-center justify-center bg-cyan-600 text-white rounded">1</button>
          <button className="w-5 h-5 flex items-center justify-center hover:bg-muted rounded transition-colors">2</button>
          <button className="w-5 h-5 flex items-center justify-center hover:bg-muted rounded transition-colors">3</button>
          <span>...</span>
          <button className="px-1.5 py-1 hover:text-foreground transition-colors">{">"}</button>
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
      {status.replace("_", " ")}
    </span>
  );
}
