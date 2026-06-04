import React, { useState, useEffect } from "react";
import { AlertCircle, ShieldAlert, Sparkles, TrendingUp, TrendingDown, HelpCircle, Activity } from "lucide-react";
import { cn } from "../../lib/utils";

export function FusionRiskAnalytics() {
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTicks(t => t + 1);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const avgRisk = (42.5 + Math.sin(ticks * 0.4) * 2.1).toFixed(1);
  const maxRisk = 88;
  const currentThreatLevel = "ELEVATED (GUARD 2)";

  // Risk Score Distribution
  const distributions = [
    { label: "Low", count: 1842, pct: "58.4%", color: "bg-emerald-500" },
    { label: "Medium", count: 982, pct: "31.1%", color: "bg-cyan-500" },
    { label: "High", count: 284, pct: "9.0%", color: "bg-amber-500" },
    { label: "Critical", count: 48, pct: "1.5%", color: "bg-rose-500" }
  ];

  // Simulated sparkline trend
  const trendPoints = [42, 45, 41, 48, 43, 40, 42, 44, 41, 43, 42];
  const delta = "+1.8%";

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm select-none">
      <div className="flex items-center justify-between mb-4 border-b border-border/20 pb-2">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
          SECTION 30: MULTI-MODAL FUSION RISK RISK SCORING COGNITIVE ANALYTICS
        </h3>
        <span className="text-[7.5px] bg-rose-500/10 text-rose-500 border border-rose-500/15 px-2 py-0.5 rounded uppercase font-black font-mono">
          EVALUATIVE THREAT INDEX
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Key Metrics block */}
        <div className="lg:col-span-4 space-y-3 font-mono">
          
          <div className="bg-secondary/40 border border-border/70 p-3 rounded-lg leading-relaxed flex items-center justify-between">
            <div>
              <span className="text-muted-foreground block text-[7px] uppercase font-bold mb-0.5">AVG FUSION RISK SCORE</span>
              <span className="text-foreground text-2xl font-black">{avgRisk}</span>
            </div>
            <div className="text-right">
              <span className="text-[8px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <TrendingDown size={9} /> -2.4%
              </span>
              <span className="text-[6.5px] text-muted-foreground block mt-1">Normal Range</span>
            </div>
          </div>

          <div className="bg-secondary/40 border border-border/70 p-3 rounded-lg leading-relaxed flex items-center justify-between">
            <div>
              <span className="text-muted-foreground block text-[7px] uppercase font-bold mb-0.5">MAX PEAK RECORDED RISK</span>
              <span className="text-rose-500 text-2xl font-black">{maxRisk}</span>
            </div>
            <div className="text-right">
              <span className="text-[6.5px] text-muted-foreground block">Occurred 2h ago</span>
              <span className="text-[8px] text-rose-400 bg-rose-500/10 border border-rose-500/10 px-1.5 py-0.5 rounded inline-block mt-1">
                EXFIL ATTEMPT
              </span>
            </div>
          </div>

          <div className="bg-secondary/40 border border-border/70 p-3 rounded-lg leading-relaxed">
            <span className="text-muted-foreground block text-[7px] uppercase font-bold mb-1">COGNITIVE THREAT LEVEL</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
              <span className="text-amber-500 text-sm font-black tracking-wider leading-none">{currentThreatLevel}</span>
            </div>
          </div>

        </div>

        {/* Risk Distribution Grid */}
        <div className="lg:col-span-5 flex flex-col justify-start font-mono">
          <div className="text-[8px] font-black text-muted-foreground uppercase mb-2 block">
            RISK CLASSIFICATION DISTRIBUTION
          </div>

          <div className="space-y-2.5">
            {distributions.map((dist) => (
              <div key={dist.label} className="space-y-1">
                <div className="flex justify-between text-[8px] leading-none mb-0.5 font-bold">
                  <span className="text-foreground">{dist.label} Risk</span>
                  <span className="text-muted-foreground">{dist.count} ({dist.pct})</span>
                </div>
                <div className="h-1.5 bg-secondary/45 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-300", dist.color)} style={{ width: dist.pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Trend Visualizer */}
        <div className="lg:col-span-3 flex flex-col justify-between font-mono bg-secondary/30 border border-border/60 rounded-xl p-3">
          <div className="flex items-center justify-between text-[7.5px] font-black text-muted-foreground uppercase border-b border-border/10 pb-1.5 leading-none mb-2">
            <span>Risk Index Trend</span>
            <span className="text-rose-500 flex items-center gap-0.5 font-mono"><TrendingUp size={10} /> {delta}</span>
          </div>

          {/* Styled Sparkline with custom paths in SVG */}
          <div className="h-15 flex items-end justify-center py-1">
            <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d={`M 0,20 Q 10,12 20,22 T 40,15 T 60,25 T 80,10 T 100,5`}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d={`M 0,20 Q 10,12 20,22 T 40,15 T 60,25 T 80,10 T 100,5 L 100,30 L 0,30 Z`}
                fill="url(#riskGrad)"
              />
              {/* Highlight Peak dot */}
              <circle cx="100" cy="5" r="2.5" fill="#f43f5e" className="animate-pulse" />
            </svg>
          </div>

          <div className="text-[6.5px] text-muted-foreground uppercase font-black text-center mt-2 border-t border-border/5 pt-1.5">
            48-hour continuous rolling regression
          </div>
        </div>

      </div>
    </div>
  );
}

export default FusionRiskAnalytics;
