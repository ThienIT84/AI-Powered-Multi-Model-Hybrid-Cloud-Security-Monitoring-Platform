import React, { useState, useMemo } from "react";
import { CloudAsset } from "./types";
import { Search, SlidersHorizontal, ArrowUpDown, Shield, ChevronRight, CheckCircle, HelpCircle } from "lucide-react";

interface CloudAssetInventoryProps {
  assets: CloudAsset[];
  selectedAssetId: string | null;
  onSelectAsset: (asset: CloudAsset) => void;
}

export function CloudAssetInventory({
  assets,
  selectedAssetId,
  onSelectAsset,
}: CloudAssetInventoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState<string>("ALL");
  const [envFilter, setEnvFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"riskScore" | "exposureScore" | "name">("riskScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(false);

  // Trigger brief skeleton state when filter changes to simulate high scale virtual fetch
  const handleFilterChange = (updater: () => void) => {
    setIsLoading(true);
    updater();
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  };

  const filteredAndSortedAssets = useMemo(() => {
    let result = assets.filter((asset) => {
      const matchSearch =
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.region.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchService = serviceFilter === "ALL" || asset.service === serviceFilter;
      const matchEnv = envFilter === "ALL" || asset.environment === envFilter;

      return matchSearch && matchService && matchEnv;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else {
        comparison = a[sortBy] - b[sortBy];
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    return result;
  }, [assets, searchTerm, serviceFilter, envFilter, sortBy, sortOrder]);

  const toggleSort = (field: "riskScore" | "exposureScore" | "name") => {
    handleFilterChange(() => {
      if (sortBy === field) {
        setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(field);
        setSortOrder("desc");
      }
    });
  };

  const getServiceBadgeColor = (service: string) => {
    switch (service) {
      case "EKS":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20";
      case "S3":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
      case "EC2":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20";
      case "RDS":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
      case "Lambda":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20";
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-500 dark:text-red-400 font-black";
    if (score >= 50) return "text-amber-500 font-bold";
    return "text-emerald-550 dark:text-emerald-400 font-medium";
  };

  const getExposureLevel = (score: number) => {
    if (score >= 80) return { label: "High Exposure", color: "bg-red-500/10 text-red-600 dark:text-red-400" };
    if (score >= 40) return { label: "Medium", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" };
    return { label: "Isolated", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" };
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col h-full" id="cloud-asset-inventory-panel">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3 mb-3 select-none">
        <div>
          <h3 className="text-xs font-black uppercase text-foreground tracking-wider font-mono flex items-center gap-2">
            <Shield size={14} className="text-cyan-500" />
            Cloud Asset Inventory
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Active multi-tenant workloads with live risk profiles
          </p>
        </div>
        <div className="text-[8.5px] font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded uppercase font-black w-fit">
          INV-DB: {filteredAndSortedAssets.length} Active Nodes
        </div>
      </div>

      {/* Modern Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        {/* Search */}
        <div className="relative">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assets, owner, region..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-muted/40 border border-border focus:border-cyan-500 rounded-lg pl-8 pr-2.5 py-1 text-[9px] placeholder:text-muted-foreground outline-hidden font-mono text-foreground text-ellipsis"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-1.5">
          <select
            value={serviceFilter}
            onChange={(e) => handleFilterChange(() => setServiceFilter(e.target.value))}
            className="bg-muted/40 border border-border focus:border-cyan-500 rounded-lg px-2 py-1 text-[9px] font-black uppercase cursor-pointer outline-hidden font-mono text-foreground"
          >
            <option value="ALL">SERVICE (ALL)</option>
            <option value="EC2">EC2 Instance</option>
            <option value="RDS">RDS Postgres</option>
            <option value="S3">S3 Storage</option>
            <option value="IAM">IAM Identity</option>
            <option value="Lambda">Lambda Service</option>
            <option value="EKS">EKS Cluster</option>
          </select>

          <select
            value={envFilter}
            onChange={(e) => handleFilterChange(() => setEnvFilter(e.target.value))}
            className="bg-muted/40 border border-border focus:border-cyan-500 rounded-lg px-2 py-1 text-[9px] font-black uppercase cursor-pointer outline-hidden font-mono text-foreground"
          >
            <option value="ALL">ENV (ALL)</option>
            <option value="Production">Prod</option>
            <option value="Staging">Staging</option>
            <option value="Development">Dev</option>
          </select>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1 bg-muted/20 border border-border/80 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => toggleSort("riskScore")}
            className={`flex-1 py-1 text-[8px] font-black uppercase rounded-md flex items-center justify-center gap-1 transition-all ${
              sortBy === "riskScore" ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Risk {sortBy === "riskScore" && (sortOrder === "desc" ? "DOWN" : "UP")}
          </button>
          <button
            type="button"
            onClick={() => toggleSort("exposureScore")}
            className={`flex-1 py-1 text-[8px] font-black uppercase rounded-md flex items-center justify-center gap-1 transition-all ${
              sortBy === "exposureScore" ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Expos. {sortBy === "exposureScore" && (sortOrder === "desc" ? "DOWN" : "UP")}
          </button>
        </div>
      </div>

      {/* Main Table / List Container */}
      <div className="flex-1 overflow-y-auto max-h-145 border border-border/40 rounded-lg bg-muted/5">
        {isLoading ? (
          /* Loading State skeletons */
          <div className="space-y-2 p-3 font-mono">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted/30 border border-border/40 rounded-lg p-3 animate-pulse flex flex-col gap-2">
                <div className="h-2.5 w-1/3 bg-muted rounded"></div>
                <div className="h-1.5 w-1/2 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedAssets.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground italic text-[10px] font-mono uppercase">
            No cloud assets matching the filters found.
          </div>
        ) : (
          <div className="divide-y divide-border/25">
            {filteredAndSortedAssets.map((asset) => {
              const isSelected = selectedAssetId === asset.id;
              const expLevel = getExposureLevel(asset.exposureScore);
              return (
                <button
                  key={asset.id}
                  onClick={() => onSelectAsset(asset)}
                  className={`w-full text-left p-3 flex items-start justify-between gap-3 transition-all hover:bg-muted/15 cursor-pointer border-l-2 select-none ${
                    isSelected
                      ? "bg-cyan-500/5 border-l-cyan-500 dark:bg-cyan-950/25 border-border"
                      : "border-l-transparent text-muted-foreground"
                  }`}
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-black text-foreground uppercase tracking-tight truncate">
                        {asset.name}
                      </span>
                      <span className={`text-[7px] font-black uppercase px-1.5 py-0.2 rounded font-mono ${getServiceBadgeColor(asset.service)}`}>
                        {asset.service}
                      </span>
                    </div>

                    {/* Metadata line */}
                    <div className="flex items-center gap-2 text-[8px] text-muted-foreground font-mono flex-wrap">
                      <span className="text-zinc-400 font-bold">{asset.environment.toUpperCase()}</span>
                      <span>-</span>
                      <span>{asset.region}</span>
                      <span>-</span>
                      <span className="truncate">Own: {asset.owner}</span>
                    </div>

                    {/* Exposure Findings pill line */}
                    <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                      <span className={`text-[7.5px] px-1.5 py-0.2 rounded font-mono font-black uppercase ${expLevel.color}`}>
                        {expLevel.label}
                      </span>
                      <span className="text-[8px] text-slate-500 font-mono">
                        Findings: {asset.findings.length}
                      </span>
                    </div>
                  </div>

                  {/* Right hand score items */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right font-mono select-none">
                      <span className="text-[7px] text-muted-foreground uppercase block font-semibold">Risk Score</span>
                      <span className={`text-[12px] font-black ${getRiskColor(asset.riskScore)}`}>
                        {asset.riskScore}
                      </span>
                    </div>
                    <ChevronRight size={13} className="text-muted-foreground self-center shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export default CloudAssetInventory;
