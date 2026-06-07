import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import { ANALYTICS_TRENDS } from "./mockData";
import { cn } from "./utils";

interface AttackSurfaceAnalyticsTrendsProps {
  timeRange: "24H" | "7D" | "30D" | "90D";
  setTimeRange: (range: "24H" | "7D" | "30D" | "90D") => void;
}

export function AttackSurfaceAnalyticsTrends({
  timeRange,
  setTimeRange
}: AttackSurfaceAnalyticsTrendsProps) {
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-800 rounded-xl p-5 shadow-sm dark:shadow-xl">
      <div className="flex items-start justify-between mb-4 pb-2 border-b border-slate-100 dark:border-gray-800">
        <div>
          <span className="text-[9px] font-mono text-slate-500 dark:text-gray-400 uppercase tracking-widest block mb-0.5">
            VULNERABILITY EXPANSION RATIO
          </span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Exposure Trend Analytics
          </h3>
        </div>

        {/* Timeline selector tabs */}
        <div className="flex gap-1 bg-slate-50 dark:bg-[#0B1220] p-0.5 rounded border border-slate-200 dark:border-gray-850">
          {(["24H", "7D", "30D", "90D"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={cn(
                "text-[9px] font-mono font-black py-0.5 px-1.5 rounded transition-all cursor-pointer",
                timeRange === r
                  ? "bg-slate-200/85 dark:bg-gray-800 font-bold text-slate-900 dark:text-white"
                  : "text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300"
              )}
              id={`trend-tab-${r}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* AreaChart Container */}
      <div className="w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={ANALYTICS_TRENDS[timeRange]}
            margin={{ top: 5, right: 3, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="glowRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="glowBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
              opacity={0.6}
            />
            <XAxis
              dataKey="time"
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 8, fill: "var(--muted-foreground)", fontFamily: "JetBrains Mono" }}
              tickLine={false}
              opacity={0.5}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 8, fill: "var(--muted-foreground)", fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={false}
              opacity={0.5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                borderRadius: "6px"
              }}
              itemStyle={{ fontSize: "10px", fontFamily: "JetBrains Mono", color: "var(--foreground)" }}
              labelStyle={{ fontSize: "9px", color: "var(--muted-foreground)" }}
            />
            <Area
              type="monotone"
              dataKey="totalExposure"
              name="Aggregate Exposure"
              stroke="#EF4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#glowRed)"
            />
            <Area
              type="monotone"
              dataKey="avgRisk"
              name="Mean Risk Score"
              stroke="#38BDF8"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#glowBlue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Custom chart legends */}
      <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 dark:text-gray-500 uppercase mt-2.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 bg-red-500 inline-block text-red-500 shadow-[0_0_5px_red]" />
          <span>AGGREGATE EXPOSURE INDEX</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 bg-blue-400 inline-block" />
          <span>AVERAGE RISK FACTOR</span>
        </div>
      </div>
    </div>
  );
}
