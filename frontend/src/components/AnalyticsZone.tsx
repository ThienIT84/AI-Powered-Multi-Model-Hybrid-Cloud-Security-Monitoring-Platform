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
import { Brain, ShieldAlert, Activity, ChevronUp, Maximize2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AnalyticsZoneProps {
  traffic: TrafficData[];
  alerts: Alert[];
  onSelectAlert?: (alert: Alert) => void;
}

export function AnalyticsZone({ traffic, alerts, onSelectAlert }: AnalyticsZoneProps) {
  const [disabledTypes, setDisabledTypes] = React.useState<string[]>([]);

  const handleTypeClick = (typeName: string) => {
    // Show details for the latest alert of this type
    const latestOfThisType = [...alerts].reverse().find(a => a.attackType === typeName);
    if (latestOfThisType && onSelectAlert) {
       onSelectAlert(latestOfThisType);
    }
  };

  const toggleType = (typeName: string) => {
    setDisabledTypes(prev => 
      prev.includes(typeName) 
        ? prev.filter(t => t !== typeName) 
        : [...prev, typeName]
    );
  };

  const threatData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    const colors: Record<string, string> = {
      "SQL Injection": "#ef4444",
      "DDoS": "#f97316",
      "XSS": "#a855f7",
      "Port Scan": "#3b82f6",
      "Brute Force": "#eab308",
      "Unauthorized Access": "#06b6d4"
    };

    alerts.forEach(alert => {
      counts[alert.attackType] = (counts[alert.attackType] || 0) + 1;
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || "#64748b",
      percentage: total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "0%",
      disabled: disabledTypes.includes(name)
    })).sort((a, b) => b.value - a.value);
  }, [alerts, disabledTypes]);

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
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-4 h-105">
      {/* Main Traffic Chart */}
      <motion.div 
        layout
        className="xl:col-span-8 bg-[#030408] border border-white/5 rounded-xl p-4 relative shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
             <h3 className="text-[10px] font-black text-gray-100 uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">REAL-TIME AI SECURITY EVENTS</h3>
          </div>
          <div className="flex items-center gap-2">
             <div className="flex items-center bg-white/3 rounded px-2 py-1 border border-white/5 gap-2 cursor-pointer hover:bg-white/6 transition-colors">
                <span className="text-[8px] font-black text-white uppercase tracking-widest leading-none">Last 1 Hour</span>
                <ChevronUp className="w-2.5 h-2.5 text-gray-400 rotate-180" />
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 mb-6">
           <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 bg-blue-500 rounded-sm shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Normal Traffic</span>
           </div>
           <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 bg-red-500 rounded-sm shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Anomalies / Threats</span>
           </div>
        </div>

        <div className="h-70 w-full">
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
              <CartesianGrid strokeDasharray="0" stroke="#ffffff" opacity={0.02} vertical={false} />
              <XAxis 
                dataKey="formattedTime" 
                stroke="#1e293b" 
                fontSize={8} 
                tickLine={false} 
                axisLine={true}
                minTickGap={30}
                padding={{ left: 10, right: 10 }}
                tick={{ fill: '#475569', fontWeight: 800 }}
              />
              <YAxis 
                stroke="#1e293b" 
                fontSize={8} 
                tickLine={false} 
                axisLine={false}
                domain={[0, 1200]}
                ticks={[0, 200, 400, 600, 800, 1000, 1200]}
                tick={{ fill: '#475569', fontWeight: 800 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.05)' }} />
              
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
                dataKey={(v) => v.isAnomaly ? v.inbound : null} 
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
                dataKey={(v) => v.isPeak ? v.inbound : null}
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
                  isFront={true} 
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Attacks By Type */}
      <motion.div 
        layout
        className="xl:col-span-4 bg-[#06070a] border border-white/5 rounded-xl p-4 flex flex-col justify-between shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-[10px] font-black text-gray-100 uppercase tracking-[0.2em]">ATTACKS BY TYPE</h3>
           <Brain className="w-3 h-3 text-blue-500 animate-pulse" />
        </div>
        
        <div className="flex-1 relative flex items-center justify-center min-h-55">
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
                  animationDuration={1000}
                  animationBegin={0}
                  isAnimationActive={true}
                >
                  {filteredThreatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" fillOpacity={0.8} />
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
                   className="text-3xl font-black text-white leading-none tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                 >
                   {totalVisible}
                 </motion.span>
               </AnimatePresence>
               <span className="text-[8px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">Total Signals</span>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-1.5 mt-4 max-h-30 overflow-y-auto custom-scrollbar pr-1">
           {threatData.map((item, idx) => (
             <motion.div 
               key={idx} 
               layout
               onClick={() => handleTypeClick(item.name)}
               className={cn(
                 "flex items-center justify-between p-2 rounded-lg border border-white/2 cursor-pointer transition-all hover:bg-white/4",
                 item.disabled ? "opacity-30 grayscale" : "bg-white/2"
               )}
             >
                <div className="flex items-center gap-2.5">
                   <motion.div 
                    layout
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleType(item.name);
                    }}
                    className="w-2 h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)] cursor-pointer" 
                    style={{ backgroundColor: item.color }} 
                   />
                   <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                   <AnimatePresence mode="wait">
                     <motion.span 
                       key={item.percentage}
                       initial={{ opacity: 0, x: 5 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -5 }}
                       className="text-[9px] font-black text-gray-100 tracking-tighter"
                     >
                       {item.percentage}
                     </motion.span>
                   </AnimatePresence>
                   <div className="min-w-7.5 flex justify-end">
                      <motion.span 
                        layout
                        className="text-[10px] font-mono font-black text-gray-500"
                      >
                        [{item.value}]
                      </motion.span>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      </motion.div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a]/95 border border-cyan-500/30 p-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
           <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
           <p className="text-[11px] font-black text-gray-100 uppercase tracking-[0.15em]">{label}</p>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_5px_#3b82f6]" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Traffic:</span>
            </div>
            <span className="text-xs font-black text-blue-400 font-mono tracking-tighter">{payload[0].value.toFixed(1)} Gbps</span>
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
             <span className="text-[8.5px] font-black bg-white/5 border border-white/10 text-gray-100 px-1 py-0.5 rounded tracking-tighter uppercase leading-none">{label}</span>
             <span className="text-[8.5px] text-gray-500 truncate max-w-37.5 leading-none tracking-tight">{desc}</span>
          </div>
          <span className={cn("text-[9px] font-black font-mono", value > 94 ? "text-red-400" : "text-yellow-400")}>{value}%</span>
       </div>
       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div className={cn("h-full transition-all duration-1000", color, "shadow-[0_0_8px_rgba(255,255,255,0.1)]")} style={{ width: `${value}%` }} />
       </div>
    </div>
  );
}
