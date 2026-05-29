import React, { useMemo, useState } from "react";
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
import { cn } from "../../lib/utils";

interface NetworkChartProps {
  data: ChartDataPoint[];
}

export const NetworkChart: React.FC<NetworkChartProps> = React.memo(({ data }) => {
  // Chart local interactive state
  const [timeRange, setTimeRange] = useState<"5m" | "15m" | "1h" | "6h" | "24h">("5m");
  const [showActiveFleet, setShowActiveFleet] = useState(true);
  const [showBandwidth, setShowBandwidth] = useState(true);
  const [showAnomalies, setShowAnomalies] = useState(true);

  // Filter or slice the data depending on time range to simulate real data retrieval
  const processedData = useMemo(() => {
    switch (timeRange) {
      case "5m":
        return data.slice(-12); // Last 12 ticks
      case "15m":
        return data.slice(-18); // Last 18 ticks
      case "1h":
        return data.slice(-24); // Last 24 ticks
      default:
        return data; // All standard simulated points
    }
  }, [data, timeRange]);

  // Find anomaly points for markers
  const anomalyPoints = useMemo(() => {
    return processedData
      .map((d, index) => ({ ...d, index }))
      .filter((d) => d.isAnomaly);
  }, [processedData]);

  const formatBandwidthMetric = (val: number) => {
    if (val >= 1024) return `${(val / 1024).toFixed(1)} MB/s`;
    return `${val} KB/s`;
  };

  return (
    <div 
      className="w-full h-85 bg-card border border-border rounded-lg p-3.5 flex flex-col justify-between shadow-xs relative overflow-hidden" 
      id="network-chart-container"
    >
      {/* Visual background scanning overlays */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-emerald-500/0.5 to-transparent pointer-events-none" />
      
      {/* Chart Headers */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 z-10 relative">
        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <h2 className="text-[10px] font-black text-foreground dark:text-emerald-400 tracking-widest uppercase font-mono">
            COGNITIVE REAL-TIME TELEMETRY STREAM
          </h2>
        </div>

        {/* Dropdowns & Active Toggles */}
        <div className="flex items-center gap-2.5">
          {/* Controls indicators acting as filters */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[8px] tracking-wider uppercase font-black">
            <button
              onClick={() => setShowActiveFleet(!showActiveFleet)}
              className={cn(
                "px-2 py-0.5 border rounded-sm transition-all cursor-pointer",
                showActiveFleet 
                  ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-500" 
                  : "bg-muted border-border text-muted-foreground/60"
              )}
            >
              Active Fleet
            </button>
            <button
              onClick={() => setShowBandwidth(!showBandwidth)}
              className={cn(
                "px-2 py-0.5 border rounded-sm transition-all cursor-pointer",
                showBandwidth 
                  ? "bg-emerald-505/10 border-emerald-500/40 text-emerald-505" 
                  : "bg-muted border-border text-muted-foreground/60"
              )}
            >
              Bandwidth
            </button>
            <button
              onClick={() => setShowAnomalies(!showAnomalies)}
              className={cn(
                "px-2 py-0.5 border rounded-sm transition-all cursor-pointer",
                showAnomalies 
                  ? "bg-red-500/10 border-red-500/40 text-red-500" 
                  : "bg-muted border-border text-muted-foreground/60"
              )}
            >
              Anomaly Point
            </button>
          </div>

          {/* Time range controller dropdown */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-background border border-border text-[9px] font-bold py-0.5 px-1.5 rounded focus:outline-none focus:border-cyan-500 text-foreground font-mono cursor-pointer"
          >
            <option value="5m">5m GRID</option>
            <option value="15m">15m GRID</option>
            <option value="1h">1h TELEMETRY</option>
            <option value="6h">6h TELEMETRY</option>
            <option value="24h">24h BATCH</option>
          </select>
        </div>
      </div>

      {/* Target Chart Container */}
      <div className="flex-1 w-full min-h-55 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={processedData}
            margin={{ top: 10, right: 5, left: -32, bottom: 0 }}
          >
            <defs>
              <linearGradient id="cyberAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            {/* Incredibly light grid for pure visual clean dashboard */}
            <CartesianGrid
              strokeDasharray="2 3"
              stroke="rgba(148, 163, 184, 0.05)"
              vertical={false}
            />

            <XAxis
              dataKey="timeLabel"
              stroke="#64748b"
              fontSize={9}
              fontFamily="monospace"
              tickLine={false}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.1)" }}
              dy={5}
            />

            <YAxis
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.1)" }}
              dx={-2}
              domain={[0, "auto"]}
            />

            {/* Custom Cyberpunk Tooltip */}
            <Tooltip
              cursor={{ stroke: "rgba(16, 185, 129, 0.2)", strokeWidth: 1, strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const dp = payload[0].payload as ChartDataPoint;
                  return (
                    <div className="bg-card border border-border p-2.5 rounded shadow-lg font-mono text-[9px] text-foreground min-w-45">
                      <div className="text-muted-foreground pb-1 flex justify-between items-center border-b border-border/40">
                        <span>SYS_TIME:</span>
                        <span className="text-emerald-500 font-bold">{dp.timeLabel}</span>
                      </div>
                      
                      <div className="space-y-1 mt-1.5 uppercase font-black text-muted-foreground/95">
                        <div className="flex justify-between">
                          <span>Active Flows:</span>
                          <span className="text-foreground">{dp.flows} CH</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bandwidth Speed:</span>
                          <span className="text-emerald-500">{formatBandwidthMetric(dp.bandwidth)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Anomaly Metric:</span>
                          <span className={cn(
                            "font-black",
                            dp.anomalyScore > 50 ? "text-red-500" : "text-amber-500"
                          )}>
                            {dp.anomalyScore}%
                          </span>
                        </div>
                      </div>

                      {dp.isAnomaly && (
                        <div className="mt-1.5 pt-1.5 border-t border-red-500/10 text-red-500 font-black flex items-center gap-1 uppercase tracking-wide text-[8px]">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                          SIEM THREAT: {dp.eventAnnotation || "SUSPICIOUS STREAM"}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Custom Telemetry Green Area Stream */}
            {showActiveFleet && (
              <Area
                type="monotone"
                dataKey="flows"
                stroke="#10b981"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#cyberAreaGradient)"
                activeDot={{ r: 3, strokeWidth: 0, fill: "#10b981" }}
              />
            )}

            {/* Micro bandwidth line with subtle glow */}
            {showBandwidth && (
              <Line
                type="monotone"
                dataKey="bandwidth"
                stroke="#10b981"
                strokeWidth={1.2}
                dot={false}
                activeDot={{ r: 2.5, stroke: "#10b981" }}
              />
            )}

            {/* Draw red reference dot markers on Anomaly coordinates if showAnomalies is active */}
            {showAnomalies && anomalyPoints.map((point) => (
              <ReferenceDot
                key={`anomaly-dot-${point.timeLabel}-${point.index}`}
                x={point.timeLabel}
                y={point.flows}
                r={4}
                fill="#f43f5e"
                stroke="#ffffff"
                strokeWidth={1}
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
