import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Hourglass, 
  ShieldX, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Activity
} from "lucide-react";
import { CYBER_COLORS } from "./reportsConfig";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
}

function AnimatedCounter({ value, suffix = "" }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) return;
    
    // Quick count up duration (~800ms)
    const duration = 800;
    const increment = Math.ceil(end / (duration / 25));
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [value]);

  // Format with commas if large
  const displayVal = count >= 1000 
    ? count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") 
    : count;

  return <span>{displayVal}{suffix}</span>;
}

export function ReportStats() {
  const stats = [
    {
      title: "TOTAL ALERTS DETECTED",
      valueDisplay: "1,248",
      suffix: " alerts",
      change: "+12.4% MoM",
      isPositive: false,
      detail: "vs previous 30d",
      icon: ShieldAlert,
      color: "text-cyan-400 border-cyan-500/30",
      glowColor: "shadow-[0_0_20px_rgba(6,182,212,0.12)]",
      borderColor: "border-cyan-500/20 hover:border-cyan-500/50",
      badgeColor: "bg-cyan-500/10 text-cyan-400",
      pulse: true
    },
    {
      title: "CRITICAL INCIDENTS",
      valueDisplay: "42",
      suffix: " incidents",
      change: "-8.3%",
      isPositive: true,
      detail: "Mitigated & Closed",
      icon: AlertTriangle,
      color: "text-red-400 border-red-500/30",
      glowColor: "shadow-[0_0_20px_rgba(244,63,94,0.15)]",
      borderColor: "border-red-500/20 hover:border-red-500/50",
      badgeColor: "bg-red-500/10 text-red-400",
      pulse: true
    },
    {
      title: "MEAN TIME TO RESOLVE",
      valueDisplay: "14.5",
      suffix: " min",
      change: "-2.1m",
      isPositive: true,
      detail: "SLA target: 15m",
      icon: Hourglass,
      color: "text-amber-400 border-amber-500/30",
      glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.12)]",
      borderColor: "border-amber-500/20 hover:border-amber-500/50",
      badgeColor: "bg-amber-500/10 text-amber-400",
      pulse: false
    },
    {
      title: "FALSE POSITIVE RATE",
      valueDisplay: "2.4",
      suffix: "%",
      change: "-0.6%",
      isPositive: true,
      detail: "AI Fusion optimized",
      icon: ShieldX,
      color: "text-emerald-400 border-emerald-500/30",
      glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.12)]",
      borderColor: "border-emerald-500/20 hover:border-emerald-500/50",
      badgeColor: "bg-emerald-500/10 text-emerald-400",
      pulse: false
    },
    {
      title: "INGEST RATE",
      valueDisplay: "9.8K",
      suffix: " events/sec",
      change: "Stable",
      isPositive: true,
      detail: "Stable pipeline",
      icon: Activity,
      color: "text-purple-400 border-purple-500/30",
      glowColor: "shadow-[0_0_20px_rgba(168,85,247,0.12)]",
      borderColor: "border-purple-500/20 hover:border-purple-500/50",
      badgeColor: "bg-purple-500/10 text-purple-400",
      pulse: false
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className={`bg-card rounded-xl p-4 border ${stat.borderColor} ${stat.glowColor} transition-all duration-300 hover:scale-[1.02] hover:bg-card/90 flex flex-col justify-between group relative overflow-hidden`}
          >
            {/* Cyber Corner lines decorations */}
            <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-border group-hover:border-cyan-500/40 transition-colors" />
            <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-border group-hover:border-cyan-500/40 transition-colors" />

            <div className="flex justify-between items-start gap-2 relative z-10">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-1">
                  {stat.pulse && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${i === 1 ? 'bg-red-400' : 'bg-cyan-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${i === 1 ? 'bg-red-500' : 'bg-cyan-500'}`}></span>
                    </span>
                  )}
                  <span className="text-[8px] font-mono font-bold text-muted-foreground tracking-[0.15em] uppercase block leading-none">
                    {stat.title}
                  </span>
                </div>
                <div className="text-2xl font-black text-foreground tracking-tight block font-mono">
                  <span>
                    {stat.valueDisplay}
                    <span className="text-[10px] text-muted-foreground font-sans ml-0.5">{stat.suffix}</span>
                  </span>
                </div>
              </div>
              <div className={`p-2 rounded-lg bg-muted border border-border ${stat.color} transition-all duration-300 group-hover:shadow-[0_0_10px_rgba(6,182,212,0.15)] shrink-0`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border pt-2 relative z-10 gap-1">
              <div className="flex items-center gap-1">
                {stat.change === "Stable" ? (
                  <Activity className="w-3 h-3 text-purple-400" />
                ) : stat.isPositive ? (
                  <TrendingDown className="w-3 h-3 text-emerald-500" />
                ) : (
                  <TrendingUp className="w-3 h-3 text-red-500" />
                )}
                <span className={`text-[9px] font-mono font-bold tracking-wider ${stat.change === "Stable" ? "text-purple-400" : stat.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stat.change}
                </span>
              </div>
              <span className="text-[8px] font-mono font-bold uppercase text-muted-foreground tracking-wide truncate max-w-25" title={stat.detail}>
                {stat.detail}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
