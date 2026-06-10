import React, { useState, useMemo } from "react";
import { Search, Filter, ShieldAlert, Monitor, Server, Tag, RefreshCw, Layers } from "lucide-react";
import { Asset } from "./types";
import { cn } from "../../lib/utils";

interface AssetInventoryTableProps {
  assets: Asset[];
  selectedAssetId: string | null;
  onSelectAssetId: (id: string) => void;
}

export function AssetInventoryTable({
  assets,
  selectedAssetId,
  onSelectAssetId,
}: AssetInventoryTableProps) {
  const [search, setSearch] = useState("");
  const [selectedZone, setSelectedZone] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>("ALL");

  // Get unique options dynamically
  const zones = useMemo(() => Array.from(new Set(assets.map((a) => a.zone))), [assets]);
  const types = useMemo(() => Array.from(new Set(assets.map((a) => a.type))), [assets]);

  // Filter logic
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // 1. Text Search matching hostname, IP, or owner
      const q = search.toLowerCase().trim();
      if (q) {
        const matchesSearch =
          asset.hostname.toLowerCase().includes(q) ||
          asset.ip.toLowerCase().includes(q) ||
          asset.owner.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // 2. Zone Filter
      if (selectedZone !== "ALL" && asset.zone !== selectedZone) {
        return false;
      }

      // 3. Type Filter
      if (selectedType !== "ALL" && asset.type !== selectedType) {
        return false;
      }

      // 4. Status Filter
      if (selectedStatus !== "ALL" && asset.status !== selectedStatus) {
        return false;
      }

      // 5. Risk Level Filter
      if (selectedRiskLevel !== "ALL") {
        if (selectedRiskLevel === "HIGH" && asset.riskScore < 80) return false;
        if (selectedRiskLevel === "MEDIUM" && (asset.riskScore < 40 || asset.riskScore >= 80)) return false;
        if (selectedRiskLevel === "LOW" && asset.riskScore >= 40) return false;
      }

      return true;
    });
  }, [assets, search, selectedZone, selectedType, selectedStatus, selectedRiskLevel]);

  // Color mappings
  const statusStyles = {
    Normal: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/20",
    Warning: "bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/20",
    Critical: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  };

  const riskColor = (score: number) => {
    if (score >= 80) return "text-red-600 dark:text-red-400 font-black";
    if (score >= 40) return "text-amber-600 dark:text-amber-450 font-bold";
    return "text-emerald-600 dark:text-emerald-450";
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col space-y-4 select-none h-107.5">
      {/* Table Header Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Layers size={11} className="text-cyan-400" />
            <span className="text-[9px] font-mono font-black tracking-[0.2em] text-[#06b6d4] uppercase">
              ATTACK SURFACE INVENTORY
            </span>
          </div>
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
            Risk Asset Inventory
          </h3>
        </div>

        {/* Filters and Search Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative min-w-35 xl:w-44">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Search Host, IP, Owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border text-[9px] font-mono text-foreground pl-7 pr-2.5 py-1.5 rounded-lg placeholder:text-muted-foreground/45 focus:outline-none focus:border-cyan-500/40 uppercase tracking-wider"
            />
          </div>

          {/* Zone Selector */}
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-bold text-muted-foreground uppercase">ZONE:</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-background border border-border text-[9px] font-mono uppercase text-foreground px-1.5 py-1 rounded-lg cursor-pointer focus:outline-none focus:border-cyan-300"
            >
              <option value="ALL">ALL ZONES</option>
              {zones.map((z) => (
                <option key={z} value={z}>{z.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Type Selector */}
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-bold text-muted-foreground uppercase">TYPE:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-background border border-border text-[9px] font-mono uppercase text-foreground px-1.5 py-1 rounded-lg cursor-pointer focus:outline-none focus:border-cyan-300"
            >
              <option value="ALL">ALL TYPES</option>
              {types.map((t) => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-bold text-muted-foreground uppercase">STATUS:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-background border border-border text-[9px] font-mono uppercase text-foreground px-1.5 py-1 rounded-lg cursor-pointer focus:outline-none focus:border-cyan-300"
            >
              <option value="ALL">ALL STATUS</option>
              <option value="Normal">NORMAL</option>
              <option value="Warning">WARNING</option>
              <option value="Critical">CRITICAL</option>
            </select>
          </div>

          {/* Fusion Risk Score Level Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-bold text-muted-foreground uppercase">FUSION RISK:</span>
            <select
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value)}
              className="bg-background border border-border text-[9px] font-mono uppercase text-foreground px-1.5 py-1 rounded-lg cursor-pointer focus:outline-none focus:border-cyan-300"
            >
              <option value="ALL">ALL RISKS</option>
              <option value="HIGH">HIGH (&gt;80)</option>
              <option value="MEDIUM">MED (40-80)</option>
              <option value="LOW">LOW (&lt;40)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full border-collapse text-left text-[10px] font-mono">
          <thead>
            <tr className="border-b border-border text-muted-foreground/80 font-black uppercase text-[8px] tracking-widest text-nowrap select-none sticky top-0 bg-card z-10">
              <th className="py-2 pr-2">Hostname</th>
              <th className="py-2 px-2">IP Address</th>
              <th className="py-2 px-2">Zone</th>
              <th className="py-2 px-2">Asset Type</th>
              <th className="py-2 px-2">Owner Team</th>
              <th className="py-2 px-2 text-center">Status</th>
              <th className="py-2 px-2 text-center">Fusion Risk Score</th>
              <th className="py-2 px-2 text-center">Alerts</th>
              <th className="py-2 pl-2 text-right">Last Seen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {filteredAssets.map((asset) => {
              const isSelected = selectedAssetId === asset.id;
              return (
                <tr
                  key={asset.id}
                  onClick={() => onSelectAssetId(asset.id)}
                  className={cn(
                    "hover:bg-muted/30 cursor-pointer transition-all duration-150 group",
                    isSelected ? "bg-cyan-500/4 border-l-2 border-l-cyan-500 font-bold" : ""
                  )}
                >
                  <td className="py-2.5 pr-2 truncate max-w-35 text-foreground font-bold">
                    <span className="group-hover:text-cyan-400 group-hover:underline">
                      {asset.hostname}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-cyan-600 dark:text-cyan-400 font-bold">
                    {asset.ip}
                  </td>
                  <td className="py-2.5 px-2 text-muted-foreground uppercase text-[8.5px]">
                    {asset.zone}
                  </td>
                  <td className="py-2.5 px-2 text-foreground/80 text-[8.5px] uppercase">
                    {asset.type}
                  </td>
                  <td className="py-2.5 px-2 text-muted-foreground text-[8.5px] truncate max-w-27.5">
                    {asset.owner}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={cn(
                        "text-[7.5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border leading-none inline-block",
                        statusStyles[asset.status]
                      )}
                    >
                      {asset.status}
                    </span>
                  </td>
                  <td className={cn("py-2.5 px-2 text-center text-xs", riskColor(asset.riskScore))}>
                    {String(asset.riskScore).padStart(2, "0")}
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold">
                    {asset.openAlerts > 0 ? (
                      <span className="text-red-600 dark:text-red-400 bg-red-500/10 px-1 py-0.5 rounded text-[8.5px] border border-red-500/20 dark:border-red-500/30 font-black">
                        {asset.openAlerts} ACT
                      </span>
                    ) : (
                      <span className="text-muted-foreground/45">—</span>
                    )}
                  </td>
                  <td className="py-2.5 pl-2 text-right text-muted-foreground text-[8.5px]">
                    {asset.lastSeen}
                  </td>
                </tr>
              );
            })}

            {filteredAssets.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="py-16 text-center text-muted-foreground font-mono uppercase tracking-[0.2em] text-[8.5px]"
                >
                  No hybrid assets match criteria query
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-[8px] font-mono text-muted-foreground/60 border-t border-border/30 pt-2.5">
        <span className="uppercase tracking-widest">
          DISCOVERED TELEMETRY PIPELINE
        </span>
        <span className="uppercase tracking-widest flex items-center gap-1">
          <RefreshCw size={8} className="animate-spin text-cyan-400" />
          Showing {filteredAssets.length} of {assets.length} assets
        </span>
      </div>
    </div>
  );
}
