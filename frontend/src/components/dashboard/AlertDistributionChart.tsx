import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { SeverityDistributionItem } from "./types/dashboard.types";
import { ShieldAlert, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface AlertDistributionChartProps {
  data: SeverityDistributionItem[];
}

const COLORS: Record<string, string> = {
  Critical: "#ef4444", // red-500
  High: "#f59e0b",     // amber-500
  Medium: "#eab308",   // yellow-500
  Low: "#10b981"       // emerald-500
};

export const AlertDistributionChart: React.FC<AlertDistributionChartProps> = React.memo(({ data }) => {
  const totalCount = data.reduce((sum, item) => sum + item.value, 0);

  const getTrendIcon = (trend: string | null) => {
    if (!trend) return <Minus size={11} className="text-zinc-500 shrink-0" />;
    if (trend.startsWith("+")) {
      return <TrendingUp size={11} className="text-red-500 shrink-0" />;
    }
    if (trend.startsWith("-")) {
      return <TrendingDown size={11} className="text-emerald-500 shrink-0" />;
    }
    return <Minus size={11} className="text-zinc-500 shrink-0" />;
  };

  const getTrendColor = (trend: string | null) => {
    if (!trend) return "text-zinc-500";
    if (trend.startsWith("+")) return "text-red-450 dark:text-red-400";
    if (trend.startsWith("-")) return "text-emerald-500 dark:text-emerald-400";
    return "text-zinc-500";
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col justify-between" id="threat-severity-chart">
      <div>
        <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-4 select-none">
          <ShieldAlert size={14} className="text-cyan-500" />
          <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest font-mono">
            Threat Severity Distribution (24h)
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-around mt-2">
          {/* Donut Chart Visualizer */}
          <div className="relative w-32.5 h-32.5 shrink-0 font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={55}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#71717a"} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "9px",
                    fontFamily: "monospace"
                  }}
                  labelStyle={{ display: "none" }}
                  itemStyle={{ fontSize: "9px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
              <span className="text-base font-black text-foreground tracking-tight leading-none">
                {totalCount}
              </span>
              <span className="text-[7.5px] text-muted-foreground font-bold uppercase mt-1 leading-none tracking-wider">
                Total
              </span>
            </div>
          </div>

          {/* List of details (count, percentage, trend) */}
          <div className="flex-1 w-full space-y-2.5 font-mono select-none">
            {data.map((item) => {
              const color = COLORS[item.name];
              return (
                <div
                  key={item.name}
                  className="bg-secondary/10 border border-border/30 hover:border-border/65 px-3 py-1.5 rounded-lg flex items-center justify-between gap-1.5 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }}></span>
                    <span className="text-[9px] font-black text-foreground uppercase">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <span className="text-[9px] text-zinc-400 font-bold shrink-0">
                      {item.value} <span className="text-[8px] text-zinc-500 font-normal">({item.percentage}%)</span>
                    </span>
                    <span className={`text-[8.5px] font-extrabold flex items-center gap-0.5 shrink-0 ${getTrendColor(item.trend)}`}>
                      {getTrendIcon(item.trend)}
                      {item.trend ?? "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="text-[7.5px] text-zinc-500 font-mono mt-4 uppercase select-none border-t border-border/10 pt-2.5 flex items-center justify-between leading-none font-bold">
        <span>Metrics source: active SOC feeds</span>
        <span className="text-emerald-500">Live calculating</span>
      </div>
    </div>
  );
});

