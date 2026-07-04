import React, { useState } from "react";
import { Link2, Sparkles, Filter, Search } from "lucide-react";
import { MitreAlertMapping } from "./mitreConfig";
import { cn } from "../../lib/utils";

interface MitreAlertMappingTableProps {
  alerts: MitreAlertMapping[];
  selectedTechniqueId: string | null;
  onSelectTechniqueId: (id: string) => void;
}

export function MitreAlertMappingTable({
  alerts,
  selectedTechniqueId,
  onSelectTechniqueId,
}: MitreAlertMappingTableProps) {
  const [activeTacticFilter, setActiveTacticFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const tactics = Array.from(new Set(alerts.map((a) => a.tactic)));

  const filtered = alerts.filter((a) => {
    // 1. Tactic Filter
    if (activeTacticFilter !== "ALL" && a.tactic !== activeTacticFilter) {
      return false;
    }
    // 2. Text Search Filter (Alert ID, host IP, Fusion Decision, Tech ID/Name)
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      return (
        a.alertId.toLowerCase().includes(q) ||
        a.sourceIp.includes(q) ||
        a.destIp.includes(q) ||
        a.fusionDecision.toLowerCase().includes(q) ||
        a.techniqueId.toLowerCase().includes(q) ||
        a.techniqueName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4 select-none">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Sparkles size={11} className="text-cyan-400" />
            <span className="text-[9px] font-mono font-black tracking-[0.2em] text-[#06b6d4] uppercase">
              FUSION ALERT CORRELATION
            </span>
          </div>
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
            Alert {'->'} MITRE ATT&amp;CK Mapping Table
          </h3>
        </div>

        {/* Filters Area */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Search Host IP, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background border border-border text-[9.5px] font-mono text-foreground pl-7 pr-2.5 py-1.5 rounded-lg placeholder:text-muted-foreground/45 focus:outline-none focus:border-cyan-500/40 uppercase tracking-wider w-full sm:w-44"
            />
          </div>

          {/* Tactic dropdown */}
          <div className="flex items-center gap-1">
            <Filter size={10} className="text-muted-foreground shrink-0" />
            <select
              value={activeTacticFilter}
              onChange={(e) => setActiveTacticFilter(e.target.value)}
              className="bg-background border border-border text-[9px] font-black uppercase text-foreground px-2 py-1.5 rounded-lg cursor-pointer focus:outline-none focus:border-cyan-500/40"
            >
              <option value="ALL">ALL TARGET TACTICS</option>
              {tactics.map((t) => (
                <option key={t} value={t}>
                  {t.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Primary Grid Area */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse text-left text-[10px] font-mono whitespace-nowrap">
          <thead>
            <tr className="border-b border-border text-muted-foreground/80 font-black uppercase text-[8.5px] tracking-widest">
              <th className="py-2.5 pr-2 w-16">Timestamp</th>
              <th className="py-2.5 px-2.5 w-20">Alert ID</th>
              <th className="py-2.5 px-2.5 w-24">Source IP</th>
              <th className="py-2.5 px-2.5 w-24">Dest IP</th>
              <th className="py-2.5 px-2.5">Fusion Decision</th>
              <th className="py-2.5 px-2.5 w-20">Tech ID</th>
              <th className="py-2.5 px-2.5">Technique Name</th>
              <th className="py-2.5 px-2.5 w-24">MITRE Tactic</th>
              <th className="py-2.5 pl-2.5 w-16 text-right">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/15">
            {filtered.map((alert) => {
              const isSelected = selectedTechniqueId === alert.techniqueId;
              return (
                <tr
                  key={alert.alertId}
                  onClick={() => onSelectTechniqueId(alert.techniqueId)}
                  className={cn(
                    "hover:bg-muted/30 cursor-pointer transition-colors group",
                    isSelected ? "bg-cyan-500/4 border-l border-l-cyan-500" : ""
                  )}
                >
                  <td className="py-3 pr-2 text-muted-foreground text-[9px]">
                    {alert.timestamp}
                  </td>
                  <td className="py-3 px-2.5 font-bold text-foreground">
                    {alert.alertId}
                  </td>
                  <td className="py-3 px-2.5 font-bold text-foreground">
                    {alert.sourceIp}
                  </td>
                  <td className="py-3 px-2.5 font-bold text-foreground">
                    {alert.destIp}
                  </td>
                  <td className="py-3 px-2.5">
                    <span className="bg-muted px-1.5 py-0.5 rounded text-[8.5px] font-semibold text-foreground/90 border border-border/80">
                      {alert.fusionDecision}
                    </span>
                  </td>
                  <td className="py-3 px-2.5 font-black text-cyan-400">
                    <div className="flex items-center gap-1">
                      <Link2 size={10} className="text-cyan-500/60" />
                      <span>{alert.techniqueId}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2.5 text-foreground font-semibold">
                    {alert.techniqueName}
                  </td>
                  <td className="py-3 px-2.5 text-muted-foreground font-extrabold uppercase text-[8px]">
                    {alert.tactic}
                  </td>
                  <td className="py-3 pl-2.5 text-right font-black">
                    <span
                      className={cn(
                        "text-[9px] font-mono",
                        alert.confidence >= 90
                          ? "text-emerald-400"
                          : alert.confidence >= 80
                          ? "text-cyan-400"
                          : "text-amber-400"
                      )}
                    >
                      {alert.confidence}%
                    </span>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="py-12 text-center text-muted-foreground font-mono uppercase tracking-[0.2em] text-[9px]"
                >
                  No compiled detections mapped to active query
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Help Tip */}
      <div className="text-[8px] font-mono text-muted-foreground/60 text-right uppercase tracking-widest">
        * Click any alert mapping row to trigger target investigator.
      </div>
    </div>
  );
}
