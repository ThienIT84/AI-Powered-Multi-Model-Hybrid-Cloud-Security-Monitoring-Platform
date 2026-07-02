import React from "react";
import { Server, ShieldAlert, Cpu, Heart, CheckCircle } from "lucide-react";
import { cn } from "../../lib/utils";

export function TopTargetsPanel() {
  const targets = [
    { name: "DMZ-WEB-SVR-01", type: "Web Server (HTTP)", ip: "10.0.1.15", count: 852, score: 94, status: "Critical" },
    { name: "CORP-AD-DC-02", type: "Active Directory DC", ip: "10.0.1.4", count: 342, score: 88, status: "Investigation" },
    { name: "APP-SQL-DB-01", type: "Postgre Database Hub", ip: "10.0.2.22", count: 184, score: 72, status: "Mitigated" },
    { name: "CLOUD-S3-BUCKET", type: "AWS S3 Assets Storage", ip: "AWS-S3-0941", count: 98, score: 45, status: "Healthy" }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm h-65 select-none">
      <div className="flex items-center justify-between mb-2 border-b border-border/20 pb-2 shrink-0">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Server className="w-4 h-4 text-cyan-500 animate-pulse" />
          TOP TARGETED NETWORK ASSETS PANEL
        </h3>
        <span className="text-[7.5px] bg-[#06b6d4]/10 text-cyan-500 border border-cyan-500/15 px-2.5 py-0.5 rounded uppercase font-black font-mono">
          ASSETS FEED
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5 space-y-2 py-1 select-none font-mono">
        {targets.map(t => (
          <div key={t.name} className="bg-background/80 border border-border p-2 rounded-lg leading-none flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="p-1.5 rounded bg-secondary border border-border/20 text-muted-foreground shrink-0">
                <Server size={12} className="text-cyan-500" />
              </div>

              <div className="flex flex-col truncate pr-1">
                <span className="text-[9.5px] font-black text-foreground truncate">{t.name}</span>
                <span className="text-[7px] text-muted-foreground mt-1 truncate uppercase">{t.type} - {t.ip}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 font-bold text-[8.5px] text-right">
              <div>
                <span className="text-muted-foreground block text-[6.5px] uppercase font-bold mb-0.5">ALERTS</span>
                <span className="text-foreground font-black">{t.count}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[6.5px] uppercase font-bold mb-0.5">RISK INDEX</span>
                <span className="text-red-500 font-black">{t.score}/100</span>
              </div>
              <span className={cn(
                "text-[7px] font-black px-1.5 py-0.75 rounded border uppercase tracking-wider leading-none block text-center min-w-13.75",
                t.status === "Critical" ? "bg-red-500/10 border-red-500/20 text-red-500" :
                t.status === "Investigation" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500 animate-pulse" :
                t.status === "Mitigated" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                "bg-blue-500/10 border-blue-500/20 text-cyan-400"
              )}>
                {t.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopTargetsPanel;
