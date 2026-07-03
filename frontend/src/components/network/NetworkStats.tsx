import React, { useMemo, useRef } from "react";
import { 
  Activity, 
  Radio, 
  ShieldAlert, 
  Terminal, 
  Bug, 
  HardDriveUpload, 
  Compass, 
  Globe2 
} from "lucide-react";

interface NetworkStatsProps {
  liveBandwidth: number;
  totalActiveConnections: number;
  threatLevel: number; // percentage
  activeEndpointsCount: number;
  suspiciousSessions: number;
  avgPacketSize: number;
  threatScore: number;
  activeCountries?: number;
}

// Generate circular history queue to render responsive Sparklines of 15 items
function useSparklineHistory(value: number, length = 15) {
  const historyRef = useRef<number[]>([]);
  
  if (historyRef.current.length === 0) {
    historyRef.current = Array(length).fill(value);
  } else {
    historyRef.current = [...historyRef.current.slice(1), value];
  }
  
  return historyRef.current;
}

export const NetworkStats: React.FC<NetworkStatsProps> = React.memo(({
  liveBandwidth,
  totalActiveConnections,
  threatLevel,
  activeEndpointsCount,
  suspiciousSessions,
  avgPacketSize,
  threatScore,
  activeCountries = 1
}) => {
  // Setup historical arrays for SVG sparklines
  const bandwidthHist = useSparklineHistory(liveBandwidth);
  const connectionsHist = useSparklineHistory(totalActiveConnections);
  const threatLevelHist = useSparklineHistory(threatLevel);
  const endpointsHist = useSparklineHistory(activeEndpointsCount);
  const suspiciousHist = useSparklineHistory(suspiciousSessions);
  const packetSizeHist = useSparklineHistory(avgPacketSize / 1024); // in KB
  const threatScoreHist = useSparklineHistory(threatScore);
  const countriesHist = useSparklineHistory(activeCountries);

  const formatBandwidth = (val: number) => {
    if (val >= 1024) {
      return `${(val / 1024).toFixed(1)} Mbps`;
    }
    return `${val.toFixed(1)} Kbps`;
  };

  // Turn numbers into SVG coordinates format
  const getSparklinePath = (points: number[], width = 80, height = 20) => {
    if (points.length < 2) return "";
    const minVal = Math.min(...points);
    const maxVal = Math.max(...points);
    const spread = maxVal - minVal || 1;

    return points
      .map((val, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - ((val - minVal) / spread) * (height * 0.7) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3" id="soc-stats-grid">
      
      {/* 1. LIVE BANDWIDTH */}
      <div 
        id="tile-bandwidth"
        className="relative overflow-hidden bg-card border border-border rounded-lg p-3 transition-all duration-200 hover:border-cyan-500/50 hover:shadow-xs group"
      >
        <span className="text-[8.5px] font-black tracking-widest text-muted-foreground uppercase flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          LIVE BANDWIDTH
        </span>
        <div className="text-sm font-black font-mono text-cyan-600 dark:text-cyan-400 mt-1">
          {formatBandwidth(liveBandwidth)}
        </div>
        <div className="flex items-end justify-between mt-2.5">
          <span className="text-emerald-500 font-mono text-[7.5px] font-bold">
            ↑ +14.2% <span className="opacity-60 text-muted-foreground">FLX</span>
          </span>
          <svg className="w-14 h-5 overflow-visible" viewBox="0 0 80 20">
            <polyline
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.2"
              points={getSparklinePath(bandwidthHist)}
            />
          </svg>
        </div>
      </div>

      {/* 2. ACTIVE CHANNELS */}
      <div 
        id="tile-connections"
        className="relative overflow-hidden bg-card border border-border rounded-lg p-3 transition-all duration-200 hover:border-emerald-500/50 hover:shadow-xs group"
      >
        <span className="text-[8.5px] font-black tracking-widest text-muted-foreground uppercase flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          ACTIVE CHANNELS
        </span>
        <div className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
          {totalActiveConnections.toLocaleString()}
        </div>
        <div className="flex items-end justify-between mt-2.5">
          <span className="text-emerald-500 font-mono text-[7.5px] font-bold">
            ↑ +4.8% <span className="opacity-60 text-muted-foreground">CON</span>
          </span>
          <svg className="w-14 h-5 overflow-visible" viewBox="0 0 80 20">
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="1.2"
              points={getSparklinePath(connectionsHist)}
            />
          </svg>
        </div>
      </div>

      {/* 3. PROBABILITY THREAT LEVEL */}
      <div 
        id="tile-threat"
        className={`relative overflow-hidden bg-card border rounded-lg p-3 transition-all duration-200 group ${
          threatLevel > 35 
            ? "border-red-500/60 bg-red-500/2" 
            : "border-border hover:border-amber-500/50"
        }`}
      >
        <span className="text-[8.5px] font-black tracking-widest text-muted-foreground uppercase flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${threatLevel > 35 ? "bg-red-500 animate-ping" : "bg-amber-500"}`} />
          PROB THREAT
        </span>
        <div className={`text-sm font-black font-mono mt-1 ${
          threatLevel > 35 ? "text-red-500 animate-pulse" : "text-amber-500"
        }`}>
          {threatLevel.toFixed(1)}%
        </div>
        <div className="flex items-end justify-between mt-2.5">
          <span className={`font-mono text-[7.5px] font-bold ${threatLevel > 35 ? "text-red-500" : "text-amber-505"}`}>
            {threatLevel > 35 ? "↑ HIGH" : "↓ -2.4%"}
          </span>
          <svg className="w-14 h-5 overflow-visible" viewBox="0 0 80 20">
            <polyline
              fill="none"
              stroke={threatLevel > 35 ? "#f43f5e" : "#eab308"}
              strokeWidth="1.2"
              points={getSparklinePath(threatLevelHist)}
            />
          </svg>
        </div>
      </div>

      {/* 4. SYSTEM ENDPOINTS */}
      <div 
        id="tile-endpoints"
        className="relative overflow-hidden bg-card border border-border rounded-lg p-3 transition-all duration-200 hover:border-violet-500/50 hover:shadow-xs group"
      >
        <span className="text-[8.5px] font-black tracking-widest text-muted-foreground uppercase flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
          SYS ENDPOINTS
        </span>
        <div className="text-sm font-black font-mono text-violet-600 dark:text-violet-400 mt-1">
          {activeEndpointsCount}
        </div>
        <div className="flex items-end justify-between mt-2.5">
          <span className="text-violet-500 font-mono text-[7.5px] font-bold">
            TRACKING <span className="opacity-60 text-muted-foreground">EP</span>
          </span>
          <svg className="w-14 h-5 overflow-visible" viewBox="0 0 80 20">
            <polyline
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="1.2"
              points={getSparklinePath(endpointsHist)}
            />
          </svg>
        </div>
      </div>

      {/* 5. SUSPICIOUS FLOWS */}
      <div 
        id="tile-suspicious"
        className={`relative overflow-hidden bg-card border rounded-lg p-3 transition-all duration-200 group ${
          suspiciousSessions > 0 
            ? "border-orange-500/60 bg-orange-500/[2" 
            : "border-border hover:border-orange-500/50"
        }`}
      >
        <span className="text-[8.5px] font-black tracking-widest text-muted-foreground uppercase flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${suspiciousSessions > 0 ? "bg-orange-500 animate-ping" : "bg-neutral-500"}`} />
          SUSPICIOUS FLOWS
        </span>
        <div className={`text-sm font-black font-mono mt-1 ${
          suspiciousSessions > 0 ? "text-orange-500" : "text-foreground"
        }`}>
          {suspiciousSessions}
        </div>
        <div className="flex items-end justify-between mt-2.5">
          <span className={`font-mono text-[7.5px] font-bold ${suspiciousSessions > 0 ? "text-orange-500" : "text-muted-foreground"}`}>
            {suspiciousSessions > 0 ? "⚠️ ALERT" : "✓ SAFE"}
          </span>
          <svg className="w-14 h-5 overflow-visible" viewBox="0 0 80 20">
            <polyline
              fill="none"
              stroke="#f97316"
              strokeWidth="1.2"
              points={getSparklinePath(suspiciousHist)}
            />
          </svg>
        </div>
      </div>

      {/* 6. AVG PACKET SIZE */}
      <div 
        id="tile-packet-size"
        className="relative overflow-hidden bg-card border border-border rounded-lg p-3 transition-all duration-200 hover:border-sky-500/50 hover:shadow-xs group"
      >
        <span className="text-[8.5px] font-black tracking-widest text-muted-foreground uppercase flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          AVG PACKET SIZE
        </span>
        <div className="text-sm font-black font-mono text-sky-600 dark:text-sky-400 mt-1">
          {avgPacketSize.toLocaleString()} B
        </div>
        <div className="flex items-end justify-between mt-2.5">
          <span className="text-sky-500 font-mono text-[7.5px] font-bold">
            SIZE <span className="opacity-60 text-muted-foreground">ENV</span>
          </span>
          <svg className="w-14 h-5 overflow-visible" viewBox="0 0 80 20">
            <polyline
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="1.2"
              points={getSparklinePath(packetSizeHist)}
            />
          </svg>
        </div>
      </div>

      {/* 7. THREAT INDEX */}
      <div 
        id="tile-threat-score"
        className="relative overflow-hidden bg-card border border-border rounded-lg p-3 transition-all duration-200 hover:border-rose-500/50 hover:shadow-xs group"
      >
        <span className="text-[8.5px] font-black tracking-widest text-muted-foreground uppercase flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          THREAT INDEX
        </span>
        <div className="text-sm font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
          {threatScore}/100
        </div>
        <div className="flex items-end justify-between mt-2.5">
          <span className="text-rose-500 font-mono text-[7.5px] font-bold">
            {threatScore > 50 ? "⚠️ HEURISTIC" : "✓ OK"}
          </span>
          <svg className="w-14 h-5 overflow-visible" viewBox="0 0 80 20">
            <polyline
              fill="none"
              stroke="#f43f5e"
              strokeWidth="1.2"
              points={getSparklinePath(threatScoreHist)}
            />
          </svg>
        </div>
      </div>

      {/* 8. THREAT GEOS */}
      <div 
        id="tile-countries"
        className="relative overflow-hidden bg-card border border-border rounded-lg p-3 transition-all duration-200 hover:border-teal-500/50 hover:shadow-xs group"
      >
        <span className="text-[8.5px] font-black tracking-widest text-muted-foreground uppercase flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          THREAT GEOS
        </span>
        <div className="text-sm font-black font-mono text-teal-600 dark:text-teal-400 mt-1">
          {activeCountries} Region{activeCountries > 1 ? "s" : ""}
        </div>
        <div className="flex items-end justify-between mt-2.5">
          <span className="text-teal-500 font-mono text-[7.5px] font-bold">
            LINKED <span className="opacity-60 text-muted-foreground">GEOS</span>
          </span>
          <svg className="w-14 h-5 overflow-visible" viewBox="0 0 80 20">
            <polyline
              fill="none"
              stroke="#14b8a6"
              strokeWidth="1.2"
              points={getSparklinePath(countriesHist)}
            />
          </svg>
        </div>
      </div>

    </div>
  );
});

NetworkStats.displayName = "NetworkStats";
