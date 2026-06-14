import React, { useMemo } from "react";
import { Server, Activity, AlertTriangle, AlertOctagon, Cpu, TrendingUp, TrendingDown } from "lucide-react";
import { makeSparkline } from "./endpointFCAJData";

interface EndpointOverviewCardsProps {
  stats: {
    total: number;
    active: number;
    alertList: number;
    critical: number;
    newCount: number;
  };
}

export const EndpointOverviewCards: React.FC<EndpointOverviewCardsProps> = ({ stats }) => {
  const sparks = useMemo(() => {
    return {
      total: makeSparkline(10, 80),
      active: makeSparkline(10, 75),
      alerts: makeSparkline(10, 30),
      critical: makeSparkline(10, 10),
      newCount: makeSparkline(10, 5),
    };
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" id="endpoint-overview-cards">
      {/* Card 1: Total Endpoints */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-xs space-y-2 relative group hover:border-indigo-500/50 dark:hover:border-cyan-400/50 transition-all duration-300">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-muted rounded-lg">
            <Server size={14} className="text-muted-foreground" />
          </div>
          <span className="text-[10px] text-emerald-500 font-mono font-black flex items-center gap-0.5">
            <TrendingUp size={10} /> +4%
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 pt-1">
          <div>
            <h3 className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">Total Assets</h3>
            <p className="text-xl font-extrabold tracking-tight font-mono text-foreground">{stats.total}</p>
          </div>
          {/* Sparkline visualization */}
          <div className="h-8 w-20 shrink-0">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-slate-500 stroke-2 fill-none">
              <path d={`M ${sparks.total.map((s, idx) => `${idx * 10} ${20 - s / 5}`).join(', ')}`} />
            </svg>
          </div>
        </div>
        {/* Tooltip */}
        <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[8px] px-2 py-1 rounded font-mono uppercase tracking-wider z-25 transition-all">
          Deploy scope catalog details
        </div>
      </div>

      {/* Card 2: Active Endpoints */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-xs space-y-2 relative group hover:border-indigo-500/50 dark:hover:border-cyan-400/50 transition-all duration-300">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-indigo-500/10 dark:bg-indigo-955/50 rounded-lg">
            <Activity size={14} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-[10px] text-emerald-500 font-mono font-black flex items-center gap-0.5">
            <TrendingUp size={10} /> +12%
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 pt-1">
          <div>
            <h3 className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">Active Hosts</h3>
            <p className="text-xl font-extrabold tracking-tight font-mono text-emerald-600 dark:text-emerald-400">{stats.active}</p>
          </div>
          {/* Sparkline visualization */}
          <div className="h-8 w-20 shrink-0">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-emerald-500 stroke-2 fill-none">
              <path d={`M ${sparks.active.map((s, idx) => `${idx * 10} ${20 - s / 5}`).join(', ')}`} />
            </svg>
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[8px] px-2 py-1 rounded font-mono uppercase tracking-wider z-25 transition-all">
          Hosts streaming telemetry data
        </div>
      </div>

      {/* Card 3: Endpoints w/ Alerts */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-xs space-y-2 relative group hover:border-indigo-500/50 dark:hover:border-cyan-400/50 transition-all duration-300">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-amber-500/10 dark:bg-amber-955/45 rounded-lg">
            <AlertTriangle size={14} className="text-amber-500" />
          </div>
          <span className="text-[10px] text-red-500 font-mono font-black flex items-center gap-0.5">
            <TrendingUp size={10} /> +8%
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 pt-1">
          <div>
            <h3 className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">Host Alerts</h3>
            <p className="text-xl font-extrabold tracking-tight font-mono text-amber-500">{stats.alertList}</p>
          </div>
          {/* Sparkline visualization */}
          <div className="h-8 w-20 shrink-0">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-amber-500 stroke-2 fill-none">
              <path d={`M ${sparks.alerts.map((s, idx) => `${idx * 10} ${20 - s / 5}`).join(', ')}`} />
            </svg>
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[8px] px-2 py-1 rounded font-mono uppercase tracking-wider z-25 transition-all">
          Systems flagged during 24h spectrum
        </div>
      </div>

      {/* Card 4: Critical Endpoints */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-xs space-y-2 relative group hover:border-indigo-500/50 dark:hover:border-cyan-400/50 transition-all duration-300">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-red-500/10 dark:bg-red-955/45 rounded-lg">
            <AlertOctagon size={14} className="text-red-505" />
          </div>
          <span className="text-[10px] text-emerald-500 font-mono font-black flex items-center gap-0.5">
            <TrendingDown size={10} /> -3%
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 pt-1">
          <div>
            <h3 className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">Critical Severity</h3>
            <p className="text-xl font-extrabold tracking-tight font-mono text-red-550 animate-pulse">{stats.critical}</p>
          </div>
          {/* Sparkline visualization */}
          <div className="h-8 w-20 shrink-0">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-red-500 stroke-2 fill-none">
              <path d={`M ${sparks.critical.map((s, idx) => `${idx * 10} ${20 - s / 5}`).join(', ')}`} />
            </svg>
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[8px] px-2 py-1 rounded font-mono uppercase tracking-wider z-25 transition-all">
          Requires immediate isolation intervention
        </div>
      </div>

      {/* Card 5: New Endpoints Today */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-xs space-y-2 relative group hover:border-indigo-500/50 dark:hover:border-cyan-400/50 transition-all duration-300">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-cyan-500/10 dark:bg-cyan-955/45 rounded-lg">
            <Cpu size={14} className="text-cyan-600 dark:text-cyan-400" />
          </div>
          <span className="text-[10px] text-emerald-500 font-mono font-black flex items-center gap-0.5">
            <TrendingUp size={10} /> +1%
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 pt-1">
          <div>
            <h3 className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">Discovered Today</h3>
            <p className="text-xl font-extrabold tracking-tight font-mono text-cyan-600 dark:text-cyan-400">{stats.newCount}</p>
          </div>
          {/* Sparkline visualization */}
          <div className="h-8 w-20 shrink-0">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-cyan-500 stroke-2 fill-none">
              <path d={`M ${sparks.newCount.map((s, idx) => `${idx * 10} ${20 - s / 5}`).join(', ')}`} />
            </svg>
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[8px] px-2 py-1 rounded font-mono uppercase tracking-wider z-25 transition-all">
          New agent registrations recorded today
        </div>
      </div>
    </div>
  );
};
