import React, { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { 
  LineChart as BaseLineChart, 
  Line as BaseLine, 
  XAxis as BaseXAxis, 
  YAxis as BaseYAxis, 
  CartesianGrid as BaseCartesianGrid, 
  Tooltip as BaseTooltip, 
  Legend as BaseLegend, 
  ResponsiveContainer as BaseResponsiveContainer 
} from "recharts";

interface ChartHistoryItem {
  timeLabel: string;
  flows: number;
  isAnomaly: boolean;
}

interface NetworkMonitoringChartProps {
  chartHistory: ChartHistoryItem[];
  isRunning: boolean;
  isDark: boolean;
}

export const NetworkMonitoringChart: React.FC<NetworkMonitoringChartProps> = ({
  chartHistory,
  isRunning,
  isDark,
}) => {
  // Dynamic split of flows count for green background normal and red background anomaly layers
  const parsedChartData = useMemo(() => {
    return chartHistory.map(pt => {
      const normal = pt.isAnomaly 
        ? Math.max(2, Math.round(pt.flows * 0.5 + Math.random() * 3)) 
        : pt.flows;
      const anomaly = pt.isAnomaly 
        ? Math.max(4, Math.round(pt.flows * 0.5 + Math.random() * 5)) 
        : 0;
      return {
        ...pt,
        normal,
        anomaly
      };
    });
  }, [chartHistory]);

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm space-y-3" id="realtime-traffic-chart-container">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-405 animate-pulse" />
          <h3 className="text-xs font-black text-foreground uppercase tracking-widest">
            REAL-TIME NETWORK TRAFFIC SPECTROMETER
          </h3>
        </div>
        <span className="text-[8.5px] text-muted-foreground uppercase font-black flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          Live stream traffic rate metrics (1s Refresh)
        </span>
      </div>

      <div className="h-35 w-full select-none text-[8.5px]">
        <BaseResponsiveContainer width="100%" height="100%">
          <BaseLineChart 
            data={parsedChartData} 
            margin={{ top: 5, right: 10, left: -32, bottom: 0 }}
          >
            <BaseCartesianGrid stroke={isDark ? "#1e293b" : "#e2e8f0"} strokeDasharray="2 2" vertical={false} />
            <BaseXAxis dataKey="timeLabel" stroke={isDark ? "#475569" : "#94a3b8"} tickLine={false} />
            <BaseYAxis stroke={isDark ? "#475569" : "#94a3b8"} tickLine={false} />
            <BaseTooltip 
              contentStyle={{ 
                backgroundColor: isDark ? "#020617" : "#ffffff", 
                borderColor: isDark ? "#1e293b" : "#cbd5e1", 
                color: isDark ? "#f8fafc" : "#0f172a", 
                fontSize: 9, 
                fontFamily: "monospace", 
                borderRadius: 4 
              }}
            />
            <BaseLegend iconType="circle" iconSize={5} verticalAlign="top" align="right" height={20} />
            <BaseLine 
              name="Normal Traffic (green)" 
              type="monotone" 
              dataKey="normal" 
              stroke="#10b981" 
              strokeWidth={2.5} 
              dot={false}
              activeDot={{ r: 4 }}
            />
            <BaseLine 
              name="Anomaly Traffic (red)" 
              type="monotone" 
              dataKey="anomaly" 
              stroke="#ef4444" 
              strokeWidth={2.5} 
              dot={false}
              activeDot={{ r: 4 }}
            />
          </BaseLineChart>
        </BaseResponsiveContainer>
      </div>
    </div>
  );
};
