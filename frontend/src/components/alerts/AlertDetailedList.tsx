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
  switch (name) {
    case "DDoS": return Zap;
    case "SQL Injection": return Terminal;
    case "XSS": return Globe;
    case "Port Scan": return Search;
    case "Brute Force": return Lock;
    case "Unauthorized Access": return UserX;
    case "Malware": return Cpu;
    case "Phishing": return Eye;
    case "Ransomware": return ShieldAlert;
    case "Insider Threat": return UserX;
    default: return ShieldAlert;
  }
}

interface AlertDetailedListProps {
  alerts: Alert[];
  viewMode: "table" | "grid";
  onSelectAlert: (alert: Alert) => void;
  selectedAlertId?: string;
}

export function AlertDetailedList({ alerts, viewMode, onSelectAlert, selectedAlertId }: AlertDetailedListProps) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 p-4 flex-1">
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
    <div className="flex-1 overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="px-5 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] w-12">ID</th>
            <th className="px-5 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Timestamp</th>
            <th className="px-5 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Severity</th>
            <th className="px-5 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Attack Type</th>
            <th className="px-5 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Source/Destination</th>
            <th className="px-5 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Platform</th>
            <th className="px-5 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Confidence</th>
            <th className="px-5 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Status</th>
            <th className="px-5 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] w-12 text-center"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
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
  key?: React.Key;
  alert: Alert;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

function AlertTableRow({ alert, isSelected, onClick, index }: AlertTableRowProps) {
  const isNew = index < 2; // Simulate new alerts for the pulse effect
  const theme = useAttackTheme(alert.attackType, true);
  const AttackIcon = getAttackIcon(alert.attackType);

  return (
    <motion.tr 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.5) }}
      onClick={onClick}
      className={cn(
        "group cursor-pointer transition-all duration-200 border-l-[4px]",
        isSelected ? "bg-muted/30" : "bg-transparent hover:bg-muted/50"
      )}
      style={{ 
        borderLeftColor: isSelected ? theme.primary : 'transparent',
        boxShadow: isSelected ? `inset 10px 0 20px -10px ${theme.glow}` : 'none'
      }}
    >
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {isNew && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />}
          <span className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-tighter">#{alert.id.substring(0, 7)}</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-foreground">
            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="text-[8px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
            {new Date(alert.timestamp).toLocaleDateString()}
          </span>
        </div>
      </td>
      <td className="px-5 py-4">
        <SeverityBadge severity={alert.severity} />
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-muted/50 border border-border/50 shadow-sm" style={{ color: theme.primary }}>
            <AttackIcon size={12} />
          </div>
          <span className="text-[10px] font-black text-foreground uppercase tracking-tight">{alert.attackType}</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold font-mono tracking-tighter" style={{ color: theme.primary }}>{alert.sourceIp}</span>
            <Globe className="w-2.5 h-2.5 text-muted-foreground/30" />
            <span className="text-[9px] font-bold text-foreground font-mono tracking-tighter">{alert.destinationIp}</span>
          </div>
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1">
            PORT: <span className="text-foreground">{alert.destinationPort}</span>
            <span className="mx-1 opacity-30">|</span>
            PROTO: <span className="text-foreground">{alert.protocol}</span>
          </span>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex flex-col">
           <div className="flex items-center gap-2">
             <Cloud className="w-3 h-3 text-cyan-500/70" />
             <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{alert.cloudProvider}</span>
           </div>
           <span className="text-[8px] text-muted-foreground font-bold uppercase mt-1">{alert.region}</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-700" 
              style={{ backgroundColor: theme.primary, width: `${alert.confidenceScore * 100}%`, boxShadow: `0 0 8px ${theme.glow}` }}
            />
          </div>
          <span className="text-[10px] font-mono font-black" style={{ color: theme.primary }}>{(alert.confidenceScore * 100).toFixed(0)}%</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <StatusBadge status={alert.status} />
      </td>
      <td className="px-5 py-4">
        <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all opacity-0 group-hover:opacity-100">
          <MoreHorizontal size={14} />
        </button>
      </td>
    </motion.tr>
  );
}

interface AlertGridItemProps {
  key?: React.Key;
  alert: Alert;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

function AlertGridItem({ alert, isSelected, onClick, index }: AlertGridItemProps) {
  const isDarkMode = true;
  const theme = useAttackTheme(alert.attackType, isDarkMode);
  const AttackIcon = getAttackIcon(alert.attackType);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={onClick}
      className={cn(
        "bg-card border-2 p-4 rounded-3xl shadow-sm cursor-pointer transition-all duration-300 relative overflow-hidden group",
        isSelected ? "shadow-2xl" : "border-border hover:border-border/80"
      )}
      style={{ 
        borderColor: isSelected ? theme.primary : undefined,
        boxShadow: isSelected ? `0 20px 40px -20px ${theme.glow}` : undefined
      }}
    >
      <div 
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none" 
        style={{ background: theme.gradient }}
      />
      
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-15 transition-all group-hover:scale-110">
         <AttackIcon size={64} style={{ color: theme.primary }} />
      </div>

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">ALERT ID: {alert.id.substring(0, 8)}</span>
          <div className="flex items-center gap-2">
            <SeverityBadge severity={alert.severity} />
            <StatusBadge status={alert.status} />
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-foreground">
            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-[8px] text-muted-foreground font-medium mt-1 uppercase tracking-widest leading-none">
            {new Date(alert.timestamp).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex items-center gap-3">
           <div className="p-2.5 rounded-2xl shadow-inner transition-transform group-hover:scale-110" style={{ backgroundColor: theme.muted, color: theme.primary }}>
              <AttackIcon className="w-6 h-6" style={{ filter: `drop-shadow(0 0 8px ${theme.glow})` }} />
           </div>
           <div className="flex flex-col">
              <span className="text-[13px] font-black text-foreground uppercase tracking-wider leading-none">{alert.attackType}</span>
              <span className="text-[10px] text-muted-foreground font-medium mt-1">Confidence Score: <span className="font-bold font-mono" style={{ color: theme.primary }}>{(alert.confidenceScore * 100).toFixed(0)}%</span></span>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/40">
           <div className="space-y-1">
             <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Source IP</span>
             <span className="text-[12px] font-mono font-black leading-none transition-colors" style={{ color: theme.primary }}>{alert.sourceIp}</span>
           </div>
           <div className="space-y-1 text-right">
             <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Destination IP</span>
             <span className="text-[12px] font-mono font-black text-foreground leading-none">{alert.destinationIp}</span>
           </div>
        </div>

        <div className="flex items-center justify-between pt-1">
           <div className="flex items-center gap-2.5">
              <Cloud className="w-3.5 h-3.5 text-cyan-500/80" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{alert.cloudProvider} / {alert.region}</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center">
                 <User className="w-2.5 h-2.5 text-muted-foreground" />
              </div>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{alert.assignedAnalyst?.split('_')[0]}</span>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const settings = {
    [Severity.CRITICAL]: { text: "CRITICAL", bg: "bg-red-500/10", color: "text-red-500", border: "border-red-500/30" },
    [Severity.HIGH]: { text: "HIGH", bg: "bg-orange-500/10", color: "text-orange-500", border: "border-orange-500/30" },
    [Severity.MEDIUM]: { text: "MEDIUM", bg: "bg-yellow-500/10", color: "text-yellow-600 dark:text-yellow-500", border: "border-yellow-500/30" },
    [Severity.LOW]: { text: "LOW", bg: "bg-emerald-500/10", color: "text-emerald-600 dark:text-emerald-500", border: "border-emerald-500/30" },
  };

  const config = settings[severity];

  return (
    <span className={cn(
      "px-2 py-0.5 rounded border text-[8px] font-black tracking-widest flex items-center gap-1.5 w-fit uppercase",
      config.bg,
      config.color,
      config.border
    )}>
      <div className={cn("w-1 h-1 rounded-full", config.color.replace('text-', 'bg-'))} />
      {config.text}
    </span>
  );
}

function StatusBadge({ status }: { status: AlertStatus }) {
  const settings: Record<AlertStatus, { text: string, color: string }> = {
    [AlertStatus.NEW]: { text: "New", color: "text-blue-500 bg-blue-500/10" },
    [AlertStatus.BLOCKING]: { text: "Blocking", color: "text-red-500 bg-red-500/10" },
    [AlertStatus.INVESTIGATING]: { text: "Investigating", color: "text-purple-500 bg-purple-500/10" },
    [AlertStatus.MONITORING]: { text: "Monitoring", color: "text-yellow-500 bg-yellow-500/10" },
    [AlertStatus.MITIGATED]: { text: "Mitigated", color: "text-cyan-500 bg-cyan-500/10" },
    [AlertStatus.ESCALATED]: { text: "Escalated", color: "text-orange-500 bg-orange-500/10" },
    [AlertStatus.RESOLVED]: { text: "Resolved", color: "text-emerald-500 bg-emerald-500/10" },
    [AlertStatus.FALSE_POSITIVE]: { text: "False Positive", color: "text-muted-foreground bg-muted" }
  };

  const config = settings[status];

  return (
    <span className={cn(
      "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest whitespace-nowrap",
      config.color
    )}>
      {config.text}
    </span>
  );
}
