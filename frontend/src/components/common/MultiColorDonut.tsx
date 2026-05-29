import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

export interface DonutSegment {
  name: string;
  value: number;
  color: string;
  icon?: React.ElementType;
  subLabel?: string; // e.g. "Critical", "Open", etc.
}

interface MultiColorDonutProps {
  data: DonutSegment[];
  centerLabel: string;       // e.g. "ALERTS" or "TOTAL"
  size?: number;             // height of chart area, default 220
  innerRadius?: number | string;
  outerRadius?: number | string;
  variant?: "default" | "dashboard";
}

export function MultiColorDonut({
  data,
  centerLabel,
  size = 220,
  innerRadius = 62,
  outerRadius = 90,
  variant = "default",
}: MultiColorDonutProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);

  const active = activeIndex !== null ? data[activeIndex] : null;
  const activePct = active ? Math.round((active.value / total) * 100) : null;

  const isDashboard = variant === "dashboard";

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* ── Donut centered ── */}
      <div className={cn("relative w-full flex justify-center", isDashboard ? "h-32" : "")} style={!isDashboard ? { height: size } : undefined}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={isDashboard ? "65%" : innerRadius}
              outerRadius={isDashboard ? "95%" : outerRadius}
              paddingAngle={isDashboard ? 4 : 2}
              dataKey="value"
              strokeWidth={0}
              onMouseEnter={(_, idx) => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              style={{ cursor: "pointer" }}
              isAnimationActive={false}
            >
              {data.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={entry.color}
                  opacity={activeIndex === null || activeIndex === idx ? 1 : 0.3}
                  className="outline-none transition-all"
                  style={
                    activeIndex === idx
                      ? {
                          filter: `drop-shadow(0 0 12px ${entry.color}dd)`,
                        }
                      : undefined
                  }
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={active.name}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col items-center"
              >
                <span
                  className={cn("font-black leading-none", isDashboard ? "text-2xl" : "text-3xl")}
                  style={{ color: active.color, textShadow: `0 0 16px ${active.color}99` }}
                >
                  {active.value}
                </span>
                <span
                  className="text-[10px] font-mono font-black mt-1"
                  style={{ color: active.color, opacity: 0.85 }}
                >
                  {activePct}%
                </span>
                <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest mt-1 text-center leading-tight max-w-[80px]">
                  {active.name}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="total"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col items-center"
              >
                <span className={cn("font-black text-foreground leading-none", isDashboard ? "text-2xl" : "text-4xl")}>
                  {total}
                </span>
                <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.2em] mt-2">
                  {centerLabel}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Legend grid ── */}
      <div className={cn("w-full", isDashboard ? "space-y-1.5" : "space-y-2")}>
        {data.map((item, idx) => {
          const pct = Math.round((item.value / total) * 100);
          const isActive = activeIndex === idx;
          const Icon = item.icon;

          if (isDashboard) {
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "flex flex-col p-2 px-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden select-none",
                  isActive 
                    ? "border-white/20 bg-white/[0.08]" 
                    : "bg-background border-border/40 hover:bg-white/[0.04]"
                )}
                style={{ 
                  borderLeftColor: item.color,
                  borderLeftWidth: '3px'
                }}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       {Icon && (
                         <div className="p-1 rounded bg-secondary border border-border/30" style={{ color: item.color }}>
                            <Icon className="w-3 h-3 stroke-[2.5]" />
                         </div>
                       )}
                       <div className="flex flex-col">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-wide leading-none",
                            isActive ? "text-foreground" : "text-foreground/90"
                          )}>
                            {item.name}
                          </span>
                          {item.subLabel && (
                            <span className={cn(
                              "text-[7px] font-black uppercase tracking-widest leading-none mt-1 transition-colors",
                              item.subLabel === "Critical" || item.subLabel === "Open" ? "text-critical-accent" : 
                              item.subLabel === "High" || item.subLabel === "In Progress" ? "text-high-accent" : 
                              item.subLabel === "Medium" || item.subLabel === "Pending Review" ? "text-medium-accent" : 
                              item.subLabel === "Resolved" ? "text-emerald-accent" : "text-xanh-accent"
                            )}>
                              {item.subLabel} ({item.value})
                            </span>
                          )}
                       </div>
                    </div>
                    <span className={cn(
                      "text-[9px] font-mono font-bold transition-colors",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {pct}%
                    </span>
                 </div>

                 <div className="h-0.5 bg-muted/65 rounded-full overflow-hidden mt-1.5 w-full">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${pct}%` }}
                     className="h-full rounded-full" 
                     style={{ backgroundColor: item.color }} 
                   />
                 </div>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-200 cursor-pointer group",
                isActive
                  ? "border-white/20 bg-white/[0.08]"
                  : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
              )}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {/* Left: color dot + name */}
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-200"
                  style={{
                    backgroundColor: item.color,
                    boxShadow: isActive ? `0 0 10px ${item.color}` : `0 0 6px ${item.color}66`,
                    transform: isActive ? "scale(1.3)" : "scale(1)",
                  }}
                />
                <span
                  className={cn(
                    "text-[10px] font-mono font-black uppercase tracking-wider transition-colors duration-200 truncate",
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/80"
                  )}
                >
                  {item.name}
                </span>
              </div>

              {/* Right: percentage + count */}
              <div className="flex items-center gap-4 shrink-0 ml-2">
                <span className={cn(
                  "text-[10px] font-mono font-black transition-colors duration-200",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}>
                  {pct}%
                </span>
                <span
                  className={cn(
                    "text-[10px] font-mono font-black w-8 text-right transition-colors duration-200",
                    isActive ? "text-foreground" : "text-foreground/70"
                  )}
                >
                  {item.value}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
