import React from "react";
import { 
  ShieldAlert, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  Activity,
  BrainCircuit,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { Alert, Severity, AlertStatus } from "../../types";
import { cn } from "../../lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: any;
  color: string;
  trend: number;
  percentage: string;
}

function StatCard({ label, value, icon: Icon, color, trend, percentage }: StatCardProps) {
  return (
    <div className="bg-card border border-border p-4 rounded-2xl shadow-sm group hover:border-border/80 transition-all">
      <div className="flex items-start justify-between">
        <div className={cn("p-2 rounded-xl bg-opacity-10", color.replace('text-', 'bg-'))}>
          <Icon className={cn("w-5 h-5", color)} />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-[9px] font-black uppercase tracking-widest",
          trend > 0 ? "text-green-500" : "text-red-500"
        )}>
          {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {percentage}
        </div>
      </div>
      
      <div className="mt-4">
        <div className="text-2xl font-black text-foreground tracking-tight">{value}</div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{label}</div>
      </div>

      <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-1000", color.replace('text-', 'bg-'))} 
          style={{ width: `${Math.min(100, (value / 50) * 100)}%` }}
        />
      </div>
    </div>
  );
}

export function AlertStats({ alerts }: { alerts: Alert[] }) {
  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === Severity.CRITICAL).length,
    high: alerts.filter(a => a.severity === Severity.HIGH).length,
    medium: alerts.filter(a => a.severity === Severity.MEDIUM).length,
    low: alerts.filter(a => a.severity === Severity.LOW).length,
    resolved: alerts.filter(a => a.status === AlertStatus.RESOLVED).length,
    active: alerts.filter(a => [AlertStatus.NEW, AlertStatus.INVESTIGATING, AlertStatus.ESCALATED].includes(a.status)).length,
    aiInvolved: alerts.filter(a => a.confidenceScore > 0.9).length
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        label="Total Alerts" 
        value={stats.total} 
        icon={Activity} 
        color="text-cyan-700 dark:text-cyan-500" 
        trend={12} 
        percentage="+12%" 
      />
      <StatCard 
        label="Critical Alerts" 
        value={stats.critical} 
        icon={ShieldAlert} 
        color="text-red-700 dark:text-red-500" 
        trend={-5} 
        percentage="-5%" 
      />
      <StatCard 
        label="High Severity" 
        value={stats.high} 
        icon={AlertTriangle} 
        color="text-orange-700 dark:text-orange-500" 
        trend={8} 
        percentage="+8%" 
      />
      <StatCard 
        label="AI Investigating" 
        value={stats.aiInvolved} 
        icon={BrainCircuit} 
        color="text-purple-700 dark:text-purple-500" 
        trend={24} 
        percentage="+24%" 
      />
    </div>
  );
}
