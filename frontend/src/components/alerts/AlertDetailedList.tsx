import React from "react";
import { 
  MoreHorizontal, 
  ExternalLink, 
  Eye, 
  Clock, 
  User, 
  ShieldAlert, 
  Server, 
  Cloud, 
  Globe, 
  Zap, 
  Terminal, 
  Search, 
  Lock, 
  UserX, 
  Cpu
} from "lucide-react";
import { Alert, Severity, AlertStatus } from "../../types";
import { cn } from "../../lib/utils";
import { motion } from "motion/react";
import { useAttackTheme } from "../../hooks/useAttackTheme";

function getAttackIcon(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes("ddos") || normalized.includes("beacon")) return Zap;
  if (normalized.includes("sql")) return Terminal;
  if (normalized.includes("xss") || normalized.includes("lfi") || normalized.includes("injection")) return Globe;
  if (normalized.includes("scan")) return Search;
  if (normalized.includes("brute") || normalized.includes("auth")) return Lock;
  if (normalized.includes("malware") || normalized.includes("ransom")) return Cpu;
  if (normalized.includes("phish")) return Eye;
  return ShieldAlert;
}

interface AlertDetailedListProps {
  alerts: Alert[];
  viewMode: "table" | "grid";
  onSelectAlert: (alert: Alert) => void;
  selectedAlertId?: string;
}

export function AlertDetailedList({ alerts, viewMode, onSelectAlert, selectedAlertId }: AlertDetailedListProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <ShieldAlert className="w-10 h-10 text-muted-foreground/30 mb-3 animate-pulse" />
        <h4 className="text-[12px] font-black text-foreground uppercase tracking-widest">No Alerts Matching Filter Sandbox</h4>
        <p className="text-[10px] text-muted-foreground uppercase mt-1 max-w-md font-medium tracking-wide">
          Modify your advanced filter query parameters or search query payload keyword to isolate other ingested SIEM events.
        </p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4 flex-1 overflow-y-auto max-h-245 custom-scrollbar">
        {alerts.map((alert, idx) => (
          <AlertGridItem 
            key={alert.id} 
            alert={alert} 
            isSelected={selectedAlertId === alert.id}
            onClick={() => onSelectAlert(alert)}
            index={idx}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto max-h-245 custom-scrollbar relative">
      <table className="w-full text-left border-collapse  min-w-250 relative">
        <thead className="sticky top-0 bg-card z-10 border-b border-border shadow-sm">
          <tr className="bg-muted/30">
            <th className="px-4 py-3.5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.16em] w-28">ID & Timestamp</th>
            <th className="px-4 py-3.5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.16em] w-24">Severity</th>
            <th className="px-4 py-3.5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.16em] w-36">Attack Type</th>
            <th className="px-4 py-3.5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.16em]">Source / Destination</th>
            <th className="px-4 py-3.5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.16em] w-48">Platform</th>
            <th className="px-4 py-3.5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.16em] w-28">Confidence</th>
            <th className="px-4 py-3.5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.16em] w-28">Status</th>
            <th className="px-3 py-3.5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.16em] w-10 text-center"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40 bg-card">
          {alerts.map((alert, idx) => (
            <AlertTableRow 
              key={alert.id} 
              alert={alert} 
              isSelected={selectedAlertId === alert.id}
              onClick={() => onSelectAlert(alert)}
              index={idx}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface AlertTableRowProps {
  alert: Alert;
  isSelected: boolean;
  onClick: () => void;
  index: number;
  key?: string;
}

function AlertTableRow({ alert, isSelected, onClick, index }: AlertTableRowProps) {
  const theme = useAttackTheme(alert.attackType, true);
  const AttackIcon = getAttackIcon(alert.attackType);

  // Custom standard representation of date: DD/MM/YYYY HH:MM:SS
  const formatDateTime = (timestampStr: string) => {
    try {
      const d = new Date(timestampStr);
      if (isNaN(d.getTime())) return { date: "", time: timestampStr };
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return {
        date: `${day}/${month}/${year}`,
        time: `${hours}:${minutes}:${seconds}`
      };
    } catch {
      return { date: "", time: timestampStr };
    }
  };

  const dt = formatDateTime(alert.timestamp);
  const displayId = alert.id.toLowerCase().startsWith('thr-')
    ? alert.id.toUpperCase()
    : `#THR-${alert.id.substring(0, 4).toUpperCase()}`;

  return (
    <motion.tr 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: Math.min(index * 0.015, 0.25) }}
      onClick={onClick}
      className={cn(
        "group cursor-pointer transition-all duration-150 border-l-[3px] hover:bg-muted/30",
        isSelected ? "bg-cyan-500/4 border-l-cyan-500 font-medium" : "border-l-transparent"
      )}
      style={{ 
        borderLeftColor: isSelected ? theme.primary : 'transparent',
      }}
    >
      {/* 4.3 ID & Timestamp */}
      <td className="px-4 py-2.5">
        <div className="flex flex-col gap-0.5 leading-none">
          <span className="text-[10px] font-mono font-bold text-foreground/90 uppercase tracking-tight">{displayId}</span>
          <span className="text-[8px] font-mono text-muted-foreground/80 tracking-wide mt-1">
            {dt.date} <span className="text-muted-foreground/50">{dt.time}</span>
          </span>
        </div>
      </td>

      {/* 4.4 Severity */}
      <td className="px-4 py-2.5">
        <SeverityBadge severity={alert.severity} />
      </td>

      {/* 4.5 Attack Type */}
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-muted border border-border/60" style={{ color: theme.primary }}>
            <AttackIcon size={12} />
          </div>
          <span className="text-[9.5px] font-black text-foreground uppercase tracking-tight truncate max-w-30">{alert.attackType}</span>
        </div>
      </td>

      {/* 4.6 Source / Destination */}
      <td className="px-4 py-2.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-tight">
            {/* Source IP with subtle risk-colored style depending on severity */}
            <span className={cn(
              "font-bold px-1 py-0.2 rounded-sm text-[9px]",
              alert.severity === Severity.CRITICAL ? "text-red-500 bg-red-500/10 border border-red-500/20" :
              alert.severity === Severity.HIGH ? "text-orange-500 bg-orange-500/10 border border-orange-500/20" :
              alert.severity === Severity.MEDIUM ? "text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 border border-yellow-500/20" :
              "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20"
            )}>
              {alert.sourceIp}:{alert.sourcePort || 49152}
            </span>
            <span className="text-muted-foreground/40 font-black">-></span>
            <span className="text-foreground/95 bg-muted/60 border border-border/40 px-1 py-0.2 rounded-sm text-[9px]">
              {alert.destinationIp}:{alert.destinationPort}
            </span>
          </div>
          <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-widest mt-1.5 flex items-center gap-1 leading-none">
            PROTOCOL: <span className="text-cyan-500 font-mono font-black bg-muted/90 border border-border px-1 py-0.2 rounded-xs text-[7px] leading-none">{alert.protocol || "TCP"}</span>
          </span>
        </div>
      </td>

      {/* 4.7 Platform */}
      <td className="px-4 py-2.5">
        <div className="flex flex-col gap-0.5 max-w-32.5 truncate leading-none">
          <div className="flex items-center gap-1.5">
            <Cloud className="w-2.8 h-2.8 text-cyan-500/70 shrink-0" />
            <span className="text-[9px] font-black text-foreground uppercase tracking-wider">{alert.cloudProvider}</span>
          </div>
          <span className="text-[7.5px] text-muted-foreground font-black uppercase tracking-wider truncate mt-0.5">{alert.region}</span>
        </div>
      </td>

      {/* 4.8 Confidence */}
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-10 bg-muted border border-border/70 rounded-full overflow-hidden shrink-0">
            <div 
              className="h-full transition-all duration-300 rounded-full" 
              style={{ backgroundColor: theme.primary, width: `${alert.confidenceScore * 100}%` }}
            />
          </div>
          <span className="text-[9px] font-mono font-bold" style={{ color: theme.primary }}>
            {(alert.confidenceScore * 100).toFixed(0)}%
          </span>
        </div>
      </td>

      {/* 4.9 Status */}
      <td className="px-4 py-2.5">
        <StatusBadge status={alert.status} />
      </td>

      {/* Interaction visual menu */}
      <td className="px-3 py-2.5">
        <button className="p-1 rounded text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-all opacity-0 group-hover:opacity-100 cursor-pointer">
          <ExternalLink size={11} />
        </button>
      </td>
    </motion.tr>
  );
}

function AlertGridItem({ alert, isSelected, onClick, index }: { alert: Alert; isSelected: boolean; onClick: () => void; index: number; key?: string }) {
  const theme = useAttackTheme(alert.attackType, true);
  const AttackIcon = getAttackIcon(alert.attackType);

  const displayId = alert.id.toLowerCase().startsWith('thr-')
    ? alert.id.toUpperCase()
    : `#THR-${alert.id.substring(0, 4).toUpperCase()}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15, delay: index * 0.01 }}
      onClick={onClick}
      className={cn(
        "bg-card border-2 p-3.5 rounded-xl shadow-sm cursor-pointer transition-all duration-200 relative overflow-hidden group flex flex-col justify-between min-h-43.75",
        isSelected ? "border-cyan-500 shadow-md bg-cyan-500/1" : "border-border hover:border-border/80"
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="text-[8.5px] font-black text-muted-foreground uppercase tracking-widest">ID: {displayId}</span>
            <span className="text-[8px] font-mono text-muted-foreground/60 mt-1">{new Date(alert.timestamp).toLocaleString()}</span>
          </div>
          <SeverityBadge severity={alert.severity} />
        </div>

        <div className="flex items-center gap-2.5 my-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: theme.muted, color: theme.primary }}>
            <AttackIcon size={16} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[11px] font-black text-foreground uppercase tracking-tight truncate max-w-40">{alert.attackType}</span>
            <span className="text-[8px] text-muted-foreground uppercase tracking-widest mt-1">Confidence: <span className="font-mono font-bold" style={{ color: theme.primary }}>{((alert.confidenceScore || 0) * 100).toFixed(0)}%</span></span>
          </div>
        </div>
      </div>

      <div className="mt-2 pt-2.5 border-t border-border/30 flex flex-col gap-1.5 justify-end">
        <div className="flex justify-between font-mono text-[8.5px] tracking-tight">
          <span className="font-bold text-muted-foreground truncate max-w-25">{alert.sourceIp}</span>
          <span className="text-muted-foreground/45 shrink-0">-></span>
          <span className="text-foreground/90 font-semibold truncate max-w-25">{alert.destinationIp}</span>
        </div>
        <div className="flex items-center justify-between mt-1 text-[8px] font-black uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1">
            <Cloud className="w-2.5 h-2.5 text-cyan-500/70" /> {alert.cloudProvider}
          </span>
          <StatusBadge status={alert.status} />
        </div>
      </div>
    </motion.div>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const norm = String(severity).toUpperCase();
  const settings = {
    CRITICAL: { text: "CRITICAL", bg: "bg-red-500/10", color: "text-red-500", border: "border-red-500/25" },
    HIGH: { text: "HIGH", bg: "bg-orange-500/10", color: "text-orange-500", border: "border-orange-500/25" },
    MEDIUM: { text: "MEDIUM", bg: "bg-yellow-500/10", color: "text-yellow-600 dark:text-yellow-500", border: "border-yellow-500/25" },
    LOW: { text: "LOW", bg: "bg-emerald-500/10", color: "text-emerald-600 dark:text-emerald-500", border: "border-emerald-500/25" },
  };

  const config = settings[norm as keyof typeof settings] || settings.LOW;

  return (
    <span className={cn(
      "px-1.5 py-0.5 rounded border text-[7.5px] font-black tracking-wider flex items-center gap-1 w-fit uppercase font-mono leading-none",
      config.bg,
      config.color,
      config.border
    )}>
      <div className={cn("w-1 h-1 rounded-full", config.color.replace('text-', 'bg-'))} />
      {config.text}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const norm = String(status).toLowerCase();
  
  const settings: Record<string, { text: string, color: string }> = {
    "new": { text: "NEW", color: "text-blue-500 bg-blue-500/10 border border-blue-500/20" },
    "investigating": { text: "INVESTIGATING", color: "text-purple-500 bg-purple-500/10 border border-purple-500/20" },
    "mitigated": { text: "MITIGATED", color: "text-cyan-500 bg-cyan-500/10 border border-cyan-500/20" },
    "resolved": { text: "RESOLVED", color: "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20" },
    "false_positive": { text: "FALSE POSITIVE", color: "text-muted-foreground bg-muted border border-border/50" },
    "blocking": { text: "BLOCKING", color: "text-red-500 bg-red-500/10 border border-red-500/20" },
    "monitoring": { text: "MONITORING", color: "text-yellow-500 bg-yellow-500/10 border border-yellow-500/20" },
    "escalated": { text: "ESCALATED", color: "text-orange-500 bg-orange-500/10 border border-orange-500/20" }
  };

  const config = settings[norm] || { text: norm.toUpperCase(), color: "text-muted-foreground bg-muted border border-border/50" };

  return (
    <span className={cn(
      "px-2 py-0.5 rounded text-[7.5px] font-black tracking-wider whitespace-nowrap leading-none",
      config.color
    )}>
      {config.text}
    </span>
  );
}
