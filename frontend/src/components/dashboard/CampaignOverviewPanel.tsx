import React from "react";
import { Flag, ShieldAlert, Cpu, Layers, Clock, AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";

export function CampaignOverviewPanel() {
  const campaigns = [
    {
      id: "CAMP-201",
      name: "APT-41 Coordinated Brute-Force Recon Campaign",
      risk: "Critical",
      assets: "DMZ-WEB-SVR-01, CORP-AD-DC-02",
      stages: "Reconnaissance → Initial Access",
      duration: "3h 42m",
      volume: 1840,
      state: "ACTIVE"
    },
    {
      id: "CAMP-202",
      name: "Targeted Russian-speaking XSS Semantic Campaign",
      risk: "High",
      assets: "CLOUD-S3-BUCKET",
      stages: "Initial Access → SQLi Execution",
      duration: "12h 15m",
      volume: 450,
      state: "MONITORING"
    }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm h-80 select-none">
      <div className="flex items-center justify-between mb-2 border-b border-border/20 pb-2 shrink-0">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Flag className="w-4 h-4 text-cyan-500" />
          ACTIVE INTEL INCIDENT CAMPAIGN OVERVIEW
        </h3>
        <span className="text-[7.5px] bg-red-400/10 text-red-500 border border-red-500/15 px-2 py-0.5 rounded uppercase font-black font-mono">
          INTEL ACTIVE
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5 space-y-3.5 py-1 select-none font-mono text-[9px] leading-none">
        {campaigns.map(c => (
          <div key={c.id} className="bg-secondary/40 hover:bg-secondary/60 border border-border p-3.5 rounded-xl leading-relaxed flex flex-col gap-2 transition-all">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/20 text-purple-400 font-extrabold text-[8px]">
                  {c.id}
                </span>
                <span className="text-[10px] font-black uppercase text-foreground leading-none">
                  {c.name}
                </span>
              </div>
              <span className={cn(
                "px-2 py-px text-[7.5px] font-black rounded uppercase tracking-wide",
                c.risk === "Critical" ? "bg-red-500/10 border border-red-500/20 text-red-500" : "bg-orange-500/10 border border-orange-500/20 text-orange-400"
              )}>
                {c.risk}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[8.5px] text-muted-foreground font-bold mt-1 leading-normal border-t border-border/10 pt-2">
              <div>
                <span className="text-[6.5px] uppercase font-bold text-muted-foreground/50 block">AFFECTED ASSETS:</span>
                <span className="text-foreground font-semibold">{c.assets}</span>
              </div>
              <div>
                <span className="text-[6.5px] uppercase font-bold text-muted-foreground/50 block">CAMPAIGN STAGE RATIO:</span>
                <span className="text-cyan-400 font-bold">{c.stages}</span>
              </div>
              <div>
                <span className="text-[6.5px] uppercase font-bold text-muted-foreground/50 block">DURATION ACTIVE:</span>
                <span className="text-foreground font-semibold">{c.duration}</span>
              </div>
              <div>
                <span className="text-[6.5px] uppercase font-bold text-muted-foreground/50 block">DETECTIONS VOLUME:</span>
                <span className="text-foreground font-bold">{c.volume.toLocaleString()} alarms</span>
              </div>
            </div>

            <div className="flex items-center gap-1 mt-1 leading-none text-[7.5px] shrink-0 uppercase font-black tracking-widest text-emerald-500">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" />
               STATUS OVERVIEW: {c.state}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CampaignOverviewPanel;
