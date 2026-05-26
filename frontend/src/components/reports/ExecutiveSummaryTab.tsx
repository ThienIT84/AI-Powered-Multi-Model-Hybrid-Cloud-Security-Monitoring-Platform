import React, { useState, useEffect } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Server, HardDrive, Database, Globe, ArrowUpRight, Cpu, Layers, ToggleLeft, ToggleRight, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CYBER_COLORS, TREND_DATASETS, ASSETS_DATASETS } from "./reportsConfig";

interface ExecutiveSummaryTabProps {
  timeframe: string;
}

export function ExecutiveSummaryTab({ timeframe }: ExecutiveSummaryTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmptyStateTriggered, setIsEmptyStateTriggered] = useState(false);

  // Trigger a realistic pipeline load transition on timeframe switch
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [timeframe]);

  const activeTrendData = TREND_DATASETS[timeframe] || TREND_DATASETS["30d"];
  const activeAssetsData = ASSETS_DATASETS[timeframe] || ASSETS_DATASETS["30d"];

  // Custom tooltips with high-tech styles to fit Splunk/Elastic aesthetics
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 border border-border p-3 rounded-lg shadow-2xl backdrop-blur-md text-[10px] font-mono leading-relaxed text-left">
          <div className="border-b border-border pb-1.5 mb-1.5 flex items-center justify-between gap-4">
            <span className="text-muted-foreground font-bold uppercase">TIMESTAMP: {label}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div className="space-y-1">
            {payload.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground font-bold uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}:
                </span>
                <span className="text-foreground font-bold">{item.value} alerts</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Simulation Controls for Enterprise verification */}
      <div className="flex items-center justify-between gap-4 bg-muted/40 p-3 border border-border rounded-xl text-[10px] font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5 uppercase">
          <Info className="w-3.5 h-3.5 text-cyan-655 dark:text-cyan-500" />
          <span>REAL-TIME SIMULATION HUB • SYSTEM STATE INGESTION IS ACTIVE</span>
        </div>
        <button
          onClick={() => setIsEmptyStateTriggered(!isEmptyStateTriggered)}
          className="flex items-center gap-1.5 hover:text-foreground transition cursor-pointer font-bold focus:outline-none"
        >
          {isEmptyStateTriggered ? (
            <>
              <ToggleRight className="w-4 h-4 text-cyan-655 dark:text-cyan-400" />
              <span className="text-cyan-655 dark:text-cyan-400 uppercase">SIMULATING EMPTY STATE</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4 text-muted-foreground" />
              <span className="uppercase text-muted-foreground">FORCE EMPTY STATE TEST</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Alarm Trend Area Chart Wrapper */}
        <div className="xl:col-span-2 bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-lg h-107.5px relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-20 h-px bg-cyan-500/20" />
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="text-[9px] font-mono font-bold text-muted-foreground tracking-[0.2em] uppercase block mb-1">
                ALERT INTENSITY BY SEVERITY
              </span>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                Threat Volume Correlation Line
              </h3>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[8px] text-muted-foreground uppercase px-2 py-0.5 bg-muted border border-border rounded">
              <span>UPDATED LIVE</span>
            </div>
          </div>

          <div className="flex-1 w-full mt-6 text-[10px] font-mono relative">
            <AnimatePresence mode="wait">
              {isLoading ? (
                // Recharts loading skeleton state
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col justify-end space-y-4 pb-2 bg-transparent"
                >
                  <div className="flex justify-between items-end h-45px px-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <div
                        key={n}
                        className="w-full bg-muted rounded-md animate-pulse"
                        style={{ height: `${20 + n * 10}%` }}
                      >
                        <div className="w-full h-full bg-linear-to-t from-cyan-950/20 via-transparent to-transparent" />
                      </div>
                    ))}
                  </div>
                  <div className="h-4 bg-muted/40 rounded-md w-full animate-pulse" />
                </motion.div>
              ) : isEmptyStateTriggered ? (
                // Recharts empty block state
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center border border-dashed border-border rounded-lg bg-card"
                >
                  <Cpu className="w-8 h-8 text-muted-foreground animate-pulse mb-2.5" />
                  <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest block">
                    NO CORRESPONDING SEVERITY LOGS FOUND
                  </span>
                  <p className="text-[9px] text-muted-foreground leading-normal max-w-xs uppercase mt-1">
                    Please modify the active custom timeframe filter. No database ingestion gaps detected for selection.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full offset-legend"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CYBER_COLORS.critical} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={CYBER_COLORS.critical} stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CYBER_COLORS.high} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={CYBER_COLORS.high} stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CYBER_COLORS.medium} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={CYBER_COLORS.medium} stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CYBER_COLORS.low} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={CYBER_COLORS.low} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#64748b" opacity={0.11} />
                      <XAxis dataKey="time" stroke="#94a3b8" tickLine={false} />
                      <YAxis stroke="#94a3b8" tickLine={false} />
                      <Tooltip content={renderCustomTooltip} />
                      <Legend 
                        verticalAlign="top" 
                        height={32} 
                        iconType="circle" 
                        iconSize={7}
                        wrapperStyle={{ 
                          paddingBottom: '15px', 
                          fontSize: '9px', 
                          fontFamily: 'monospace', 
                          fontWeight: '800' 
                        }} 
                      />
                      <Area
                        type="monotone"
                        dataKey="Critical"
                        stroke={CYBER_COLORS.critical}
                        fillOpacity={1}
                        fill="url(#colorCritical)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="High"
                        stroke={CYBER_COLORS.high}
                        fillOpacity={1}
                        fill="url(#colorHigh)"
                        strokeWidth={1.5}
                      />
                      <Area
                        type="monotone"
                        dataKey="Medium"
                        stroke={CYBER_COLORS.medium}
                        fillOpacity={1}
                        fill="url(#colorMedium)"
                        strokeWidth={1.5}
                      />
                      <Area
                        type="monotone"
                        dataKey="Low"
                        stroke={CYBER_COLORS.low}
                        fillOpacity={1}
                        fill="url(#colorLow)"
                        strokeWidth={1.5}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Cloud Assets affected list */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-lg h-107.5px relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-20 h-px bg-red-500/20" />
          <div className="mb-4">
            <span className="text-[9px] font-mono font-bold text-muted-foreground tracking-[0.2em] uppercase block mb-1">
              CRITICAL CLOUD INVENTORY
            </span>
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
              Affected Cloud Infrastructure Assets
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 scrollbar-thin scrollbar-thumb-border">
            <AnimatePresence mode="wait">
              {isLoading ? (
                // Skeletons list
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="bg-muted/30 p-4 border border-border rounded-lg flex justify-between items-center animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-lg" />
                        <div className="space-y-1.5">
                          <div className="h-3 w-28 bg-muted rounded" />
                          <div className="h-2.5 w-16 bg-muted rounded" />
                        </div>
                      </div>
                      <div className="space-y-1.5 align-right">
                        <div className="h-3 w-12 bg-muted rounded ml-auto" />
                        <div className="h-2.5 w-8 bg-muted rounded ml-auto" />
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : isEmptyStateTriggered || activeAssetsData.length === 0 ? (
                // Empty state list
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center p-6 text-center border border-dashed border-border rounded-lg"
                >
                  <Layers className="w-8 h-8 text-muted-foreground animate-pulse mb-2.5" />
                  <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest block">
                    NO COMPROMISED CLOUD ASSETS
                  </span>
                  <span className="text-[8px] text-muted-foreground leading-normal uppercase block mt-1">
                    ALL VM SENSORS SECURE AND DECRYPTED
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  {activeAssetsData.map((asset, i) => {
                    const getIcon = () => {
                      if (asset.type.includes("Machine")) return Server;
                      if (asset.type.includes("Store")) return HardDrive;
                      if (asset.type.includes("DB")) return Database;
                      return Globe;
                    };
                    const Icon = getIcon();

                    return (
                      <div
                        key={i}
                        className="bg-muted/20 border border-border rounded-lg p-3 hover:border-foreground/15 transition-all duration-300 flex items-center justify-between gap-3 group/row shadow-inner hover:bg-muted/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-background rounded-lg text-cyan-655 dark:text-cyan-400 border border-border group-hover/row:border-cyan-500/30 transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-[11px] font-mono font-black text-foreground tracking-widest leading-normal">
                              {asset.name}
                            </h4>
                            <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-wider block mt-0.5">
                              {asset.platform} • {asset.type.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-right">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black font-mono text-red-555 dark:text-red-400">
                              {asset.alerts} ALERTS
                            </span>
                            <span className="text-[8px] font-mono font-bold text-muted-foreground">
                              RISK RISK_ID: {asset.risk}%
                            </span>
                          </div>
                          <div className="hidden sm:block">
                            <span
                               className={`text-[8px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                                asset.status === "Investigating"
                                  ? "bg-purple-500/10 text-purple-405 dark:text-purple-400 border-purple-500/20"
                                  : asset.status === "Monitoring"
                                  ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
                                  : asset.status === "Mitigated"
                                  ? "bg-cyan-500/10 text-cyan-655 dark:text-cyan-400 border-cyan-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              }`}
                            >
                              {asset.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-border pt-4 mt-2">
            <button className="w-full flex items-center justify-center gap-2 p-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-[9px] font-mono font-bold uppercase tracking-widest border border-border transition duration-200 cursor-pointer">
              <span>QUERY ENTERPRISE INVENTORY</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
