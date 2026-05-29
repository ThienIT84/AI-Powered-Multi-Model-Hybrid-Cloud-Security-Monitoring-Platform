import React, { useState } from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

export interface IncidentItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  count: number;
  confidence: number;
  color: string;
  borderColor: string;
}

interface IncidentsFeedProps {
  items: IncidentItem[];
  title?: string;
  subtitle?: string;
  confidenceLabel?: string;
}

export function IncidentsFeed({
  items,
  title = "INCIDENTS FEED (TOGGLE)",
  subtitle = "INCIDENTS FEED (TOGGLE)",
  confidenceLabel = "CONF LIMIT (AVG)",
}: IncidentsFeedProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const severityColors: Record<string, string> = {
    Critical: "text-critical-accent",
    High: "text-high-accent",
    Medium: "text-medium-accent",
    Low: "text-low-accent",
  };

  const severityBgColors: Record<string, string> = {
    Critical: "bg-critical-accent/10 dark:bg-critical-accent/15",
    High: "bg-high-accent/10 dark:bg-high-accent/15",
    Medium: "bg-medium-accent/10 dark:bg-medium-accent/15",
    Low: "bg-low-accent/10 dark:bg-low-accent/15",
  };

  const severityBorderColors: Record<string, string> = {
    Critical: "border-critical-accent/30",
    High: "border-high-accent/30",
    Medium: "border-medium-accent/30",
    Low: "border-low-accent/30",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-1">
            {subtitle}
          </p>
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
            {title}
          </h3>
        </div>
        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
          {confidenceLabel}
        </span>
      </div>

      {/* Incidents list */}
      <div className="space-y-2">
        {items.map((item, idx) => {
          const isActive = activeId === item.id;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onMouseEnter={() => setActiveId(item.id)}
              onMouseLeave={() => setActiveId(null)}
              onClick={() => setActiveId(isActive ? null : item.id)}
              className={cn(
                "relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer group",
                isActive
                  ? "border-border shadow-sm"
                  : "border-border bg-background/50 hover:bg-background/80 hover:border-border/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              )}
              style={{
                backgroundColor: isActive ? `color-mix(in srgb, ${item.color}, transparent 85%)` : undefined,
              }}
            >
              {/* Left border accent */}
              <div
                className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all duration-200"
                style={{
                  backgroundColor: item.color,
                  boxShadow: isActive ? `0 0 12px ${item.color}80` : `0 0 4px ${item.color}40`,
                }}
              />

              {/* Icon */}
              <div
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200 shrink-0",
                  isActive
                    ? `bg-background border-border shadow-inner ${severityColors[item.severity]}`
                    : "bg-muted/30 border-border text-muted-foreground opacity-70"
                )}
              >
                <div className="text-lg">{item.icon}</div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 ml-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    "text-[11px] font-black uppercase tracking-wide transition-colors duration-200",
                    isActive ? "text-foreground" : "text-foreground/60"
                  )}>
                    {item.title}
                  </span>
                  <span className={cn(
                    "text-[8px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded-full border transition-all duration-200",
                    isActive ? severityColors[item.severity] : "text-muted-foreground/50 border-border/50",
                    isActive ? severityBgColors[item.severity] : "bg-transparent",
                    isActive ? severityBorderColors[item.severity] : ""
                  )}>
                    {item.severity} ({item.count})
                  </span>
                </div>
              </div>

              {/* Confidence percentage */}
              <div className={cn(
                "text-[12px] font-mono font-black shrink-0 transition-colors duration-200",
                isActive ? severityColors[item.severity] : "text-muted-foreground/50"
              )}>
                {item.confidence}%
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
