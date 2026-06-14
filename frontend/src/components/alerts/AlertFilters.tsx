import React from "react";
import { 
  X, 
  Search, 
  Plus, 
  Filter
} from "lucide-react";
import { cn } from "../../lib/utils";

interface AlertFiltersProps {
  severityFilter: string;
  setSeverityFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  sourceIpFilter: string;
  setSourceIpFilter: (val: string) => void;
  cloudProviders: string[];
  setCloudProviders: (val: string[]) => void;
  minConfidence: number;
  setMinConfidence: (val: number) => void;
  
  savedFilters: string[];
  onApplySavedFilter: (filterName: string) => void;
  onRemoveSavedFilter: (filterName: string, e: React.MouseEvent) => void;
  onResetFilters: () => void;
  onSaveCurrentFilter: () => void;
}

export function AlertFilters({
  severityFilter,
  setSeverityFilter,
  statusFilter,
  setStatusFilter,
  sourceIpFilter,
  setSourceIpFilter,
  cloudProviders,
  setCloudProviders,
  minConfidence,
  setMinConfidence,

  savedFilters,
  onApplySavedFilter,
  onRemoveSavedFilter,
  onResetFilters,
  onSaveCurrentFilter
}: AlertFiltersProps) {

  const toggleProvider = (provider: string) => {
    const upperProv = provider.toUpperCase();
    if (cloudProviders.includes(upperProv)) {
      setCloudProviders(cloudProviders.filter(p => p !== upperProv));
    } else {
      setCloudProviders([...cloudProviders, upperProv]);
    }
  };

  return (
    <div id="alerts-applied-filters-block" className="bg-card border border-border rounded-xl p-4 shadow-sm mb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-border/40">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-cyan-500" />
          FUSION QUEUE FILTER PANELS
        </h3>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onSaveCurrentFilter}
            className="text-[8.5px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10 leading-none"
          >
            <Plus size={10} />
            Save Filter
          </button>
          <button 
            type="button"
            onClick={onResetFilters}
            className="text-[8.5px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors cursor-pointer bg-red-400/5 px-2 py-1 rounded border border-red-500/10 leading-none"
          >
            Reset All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Severity filter */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block ml-0.5">Fusion Severity</label>
          <div className="relative">
            <select 
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider focus:outline-none focus:border-cyan-500/45 text-foreground cursor-pointer appearance-none"
            >
              <option value="ALL">ALL SEVERITIES</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-muted-foreground">
              <span className="text-[7.5px]">▼</span>
            </div>
          </div>
        </div>

        {/* Status filter */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block ml-0.5">Alert Audit Status</label>
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider focus:outline-none focus:border-cyan-500/45 text-foreground cursor-pointer appearance-none"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="NEW">NEW</option>
              <option value="INVESTIGATING">INVESTIGATING</option>
              <option value="MITIGATED">MITIGATED</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-muted-foreground">
              <span className="text-[7.5px]">▼</span>
            </div>
          </div>
        </div>

        {/* Source CIDR IP Filter */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block ml-0.5">Source IP / CIDR Block</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
            <input 
              type="text" 
              placeholder="e.g. 10.0.0.0/24 or IP address..."
              value={sourceIpFilter}
              onChange={(e) => setSourceIpFilter(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg pl-8.5 pr-2.5 py-1.5 text-[9px] font-bold tracking-tight text-foreground focus:outline-none focus:border-cyan-500/45 placeholder:text-muted-foreground/45 placeholder:text-[8.5px]"
            />
          </div>
        </div>

        {/* Cloud Providers */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block ml-0.5">Cloud Infrastructure</label>
          <div className="flex gap-1.5">
            {['AWS', 'AZURE', 'GCP'].map(provider => {
              const isActive = cloudProviders.includes(provider);
              return (
                <button 
                  key={provider}
                  type="button"
                  onClick={() => toggleProvider(provider)}
                  className={cn(
                    "flex-1 bg-muted border rounded-lg py-1.5 text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer leading-none",
                    isActive 
                      ? "bg-cyan-500/10 border-cyan-500/35 text-cyan-500 shadow-sm"
                      : "border-border text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  )}
                >
                  {provider}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Min Confidence Rating slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
            <span className="text-muted-foreground">Minimum Fusion Confidence Filter</span>
            <span className="text-cyan-500 font-mono font-bold leading-none">{minConfidence > 0 ? `> ${minConfidence}%` : 'ALL SCENARIOS'}</span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <input 
              type="range" 
              min="0"
              max="100"
              step="5"
              value={minConfidence}
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="flex-1 h-1 bg-muted rounded-full appearance-none accent-cyan-500 cursor-pointer border border-border" 
            />
            <span className="text-[8.5px] font-mono text-muted-foreground/60 w-4 select-none animate-pulse">100%</span>
          </div>
        </div>
      </div>

      {/* Preset Saved Filter Chips */}
      {savedFilters.length > 0 && (
        <div className="pt-2.5 border-t border-border/40 flex flex-wrap gap-1.5 items-center">
          <span className="text-[8.5px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 mr-1">
            Active Filter Templates:
          </span>
          {savedFilters.map(filter => (
            <div 
              key={filter} 
              onClick={() => onApplySavedFilter(filter)}
              className="flex items-center gap-1.5 px-2.5 py-0.5 bg-muted/70 border border-border/70 rounded-full group cursor-pointer hover:border-cyan-500/35 hover:bg-cyan-500/5 transition-all"
            >
              <span className="text-[8px] font-black text-muted-foreground group-hover:text-cyan-500 uppercase tracking-widest">{filter}</span>
              <button 
                type="button"
                onClick={(e) => onRemoveSavedFilter(filter, e)}
                className="text-muted-foreground/42 hover:text-red-500 p-0.5 rounded transition-transform duration-100"
              >
                <X size={9} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AlertFilters;
