import React, { useState, useEffect } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  Globe, 
  ArrowUpRight, 
  ShieldAlert, 
  Layers, 
  ToggleLeft, 
  ToggleRight, 
  Loader2,
  Search,
  ArrowUpDown,
  FilterX
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CYBER_COLORS, ATTACK_MIX_DATASETS, OFFENDING_IPS_DATASETS } from "./reportsConfig";

interface ThreatIntelTabProps {
  timeframe: string;
}

type SortField = "ip" | "geo" | "alerts" | "behavior" | "lastSeen";
type SortOrder = "asc" | "desc";

export function ThreatIntelTab({ timeframe }: ThreatIntelTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmptyStateTriggered, setIsEmptyStateTriggered] = useState(false);

  // Interaction State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("alerts");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [timeframe]);

  // Reset category filter on timeframe change to avoid inconsistencies
  useEffect(() => {
    setSelectedCategory(null);
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
          <span className="text-muted-foreground font-bold">COUNT: {data.value} THREATS</span>
          <div className="text-[7.5px] text-cyan-455 mt-1">CLICK TO FILTER IP TABLE</div>
        </div>
      );
    }
    return null;
  };

  // Extract short Geo code from country string e.g. "Russia (RU)" -> "RU"
  const getGeoCode = (countryStr: string) => {
    const rx = /\(([^)]+)\)/;
    const matches = countryStr.match(rx);
    return matches ? matches[1] : countryStr;
  };

  // Map behavior to filterable tag category
  const matchesCategory = (actorBehavior: string, category: string) => {
    const cat = category.toLowerCase();
    const beh = actorBehavior.toLowerCase();
    if (cat.includes("network") && beh.includes("network")) return true;
    if (cat.includes("brute") && beh.includes("brute")) return true;
    if (cat.includes("web") && beh.includes("web")) return true;
    if (cat.includes("ddos") && beh.includes("ddos")) return true;
    if (cat.includes("malware") && beh.includes("malware")) return true;
    return false;
  };

  // Perform filtering (search query + category slice click) and sorting
  const filteredAndSortedIps = activeIpsData
    .filter(actor => {
      // 1. Filter by category click
      if (selectedCategory && !matchesCategory(actor.mainAttack, selectedCategory)) {
        return false;
      }
      
      // 2. Filter by search query
      const matchQuery = searchQuery.toLowerCase();
      const geoCode = getGeoCode(actor.country).toLowerCase();
      return (
        actor.ip.toLowerCase().includes(matchQuery) ||
        geoCode.includes(matchQuery) ||
        actor.mainAttack.toLowerCase().includes(matchQuery) ||
        actor.lastActive.toLowerCase().includes(matchQuery)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      const geoA = getGeoCode(a.country);
      const geoB = getGeoCode(b.country);

      if (sortField === "ip") {
        comparison = a.ip.localeCompare(b.ip);
      } else if (sortField === "geo") {
        comparison = geoA.localeCompare(geoB);
      } else if (sortField === "alerts") {
        comparison = a.count - b.count;
      } else if (sortField === "behavior") {
        comparison = a.mainAttack.localeCompare(b.mainAttack);
      } else if (sortField === "lastSeen") {
        comparison = a.lastActive.localeCompare(b.lastActive);
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Controls for Threat Intelligence Verification */}
      <div className="flex items-center justify-between gap-4 bg-muted/40 p-3 border border-border rounded-xl text-[10px] font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5 uppercase">
          <Loader2 className={`w-3.5 h-3.5 text-cyan-600 dark:text-cyan-500 ${isLoading ? 'animate-spin' : ''}`} />
          <span>THREAT FEEDS • SEED SENSORS SYNCHRONIZED</span>
        </div>
        <button
          onClick={() => {
            setIsEmptyStateTriggered(!isEmptyStateTriggered);
            setSelectedCategory(null);
          }}
          className="flex items-center gap-1.5 hover:text-foreground transition cursor-pointer font-bold focus:outline-none"
        >
          {isEmptyStateTriggered ? (
            <>
              <ToggleRight className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Attack Categories Donut Chart Card */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-lg h-115 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-20 h-px bg-cyan-455/20" />
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="text-[9px] font-mono font-bold text-muted-foreground tracking-[0.2em] uppercase block mb-1">
                THREAT DIVERSITY MIX (TOTAL: {totalAttacksSum})
              </span>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                Category Distribution Donut
              </h3>
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-1 text-[8px] font-mono text-red-500 hover:text-red-400 font-bold border border-red-500/10 px-2 py-0.5 rounded bg-red-500/5 transition-all animate-pulse"
              >
                <FilterX className="w-3 h-3" />
                <span>RESET FILTER</span>
              </button>
            )}
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
                  <div className="relative w-36 h-36 border-4 border-muted rounded-full animate-spin flex items-center justify-center border-t-cyan-500">
                    <div className="w-24 h-24 border-4 border-muted rounded-full" />
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
                  <div className="w-24 h-24 border border-dashed border-border rounded-full flex items-center justify-center text-muted-foreground font-mono text-[9px] uppercase">
                    Zero Vectors
                  </div>
                  <span className="text-[8px] font-mono text-muted-foreground uppercase mt-2.5">Feeds Empty</span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-55 relative"
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
                        onClick={(data, index) => {
                          const clickedCategory = activeAttackData[index].name;
                          setSelectedCategory(prev => prev === clickedCategory ? null : clickedCategory);
                        }}
                        className="cursor-pointer"
                      >
                        {activeAttackData.map((entry, index) => {
                          const isFiltered = selectedCategory && selectedCategory !== entry.name;
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
                              opacity={isFiltered ? 0.25 : 1.0}
                              stroke={selectedCategory === entry.name ? "#ffffff" : entry.color}
                              strokeWidth={selectedCategory === entry.name ? 2 : 1}
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip content={customTooltip} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Ring Hole details */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <motion.span 
                      key={selectedCategory || "all"}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-2xl font-black text-foreground font-mono leading-none tracking-tighter"
                    >
                      {selectedCategory 
                        ? activeAttackData.find(d => d.name === selectedCategory)?.value.toLocaleString()
                        : totalAttacksSum.toLocaleString()
                      }
                    </motion.span>
                    <span className="text-[7.5px] font-mono font-bold text-muted-foreground uppercase tracking-wider mt-1">
                      {selectedCategory ? `${selectedCategory.toUpperCase()} THREATS` : "TOTAL THREATS"}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Custom segmented interactive legend */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-border pt-4 text-[9px] font-mono">
            {activeAttackData.map((item, idx) => {
              const isSelected = selectedCategory === item.name;
              const isAnySelected = selectedCategory !== null;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedCategory(prev => prev === item.name ? null : item.name)}
                  className={`flex items-center gap-1.5 text-left border rounded px-1.5 py-0.5 transition-all ${
                    isSelected 
                      ? "bg-muted border-cyan-500/20 text-foreground" 
                      : isAnySelected 
                      ? "opacity-40 border-transparent text-muted-foreground" 
                      : "border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="flex-1 flex justify-between items-center pr-1 min-w-0">
                    <span className="truncate max-w-22.5 font-bold">{item.name}</span>
                    <span className="text-foreground font-semibold ml-1">{item.value}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* IP Sources log telemetry table (Full Enterprise specifications) */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-lg h-115 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-20 h-px bg-red-500/20" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3 mb-1">
            <div>
              <span className="text-[9px] font-mono font-bold text-muted-foreground tracking-[0.2em] uppercase block mb-1">
                CRITICAL OFFENDING NODES {selectedCategory ? `• FILTERED BY ${selectedCategory.toUpperCase()}` : ""}
              </span>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                Critical Offending IP Table
              </h3>
            </div>

            {/* In-container Search Input */}
            <div className="relative shrink-0 w-full sm:w-48">
              <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-muted-foreground">
                <Search className="h-3 w-3" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search host, Geo, class..."
                className="w-full bg-muted/60 placeholder-muted-foreground/60 text-foreground text-[10px] font-mono pl-7 pr-3 py-1.5 rounded-lg border border-border focus:ring-1 focus:ring-cyan-500/20 outline-none leading-normal transition-all"
              />
            </div>
          </div>

          {/* Premium Enterprise table frame */}
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            <AnimatePresence mode="wait">
              {isLoading ? (
                // Log table skeleton rows
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2.5 pt-2"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="h-8 bg-muted/30 rounded-lg border border-border animate-pulse flex items-center justify-between px-3">
                      <div className="h-3.5 w-24 bg-muted rounded" />
                      <div className="h-3.5 w-16 bg-muted rounded" />
                      <div className="h-3.5 w-12 bg-muted rounded" />
                    </div>
                  ))}
                </motion.div>
              ) : isEmptyStateTriggered || filteredAndSortedIps.length === 0 ? (
                // No Data Found
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center p-6"
                >
                  <ShieldAlert className="w-8 h-8 text-muted-foreground mb-2 animate-pulse" />
                  <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest block">
                    NO ACTORS EXCEEDING RISK INDEX SENSITIVITY
                  </span>
                  <span className="text-[8px] text-muted-foreground uppercase block mt-1 leading-normal max-w-xs">
                    Threat source stream is clean for current slice filter query.
                  </span>
                </motion.div>
              ) : (
                <motion.table 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full text-left font-mono border-collapse text-[10px]"
                >
                  <thead className="sticky top-0 bg-card/95 backdrop-blur-sm z-20 border-b border-border/80">
                    <tr className="text-[8px] font-black text-muted-foreground tracking-wider uppercase">
                      <th 
                        className="py-2.5 pr-2 cursor-pointer hover:bg-muted/40 transition select-none"
                        onClick={() => handleSort("ip")}
                      >
                        <div className="flex items-center gap-1 py-1">
                          <span>IP HOST</span>
                          <ArrowUpDown className={`w-2.5 h-2.5 shrink-0 ${sortField === "ip" ? "text-cyan-400" : "text-muted-foreground/30"}`} />
                        </div>
                      </th>
                      <th 
                        className="py-2.5 cursor-pointer hover:bg-muted/40 transition select-none"
                        onClick={() => handleSort("geo")}
                      >
                        <div className="flex items-center gap-1 py-1">
                          <span>GEO</span>
                          <ArrowUpDown className={`w-2.5 h-2.5 shrink-0 ${sortField === "geo" ? "text-cyan-400" : "text-muted-foreground/30"}`} />
                        </div>
                      </th>
                      <th 
                        className="py-2.5 text-right cursor-pointer hover:bg-muted/40 transition select-none pr-3"
                        onClick={() => handleSort("alerts")}
                      >
                        <div className="flex items-center justify-end gap-1 py-1">
                          <span>ALERTS</span>
                          <ArrowUpDown className={`w-2.5 h-2.5 shrink-0 ${sortField === "alerts" ? "text-cyan-400" : "text-muted-foreground/30"}`} />
                        </div>
                      </th>
                      <th 
                        className="py-2.5 pl-4 cursor-pointer hover:bg-muted/40 transition select-none"
                        onClick={() => handleSort("behavior")}
                      >
                        <div className="flex items-center gap-1 py-1">
                          <span>BEHAVIOR</span>
                          <ArrowUpDown className={`w-2.5 h-2.5 shrink-0 ${sortField === "behavior" ? "text-cyan-400" : "text-muted-foreground/30"}`} />
                        </div>
                      </th>
                      <th 
                        className="py-2.5 text-right cursor-pointer hover:bg-muted/40 transition select-none"
                        onClick={() => handleSort("lastSeen")}
                      >
                        <div className="flex items-center justify-end gap-1 py-1">
                          <span>LAST SEEN</span>
                          <ArrowUpDown className={`w-2.5 h-2.5 shrink-0 ${sortField === "lastSeen" ? "text-cyan-400" : "text-muted-foreground/30"}`} />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-[10px]">
                    {filteredAndSortedIps.map((actor, idx) => {
                      const geoCode = getGeoCode(actor.country);
                      return (
                        <tr 
                          key={idx} 
                          className="group/tr transition-colors hover:bg-muted/40"
                        >
                          <td className="py-2.5 font-bold text-cyan-600 dark:text-cyan-400 group-hover/tr:text-cyan-500 transition-colors">
                            {actor.ip}
                          </td>
                          <td className="py-2.5 text-muted-foreground font-sans font-bold text-[11px]">
                            <span className="inline-block bg-muted text-foreground/80 border border-border px-1.5 py-0.5 rounded text-[8.5px] font-mono uppercase font-black tracking-wider leading-none">
                              {geoCode}
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-black text-red-500 pr-3">
                            {actor.count}
                          </td>
                          <td className="py-2.5 pl-4">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider bg-background text-muted-foreground border border-border/75">
                              {actor.mainAttack.replace(" Attempt", "").replace(" Activity", "")}
                            </span>
                          </td>
                          <td className="py-2.5 text-right text-muted-foreground/80 font-medium">
                            {actor.lastActive.replace("min", "min").replace("hr", "hr")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </motion.table>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-border pt-4 mt-2 flex items-center justify-between text-[10px] font-mono leading-none shrink-0">
            <span className="text-muted-foreground font-bold tracking-wider uppercase sm:block hidden">
              IOC INTEGRITY FEED STATUS: ACTIVE
            </span>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg border border-border transition duration-200 cursor-pointer text-[9px] font-mono font-bold uppercase">
              <span>QUERY INTELLIGENCE SEED</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
