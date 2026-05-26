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
      value: 1248,
      suffix: "",
      isFloat: false,
      change: "+12.4%",
      isPositive: false,
      detail: "vs previous 30 days",
      icon: ShieldAlert,
      color: "text-cyan-400 border-cyan-500/30",
      glowColor: "shadow-[0_0_20px_rgba(6,182,212,0.12)]",
      borderColor: "border-cyan-500/20 hover:border-cyan-500/50",
      badgeColor: "bg-cyan-500/10 text-cyan-400",
      pulse: true
    },
    {
      title: "CRITICAL INCIDENTS",
      value: 42,
      suffix: "",
      isFloat: false,
      change: "-8.3%",
      isPositive: true,
      detail: "Mitigated and closed",
      icon: AlertTriangle,
      color: "text-red-400 border-red-500/30",
      glowColor: "shadow-[0_0_20px_rgba(244,63,94,0.15)]",
      borderColor: "border-red-500/20 hover:border-red-500/50",
      badgeColor: "bg-red-500/10 text-red-400",
      pulse: true
    },
    {
      title: "MEAN TIME TO RESOLVE",
      value: 145, // will scale dynamically
      suffix: "m",
      isFloat: true,
      change: "-2.1m",
      isPositive: true,
      detail: "SLA Standard: 15m",
      icon: Hourglass,
      color: "text-amber-400 border-amber-500/30",
      glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.12)]",
      borderColor: "border-amber-500/20 hover:border-amber-500/50",
      badgeColor: "bg-amber-500/10 text-amber-400",
      pulse: false
    },
    {
      title: "FALSE POSITIVE RATE",
      value: 24, // will scale dynamically
      suffix: "%",
      isFloat: true,
      change: "-0.6%",
      isPositive: true,
      detail: "AI Fusion Engine Tuning",
      icon: ShieldX,
      color: "text-emerald-400 border-emerald-500/30",
      glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.12)]",
      borderColor: "border-emerald-500/20 hover:border-emerald-500/50",
      badgeColor: "bg-emerald-500/10 text-emerald-400",
      pulse: false
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className={`bg-card rounded-xl p-5 border ${stat.borderColor} ${stat.glowColor} transition-all duration-300 hover:scale-[1.02] hover:bg-card/90 flex flex-col justify-between group relative overflow-hidden`}
          >
            {/* Cyber Corner lines decorations */}
            <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-border group-hover:border-cyan-500/40 transition-colors" />
            <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-border group-hover:border-cyan-500/40 transition-colors" />

            <div className="flex justify-between items-start gap-3 relative z-10">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-1.5">
                  {stat.pulse && (
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${i === 1 ? 'bg-red-400' : 'bg-cyan-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${i === 1 ? 'bg-red-500' : 'bg-cyan-500'}`}></span>
                    </span>
                  )}
                  <span className="text-[9px] font-mono font-bold text-muted-foreground tracking-[0.18em] uppercase block leading-none">
                    {stat.title}
                  </span>
                </div>
                <div className="text-3xl font-black text-foreground tracking-tight block font-mono">
                  {stat.isFloat ? (
                    <span>
                      {(stat.value / 10).toFixed(1)}
                      <span className="text-lg text-muted-foreground font-sans ml-0.5">{stat.suffix}</span>
                    </span>
                  ) : (
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  )}
                </div>
              </div>
              <div className={`p-2.5 rounded-lg bg-muted border border-border ${stat.color} transition-all duration-300 group-hover:shadow-[0_0_10px_rgba(6,182,212,0.15)]`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3 relative z-10">
              <div className="flex items-center gap-1">
                {stat.isPositive ? (
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5 text-red-500" />
                )}
                <span className={`text-[10px] font-mono font-bold tracking-wider ${stat.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stat.change}
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold uppercase text-muted-foreground tracking-wider">
                {stat.detail}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
