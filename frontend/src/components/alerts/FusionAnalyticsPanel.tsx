import React from "react";
import { BarChart3, TrendingUp, Cpu, Activity, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";

export function FusionAnalyticsPanel() {
  const analyticsData = [
    { hour: "08:00", rawAlerts: 4200, fusionAlerts: 4 },
    { hour: "09:00", rawAlerts: 5800, fusionAlerts: 6 },
    { hour: "10:00", rawAlerts: 9200, fusionAlerts: 11 },
    { hour: "11:00", rawAlerts: 3100, fusionAlerts: 3 },
    { hour: "12:00", rawAlerts: 4800, fusionAlerts: 5 },
    { hour: "13:00", rawAlerts: 6500, fusionAlerts: 7 }
  ];

  const totalRaw = analyticsData.reduce((sum, d) => sum + d.rawAlerts, 0);
  const totalFusion = analyticsData.reduce((sum, d) => sum + d.fusionAlerts, 0);
  const compressionRatio = ((totalRaw - totalFusion) / totalRaw * 100).toFixed(2);

  return (
    <div className="space-y-6 select-none">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI Reduction percentage stats */}
        <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[7.5px] font-black uppercase text-muted-foreground tracking-wider leading-none">NOISE REDUCTION RATE</span>
            <div className="text-xl font-black font-mono text-emerald-500 leading-none">{compressionRatio}%</div>
            <p className="text-[7.5px] text-muted-foreground font-semibold uppercase leading-none">Signal/Noise Ratio</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <TrendingUp size={14} className="animate-pulse" />
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[7.5px] font-black uppercase text-muted-foreground tracking-wider leading-none">RAW SOURCE ALERTS</span>
            <div className="text-xl font-black font-mono text-zinc-400 leading-none">{totalRaw.toLocaleString()}</div>
            <p className="text-[7.5px] text-muted-foreground font-semibold uppercase leading-none">Ingestion Rate</p>
          </div>
          <div className="p-3 bg-zinc-500/10 text-zinc-500 rounded-lg">
            <Activity size={14} />
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[7.5px] font-black uppercase text-muted-foreground tracking-wider leading-none">CORRELATED CAMPAIGNS</span>
            <div className="text-xl font-black font-mono text-cyan-500 leading-none">{totalFusion} decisions</div>
            <p className="text-[7.5px] text-muted-foreground font-semibold uppercase leading-none">Aggregator output</p>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-lg">
            <Cpu size={14} />
          </div>
        </div>
      </div>

      {/* Reduction Curve custom visualization */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <div className="flex items-center gap-1.5">
            <BarChart3 size={14} className="text-cyan-500" />
            <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">
              Raw Alert Volume vs Solidified Fusion Decisions
            </h3>
          </div>
          <span className="text-[7px] font-mono font-black text-emerald-400 bg-emerald-500/5 border border-emerald-500/15 px-2 py-0.5 rounded uppercase">
            99.9% Noise Filter
          </span>
        </div>

        {/* Visual custom SVG line chart/bar layout */}
        <div className="h-44 bg-secondary/10 border border-border/40 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex-1 flex gap-4 items-end px-2 border-b border-border/60 pb-1 pt-4 relative">
            {analyticsData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center h-full group relative">
                {/* Raw alerts high-altitude background bar */}
                <div 
                  className="bg-zinc-800 hover:bg-zinc-700/80 w-8 max-w-full rounded-t-sm transition-all duration-300 relative cursor-help"
                  style={{ height: `${(data.rawAlerts / 10000) * 100}%` }}
                  title={`Raw Alerts: ${data.rawAlerts}`}
                />
                {/* Fusion alerts foreground hot point */}
                <div 
                  className="bg-cyan-500 hover:bg-cyan-400 w-8 max-w-full rounded-t-sm transition-all duration-300 absolute bottom-0 shadow-[0_0_8px_rgba(6,182,212,0.3)] cursor-help border border-cyan-400/20"
                  style={{ height: `${(data.fusionAlerts / 15) * 100}%` }}
                  title={`Fusion Alerts: ${data.fusionAlerts}`}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-between font-mono text-[7px] text-muted-foreground uppercase pt-2 leading-none px-2">
            {analyticsData.map((data, i) => (
              <span key={i} className="flex-1 text-center font-bold">{data.hour}</span>
            ))}
          </div>
        </div>

        {/* Footnote explanations */}
        <div className="flex justify-start gap-4 text-[7px] font-mono text-muted-foreground uppercase font-black px-1 leading-none">
          <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 bg-zinc-700 rounded-sm" /> Raw Packet/Rule hits (Scale 0-10,000)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 bg-cyan-500 rounded-sm" /> Correlated Fusion Anomalies (Scale 0-15)</span>
        </div>
      </div>
    </div>
  );
}

export default FusionAnalyticsPanel;
