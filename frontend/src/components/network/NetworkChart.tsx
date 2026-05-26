import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot
} from "recharts";
import { ChartDataPoint } from "../network/NetworkConfig";

interface NetworkChartProps {
  data: ChartDataPoint[];
}

export const NetworkChart: React.FC<NetworkChartProps> = React.memo(({ data }) => {
  // Find all anomaly points to draw custom alert vectors safely
  const anomalyPoints = useMemo(() => {
    return data
      .map((d, index) => ({ ...d, index }))
      .filter((d) => d.isAnomaly);
  }, [data]);

  // Formats bytes count cleanly for display inside tooltip chart legends
  const formatBandwidthMetric = (val: number) => {
    if (val >= 1024) return `${(val / 1024).toFixed(1)} MB/s`;
    return `${val} KB/s`;
  };

  return (
    <div 
      className="w-full h-85 bg-card border border-border rounded-lg p-4 flex flex-col justify-between shadow-sm relative overflow-hidden" 
      id="network-chart-container"
    >
      {/* Visual background scanning overlays */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-cyan-500/[0.012] to-transparent pointer-events-none animate-pulse" />
      
      {/* Chart Headers */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 z-10 relative">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
          <h2 className="text-xs font-black text-foreground dark:text-cyan-400 tracking-widest uppercase font-mono">
            COGNITIVE REAL-TIME TELEMETRY STREAM
          </h2>
        </div>

        {/* Legend block */}
        <div className="flex items-center gap-4 text-[10px] font-mono whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-cyan-500/30 border border-cyan-500" />
            <span className="text-muted-foreground font-bold">Active Flows (Ch)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-500 block" />
            <span className="text-muted-foreground font-bold">Bandwidth (KB/s)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping block" />
            <span className="text-red-500 dark:text-red-400 font-black">Anomaly Critical Point</span>
          </div>
        </div>
      </div>

      {/* Target Chart Container */}
      <div className="flex-1 w-full min-h-55 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="cyberAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="2 3"
              stroke="rgba(148, 163, 184, 0.12)"
              vertical={false}
            />

            <XAxis
              dataKey="timeLabel"
              stroke="#94a3b8"
              fontSize={9}
              fontFamily="monospace"
              tickLine={false}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }}
              dy={8}
            />

            <YAxis
              stroke="#94a3b8"
              fontSize={9}
              fontFamily="monospace"
              tickLine={false}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }}
              dx={-5}
              domain={[0, "auto"]}
            />

            {/* Custom Cyberpunk Tooltip */}
            <Tooltip
              cursor={{ stroke: "rgba(6, 182, 212, 0.3)", strokeWidth: 1.5, strokeDasharray: "4 4" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const dp = payload[0].payload as ChartDataPoint;
                  return (
                    <div className="bg-card border border-border p-3 rounded-lg shadow-xl font-mono text-[10px] text-foreground min-w-50">
                      <div className="text-muted-foreground pb-1.5 border-b border-border flex justify-between items-center">
                        <span>TIMESTAMP:</span>
                        <span className="text-cyan-600 dark:text-cyan-400 font-bold">{dp.timeLabel}</span>
                      </div>
                      
                      <div className="space-y-1.5 mt-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">Active Flows:</span>
                          <span className="text-cyan-600 dark:text-cyan-455 font-black">{dp.flows} channels</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">Bandwidth Speed:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatBandwidthMetric(dp.bandwidth)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">Anomaly Probability:</span>
                          <span className={`font-bold ${dp.anomalyScore > 50 ? "text-red-500" : "text-amber-500"}`}>
                            {dp.anomalyScore}%
                          </span>
                        </div>
                      </div>

                      {dp.isAnomaly && (
                        <div className="mt-2.5 pt-2 border-t border-red-500/20 text-red-500 font-black flex items-center gap-1.5 uppercase tracking-wide text-[9px] animate-pulse">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                          SIEM FLAGGED: {dp.eventAnnotation || "SUSPICIOUS ACTIVITY"}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Flow representation metric Area */}
            <Area
              type="monotone"
              dataKey="flows"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#cyberAreaGradient)"
              activeDot={{ r: 4, strokeWidth: 0, fill: "#06b6d4" }}
            />

            {/* Micro bandwidth line */}
            <Line
              type="monotone"
              dataKey="bandwidth"
              stroke="#10b981"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, stroke: "#10b981" }}
            />

            {/* Draw red circles on all Anomaly coordinate points indices */}
            {anomalyPoints.map((point) => (
              <ReferenceDot
                key={`anomaly-dot-${point.timeLabel}-${point.index}`}
                x={point.timeLabel}
                y={point.flows}
                r={6}
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth={1.5}
                className="animate-ping"
                style={{ transformOrigin: 'center' }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

NetworkChart.displayName = "NetworkChart";
