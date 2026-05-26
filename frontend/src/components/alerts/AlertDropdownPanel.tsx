import React from "react";
import { FloatingPanel } from "../common/FloatingPanel";
import { Alert, Severity } from "../../types";
import { cn } from "../../lib/utils";
import { ShieldAlert, Clock, ExternalLink, CheckCheck } from "lucide-react";
import { motion } from "motion/react";
import { useAttackTheme } from "../../hooks/useAttackTheme";

interface AlertItemProps {
  alert: Alert;
  onClick: () => void;
  index: number;
  key?: React.Key;
}

function AlertItem({ alert, onClick, index }: AlertItemProps) {
  // We assume dark mode as default for the panel, but it will be passed down if needed
  const theme = useAttackTheme(alert.attackType, true);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
      onClick={onClick}
      className="p-4 cursor-pointer group relative overflow-hidden transition-all border-l-4 border-transparent hover:border-l-4"
      style={{ borderLeftColor: theme.primary }}
    >
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" 
        style={{ background: theme.gradient }}
      />

      <div className="flex items-start justify-between mb-2 relative z-10">
        <div className="flex items-center gap-2">
           <span className={cn(
             "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shadow-sm",
             alert.severity === Severity.CRITICAL ? "bg-red-500/20 text-red-500 border border-red-500/30" : "bg-muted text-muted-foreground border border-border"
           )}>
             {alert.severity}
           </span>
           <span className="text-[11px] font-black text-foreground uppercase tracking-widest leading-none drop-shadow-sm">{alert.attackType}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
           <Clock size={11} className="opacity-50" />
           <span className="text-[9px] font-mono font-bold tracking-tighter opacity-80">
             {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           </span>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground/80 font-medium line-clamp-1 mb-2 relative z-10">
         <span className="font-bold opacity-60">SRX:</span> <span className="text-foreground/90 font-mono" style={{ color: theme.primary }}>{alert.sourceIp}</span> <span className="mx-1 opacity-20">|</span> <span className="font-bold opacity-60">DST:</span> <span className="text-foreground/90 font-mono">{alert.destinationIp}</span>
      </p>

      <div className="flex items-center justify-between relative z-10">
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
               <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Confidence Score:</span>
               <span className="text-[10px] font-black transition-all font-mono tracking-tighter" style={{ 
                 color: theme.primary,
                 textShadow: `0 0 8px ${theme.glow}`
               }}>{(alert.confidenceScore * 100).toFixed(1)}%</span>
            </div>
         </div>
         <span className="text-[9px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-1.5" style={{ color: theme.primary }}>
            Inspect <ExternalLink size={10} />
         </span>
      </div>
    </motion.div>
  );
}

interface AlertDropdownPanelProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
}

export function AlertDropdownPanel({ isOpen, onClose, alerts, onSelectAlert }: AlertDropdownPanelProps) {
  const [filter, setFilter] = React.useState<"all" | "critical" | "investigating" | "resolved">("all");

  const filteredAlerts = React.useMemo(() => {
    let result = alerts;
    if (filter === "critical") result = result.filter(a => a.severity === Severity.CRITICAL);
    if (filter === "investigating") result = result.filter(a => a.status === "investigating");
    if (filter === "resolved") result = result.filter(a => a.status === "resolved");
    return [...result].reverse(); // Latest first
  }, [alerts, filter]);

  const tabs = [
    { id: "all", label: "All" },
    { id: "critical", label: "Critical" },
    { id: "investigating", label: "Investigating" },
    { id: "resolved", label: "Resolved" },
  ];

  return (
    <FloatingPanel isOpen={isOpen} onClose={onClose} title="Security Signal Stream">
      <div className="flex flex-col h-full">
        {/* Quick Tabs */}
        <div className="flex items-center gap-1 p-2 bg-muted/20 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={cn(
                "flex-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                filter === tab.id 
                  ? "bg-foreground text-background" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto max-h-125">
          {filteredAlerts.length > 0 ? (
            <div className="divide-y divide-border/50">
              {filteredAlerts.map((alert, i) => (
                <AlertItem 
                  key={alert.id} 
                  alert={alert} 
                  index={i} 
                  onClick={() => {
                    onSelectAlert(alert);
                    onClose();
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="p-10 text-center flex flex-col items-center justify-center opacity-30 grayscale">
               <CheckCheck size={40} className="mb-4 text-emerald-500" />
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Zero Threats Detected</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-muted/20 flex justify-center">
           <button 
             onClick={onClose}
             className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.2em] hover:underline"
           >
             Close Stream Control
           </button>
        </div>
      </div>
    </FloatingPanel>
  );
}
