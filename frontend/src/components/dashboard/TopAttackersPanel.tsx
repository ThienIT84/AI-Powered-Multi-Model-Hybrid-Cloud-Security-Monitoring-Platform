import React from "react";
import { ShieldAlert, Crosshair, Map, Globe, HelpCircle } from "lucide-react";
import { cn } from "../../lib/utils";

export function TopAttackersPanel() {
  const attackers = [
    { ip: "185.220.101.42", count: 1840, score: 98, campaigns: 3, country: "DE", asn: "AS206349 (Tor Exit)" },
    { ip: "45.146.164.110", count: 1252, score: 92, campaigns: 2, country: "RU", asn: "AS49505 (Infolada)" },
    { ip: "103.204.170.5", count: 911, score: 85, campaigns: 1, country: "IN", asn: "AS9829 (BSNL)" },
    { ip: "152.32.144.90", count: 480, score: 76, campaigns: 1, country: "CN", asn: "AS55990 (Huawei)" }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm h-65 select-none">
      <div className="flex items-center justify-between mb-2 border-b border-border/20 pb-2 shrink-0">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Crosshair className="w-4 h-4 text-cyan-500 animate-pulse" />
          TOP ADVERSARY ATTACKERS PANEL
        </h3>
        <span className="text-[7.5px] bg-[#06b6d4]/10 text-cyan-500 border border-cyan-500/15 px-2.5 py-0.5 rounded uppercase font-black font-mono">
          INTEL INDEX
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5 space-y-2 py-1 select-none">
        {attackers.map(a => (
          <div key={a.ip} className="bg-background/80 border border-border p-2 rounded-lg font-mono leading-none flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* Fake country flag / letters */}
              <div className="w-5 h-5 flex items-center justify-center rounded bg-secondary border border-border text-[7.5px] font-black shrink-0 text-cyan-500">
                {a.country}
              </div>
              
              <div className="flex flex-col truncate pr-1">
                <span className="text-[9.5px] font-black text-foreground truncate">{a.ip}</span>
                <span className="text-[7px] text-muted-foreground mt-1 truncate uppercase">{a.asn}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 font-bold text-[8.5px] text-right">
              <div>
                <span className="text-muted-foreground block text-[6.5px] uppercase font-bold mb-0.5">ATTACKS</span>
                <span className="text-foreground font-black">{a.count}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[6.5px] uppercase font-bold mb-0.5">RISK INDEX</span>
                <span className="text-red-500 font-black">{a.score}/100</span>
              </div>
              <div className="w-12 text-center bg-purple-500/10 border border-purple-500/15 text-purple-400 p-1 px-1.5 rounded">
                <span className="text-[7px] font-black block uppercase leading-none">CAMPS: {a.campaigns}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopAttackersPanel;
