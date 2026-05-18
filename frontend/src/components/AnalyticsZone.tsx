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
  Cell,
  ReferenceDot,
  ReferenceLine
} from "recharts";
import { TrafficData, Alert } from "../types";
import { cn } from "../lib/utils";
import { Brain, ShieldAlert, Activity, ChevronUp, Maximize2, AlertTriangle, Zap, Search, Eye, Lock, Terminal, Globe, UserX, Cpu, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { getCachedAttackTheme } from "../utils/attackColors";

interface AnalyticsZoneProps {
  traffic: TrafficData[];
  alerts: Alert[];
  onSelectAlert?: (alert: Alert) => void;
  isDarkMode?: boolean;
}

export function AnalyticsZone({ traffic, alerts, onSelectAlert, isDarkMode = true }: AnalyticsZoneProps) {
  const [disabledTypes, setDisabledTypes] = React.useState<string[]>([]);

  const toggleType = (typeName: string) => {
    setDisabledTypes(prev => 
      prev.includes(typeName) 
        ? prev.filter(t => t !== typeName) 
        : [...prev, typeName]
    );
  };

  const threatData = React.useMemo(() => {
    const counts: Record<string, number> = {};

    alerts.forEach(alert => {
      counts[alert.attackType] = (counts[alert.attackType] || 0) + 1;
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    return Object.entries(counts).map(([name, value]) => {
      const theme = getCachedAttackTheme(name, isDarkMode);
      return {
        name,
        value,
        color: theme.primary,
        theme,
        percentage: total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "0%",
        disabled: disabledTypes.includes(name)
      };
    }).sort((a, b) => b.value - a.value);
  }, [alerts, disabledTypes, isDarkMode]);

  const filteredThreatData = React.useMemo(() => {
    return threatData.filter(d => !d.disabled);
  }, [threatData]);

  const totalVisible = filteredThreatData.reduce((acc, curr) => acc + curr.value, 0);

  // Map real-time traffic data or use mock if empty
  const chartData = React.useMemo(() => {
    if (traffic && traffic.length > 0) {
      return traffic.map(d => ({
        ...d,
        formattedTime: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      }));
    }
    
    // Initial mock data
    const data = [];
    const now = new Date();
    for (let i = 0; i <= 60; i++) {
      const time = new Date(now.getTime() - (60 - i) * 2000);
      data.push({
        timestamp: time.toISOString(),
        formattedTime: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        inbound: 150 + Math.random() * 100,
        isAnomaly: false,
        isPeak: false
      });
    }
    return data;
  }, [traffic]);

  const peaks = chartData.filter(d => d.isPeak);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-4 h-[420px]">
      {/* Main Traffic Chart */}
      <motion.div 
        layout
        className="xl:col-span-8 bg-card border border-border rounded-xl p-4 relative shadow-sm overflow-hidden transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
             <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(34,211,238,0.2)]">REAL-TIME AI SECURITY EVENTS</h3>
          </div>
          <div className="flex items-center gap-2">
             <div className="flex items-center bg-secondary/50 rounded px-2 py-1 border border-border gap-2 cursor-pointer hover:bg-secondary transition-colors">
                <span className="text-[8px] font-black text-foreground uppercase tracking-widest leading-none">Last 1 Hour</span>
                <ChevronUp className="w-2.5 h-2.5 text-muted-foreground rotate-180" />
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 mb-6">
           <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 bg-cyan-500 rounded-sm shadow-[0_0_8px_rgba(34,211,238,0.3)]" />
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Normal Traffic</span>
           </div>
           <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 bg-red-500 rounded-sm shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Anomalies / Threats</span>
           </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
              <XAxis 
                dataKey="formattedTime" 
                stroke="currentColor"
                className="text-muted-foreground"
                fontSize={8} 
                tickLine={false} 
                axisLine={true}
                minTickGap={30}
                padding={{ left: 10, right: 10 }}
                tick={{ fill: 'currentColor', fontWeight: 800 }}
              />
              <YAxis 
                stroke="currentColor"
                className="text-muted-foreground"
                fontSize={8} 
                tickLine={false} 
                axisLine={false}
                domain={[0, 1200]}
                ticks={[0, 200, 400, 600, 800, 1000, 1200]}
                tick={{ fill: 'currentColor', fontWeight: 800 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(59,130,246,0.1)' }} />
              
              {/* Blue base line */}
              <Area 
                type="monotone" 
                dataKey="inbound" 
                stroke="#22d3ee" 
                fill="url(#colorIn)" 
                isAnimationActive={false}
                strokeWidth={1} 
                dot={false}
                activeDot={{ r: 4, fill: '#22d3ee', stroke: '#fff', strokeWidth: 1 }}
              />
              
              {/* Red spikes line layer */}
              <Area 
                type="monotone" 
                dataKey={(v: any) => v.isAnomaly ? v.inbound : null} 
                stroke="#ef4444" 
                strokeWidth={1.5} 
                isAnimationActive={false}
                fill="url(#colorThreat)"
                dot={false}
                connectNulls={false}
                style={{ filter: "drop-shadow(0 0 4px rgba(239, 68, 68, 0.4))" }}
              />

              {/* Peak Dots */}
              <Area
                type="monotone"
                dataKey={(v: any) => v.isPeak ? v.inbound : null}
                stroke="none"
                fill="none"
                isAnimationActive={false}
                dot={(props: any) => {
                  const { cx, cy } = props;
                  if (isNaN(cx) || isNaN(cy)) return <></>;
                  return (
                    <g key={`peak-dot-${cx}-${cy}`}>
                      <circle cx={cx} cy={cy} r={3} fill="#ef4444" filter="url(#marker-glow)" />
                      <circle cx={cx} cy={cy} r={1.5} fill="white" />
                    </g>
                  );
                }}
              />

              {peaks.map((spike, idx) => (
                <ReferenceDot 
                  key={`ad-${spike.timestamp}-${idx}`} 
                  x={spike.formattedTime} 
                  y={spike.inbound} 
                  r={8} 
                  fill="transparent"
                  stroke="none"
                  className="cursor-pointer"
                  onClick={() => {
                    const latestAlert = [...alerts].reverse().find(a => 
                      new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) === spike.formattedTime
                    );
                    if (latestAlert && onSelectAlert) onSelectAlert(latestAlert);
                  }}
                  label={<CustomMarker />} 
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Attacks By Type */}
      <motion.div 
        layout
        className="xl:col-span-4 bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all duration-300 group"
      >
        {/* Color accents for the card */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex items-center justify-between mb-4">
           <div className="flex flex-col">
              <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">ATTACKS BY TYPE</h3>
              <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Threat Distribution</span>
           </div>
           <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Brain className="w-3 h-3 text-cyan-500 animate-pulse" />
           </div>
        </div>
        
        <div className="flex-1 relative flex items-center justify-center min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredThreatData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1000}
                  animationBegin={0}
                  isAnimationActive={true}
                >
                   {filteredThreatData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.theme.primary} 
                      stroke={isDarkMode ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)"}
                      strokeWidth={1}
                      fillOpacity={0.85}
                      className="hover:fill-opacity-100 transition-all cursor-pointer outline-none"
                      style={{ 
                        filter: `drop-shadow(0 0 12px ${entry.theme.glow})`,
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <AnimatePresence mode="wait">
                 <motion.span 
                   key={totalVisible}
                   initial={{ opacity: 0, scale: 0.8, y: 5 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 1.2, y: -5 }}
                   transition={{ duration: 0.3, ease: "easeOut" }}
                   className="text-4xl font-black text-foreground leading-none tracking-tighter drop-shadow-sm"
                 >
                   {totalVisible}
                 </motion.span>
               </AnimatePresence>
               <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.3em] mt-2 opacity-80">Total Signals</span>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-2 mt-4 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
           {threatData.map((item, idx) => {
             const AttackIcon = getAttackIcon(item.name);
             return (
               <motion.div 
                  key={idx} 
                  layout
                  onClick={() => toggleType(item.name)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.01, x: 2 }}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden",
                    item.disabled ? "opacity-30 grayscale border-transparent bg-muted/10 shadow-none" : "bg-muted/20 border-border group/item shadow-sm hover:shadow-md"
                  )}
                  style={{ 
                    borderLeftColor: !item.disabled ? item.theme.primary : undefined,
                    borderLeftWidth: !item.disabled ? '4px' : '1px'
                  }}
                >
                   {!item.disabled && (
                     <div 
                       className="absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none" 
                       style={{ background: item.theme.gradient }} 
                     />
                   )}
                   <div className="flex flex-col flex-1 gap-1.5 relative z-10">
                      <div className="flex items-center gap-3">
                         <div className="p-1.5 rounded-lg bg-background/50 border border-border/50 text-muted-foreground group-hover/item:text-foreground transition-colors shadow-sm" 
                              style={{ 
                                color: !item.disabled ? item.theme.primary : undefined,
                                boxShadow: !item.disabled ? `0 0 10px ${item.theme.glow}` : 'none'
                              }}>
                            <AttackIcon size={14} />
                         </div>
                         <span className="text-[10px] font-black text-muted-foreground group-hover/item:text-foreground uppercase tracking-widest transition-colors">{item.name}</span>
                      </div>
                      {!item.disabled && (
                        <div className="h-1 w-full bg-muted/40 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: item.percentage }}
                             transition={{ duration: 1.2, ease: "anticipate" }}
                             className="h-full rounded-full" 
                             style={{ 
                               backgroundColor: item.theme.primary, 
                               boxShadow: `0 0 8px ${item.theme.glow}` 
                             }} 
                           />
                        </div>
                      )}
                   </div>
                   <div className="flex items-center gap-4 relative z-10">
                      <AnimatePresence mode="wait">
                        {!item.disabled && (
                          <motion.span 
                            key={item.percentage}
                            initial={{ opacity: 0, x: 5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -5 }}
                            className="text-[10px] font-black tracking-tighter"
                            style={{ color: item.theme.primary }}
                          >
                            {item.percentage}
                          </motion.span>
                        )}
                      </AnimatePresence>
                       <div className="flex items-center gap-3">
                          <span className={cn(
                            "text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter shadow-sm border",
                          )} style={{ 
                            backgroundColor: item.theme.muted, 
                            color: item.theme.text, 
                            borderColor: item.theme.border 
                          }}>
                             {getSeverityLabel(item.name)}
                          </span>
                          <div className="min-w-[35px] flex justify-end">
                             <motion.span 
                               layout
                               className="text-[11px] font-mono font-black text-muted-foreground/80 group-hover/item:text-foreground transition-colors"
                             >
                               {item.value}
                             </motion.span>
                          </div>
                       </div>
                   </div>
                </motion.div>
             );
           })}
        </div>
      </motion.div>
    </div>
  );
}


function getAttackIcon(name: string) {
  switch (name) {
    case "DDoS": return Zap;
    case "SQL Injection": return Terminal;
    case "XSS": return Globe;
    case "Port Scan": return Search;
    case "Brute Force": return Lock;
    case "Unauthorized Access": return UserX;
    case "Malware": return Cpu;
    case "Phishing": return Eye;
    case "Ransomware": return ShieldAlert;
    case "Insider Threat": return UserX;
    default: return ShieldAlert;
  }
}

function getSeverityLabel(name: string) {
  switch (name) {
    case "DDoS":
    case "SQL Injection":
    case "Ransomware":
    case "Privilege Escalation":
      return "Critical";
    case "Brute Force":
    case "Malware":
    case "Unauthorized Access":
    case "Insider Threat":
      return "High";
    default:
      return "Medium";
  }
}

function getSeverityColor(name: string) {
  const label = getSeverityLabel(name);
  switch (label) {
    case "Critical": return "bg-red-500/10 text-red-500 border border-red-500/20";
    case "High": return "bg-orange-500/10 text-orange-500 border border-orange-500/20";
    default: return "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20";
  }
}


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 border border-border p-4 rounded-xl shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-3 border-b border-border pb-2">
           <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
           <p className="text-[11px] font-black text-foreground uppercase tracking-[0.15em]">{label}</p>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_#3b82f6]" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Traffic:</span>
            </div>
            <span className="text-xs font-black text-blue-500 font-mono tracking-tighter">{payload[0].value.toFixed(1)} Gbps</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomMarker = (props: any) => {
  const { cx, cy } = props;
  if (isNaN(cx) || isNaN(cy)) return null;
  // Offset the marker upward so it sits above the spike peak
  const offsetY = cy - 8;
  return (
    <g>
      <defs>
        <filter id="marker-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Glow effect triangle */}
      <path 
        d={`M${cx} ${offsetY - 12} L${cx + 8} ${offsetY} L${cx - 8} ${offsetY} Z`} 
        fill="#ef4444" 
        filter="url(#marker-glow)"
        opacity="0.8"
      />
      
      {/* Main Red Triangle */}
      <path 
        d={`M${cx} ${offsetY - 12} L${cx + 7} ${offsetY} L${cx - 7} ${offsetY} Z`} 
        fill="#ef4444" 
        stroke="#ffffff"
        strokeWidth={0.5}
        strokeOpacity={0.2}
      />
      
      {/* Warning symbol '!' */}
      <path 
        d={`M${cx - 0.75} ${offsetY - 8.5} L${cx + 0.75} ${offsetY - 8.5} L${cx + 0.5} ${offsetY - 5} L${cx - 0.5} ${offsetY - 5} Z`} 
        fill="white" 
      />
      <circle cx={cx} cy={offsetY - 3} r={0.8} fill="white" />
    </g>
  );
};

function AIProgressItem({ label, value, desc, color }: { label: string, value: number, desc: string, color: string }) {
  return (
    <div className="space-y-1.5">
       <div className="flex justify-between items-end">
          <div className="flex items-center gap-1.5">
             <span className="text-[8.5px] font-black bg-muted border border-border text-foreground px-1 py-0.5 rounded tracking-tighter uppercase leading-none">{label}</span>
             <span className="text-[8.5px] text-muted-foreground truncate max-w-[150px] leading-none tracking-tight">{desc}</span>
          </div>
          <span className={cn("text-[9px] font-black font-mono", value > 94 ? "text-red-500" : "text-yellow-500")}>{value}%</span>
       </div>
       <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div className={cn("h-full transition-all duration-1000", color, "shadow-sm")} style={{ width: `${value}%` }} />
       </div>
    </div>
  );
}
