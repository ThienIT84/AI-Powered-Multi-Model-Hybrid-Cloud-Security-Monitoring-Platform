import React, { useMemo, useEffect, useRef } from "react";
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

// Generate circular history queue to render responsive Sparklines of 20 items
function useSparklineHistory(value: number, length = 20) {
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
  const packetSizeHist = useSparklineHistory(avgPacketSize);
  const threatScoreHist = useSparklineHistory(threatScore);
  const countriesHist = useSparklineHistory(activeCountries);

  const formatBandwidth = (val: number) => {
    if (val >= 1024 * 1024) {
      return `${(val / (1024 * 1024)).toFixed(2)} Gbps`;
    }
    if (val >= 1024) {
      return `${(val / 1024).toFixed(1)} Mbps`;
    }
    return `${val.toFixed(1)} Kbps`;
  };

  // Turn numbers into SVG coordinates format
  const getSparklinePath = (points: number[], width = 100, height = 30) => {
    if (points.length < 2) return "";
    const minVal = Math.min(...points);
    const maxVal = Math.max(...points);
    const spread = maxVal - minVal || 1;

    return points
      .map((val, idx) => {
        const x = (idx / (points.length - 1)) * width;
        // Invert y because SVG y goes top-down
        const y = height - ((val - minVal) / spread) * (height * 0.8) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="soc-stats-grid">
      
      {/* 1. LIVE BANDWIDTH */}
      <div 
        id="tile-bandwidth"
        className="relative overflow-hidden bg-card border border-border rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] hover:border-cyan-500 dark:hover:border-cyan-500/50 hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] group"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 pointer-events-none" />
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] font-black tracking-widest text-(--muted-foreground) uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              LIVE BANDWIDTH
            </span>
            <div className="text-xl font-extrabold font-mono text-cyan-600 dark:text-cyan-400 mt-1">
              {formatBandwidth(liveBandwidth)}
            </div>
          </div>
          <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-600 dark:text-cyan-400">
            <Activity className="w-4 h-4 animate-pulse animate-duration-1000" />
          </div>
        </div>

        {/* Mini Sparkline */}
        <div className="flex items-end justify-between mt-3 text-xs">
          <div className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
            ↑ +14.2% <span className="text-[9px] text-(--muted-foreground) font-medium">stability normal</span>
          </div>
          <svg className="w-24 h-8 overflow-visible" viewBox="0 0 100 30">
            <polyline
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.5"
              points={getSparklinePath(bandwidthHist)}
            />
          </svg>
        </div>
      </div>

      {/* 2. ACTIVE CHANNELS */}
      <div 
        id="tile-connections"
        className="relative overflow-hidden bg-card border border-border rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500 dark:hover:border-emerald-500/50 hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] group"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 pointer-events-none" />
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] font-black tracking-widest text-(--muted-foreground) uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ACTIVE CHANNELS
            </span>
            <div className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {totalActiveConnections.toLocaleString()}
            </div>
          </div>
          <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-600 dark:text-emerald-400">
            <Radio className="w-4 h-4 animate-ping" style={{ animationDuration: '4s' }} />
          </div>
        </div>

        {/* Mini Sparkline */}
        <div className="flex items-end justify-between mt-3 text-xs">
          <div className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
            ↑ +4.8% <span className="text-[9px] text-(--muted-foreground) font-medium">cumulative channel flows</span>
          </div>
          <svg className="w-24 h-8 overflow-visible" viewBox="0 0 100 30">
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              points={getSparklinePath(connectionsHist)}
            />
          </svg>
        </div>
      </div>

      {/* 3. PROBABILITY THREAT LEVEL */}
      <div 
        id="tile-threat"
        className={`relative overflow-hidden bg-card border rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] group ${
          threatLevel > 35 
            ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.08)] bg-red-500/5" 
            : "border-border hover:border-amber-500 dark:hover:border-amber-500/50 hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]"
        }`}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 pointer-events-none" />
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] font-black tracking-widest text-(--muted-foreground) uppercase flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${threatLevel > 35 ? "bg-red-500 animate-ping" : "bg-amber-500"}`} />
              PROBABILITY THREAT
            </span>
            <div className={`text-xl font-extrabold font-mono mt-1 ${
              threatLevel > 35 ? "text-red-600 dark:text-red-400 animate-pulse" : "text-amber-650 dark:text-amber-500"
            }`}>
              {threatLevel.toFixed(1)}%
            </div>
          </div>
          <div className={`p-1.5 rounded border ${
            threatLevel > 35 
              ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-450 animate-bounce" 
              : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-500"
          }`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>

        {/* Mini Sparkline */}
        <div className="flex items-end justify-between mt-3 text-xs">
          <div className={`font-mono text-[10px] font-bold ${threatLevel > 35 ? "text-red-500" : "text-amber-500"}`}>
            {threatLevel > 35 ? "↑ RISK ESCALATED" : "↓ -2.4% stabilized ratio"}
          </div>
          <svg className="w-24 h-8 overflow-visible" viewBox="0 0 100 30">
            <polyline
              fill="none"
              stroke={threatLevel > 35 ? "#ef4444" : "#f59e0b"}
              strokeWidth="1.5"
              points={getSparklinePath(threatLevelHist)}
            />
          </svg>
        </div>
      </div>

      {/* 4. SYSTEM ENDPOINTS */}
      <div 
        id="tile-endpoints"
        className="relative overflow-hidden bg-card border border-border rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] hover:border-violet-500 dark:hover:border-violet-500/50 hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] group"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 pointer-events-none" />
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] font-black tracking-widest text-(--muted-foreground) uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              SYSTEM ENDPOINTS
            </span>
            <div className="text-xl font-extrabold font-mono text-violet-600 dark:text-violet-400 mt-1">
              {activeEndpointsCount}
            </div>
          </div>
          <div className="p-1.5 bg-violet-500/10 border border-violet-500/20 rounded text-violet-600 dark:text-violet-400">
            <Terminal className="w-4 h-4" />
          </div>
        </div>

        {/* Mini Sparkline */}
        <div className="flex items-end justify-between mt-3 text-xs">
          <div className="text-violet-600 dark:text-violet-400 font-mono text-[10px] font-bold">
            ↑ unique host entities <span className="text-(--muted-foreground) font-normal">tracked</span>
          </div>
          <svg className="w-24 h-8 overflow-visible" viewBox="0 0 100 30">
            <polyline
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="1.5"
              points={getSparklinePath(endpointsHist)}
            />
          </svg>
        </div>
      </div>

      {/* 5. SUSPICIOUS SESSIONS */}
      <div 
        id="tile-suspicious"
        className="relative overflow-hidden bg-card border border-border rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] hover:border-orange-500 dark:hover:border-orange-500/50 hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(249,115,22,0.15)] group"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 pointer-events-none" />
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] font-black tracking-widest text-(--muted-foreground) uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
              SUSPICIOUS FLOWS
            </span>
            <div className="text-xl font-extrabold font-mono text-orange-600 dark:text-orange-400 mt-1">
              {suspiciousSessions}
            </div>
          </div>
          <div className="p-1.5 bg-orange-500/10 border border-orange-500/20 rounded text-orange-600 dark:text-orange-400">
            <Bug className="w-4 h-4" />
          </div>
        </div>

        {/* Mini Sparkline */}
        <div className="flex items-end justify-between mt-3 text-xs">
          <div className="text-orange-600 dark:text-orange-400 font-mono text-[10px] font-bold">
            {suspiciousSessions > 5 ? "⚠️ WARNING: HIGH RISK" : "✓ safe queue margin"}
          </div>
          <svg className="w-24 h-8 overflow-visible" viewBox="0 0 100 30">
            <polyline
              fill="none"
              stroke="#f97316"
              strokeWidth="1.5"
              points={getSparklinePath(suspiciousHist)}
            />
          </svg>
        </div>
      </div>

      {/* 6. AVG PACKET SIZE */}
      <div 
        id="tile-packet-size"
        className="relative overflow-hidden bg-card border border-border rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] hover:border-sky-500 dark:hover:border-sky-500/50 hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(14,165,233,0.15)] group"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 pointer-events-none" />
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] font-black tracking-widest text-(--muted-foreground) uppercase justify-start flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              AVG PACKET SIZE
            </span>
            <div className="text-xl font-extrabold font-mono text-sky-600 dark:text-sky-400 mt-1">
              {avgPacketSize.toLocaleString()} B
            </div>
          </div>
          <div className="p-1.5 bg-sky-500/10 border border-sky-500/20 rounded text-sky-600 dark:text-sky-400">
            <HardDriveUpload className="w-4 h-4" />
          </div>
        </div>

        {/* Mini Sparkline */}
        <div className="flex items-end justify-between mt-3 text-xs">
          <div className="text-sky-600 dark:text-sky-400 font-mono text-[10px] font-bold">
            {avgPacketSize > 50000 ? "↑ LARGE TRANSFER" : "Normal size envelope"}
          </div>
          <svg className="w-24 h-8 overflow-visible" viewBox="0 0 100 30">
            <polyline
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="1.5"
              points={getSparklinePath(packetSizeHist)}
            />
          </svg>
        </div>
      </div>

      {/* 7. THREAT SCORE */}
      <div 
        id="tile-threat-score"
        className="relative overflow-hidden bg-card border border-border rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] hover:border-rose-500 dark:hover:border-rose-500/50 hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(244,63,94,0.15)] group"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 pointer-events-none" />
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] font-black tracking-widest text-(--muted-foreground) uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              THREAT INDEX
            </span>
            <div className="text-xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-1">
              {threatScore}/100
            </div>
          </div>
          <div className="p-1.5 bg-rose-500/10 border border-rose-500/20 rounded text-rose-600 dark:text-rose-400">
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '60s' }} />
          </div>
        </div>

        {/* Mini Sparkline */}
        <div className="flex items-end justify-between mt-3 text-xs">
          <div className="text-zinc-500 font-mono text-[10px] font-bold">
            {threatScore > 50 ? "⚠️ AGENT INTERVENTION" : "✓ compliant SOC rating"}
          </div>
          <svg className="w-24 h-8 overflow-visible" viewBox="0 0 100 30">
            <polyline
              fill="none"
              stroke="#f43f5e"
              strokeWidth="1.5"
              points={getSparklinePath(threatScoreHist)}
            />
          </svg>
        </div>
      </div>

      {/* 8. ACTIVE COUNTRIES */}
      <div 
        id="tile-countries"
        className="relative overflow-hidden bg-card border border-border rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] hover:border-teal-500 dark:hover:border-teal-500/50 hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(20,184,166,0.15)] group"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 pointer-events-none" />
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] font-black tracking-widest text-(--muted-foreground) uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              THREAT GEOS
            </span>
            <div className="text-xl font-extrabold font-mono text-teal-600 dark:text-teal-400 mt-1">
              {activeCountries} Core Region{activeCountries > 1 ? "s" : ""}
            </div>
          </div>
          <div className="p-1.5 bg-teal-500/10 border border-teal-500/20 rounded text-teal-600 dark:text-teal-400">
            <Globe2 className="w-4 h-4 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
        </div>

        {/* Mini Sparkline */}
        <div className="flex items-end justify-between mt-3 text-xs">
          <div className="text-teal-600 dark:text-teal-400 font-mono text-[10px] font-bold">
            ✓ monitored gateway links
          </div>
          <svg className="w-24 h-8 overflow-visible" viewBox="0 0 100 30">
            <polyline
              fill="none"
              stroke="#14b8a6"
              strokeWidth="1.5"
              points={getSparklinePath(countriesHist)}
            />
          </svg>
        </div>
      </div>

    </div>
  );
});

NetworkStats.displayName = "NetworkStats";
