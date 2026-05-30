import React from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { TrafficData, Alert } from "../../types";
import { cn } from "../../lib/utils";
import { 
  Brain, 
  ChevronDown, 
  TrendingUp, 
  ShieldAlert, 
  Terminal, 
  Globe, 
  Search, 
  Lock, 
  Cpu, 
  Eye, 
  Zap,
  Activity
} from "lucide-react";
import { getCachedAttackTheme } from "../../utils/attackColors";
import { motion, AnimatePresence } from "motion/react";

interface AnalyticsZoneProps {
  traffic: TrafficData[];
  alerts: Alert[];
  selectedAlert?: Alert | null;
  onSelectAlert?: (alert: Alert | null) => void;
  isDarkMode?: boolean;
  disabledAttackTypes: string[];
  onToggleAttackType: (typeName: string) => void;
}

export function AnalyticsZone({ 
  traffic = [], 
  alerts = [], 
  isDarkMode = true,
  disabledAttackTypes = [],
  onToggleAttackType
}: AnalyticsZoneProps) {
  const [selectedChartAttackFilter, setSelectedChartAttackFilter] = React.useState<string>("ALL");
  const [timeRange, setTimeRange] = React.useState<string>("24h");
  const [feedExpanded, setFeedExpanded] = React.useState<boolean>(true);
  const [hoveredSlice, setHoveredSlice] = React.useState<any | null>(null);

  // Attack categories matching the enriched backend alerts
  const knownAttackTypes = [
    "DDoS", "SQL Injection", "XSS", "Brute Force", "Port Scan", 
    "LFI", "Command Injection", "Beaconing", "Botnet Activity", "Credential Stuffing"
  ];

  // Helper matching alert to chart datapoint for contextual intelligence
  const matchAlertForPoint = React.useCallback((timestamp: string) => {
    const ptTime = new Date(timestamp).getTime();
    return alerts.find(a => {
      const alertTime = new Date(a.timestamp).getTime();
      return Math.abs(alertTime - ptTime) < 5000;
    });
  }, [alerts]);

  // Determine active dynamic time window boundaries based on latest traffic timestamp
  const latestTime = React.useMemo(() => {
    if (traffic && traffic.length > 0) {
      return Math.max(...traffic.map(t => new Date(t.timestamp).getTime()));
    }
    return Date.now();
  }, [traffic]);

  const durationMs = React.useMemo(() => {
    switch (timeRange) {
      case "5m": return 5 * 60 * 1000;
      case "15m": return 15 * 60 * 1000;
      case "1h": return 1 * 60 * 60 * 1000;
      case "6h": return 6 * 60 * 60 * 1000;
      case "24h":
      default: return 24 * 60 * 60 * 1000;
    }
  }, [timeRange]);

  // Dynamically filter alerts according to chosen time windows
  const filteredAlertsByTime = React.useMemo(() => {
    if (timeRange === "24h") return alerts;
    return alerts.filter(alert => {
      const timeDiff = latestTime - new Date(alert.timestamp).getTime();
      return timeDiff <= durationMs;
    });
  }, [alerts, timeRange, latestTime, durationMs]);

  // Dynamically filter traffic bandwidth records according to chosen time windows
  const filteredTrafficByTime = React.useMemo(() => {
    if (timeRange === "24h") return traffic;
    const filtered = traffic.filter(item => {
      const timeDiff = latestTime - new Date(item.timestamp).getTime();
      return timeDiff <= durationMs;
    });
    // Fallback if data just started populating
    return filtered.length > 3 ? filtered : traffic.slice(-15);
  }, [traffic, timeRange, latestTime, durationMs]);

  // Calculated attack statistics for Donut chart and list feeds based on time-filtered alerts
  const threatData = React.useMemo(() => {
    const counts: Record<string, number> = {};

    // Initialize all known attack types to ensure high dense visibility
    knownAttackTypes.forEach(t => {
      counts[t] = 0;
    });

    // Populate actual counts from time-filtered alerts
    filteredAlertsByTime.forEach(alert => {
      counts[alert.attackType] = (counts[alert.attackType] || 0) + 1;
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    return Object.entries(counts).map(([name, value]) => {
      const theme = getCachedAttackTheme(name, isDarkMode);
      
      const matchingAlerts = filteredAlertsByTime.filter(a => a.attackType === name);
      const avgConfidence = matchingAlerts.length > 0 
        ? matchingAlerts.reduce((sum, a) => sum + (a.confidenceScore || 0), 0) / matchingAlerts.length 
        : (0.7 + (name.charCodeAt(0) % 25) / 100); // Standardized baseline for display

      return {
        name,
        value,
        color: theme.primary,
        theme,
        percentage: total > 0 ? `${((value / total) * 100).toFixed(0)}%` : "0%",
        avgConfidence,
        disabled: disabledAttackTypes.includes(name)
      };
    }).sort((a, b) => b.value - a.value);
  }, [filteredAlertsByTime, disabledAttackTypes, isDarkMode]);

  const filteredThreatData = React.useMemo(() => {
    const total = threatData.reduce((sum, item) => sum + (item.disabled ? 0 : item.value), 0);
    
    // If absolutely everything is disabled, render all with equal small values
    if (total === 0) {
      return threatData.map(item => ({
        ...item,
        value: 1,
        disabled: true
      }));
    }

    return threatData.map(item => {
      if (item.disabled) {
        // Shrunk to a tiny visual placeholder slice so it stays visible on the ring in low opacity!
        return {
          ...item,
          value: Math.max(0.12, total * 0.012)
        };
      }
      return item;
    });
  }, [threatData]);

  const totalVisible = React.useMemo(() => {
    return threatData.filter(d => !d.disabled).reduce((acc, curr) => acc + curr.value, 0);
  }, [threatData]);

  // Map real-time traffic graph details
  const chartData = React.useMemo(() => {
    const rawData = filteredTrafficByTime;
    
    return rawData.map(d => {
      const matchedAlert = matchAlertForPoint(d.timestamp);
      const isFilteredOut = matchedAlert && disabledAttackTypes.includes(matchedAlert.attackType);
      
      return {
        ...d,
        isAnomaly: isFilteredOut ? false : d.isAnomaly,
        isPeak: isFilteredOut ? false : d.isPeak,
        formattedTime: new Date(d.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit', 
          hour12: false 
        })
      };
    });
  }, [filteredTrafficByTime, matchAlertForPoint, disabledAttackTypes]);

  // Chart Tooltip component
  const CustomTooltipContent = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const matchedAlert = matchAlertForPoint(dataPoint.timestamp);
      
      const timeStr = new Date(dataPoint.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: false 
      });

      const trafficVal = payload[0].value.toFixed(1);
      const isAnomaly = dataPoint.isAnomaly;
      const confidence = matchedAlert ? matchedAlert.confidenceScore : 0.05;
      const anomalyScore = isAnomaly ? (confidence * 100).toFixed(0) + "%" : "0.5%";
      const attackType = isAnomaly ? (matchedAlert?.attackType || "Anomaly detected") : null;

      return (
        <div className="bg-card/95 border border-border p-3 rounded-xl shadow-xl backdrop-blur-xl max-w-52.5 select-none text-[10px]">
          <div className="flex items-center gap-2 mb-2 border-b border-border/40 pb-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
             <p className="font-mono font-bold text-foreground">{timeStr}</p>
          </div>
          <div className="space-y-1.5 font-bold">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground uppercase tracking-wider text-[8px]">Bandwidth:</span>
              <span className="text-cyan-500 font-mono">{trafficVal} Gbps</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground uppercase tracking-wider text-[8px]">Anomaly Index:</span>
              <span className={cn("font-mono", isAnomaly ? "text-red-500 animate-pulse" : "text-emerald-500")}>{anomalyScore}</span>
            </div>
            {attackType && (
              <div className="pt-1.5 border-t border-border/20 mt-1 flex flex-col gap-0.5">
                <span className="text-red-500 uppercase tracking-widest text-[7px]">ATTACK INTERCEPT:</span>
                <span className="text-foreground text-[10px] bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded mt-0.5 w-fit uppercase font-mono tracking-tight">{attackType}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-4 select-none">
      
      {/* REAL-TIME AI SECURITY EVENTS CHART (Left Column - 8 cols) */}
      <div className="xl:col-span-8 bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm min-h-110 max-h-110">
        
        {/* Chart Header Toolbar */}
        <div className="flex items-center justify-between mb-2 shrink-0">
          <div className="flex flex-col">
            <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-500" />
              REAL-TIME SECURITY TRAFFIC BANDWIDTH
            </h3>
            <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-1 opacity-60">Anomaly Spikes Highlighted</span>
          </div>

          <div className="flex items-center gap-4">
            {/* TIME DROPDOWN - Compact & responsive */}
            <div className="flex items-center gap-1.5">
              <span className="text-[8.5px] font-black text-muted-foreground uppercase tracking-widest hidden sm:inline">TIME WINDOW:</span>
              <div className="relative">
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="appearance-none bg-secondary/60 border border-border px-2.5 py-1.5 pr-7 rounded font-black text-[9px] uppercase tracking-wider text-foreground cursor-pointer focus:outline-none focus:border-cyan-500 hover:bg-secondary transition-colors"
                >
                  <option value="5m">Last 5 Minutes</option>
                  <option value="15m">Last 15 Minutes</option>
                  <option value="1h">Last 1 Hour</option>
                  <option value="6h">Last 6 Hours</option>
                  <option value="24h">Last 24 Hours</option>
                </select>
                <ChevronDown className="w-3 h-3 text-muted-foreground absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Attack Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[8.5px] font-black text-muted-foreground uppercase tracking-widest hidden sm:inline">FILTER ATTACK:</span>
              <div className="relative">
                <select 
                  value={selectedChartAttackFilter} 
                  onChange={(e) => setSelectedChartAttackFilter(e.target.value)}
                  className="appearance-none bg-secondary/60 border border-border px-2.5 py-1.5 pr-7 rounded font-black text-[9px] uppercase tracking-wider text-foreground cursor-pointer focus:outline-none focus:border-cyan-500 hover:bg-secondary transition-colors"
                >
                  <option value="ALL">ALL EVENTS</option>
                  {knownAttackTypes.map(typ => (
                    <option key={typ} value={typ}>{typ.toUpperCase()}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-muted-foreground absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Legend status indicators */}
        <div className="flex items-center gap-4 mb-3 text-[8.5px] font-black uppercase tracking-wider shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-1 bg-cyan-500 rounded animate-pulse" />
            <span className="text-muted-foreground">Normal traffic flow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-1 bg-red-500 rounded" />
            <span className="text-red-500">Heuristic threat spikes</span>
          </div>
        </div>

        {/* Real-time Area Chart render container */}
        <div className="flex-1 min-h-0 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData} 
              margin={{ top: 8, right: 2, left: -34, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.12}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAnom" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.22}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="currentColor" 
                className="text-border/20" 
                vertical={false} 
              />
              <XAxis 
                dataKey="formattedTime" 
                stroke="currentColor"
                className="text-muted-foreground/50 font-mono text-[6.5px] tracking-tight"
                tickLine={false} 
                axisLine={true}
                minTickGap={25}
                padding={{ left: 5, right: 5 }}
                tick={{ fill: 'currentColor', fontSize: 9, opacity: 0.55 }}
              />
              <YAxis 
                stroke="currentColor"
                className="text-muted-foreground/50 font-mono text-[6.5px] tracking-tight"
                tickLine={false} 
                axisLine={false}
                domain={[0, 1200]}
                ticks={[0, 300, 600, 900, 1200]}
                tick={{ fill: 'currentColor', fontSize: 8, opacity: 0.55 }}
              />
              <Tooltip 
                content={<CustomTooltipContent />} 
                cursor={{ stroke: 'currentColor', strokeWidth: 0.5, className: 'text-border' }} 
              />
              
              {/* Normal Traffic Layer */}
              <Area 
                type="monotone" 
                dataKey="inbound" 
                stroke="#22d3ee" 
                fill="url(#colorNormal)" 
                isAnimationActive={false}
                strokeWidth={1.5} 
                dot={false}
                activeDot={{ r: 3.5, fill: '#22d3ee', stroke: '#fff', strokeWidth: 1 }}
              />
              
              {/* Event Spikes Layer */}
              <Area 
                type="monotone" 
                dataKey={(v: any) => {
                  if (!v.isAnomaly) return null;
                  
                  if (selectedChartAttackFilter !== "ALL") {
                    const matchedAlert = matchAlertForPoint(v.timestamp);
                    if (!matchedAlert || matchedAlert.attackType !== selectedChartAttackFilter) {
                      return null;
                    }
                  }
                  
                  return v.inbound;
                }} 
                stroke="#ef4444" 
                strokeWidth={1.5} 
                isAnimationActive={false}
                fill="url(#colorAnom)"
                dot={false}
                connectNulls={false}
              />

              {/* Peak Anomaly Dots */}
              <Area
                type="monotone"
                dataKey={(v: any) => {
                  if (!v.isPeak) return null;
                  
                  if (selectedChartAttackFilter !== "ALL") {
                    const matchedAlert = matchAlertForPoint(v.timestamp);
                    if (!matchedAlert || matchedAlert.attackType !== selectedChartAttackFilter) {
                      return null;
                    }
                  }
                  
                  return v.inbound;
                }}
                stroke="none"
                fill="none"
                isAnimationActive={false}
                dot={(props: any) => {
                  const { cx, cy } = props;
                  if (isNaN(cx) || isNaN(cy)) return <></>;
                  return (
                    <g key={`spike-peak-${cx}-${cy}`}>
                      <circle cx={cx} cy={cy} r={4} fill="#ef4444" opacity={0.6} />
                      <circle cx={cx} cy={cy} r={1.5} fill="#ffffff" />
                    </g>
                  );
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* THREAT CLASSIFICATION PANEL (Always visible in Right Column - 4 cols, horizontally side-by-side when expanded) */}
      <div className="xl:col-span-4 min-h-110 max-h-110">
        <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col justify-between shadow-sm h-full w-full overflow-hidden select-none">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-1.5 shrink-0">
             <div className="flex flex-col">
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-cyan-500" />
                  THREAT CLASSIFICATION
                </h3>
                <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-1 opacity-60">Interactive SOC console</span>
             </div>
             
             {/* Header Toggle Button */}
             <button
               onClick={() => setFeedExpanded(!feedExpanded)}
               className="flex items-center gap-1.5 bg-secondary/85 hover:bg-secondary border border-border px-2.5 py-1 rounded transition-all text-[8px] font-black uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
             >
               <span className={cn(
                 "relative flex h-1.5 w-1.5 shrink-0 rounded-full",
                 feedExpanded ? "bg-cyan-500 animate-pulse" : "bg-muted-foreground/30"
               )} />
               <span>{feedExpanded ? "COLLAPSE FEED" : "EXPAND FEED"}</span>
             </button>
          </div>

          {/* Core Content: Side-by-side Donut Chart & Scrollable List with Framer Motion transitions */}
          <div className="flex-1 flex flex-row items-center gap-4 py-1.5 min-h-0 w-full overflow-hidden relative">
              
              {/* 1. Donut Chart Component with layout animation */}
              <motion.div 
                layout
                animate={{ width: feedExpanded ? "42%" : "100%" }}
                transition={{ type: "tween", duration: 0.22, ease: "easeInOut" }}
                className="flex flex-col items-center justify-center h-full shrink-0"
              >
                 <motion.div 
                   layout
                   animate={{ 
                     width: feedExpanded ? 175 : 255, 
                     height: feedExpanded ? 175 : 255 
                   }}
                   transition={{ type: "tween", duration: 0.22, ease: "easeInOut" }}
                   className="relative flex items-center justify-center"
                   style={{ 
                     filter: hoveredSlice && !hoveredSlice.disabled
                       ? `drop-shadow(0 0 16px ${hoveredSlice.theme.primary}12)`
                       : `drop-shadow(0 0 16px rgba(6, 182, 212, 0.1))`
                   }}
                 >
                   {/* Centered soft reactive dynamic backing glow ring */}
                   <div 
                     className="absolute rounded-full opacity-15 blur-xl pointer-events-none transition-all duration-300 ease-in-out"
                     style={{
                       width: "75%",
                       height: "75%",
                       background: hoveredSlice && !hoveredSlice.disabled
                         ? hoveredSlice.theme.primary
                         : "rgba(6, 182, 212, 0.45)",
                       mixBlendMode: "screen"
                     }}
                   />

                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={filteredThreatData}
                         cx="50%"
                         cy="50%"
                         innerRadius="72%"
                         outerRadius="95%"
                         paddingAngle={3}
                         dataKey="value"
                         stroke="none"
                         isAnimationActive={true}
                         animationDuration={300}
                       >
                         {filteredThreatData.map((entry, index) => {
                           const isHovered = hoveredSlice?.name === entry.name;
                           const isDisabled = entry.disabled;
                           return (
                             <Cell 
                               key={`donut-slice-${index}`} 
                               fill={isDisabled ? (isDarkMode ? "#2d3748" : "#cbd5e1") : entry.theme.primary} 
                               className="outline-none active:outline-none cursor-pointer transition-all duration-300"
                               style={{
                                 opacity: isDisabled ? 0.22 : isHovered ? 1 : 0.88,
                                 transform: isHovered && !isDisabled ? "scale(1.035)" : "scale(1)",
                                 transformOrigin: "center",
                                 transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
                               }}
                               onClick={() => onToggleAttackType(entry.name)}
                               onMouseEnter={() => setHoveredSlice(entry)}
                               onMouseLeave={() => setHoveredSlice(null)}
                             />
                           );
                         })}
                       </Pie>
                     </PieChart>
                   </ResponsiveContainer>
                   
                   {/* Centered Total / Hover summary info in center hole */}
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center p-2 leading-none">
                     {hoveredSlice && !hoveredSlice.disabled ? (
                       <div className="flex flex-col items-center justify-center">
                         <span className="font-black text-foreground leading-none tracking-tight text-lg md:text-2xl transition-all duration-150">
                           {hoveredSlice.percentage}
                         </span>
                         <span 
                           className="text-[7.5px] font-black uppercase tracking-wider mt-1 truncate max-w-23.75"
                           style={{ color: hoveredSlice.theme.primary }}
                         >
                           {hoveredSlice.name}
                         </span>
                         <span className="text-[6.5px] font-mono font-bold text-muted-foreground mt-0.5 uppercase">
                           {hoveredSlice.value} alerts
                         </span>
                       </div>
                     ) : (
                       <div className="flex flex-col items-center justify-center">
                         <span className={cn(
                           "font-black text-foreground leading-none tracking-tighter transition-all duration-200",
                           feedExpanded ? "text-2xl" : "text-4xl"
                         )}>
                           {totalVisible}
                         </span>
                         <span className="text-[8.5px] text-muted-foreground font-black uppercase tracking-[0.14em] mt-1 opacity-75">
                           ALERTS
                         </span>
                         <span className="text-[6.5px] text-emerald-500 font-mono font-bold uppercase tracking-widest mt-0.5 opacity-80 animate-pulse">
                           ACTIVE
                         </span>
                       </div>
                     )}
                   </div>
                 </motion.div>
              </motion.div>

              {/* 2. Scrollable Attack List (Incidents Feed) with simple width animate behavior */}
              <AnimatePresence initial={false}>
                {feedExpanded && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "58%", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: "tween", duration: 0.22, ease: "easeInOut" }}
                    className="h-full flex flex-col overflow-hidden min-w-45 shrink-0"
                  >
                    <div className="flex-1 w-full flex flex-col overflow-y-auto custom-scrollbar pr-0.5 border border-border/10 rounded-lg bg-secondary/10 p-1.5 min-h-0">
                      <div className="flex items-center justify-between px-1 bg-card/60 backdrop-blur-xs rounded py-1 pb-1 text-[7px] font-black text-muted-foreground uppercase border-b border-border/20 mb-1 sticky top-0 z-10">
                         <span>ATTACK / SEVERITY</span>
                         <span className="mr-1">CONF / FREQ</span>
                      </div>
                      
                      <div className="space-y-1.5 flex-1 w-full mt-1">
                         {threatData.map((item) => {
                           const AttackIcon = getAttackIcon(item.name);
                           const severityLabel = getSeverityLabel(item.name);
                           return (
                             <div 
                                key={item.name} 
                                onClick={() => onToggleAttackType(item.name)}
                                className={cn(
                                  "flex flex-col p-1 px-1.5 rounded border transition-all cursor-pointer relative overflow-hidden select-none",
                                  item.disabled 
                                    ? "opacity-20 grayscale border-transparent bg-muted/5" 
                                    : "bg-background border border-border/40 hover:bg-muted/35"
                                )}
                                style={{ 
                                  borderLeftColor: !item.disabled ? item.theme.primary : undefined,
                                  borderLeftWidth: !item.disabled ? '2.5px' : '1px'
                                }}
                              >
                                 <div className="flex items-center justify-between h-5">
                                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                       <div className="p-0.5 rounded bg-secondary border border-border/20 shrink-0" style={{ color: !item.disabled ? item.theme.primary : "#64748b" }}>
                                          <AttackIcon className="w-2.5 h-2.5 stroke-[2.2]" />
                                       </div>
                                       <div className="flex flex-col min-w-0">
                                          <span className="text-[8px] font-black uppercase text-foreground leading-none truncate pr-1">
                                            {item.name}
                                          </span>
                                          <span className={cn(
                                            "text-[6px] font-black uppercase tracking-wider leading-none mt-0.5 shrink-0",
                                            severityLabel === "Critical" ? "text-red-500" : severityLabel === "High" ? "text-orange-500" : severityLabel === "Medium" ? "text-yellow-600 dark:text-yellow-500" : "text-blue-500"
                                          )}>
                                            {severityLabel}
                                          </span>
                                       </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end justify-center w-13 shrink-0 pr-2 font-mono font-bold leading-none overflow-hidden">
                                      <span className="text-[8px] text-foreground">
                                        {(item.avgConfidence * 100).toFixed(0)}%
                                      </span>
                                      <span className="text-[6.5px] text-muted-foreground/60 mt-0.5">
                                        count: {item.value}
                                      </span>
                                    </div>
                                 </div>
                             </div>
                           );
                         })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
          </div>

          {/* Footer status markers */}
          <div className="mt-1 pt-1.5 border-t border-border/30 flex items-center justify-between text-[7px] font-black text-muted-foreground uppercase tracking-widest shrink-0">
             <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                   <span>CRITICAL</span>
                </div>
                <div className="flex items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded bg-orange-500" />
                   <span>HIGH</span>
                </div>
                <div className="flex items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded bg-yellow-500" />
                   <span>MEDIUM</span>
                </div>
             </div>
             <span className="opacity-55">Interactive Legends</span>
          </div>

        </div>
      </div>

    </div>
  );
}

function getAttackIcon(name: string) {
  switch (name) {
    case "DDoS": return Zap;
    case "SQL Injection": return Terminal;
    case "XSS": return Globe;
    case "Port Scan": return Search;
    case "LFI": return Eye;
    case "Command Injection": return Terminal;
    case "Beaconing": return TrendingUp;
    case "Botnet Activity": return Cpu;
    case "Credential Stuffing": return Lock;
    default: return ShieldAlert;
  }
}

function getSeverityLabel(name: string) {
  switch (name) {
    case "DDoS":
    case "SQL Injection":
    case "Ransomware Attempt":
      return "Critical";
    case "Brute Force":
    case "Command Injection":
    case "Botnet Activity":
    case "Credential Stuffing":
      return "High";
    default:
      return "Medium";
  }
}
