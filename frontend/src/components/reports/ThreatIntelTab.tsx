import React, { useState, useEffect } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Globe, ArrowUpRight, ShieldAlert, Layers, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CYBER_COLORS, ATTACK_MIX_DATASETS, OFFENDING_IPS_DATASETS } from "./reportsConfig";

interface ThreatIntelTabProps {
  timeframe: string;
}

export function ThreatIntelTab({ timeframe }: ThreatIntelTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmptyStateTriggered, setIsEmptyStateTriggered] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [timeframe]);

  const activeAttackData = ATTACK_MIX_DATASETS[timeframe] || ATTACK_MIX_DATASETS["30d"];
  const activeIpsData = OFFENDING_IPS_DATASETS[timeframe] || OFFENDING_IPS_DATASETS["30d"];

  // Calculate dynamic sum of attacks based on timeframe
  const totalAttacksSum = activeAttackData.reduce((acc, curr) => acc + curr.value, 0);

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border px-3 py-2 rounded-lg shadow-2xl backdrop-blur-md text-[10px] font-mono">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="text-foreground font-bold uppercase">{data.name}</span>
          </div>
          <span className="text-muted-foreground font-bold">COUNT: {data.value} SIGNALS</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Simulation Controls for Threat Intelligence Verification */}
      <div className="flex items-center justify-between gap-4 bg-muted/40 p-3 border border-border rounded-xl text-[10px] font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5 uppercase">
          <Loader2 className={`w-3.5 h-3.5 text-cyan-555 dark:text-cyan-500 ${isLoading ? 'animate-spin' : ''}`} />
          <span>THREAT FEEDS • SEED SENSORS SYNCHRONIZED</span>
        </div>
        <button
          onClick={() => setIsEmptyStateTriggered(!isEmptyStateTriggered)}
          className="flex items-center gap-1.5 hover:text-foreground transition cursor-pointer font-bold focus:outline-none"
        >
          {isEmptyStateTriggered ? (
            <>
              <ToggleRight className="w-4 h-4 text-cyan-655 dark:text-cyan-400" />
              <span className="text-cyan-655 dark:text-cyan-400 uppercase">SIMULATING EMPTY ACTORS</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4 text-muted-foreground" />
              <span className="uppercase text-muted-foreground">FORCE NO-DATA FOUND TEST</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Attack Categories Donut Chart Card */}
        <div className="xl:col-span-2 bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-lg h-107.5px relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-20 h-px bg-cyan-400/20" />
          <div>
            <span className="text-[9px] font-mono font-bold text-muted-foreground tracking-[0.2em] uppercase block mb-1">
              THREAT DIVERSITY MIX
            </span>
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
              Category Distribution Percentage
            </h3>
          </div>

          <div className="flex-1 w-full flex items-center justify-center font-mono relative">
            <AnimatePresence mode="wait">
              {isLoading ? (
                // Pie chart loading skeleton
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                >
                  <div className="relative w-40 h-40 border-4 border-muted rounded-full animate-spin flex items-center justify-center border-t-cyan-500">
                    <div className="w-28 h-28 border-4 border-muted rounded-full" />
                  </div>
                  <span className="text-[8px] text-muted-foreground uppercase mt-4 block">Loading Feeds...</span>
                </motion.div>
              ) : isEmptyStateTriggered ? (
                // Pie empty selection
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center p-4"
                >
                  <div className="w-28 h-28 border border-dashed border-border rounded-full flex items-center justify-center text-muted-foreground font-mono text-[9px] uppercase">
                    Zero Vectors
                  </div>
                  <span className="text-[8px] font-mono text-muted-foreground uppercase mt-2.5">Feeds Empty</span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-55px relative"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activeAttackData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={88}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {activeAttackData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={customTooltip} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Ring Hole details */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <motion.span 
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-black text-foreground font-mono leading-none tracking-tighter"
                    >
                      {totalAttacksSum.toLocaleString()}
                    </motion.span>
                    <span className="text-[7.5px] font-mono font-bold text-muted-foreground uppercase tracking-widest mt-1">
                      THREAT COUNTS
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Inline structured custom legend matching standard split */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-border pt-4 text-[9px] font-mono">
            {activeAttackData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <div className="flex-1 flex justify-between items-center pr-1 min-w-0">
                  <span className="text-muted-foreground truncate max-w-22.5px">{item.name}</span>
                  <span className="text-foreground font-bold ml-1">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* IP Sources log telemetry table (Full Enterprise specifications) */}
        <div className="xl:col-span-3 bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-lg h-107.5px relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-20 h-px bg-red-500/20" />
          <div>
            <span className="text-[9px] font-mono font-bold text-muted-foreground tracking-[0.2em] uppercase block mb-1">
              THREAT INTELLIGENCE FEED
            </span>
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
              Critical Offending IP Log Sources
            </h3>
          </div>

          {/* Premium Enterprise table frame */}
          <div className="flex-1 overflow-auto custom-scrollbar mt-4 pr-1 relative scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            <AnimatePresence mode="wait">
              {isLoading ? (
                // Log table skeleton rows
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3 pt-2"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="h-10 bg-muted/30 rounded-lg border border-border animate-pulse flex items-center justify-between px-4">
                      <div className="h-3 w-28 bg-muted rounded" />
                      <div className="h-3 w-16 bg-muted rounded" />
                      <div className="h-3 w-12 bg-muted rounded" />
                    </div>
                  ))}
                </motion.div>
              ) : isEmptyStateTriggered || activeIpsData.length === 0 ? (
                // No Data Found
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center p-6"
                >
                  <ShieldAlert className="w-10 h-10 text-muted-foreground mb-2.5 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest block">
                    NO ACTORS SIGNAL FLAG ATTEMPT RECORDED
                  </span>
                  <span className="text-[8px] text-muted-foreground uppercase block mt-1">
                    Threat stream is exceptionally quiet. Filters are operating smoothly.
                  </span>
                </motion.div>
              ) : (
                <motion.table 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full text-left font-mono border-collapse"
                >
                  {/* Sticky Header to meet requirement G */}
                  <thead className="sticky top-0 bg-card z-20 shadow-md">
                    <tr className="border-b border-border text-[8.5px] font-black text-muted-foreground tracking-wider uppercase bg-card">
                      <th className="py-2.5 pr-2">HOST IP</th>
                      <th className="py-2.5">COUNTRY</th>
                      <th className="py-2.5 text-right font-bold pr-3">ALERTS</th>
                      <th className="py-2.5 pl-4">SIGNATURE SIGN</th>
                      <th className="py-2.5 text-right">LAST CAPTURE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-[10px]">
                    {activeIpsData.map((actor, idx) => {
                      // Apply Zebra row logic and hover highlighting
                      const isEven = idx % 2 === 0;
                      return (
                        <tr 
                          key={idx} 
                          className={`group/tr transition-colors hover:bg-muted ${isEven ? 'bg-muted/10' : 'bg-transparent'}`}
                        >
                          <td className="py-3 font-bold text-cyan-655 dark:text-cyan-400 group-hover/tr:text-foreground transition-colors">{actor.ip}</td>
                          <td className="py-3 text-muted-foreground font-sans text-[11px] font-medium">{actor.country}</td>
                          <td className="py-3 text-right font-bold text-red-555 dark:text-red-400 pr-3 font-mono">{actor.count}</td>
                          <td className="py-3 pl-4">
                            <span className="inline-block px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider bg-background text-muted-foreground border border-border group-hover/tr:border-border transition">
                              {actor.mainAttack}
                            </span>
                          </td>
                          <td className="py-3 text-right text-muted-foreground text-[9.5px]">{actor.lastActive}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </motion.table>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-border pt-4 mt-2 flex items-center justify-between text-[10px] font-mono leading-none">
            <span className="text-muted-foreground font-bold tracking-wider uppercase sm:block hidden">
              IOC INTEGRITY FEED STATUS: OK
            </span>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg border border-border transition duration-200 cursor-pointer">
              <span>QUERY INTELLIGENCE SEED</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
