import React, { useMemo, useState, useEffect } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Brush,
  ReferenceArea
} from "recharts";
import { TrafficData } from "../../types";
import { cn } from "../../lib/utils";
import { Activity, ShieldAlert, Sparkles, Filter, ZoomIn, RefreshCw } from "lucide-react";

interface RealtimeFlowChartProps {
  traffic: TrafficData[];
}

export function RealtimeFlowChart({ traffic = [] }: RealtimeFlowChartProps) {
  const [zoomState, setZoomState] = useState<{ left?: any; right?: any; refAreaLeft?: any; refAreaRight?: any }>({});
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const formattedChartData = useMemo(() => {
    return traffic.map(item => {
      const observedFlows = item.flows || item.inbound + item.outbound;
      const anomalyVal = item.isAnomaly ? item.anomalies || observedFlows : 0;
      return {
        ...item,
        time: new Date(item.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        normalFlows: Math.max(0, observedFlows - anomalyVal),
        anomalyFlows: anomalyVal
      };
    });
  }, [traffic]);

  const handleZoom = () => {
    let { refAreaLeft, refAreaRight } = zoomState;
    if (refAreaLeft === refAreaRight || !refAreaRight) {
      setZoomState({});
      return;
    }

    // Sort index
    if (refAreaLeft > refAreaRight) {
      const temp = refAreaLeft;
      refAreaLeft = refAreaRight;
      refAreaRight = temp;
    }

    setZoomState({
      left: refAreaLeft,
      right: refAreaRight,
      refAreaLeft: null,
      refAreaRight: null
    });
  };

  const clearZoom = () => {
    setZoomState({});
  };

  const filteredData = useMemo(() => {
    const { left, right } = zoomState;
    if (!left || !right) return formattedChartData;

    const leftIdx = formattedChartData.findIndex(item => item.time === left);
    const rightIdx = formattedChartData.findIndex(item => item.time === right);

    if (leftIdx === -1 || rightIdx === -1) return formattedChartData;

    return formattedChartData.slice(
      Math.min(leftIdx, rightIdx),
      Math.max(leftIdx, rightIdx) + 1
    );
  }, [formattedChartData, zoomState]);

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm h-100 select-none relative">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex flex-col">
          <h3 className="text-[10px] font-extrabold text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            ZEEK CONN.LOG REAL-TIME FLOW ANALYTICS
          </h3>
          <span className="text-[8px] text-muted-foreground font-extrabold uppercase tracking-widest mt-1 opacity-80">
            NORMAL TRAFFIC BANDWIDTH VS AI1 ANOMALY SPIKES
          </span>
        </div>

        <div className="flex items-center gap-2">
          {(zoomState.left || zoomState.right) && (
            <button 
              onClick={clearZoom}
              className="text-[8px] bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 p-1 px-2 rounded-md font-extrabold uppercase tracking-widest cursor-pointer leading-none flex items-center gap-1"
            >
              <ZoomIn size={10} />
              Reset Zoom
            </button>
          )}
          <span className="text-[7.5px] bg-cyan-500/10 dark:bg-[#06b6d4]/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/15 dark:border-cyan-500/15 px-2 py-0.5 rounded uppercase font-extrabold tracking-widest leading-none font-mono">
            INSPECTOR LOGGED FLOWS
          </span>
        </div>
      </div>

      {/* Guide label legends */}
      <div className="flex items-center gap-4 mb-3 text-[8px] font-extrabold uppercase tracking-widest shrink-0 font-mono">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-3 bg-cyan-500 rounded" />
          <span className="text-muted-foreground font-extrabold">Normal traffic flow (Zeek conn.log)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-3 bg-red-500 rounded animate-pulse" />
          <span className="text-red-505 dark:text-red-500 font-extrabold animate-pulse">AI1 ANOMALOUS OVERBREAK SPIKES</span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={filteredData}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            onMouseDown={(e: any) => e && setZoomState(prev => ({ ...prev, refAreaLeft: e.activeLabel }))}
            onMouseMove={(e: any) => zoomState.refAreaLeft && e && setZoomState(prev => ({ ...prev, refAreaRight: e.activeLabel }))}
            onMouseUp={handleZoom}
          >
            <defs>
              <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="anomGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.45}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/12" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="currentColor" 
              className="text-muted-foreground/50 font-mono text-[7px]" 
              tick={{ fontSize: 8, fontWeight: "bold" }}
              tickLine={false}
              minTickGap={30}
            />
            <YAxis 
              stroke="currentColor" 
              className="text-muted-foreground/50 font-mono text-[7px]" 
              tick={{ fontSize: 8, fontWeight: "bold" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDark ? "#0d1117" : "#ffffff",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
              }}
              labelStyle={{ fontSize: "9px", fontFamily: "monospace", color: isDark ? "#94a3b8" : "#64748b", fontWeight: "bold" }}
              itemStyle={{ fontSize: "10px", margin: 0, padding: "2px 0", fontWeight: "bold" }}
            />
            
            <Area 
              type="monotone" 
              dataKey="normalFlows" 
              name="Normal Traffic" 
              stroke="#06b6d4" 
              fill="url(#normalGrad)" 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />

            <Area 
              type="monotone" 
              dataKey="anomalyFlows" 
              name="AI1 Intercept Anomaly" 
              stroke="#ef4444" 
              fill="url(#anomGrad)" 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />

            {zoomState.refAreaLeft && zoomState.refAreaRight && (
              <ReferenceArea {...{ x1: zoomState.refAreaLeft, x2: zoomState.refAreaRight, fill: "#06b6d4", fillOpacity: 0.15 } as any} />
            )}

            <Brush 
              dataKey="time" 
              height={18} 
              stroke={isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}
              fill={isDark ? "#06090e" : "#f8fafc"}
              tickFormatter={() => ""}
              travellerWidth={8}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="absolute bottom-5 right-10 pointer-events-none select-none hidden sm:flex items-center gap-1.5 opacity-60 text-[7px] font-mono leading-none">
         <span className="font-bold">Drag/brush area to Zoom</span>
      </div>
    </div>
  );
}

export default RealtimeFlowChart;
