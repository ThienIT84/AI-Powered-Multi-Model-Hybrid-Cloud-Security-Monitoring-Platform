import React from "react";
import { Search, RotateCcw, Download, Check, Filter } from "lucide-react";
import { EndpointType, CloudProvider, EndpointStatus } from "./endpointConfig";
import { cn } from "../../lib/utils";

export interface FilterState {
  search: string;
  type: "all" | EndpointType;
  provider: "all" | CloudProvider;
  status: "all" | EndpointStatus;
  riskThreshold: number; // 0 - 100
  region: string;
}

interface EndpointFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  onExport: () => void;
}

export function EndpointFilters({
  filters,
  onFilterChange,
  onReset,
  onExport,
}: EndpointFiltersProps) {
  
  const handleSavedFilterClick = (type: string) => {
    switch (type) {
      case "HIGH AWS":
        onFilterChange({
          search: "",
          type: "all",
          provider: "AWS",
          status: "all",
          riskThreshold: 80,
          region: "all",
        });
        break;
      case "OFFLINE":
        onFilterChange({
          search: "",
          type: "all",
          provider: "all",
          status: "OFFLINE",
          riskThreshold: 0,
          region: "all",
        });
        break;
      case "COMPROMISED":
        onFilterChange({
          search: "",
          type: "all",
          provider: "all",
          status: "CRITICAL",
          riskThreshold: 50,
          region: "all",
        });
        break;
      default:
        break;
    }
  };

  const isHighAwsActive = filters.provider === "AWS" && filters.riskThreshold >= 80;
  const isOfflineActive = filters.status === "OFFLINE";
  const isCompromisedActive = filters.status === "CRITICAL";

  return (
    <div id="endpoint-filters" className="p-5 bg-card border border-border rounded-xl space-y-4">
      
      {/* Search Input and Top Row Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Search assets (hostname, ip, endpoint id)..."
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all uppercase placeholder:normal-case"
          />
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-muted/60 hover:bg-muted border border-border rounded-xl text-[10px] font-mono font-black text-muted-foreground hover:text-foreground uppercase tracking-widest transition-all cursor-pointer"
          >
            <RotateCcw size={12} /> Reset
          </button>
          
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-500/20 rounded-xl text-[10px] font-mono font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/25"
          >
            <Download size={12} /> Export CSV
          </button>
        </div>
      </div>

      {/* Grid Controls Dropdown Selector options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end pt-2 border-t border-border/40">
        
        {/* Endpoint Type Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest block pl-1">
            Asset Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value as any })}
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-[11px] font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/30 font-bold transition-all uppercase cursor-pointer"
          >
            <option value="all">ANY NODE TYPE</option>
            <option value="EC2">AWS EC2</option>
            <option value="VM">HYBRID VM</option>
            <option value="Container">K8S CONTAINER</option>
            <option value="IoT">IOT EDGE DEVICE</option>
          </select>
        </div>

        {/* Cloud Provider Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest block pl-1">
            Cloud Platform
          </label>
          <select
            value={filters.provider}
            onChange={(e) => onFilterChange({ ...filters, provider: e.target.value as any })}
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-[11px] font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/30 font-bold transition-all uppercase cursor-pointer"
          >
            <option value="all">ANY CLOUD</option>
            <option value="AWS">AMAZON SEC-AWS</option>
            <option value="Azure">MICROSOFT AZURE</option>
            <option value="GCP">GOOGLE CLOUD PLATFORM</option>
          </select>
        </div>

        {/* Region Filter */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest block pl-1">
            Geographic Region
          </label>
          <select
            value={filters.region}
            onChange={(e) => onFilterChange({ ...filters, region: e.target.value })}
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-[11px] font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/30 font-bold transition-all uppercase cursor-pointer"
          >
            <option value="all">ANY REGION</option>
            <option value="US">US GEOS (EAST/WEST)</option>
            <option value="EU">EU GEO (WEST)</option>
            <option value="AP">APAC GEOS (SE/NE)</option>
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest block pl-1">
            Security Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value as any })}
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-[11px] font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/30 font-bold transition-all uppercase cursor-pointer"
          >
            <option value="all">ALL NODE STATES</option>
            <option value="HEALTHY">HEALTHY STATED</option>
            <option value="WARNING">WARNING TRIGGERED</option>
            <option value="CRITICAL">CRITICAL MITRE ATTACK</option>
            <option value="OFFLINE">OFFLINE HEARTBEAT OUT</option>
          </select>
        </div>

        {/* Interactive risk threshold slider bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-1">
            <label className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest leading-none">
              AI Risk Threshold
            </label>
            <span className="text-[10px] font-mono font-black text-cyan-500 bg-cyan-500/10 px-1.5 border border-cyan-500/10 rounded leading-none shrink-0">
              &ge; {filters.riskThreshold}%
            </span>
          </div>
          
          <input
            type="range"
            min="0"
            max="90"
            step="10"
            value={filters.riskThreshold}
            onChange={(e) => onFilterChange({ ...filters, riskThreshold: parseInt(e.target.value) || 0 })}
            className="w-full h-2 bg-muted rounded-full appearance-none accent-cyan-500 cursor-pointer border border-border"
          />
        </div>
      </div>

      {/* Pre-saved filter chips */}
      <div className="flex items-center gap-1.5 pt-2 flex-wrap text-[9px] font-mono">
        <span className="text-muted-foreground uppercase font-black tracking-widest flex items-center gap-1 shrink-0 mr-1 select-none">
          <Filter size={10} className="text-cyan-500" />
          Quick Filters:
        </span>

        {/* High Risk AWS */}
        <button
          onClick={() => handleSavedFilterClick("HIGH AWS")}
          className={cn(
            "px-2.5 py-1 rounded-lg border flex items-center gap-1 cursor-pointer transition-all uppercase font-bold",
            isHighAwsActive 
              ? "bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.1)]" 
              : "bg-muted text-muted-foreground border-border/80 hover:bg-muted/80 hover:text-foreground"
          )}
        >
          {isHighAwsActive && <Check size={10} className="text-red-500 animate-pulse" />}
          High Risk AWS
        </button>

        {/* Offline last 24H */}
        <button
          onClick={() => handleSavedFilterClick("OFFLINE")}
          className={cn(
            "px-2.5 py-1 rounded-lg border flex items-center gap-1 cursor-pointer transition-all uppercase font-bold",
            isOfflineActive 
              ? "bg-zinc-500/10 text-zinc-400 border-zinc-400/30" 
              : "bg-muted text-muted-foreground border-border/80 hover:bg-muted/80 hover:text-foreground"
          )}
        >
          {isOfflineActive && <Check size={10} />}
          Offline Nodes
        </button>

        {/* Compromised Nodes */}
        <button
          onClick={() => handleSavedFilterClick("COMPROMISED")}
          className={cn(
            "px-2.5 py-1 rounded-lg border flex items-center gap-1 cursor-pointer transition-all uppercase font-bold",
            isCompromisedActive 
              ? "bg-amber-500/10 text-amber-500 border-amber-500/30" 
              : "bg-muted text-muted-foreground border-border/80 hover:bg-muted/80 hover:text-foreground"
          )}
        >
          {isCompromisedActive && <Check size={10} className="text-amber-500" />}
          Compromised Nodes
        </button>
      </div>

    </div>
  );
}
