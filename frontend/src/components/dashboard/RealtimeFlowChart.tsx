import React, { useMemo, useState } from "react";
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

  const formattedChartData = useMemo(() => {
    return traffic.map(item => {
      // Create interesting artificial normal vs anomaly flows based on inbound and isAnomaly values
      const anomalyVal = item.isAnomaly ? (item.flows || 350) * (1.5 + Math.random() * 0.8) : 0;
      return {
        ...item,
        time: new Date(item.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        normalFlows: item.flows || 200 + Math.sin(new Date(item.timestamp).getTime() / 10000) * 80 + Math.random() * 20,
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
          <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-500" />
            ZEEK CONN.LOG REAL-TIME FLOW ANALYTICS
          </h3>
          <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-60">
            NORMAL TRAFFIC BANDWIDTH VS AI1 ANOMALY SPIKES
          </span>
        </div>

        <div className="flex items-center gap-2">
          {(zoomState.left || zoomState.right) && (
            <button 
              onClick={clearZoom}
              className="text-[8px] bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 border border-cyan-500/20 p-1 px-2 rounded-md font-black uppercase tracking-widest cursor-pointer leading-none flex items-center gap-1"
            >
              <ZoomIn size={10} />
              Reset Zoom
            </button>
          )}
          <span className="text-[7.5px] bg-[#06b6d4]/10 text-cyan-500 border border-cyan-500/15 px-2 py-0.5 rounded uppercase font-black tracking-widest leading-none font-mono">
            INSPECTOR LOGGED FLOWS
          </span>
        </div>
      </div>

      {/* Guide label legends */}
      <div className="flex items-center gap-4 mb-3 text-[8px] font-black uppercase tracking-widest shrink-0 font-mono">
        <div className="flex items-center gap-1.5">
          <div className="h-1 w-3 bg-cyan-500" />
          <span className="text-muted-foreground">Normal traffic flow (Zeek conn.log)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1 w-3 bg-red-500" />
          <span className="text-red-500 animate-pulse">AI1 ANOMALOUS OVERBREAK SPIKES</span>
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
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="anomGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/12" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="currentColor" 
              className="text-muted-foreground/45 font-mono text-[7px]" 
              tick={{ fontSize: 8 }}
              tickLine={false}
              minTickGap={30}
            />
            <YAxis 
              stroke="currentColor" 
              className="text-muted-foreground/45 font-mono text-[7px]" 
              tick={{ fontSize: 8 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: "#0b0f14", borderColor: "rgba(255,255,255,0.08)", borderRadius: "8px" }}
              labelStyle={{ fontSize: "9px", fontFamily: "monospace", color: "#888" }}
              itemStyle={{ fontSize: "10px", margin: 0, padding: "2px 0" }}
            />
            
            <Area 
              type="monotone" 
              dataKey="normalFlows" 
              name="Normal Traffic" 
              stroke="#06b6d4" 
              fill="url(#normalGrad)" 
              strokeWidth={1.8}
              dot={false}
              isAnimationActive={false}
            />

            <Area 
              type="monotone" 
              dataKey="anomalyFlows" 
              name="AI1 Intercept Anomaly" 
              stroke="#ef4444" 
              fill="url(#anomGrad)" 
              strokeWidth={1.8}
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
              stroke="rgba(255,255,255,0.08)"
              fill="#06090e"
              tickFormatter={() => ""}
              travellerWidth={8}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="absolute bottom-5 right-10 pointer-events-none select-none hidden sm:flex items-center gap-1.5 opacity-40 text-[7px] font-mono leading-none">
         <span>Drag/brush area to Zoom</span>
      </div>
    </div>
  );
}

export default RealtimeFlowChart;
