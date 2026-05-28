import React from "react";
import { 
  Globe,
  Bug,
  Crosshair
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { cn } from "../../lib/utils";
import { Alert, TrafficData } from "../../types";

interface KPIOverviewProps {
  alerts: Alert[];
  traffic: TrafficData[];
}

export function KPIOverview({ alerts = [], traffic = [] }: KPIOverviewProps) {
  // Real-time dynamic values calculating against current stream
  const latestTraffic = traffic[traffic.length - 1];
  
  // Base 8.42 Tbps + micro-changes based on live stream
  const liveTrafficVal = latestTraffic 
    ? (8.42 + (latestTraffic.inbound - 250) / 10000).toFixed(3) 
    : "8.420";

  const liveThreatsCount = 1232 + alerts.length;
  
  // Classified attacks sum
  const liveClassifiedCount = 356 + Math.floor(alerts.length * 0.4);

  // Rolling traffic trends
  const trafficTrend = React.useMemo(() => {
    if (traffic.length === 0) {
      return Array.from({ length: 15 }, (_, i) => ({ val: 200 + Math.sin(i / 2) * 20 + Math.random() * 10 }));
    }
    return traffic.slice(-15).map(t => ({ val: t.inbound }));
  }, [traffic]);

  // Rolling alerts density trend
  const threatsTrend = React.useMemo(() => {
    const baseTrend = [12, 15, 14, 18, 17, 20, 22, 19, 21, 24, 23, 26, 28, 27, 30];
    const liveOffset = alerts.length % 5;
    return baseTrend.map((v, i) => ({ 
      val: v + liveOffset + Math.floor(Math.sin((i + alerts.length) / 3) * 2) 
    }));
  }, [alerts]);

  // Rolling classified attacks trend
  const classifiedTrend = React.useMemo(() => {
    const baseTrend = [8, 9, 8, 11, 10, 13, 12, 14, 15, 13, 16, 17, 15, 18, 19];
    const liveOffset = Math.floor(alerts.length * 0.4) % 4;
    return baseTrend.map((v, i) => ({ 
      val: v + liveOffset + Math.floor(Math.cos((i + alerts.length) / 2) * 1.5) 
    }));
  }, [alerts]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <StatCard 
        title="TOTAL NETWORK TRAFFIC" 
        value={`${liveTrafficVal} Tbps`} 
        change="+12.6%" 
        status="8.42 Tbps nominal"
        icon={Globe}
        iconColor="text-cyan-500 bg-cyan-500/10"
        isLive
        chartDataList={trafficTrend}
        lineColor="#22d3ee"
        fillColor="rgba(34, 211, 238, 0.1)"
      />
      <StatCard 
        title="TOTAL AI THREATS DETECTED" 
        value={liveThreatsCount.toLocaleString()} 
        change={`+${alerts.filter(a => a.severity === "High" || a.severity === "Critical").length}`} 
        status="Active Inspection"
        icon={Bug}
        iconColor="text-red-500 bg-red-500/10"
        isLive
        isRed
        chartDataList={threatsTrend}
        lineColor="#ef4444"
        fillColor="rgba(239, 68, 68, 0.1)"
      />
      <StatCard 
        title="CLASSIFIED ATTACKS" 
        value={liveClassifiedCount.toLocaleString()} 
        change="+15.3%" 
        status="L3/L4/L7 Heuristics"
        icon={Crosshair}
        iconColor="text-amber-500 bg-amber-500/10"
        isLive
        isAmber
        chartDataList={classifiedTrend}
        lineColor="#f59e0b"
        fillColor="rgba(245, 158, 11, 0.1)"
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  status: string;
  icon: any;
  iconColor: string;
  isRed?: boolean;
  isAmber?: boolean;
  isLive?: boolean;
  chartDataList: { val: number }[];
  lineColor: string;
  fillColor: string;
}

function StatCard({ 
  title, value, change, status, icon: Icon, iconColor, isRed, isAmber, isLive, chartDataList, lineColor, fillColor 
}: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between min-h-27.5 relative overflow-hidden shadow-sm transition-all duration-300 hover:border-border-hover hover:shadow-md select-none">
      {/* Small green dot indicating active feed */}
      {isLive && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-background border border-border/50 px-2 py-0.5 rounded-full">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-widest leading-none">LIVE</span>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.12em]">{title}</h3>
        </div>
        
        {/* Value container */}
        <div className="text-2xl font-black text-foreground tracking-tighter leading-none mt-1">
          {value}
        </div>
      </div>

      {/* Mini Trend Line nested below main value */}
      <div className="h-7 w-full my-1 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartDataList} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <Area 
              type="monotone" 
              dataKey="val" 
              stroke={lineColor} 
              fill={fillColor} 
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/20">
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "text-[9px] font-bold px-1 py-0.5 rounded leading-none border",
            isRed 
              ? "bg-red-500/15 text-red-500 border-red-500/20" 
              : isAmber 
                ? "bg-amber-500/15 text-amber-500 border-amber-500/20" 
                : "bg-cyan-500/15 text-cyan-500 border-cyan-500/20"
          )}>
            {change}
          </span>
          <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-wider">{status}</span>
        </div>
        <div className={cn("p-1.5 rounded-lg border border-border/30", iconColor)}>
          <Icon className="w-3.5 h-3.5 stroke-2" />
        </div>
      </div>
    </div>
  );
}
