import React, { useState, useEffect } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  Server, 
  HardDrive, 
  Database, 
  Globe, 
  ArrowUpRight, 
  Cpu, 
  Layers, 
  ToggleLeft, 
  ToggleRight, 
  Info, 
  Search, 
  ArrowUpDown,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CYBER_COLORS, TREND_DATASETS, ASSETS_DATASETS } from "./reportsConfig";

interface ExecutiveSummaryTabProps {
  timeframe: string;
}

type SortField = "name" | "alerts" | "risk" | "status";
type SortOrder = "asc" | "desc";

export function ExecutiveSummaryTab({ timeframe }: ExecutiveSummaryTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmptyStateTriggered, setIsEmptyStateTriggered] = useState(false);

  // Table Sorting and Filtering State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("risk");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

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

  // Handle Sort Function
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Perform filtering & sorting on assets data
  const filteredAndSortedAssets = activeAssetsData
    .filter(asset => {
      const matchQuery = searchQuery.toLowerCase();
      return (
        asset.name.toLowerCase().includes(matchQuery) ||
        asset.status.toLowerCase().includes(matchQuery) ||
        asset.platform.toLowerCase().includes(matchQuery) ||
        asset.type.toLowerCase().includes(matchQuery)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "alerts") {
        comparison = a.alerts - b.alerts;
      } else if (sortField === "risk") {
        comparison = a.risk - b.risk;
      } else if (sortField === "status") {
        comparison = a.status.localeCompare(b.status);
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

  return (
    <div className="space-y-6">
      {/* Simulation Controls for Enterprise verification */}
      <div className="flex items-center justify-between gap-4 bg-muted/40 p-3 border border-border rounded-xl text-[10px] font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5 uppercase">
          <Info className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>REAL-TIME SIMULATION HUB • SYSTEM STATE INGESTION IS ACTIVE</span>
        </div>
        <button
          onClick={() => setIsEmptyStateTriggered(!isEmptyStateTriggered)}
          className="flex items-center gap-1.5 hover:text-foreground transition cursor-pointer font-bold focus:outline-none"
        >
          {isEmptyStateTriggered ? (
            <>
              <ToggleRight className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              <span className="text-cyan-600 dark:text-cyan-400 uppercase">SIMULATING EMPTY STATE</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4 text-muted-foreground" />
              <span className="uppercase text-muted-foreground">FORCE EMPTY STATE TEST</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Intensity Line Chart Wrapper */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-lg h-115 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-20 h-px bg-cyan-500/20" />
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="text-[9px] font-mono font-bold text-muted-foreground tracking-[0.2em] uppercase block mb-1">
                ALERT INTENSITY BY SEVERITY (01/05 → 30/05)
              </span>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                Threat Volume Correlation Chart
              </h3>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[8px] text-muted-foreground uppercase px-2 py-0.5 bg-muted border border-border rounded">
              <span className="w-1.5 h-1.5 bg-cyan-455 dark:bg-cyan-400 rounded-full animate-pulse" />
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
                  <div className="flex justify-between items-end h-45 px-4 gap-4">
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
                    Please modify timeframe filter. No database ingestion gaps detected for selection.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full offset-legend"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activeTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#64748b" opacity={0.11} />
                      <XAxis dataKey="time" stroke="#94a3b8" tickLine={false} style={{ fontSize: "9px" }} />
                      <YAxis stroke="#94a3b8" tickLine={false} style={{ fontSize: "9px" }} />
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
                      <Line
                        type="monotone"
                        dataKey="Critical"
                        name="Critical (Red spikes)"
                        stroke={CYBER_COLORS.critical}
                        strokeWidth={2.5}
                        dot={{ r: 3, strokeWidth: 1 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="High"
                        name="High (Orange)"
                        stroke={CYBER_COLORS.high}
                        strokeWidth={2}
                        dot={{ r: 2, strokeWidth: 1 }}
                        activeDot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Medium"
                        name="Medium (Yellow)"
                        stroke={CYBER_COLORS.medium}
                        strokeWidth={2}
                        dot={{ r: 2, strokeWidth: 1 }}
                        activeDot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Low"
                        name="Low (Blue baseline)"
                        stroke={CYBER_COLORS.low}
                        strokeWidth={2}
                        dot={{ r: 2, strokeWidth: 1 }}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sortable & Filterable Cloud Assets Table Container */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col shadow-lg h-115 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-20 h-px bg-red-500/20" />
          
          <div className="flex flex-col gap-2 mb-4">
            <div>
              <span className="text-[9px] font-mono font-bold text-muted-foreground tracking-[0.2em] uppercase block mb-1">
                CRITICAL CLOUD INVENTORY
              </span>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                Asset Risk Analysis Table
              </h3>
            </div>

            {/* In-container Filter Input */}
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-muted-foreground">
                <Search className="h-3 w-3" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter assets, platforms, status..."
                className="w-full bg-muted/65 placeholder-muted-foreground/60 text-foreground text-[10px] font-mono pl-8 pr-3 py-1.5 rounded-lg border border-border focus:ring-1 focus:ring-cyan-500/20 focus:border-cyan-500/30 outline-none leading-relaxed transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-muted-foreground hover:text-foreground text-[9px] font-mono font-black"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>

          {/* Interactive Cloud Inventory Table */}
          <div className="flex-1 overflow-auto custom-scrollbar border border-border/70 rounded-lg bg-background/30 text-[10px] font-mono">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 space-y-3"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-9 bg-muted/50 rounded animate-pulse" />
                  ))}
                </motion.div>
              ) : isEmptyStateTriggered || filteredAndSortedAssets.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center p-6 text-center"
                >
                  <Layers className="w-7 h-7 text-muted-foreground animate-pulse mb-2" />
                  <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest block">
                    NO COMPROMISED ASSETS FOUND
                  </span>
                  <span className="text-[8px] text-muted-foreground leading-normal uppercase block mt-1">
                    ALL VM SENSORS SECURE AND RECONCILED
                  </span>
                </motion.div>
              ) : (
                <motion.table
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full text-left border-collapse"
                >
                  <thead>
                    <tr className="bg-muted border-b border-border text-[8px] tracking-wider text-muted-foreground font-black uppercase sticky top-0 z-10">
                      <th 
                        className="py-2.5 px-3 cursor-pointer hover:bg-muted/80 transition-colors select-none"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-1">
                          <span>ASSET</span>
                          <ArrowUpDown className={`w-2.5 h-2.5 shrink-0 ${sortField === "name" ? "text-cyan-400" : "text-muted-foreground/45"}`} />
                        </div>
                      </th>
                      <th 
                        className="py-2.5 px-2 cursor-pointer hover:bg-muted/80 transition-colors select-none"
                        onClick={() => handleSort("alerts")}
                      >
                        <div className="flex items-center gap-1">
                          <span>ALERTS</span>
                          <ArrowUpDown className={`w-2.5 h-2.5 shrink-0 ${sortField === "alerts" ? "text-cyan-400" : "text-muted-foreground/45"}`} />
                        </div>
                      </th>
                      <th 
                        className="py-2.5 px-2 cursor-pointer hover:bg-muted/80 transition-colors select-none"
                        onClick={() => handleSort("risk")}
                      >
                        <div className="flex items-center gap-1">
                          <span>RISK INDEX</span>
                          <ArrowUpDown className={`w-2.5 h-2.5 shrink-0 ${sortField === "risk" ? "text-cyan-400" : "text-muted-foreground/45"}`} />
                        </div>
                      </th>
                      <th 
                        className="py-2.5 px-2 cursor-pointer hover:bg-muted/80 transition-colors select-none"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center gap-1">
                          <span>STATUS</span>
                          <ArrowUpDown className={`w-2.5 h-2.5 shrink-0 ${sortField === "status" ? "text-cyan-400" : "text-muted-foreground/45"}`} />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedAssets.map((asset, i) => {
                      const getIcon = () => {
                        if (asset.type.includes("Machine")) return Server;
                        if (asset.type.includes("Store")) return HardDrive;
                        if (asset.type.includes("DB")) return Database;
                        return Globe;
                      };
                      const Icon = getIcon();

                      // SPECIFIED RISK COLOR HIGHLIGHT RULE:
                      // Risk Index > 90% -> Red Highlight
                      // 70 - 90% -> Orange Warning
                      // < 70% -> Stable state (Green decoration)
                      let riskBadgeClass = "";
                      let riskIcon = null;
                      if (asset.risk > 90) {
                        riskBadgeClass = "text-red-500 bg-red-500/10 border-red-500/20 font-black shadow-[0_0_8px_rgba(239,68,68,0.15)]";
                        riskIcon = <AlertOctagon className="w-2.5 h-2.5 inline mr-1 text-red-500 align-middle" />;
                      } else if (asset.risk >= 70) {
                        riskBadgeClass = "text-orange-500 bg-orange-500/10 border-orange-500/25 font-bold";
                        riskIcon = <AlertTriangle className="w-2.5 h-2.5 inline mr-1 text-orange-500 align-middle" />;
                      } else {
                        riskBadgeClass = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 font-bold";
                        riskIcon = <CheckCircle2 className="w-2.5 h-2.5 inline mr-1 text-emerald-500 align-middle" />;
                      }

                      return (
                        <tr 
                          key={i} 
                          className="border-b border-border/50 hover:bg-muted/20 transition-colors leading-relaxed group/row"
                        >
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <span className="p-1 bg-background border border-border rounded group-hover/row:border-cyan-500/25 shrink-0 text-cyan-400">
                                <Icon className="w-3 h-3" />
                              </span>
                              <div className="min-w-0">
                                <div className="font-bold text-foreground truncate max-w-27.5" title={asset.name}>
                                  {asset.name}
                                </div>
                                <div className="text-[7.5px] text-muted-foreground tracking-wide font-black uppercase">
                                  {asset.platform} • {asset.type.replace("Virtual Machine", "VM").replace("Relational DB", "RDS")}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-2 font-black text-foreground">
                            {asset.alerts}
                          </td>
                          <td className="py-2.5 px-2">
                            <span className={`inline-block px-1.5 py-0.5 rounded border text-[8px] uppercase font-black font-mono tracking-wider ${riskBadgeClass}`}>
                              {riskIcon}
                              {asset.risk}%
                            </span>
                          </td>
                          <td className="py-2.5 px-2">
                            <span 
                              className={`text-[7.5px] font-mono font-black uppercase tracking-wider px-1 py-0.5 rounded border ${
                                asset.status === "Investigating"
                                  ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                  : asset.status === "Monitoring"
                                  ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                  : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                              }`}
                            >
                              {asset.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </motion.table>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-border pt-3.5 mt-2 shrink-0">
            <button className="w-full flex items-center justify-center gap-2 p-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-[9px] font-mono font-bold uppercase tracking-widest border border-border transition duration-200 cursor-pointer">
              <span>QUERY ENTERPRISE INVENTORY</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
