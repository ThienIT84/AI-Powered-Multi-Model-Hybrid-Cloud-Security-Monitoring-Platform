import { 
  ShieldAlert, 
  Activity,
  Globe,
  Bug,
  Crosshair
} from "lucide-react";
import { cn } from "../../lib/utils";
import { DashboardSummary } from "../../types";
import { 
  LineChart, 
  Line, 
  ResponsiveContainer,
} from "recharts";

const sparklineData = Array.from({ length: 15 }, (_, i) => ({ value: 30 + Math.random() * 50 }));

interface KPIOverviewProps {
  summary: DashboardSummary;
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

export function KPIOverview({ summary }: KPIOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <StatCard 
        title="TOTAL NETWORK FLOWS" 
        value={formatCompact(summary.totalNetworkFlows)} 
        change={`${summary.flowChangePercent}%`} 
        subtitle="vs last 24h"
        icon={Globe}
        iconColor="text-blue-500"
        sparklineColor="#3b82f6"
      />
      <StatCard 
        title="TOTAL FUSION ALERTS" 
        value={formatCompact(summary.totalFusionAlerts)} 
        change={`${summary.alertChangePercent}%`} 
        subtitle="vs last 24h"
        icon={Bug}
        iconColor="text-red-500"
        sparklineColor="#ef4444"
        isRed
      />
      <StatCard 
        title="TOP THREAT" 
        value={summary.topThreat} 
        change={`${summary.classifiedAttackChangePercent}%`} 
        subtitle="classification lift"
        icon={Crosshair}
        iconColor="text-purple-500"
        sparklineColor="#a855f7"
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  subtitle: string;
  icon: any;
  iconColor: string;
  sparklineColor: string;
  isRed?: boolean;
}

function StatCard({ 
  title, value, change, subtitle, icon: Icon, iconColor, sparklineColor, isRed 
}: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between min-h-[120px] relative group overflow-hidden shadow-sm transition-all duration-300 hover:border-cyan-500/30 hover:shadow-md">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">{title}</h3>
        <div className={cn("p-1.5 rounded bg-secondary/50", iconColor)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="text-2xl font-black text-foreground tracking-tighter leading-none">
            {value}
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn("text-[10px] font-black flex items-center gap-0.5", isRed ? "text-red-500" : "text-green-500")}>
              ↑ {change}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{subtitle}</span>
          </div>
        </div>

        <div className="h-10 w-24 opacity-40 group-hover:opacity-80 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={sparklineColor} 
                strokeWidth={2} 
                dot={false} 
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Decorative gradient overlay */}
      <div className={cn(
        "absolute -bottom-1 -right-1 w-24 h-24 blur-[60px] opacity-10 pointer-events-none transition-all duration-700 group-hover:opacity-20",
        isRed ? "bg-red-500" : "bg-blue-500"
      )} />
    </div>
  );
}
