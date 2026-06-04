import React from "react";
import { 
  Workflow, 
  AlertTriangle, 
  Zap, 
  ShieldCheck, 
  Clock 
} from "lucide-react";
import { Playbook } from "./playbooksConfig";
import { MockIncident, mitreTechniques } from "./playbookMockData";

export interface HeroStatsGridProps {
  playbooks: Playbook[];
  incidents: MockIncident[];
}

export function HeroStatsGrid({ playbooks, incidents }: HeroStatsGridProps) {
  const totalPlaybooks = playbooks.length;
  const activeIncidentsCount = incidents.filter(i => i.status !== "Closed" && i.status !== "Contained").length;
  const closedIncidentsCount = incidents.filter(i => i.status === "Closed" || i.status === "Contained").length;
  const mitreTechniquesCount = mitreTechniques.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="playbooks-hero-stats-grid">
      {/* Total Playbooks */}
      <div className="bg-card border border-border rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-cyan-500/30 transition">
        <div className="absolute top-2 right-2 p-1.5 bg-blue-500/5 text-blue-500 rounded-md">
          <Workflow className="w-4 h-4" />
        </div>
        <span className="text-[9px] font-mono text-muted-foreground/90 tracking-wider uppercase font-black">Total Playbooks</span>
        <div className="text-xl font-mono font-black mt-1">{totalPlaybooks} Active</div>
        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/90 mt-2 font-mono font-semibold">
          <span className="text-emerald-500 font-extrabold">● Core 8</span>
          <span>+ 13 custom nodes</span>
        </div>
      </div>

      {/* Active Incidents */}
      <div className="bg-card border border-border rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-rose-500/30 transition">
        <div className="absolute top-2 right-2 p-1.5 bg-rose-500/5 text-rose-500 rounded-md">
          <AlertTriangle className="w-4 h-4 animate-pulse" />
        </div>
        <span className="text-[9px] font-mono text-muted-foreground/90 tracking-wider uppercase font-black">Active Incidents</span>
        <div className="text-xl font-mono font-black mt-1 text-rose-500">{activeIncidentsCount} Cases</div>
        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/90 mt-2 font-mono font-semibold">
          <span className="text-emerald-500 font-extrabold">-12%</span>
          <span>historical reduction rate</span>
        </div>
      </div>

      {/* Response Workflows */}
      <div className="bg-card border border-border rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-emerald-500/30 transition">
        <div className="absolute top-2 right-2 p-1.5 bg-emerald-500/5 text-emerald-500 rounded-md">
          <Zap className="w-4 h-4" />
        </div>
        <span className="text-[9px] font-mono text-muted-foreground/90 tracking-wider uppercase font-black">Response Workflows</span>
        <div className="text-xl font-mono font-black mt-1">{closedIncidentsCount} Success</div>
        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/90 mt-2 font-mono font-semibold">
          <span className="text-cyan-500 font-extrabold">100%</span>
          <span>simulated dispatch validity</span>
        </div>
      </div>

      {/* MITRE Covers */}
      <div className="bg-card border border-border rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-purple-500/30 transition">
        <div className="absolute top-2 right-2 p-1.5 bg-purple-500/5 text-purple-500 rounded-md">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <span className="text-[9px] font-mono text-muted-foreground/90 tracking-wider uppercase font-black">MITRE Techniques</span>
        <div className="text-xl font-mono font-black mt-1">{mitreTechniquesCount} Tactics</div>
        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/90 mt-2 font-mono font-semibold">
          <span className="text-purple-500 font-extrabold">32 Codes</span>
          <span>exhaustive mapped coverage</span>
        </div>
      </div>

      {/* Avg Resolution Time */}
      <div className="bg-card border border-border rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-amber-500/30 transition">
        <div className="absolute top-2 right-2 p-1.5 bg-amber-500/5 text-amber-500 rounded-md">
          <Clock className="w-4 h-4" />
        </div>
        <span className="text-[9px] font-mono text-muted-foreground/90 tracking-wider uppercase font-black">Avg Response Time</span>
        <div className="text-xl font-mono font-black mt-1 text-amber-500">4.2 Mins</div>
        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/90 mt-2 font-mono font-semibold">
          <span className="text-emerald-500 font-extrabold">↓ 18%</span>
          <span>reduction over manual</span>
        </div>
      </div>
    </div>
  );
}
