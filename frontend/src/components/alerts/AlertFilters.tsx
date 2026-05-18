import React from "react";
import { 
  X, 
  Search, 
  Cloud, 
  Shield, 
  Clock, 
  User, 
  Zap,
  Target
} from "lucide-react";

export function AlertFilters() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-cyan-500" />
          Advanced Filters
        </h3>
        <button className="text-[10px] font-black text-cyan-500 uppercase tracking-widest hover:text-cyan-400 transition-colors">
          Reset All Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Severity & Status */}
        <div className="space-y-3">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Severity & Status</label>
          <div className="grid grid-cols-2 gap-2">
            <select className="bg-muted border border-border rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-cyan-500/50 appearance-none">
              <option>All Severities</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select className="bg-muted border border-border rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-cyan-500/50 appearance-none">
              <option>All Statuses</option>
              <option>New</option>
              <option>Investigating</option>
              <option>Mitigated</option>
              <option>Resolved</option>
            </select>
          </div>
        </div>

        {/* Source & Network */}
        <div className="space-y-3">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Source & Network</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Source IP / Subnet"
              className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Cloud & Region */}
        <div className="space-y-3">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Cloud Provider</label>
          <div className="flex gap-2">
            {['AWS', 'Azure', 'GCP'].map(provider => (
              <button 
                key={provider}
                className="flex-1 bg-muted border border-border rounded-lg py-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:bg-cyan-500/10 hover:text-cyan-500 hover:border-cyan-500/30 transition-all"
              >
                {provider}
              </button>
            ))}
          </div>
        </div>

        {/* AI Confidence */}
        <div className="space-y-3">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">AI Confidence (Min {">"} 85%)</label>
          <div className="flex items-center gap-4 pt-1">
            <input type="range" className="flex-1 h-1.5 bg-muted rounded-full appearance-none accent-cyan-500" />
            <span className="text-[10px] font-mono text-cyan-500 font-black">90%</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border flex flex-wrap gap-2">
        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 mr-2">
          Saved Filters:
        </span>
        {['Critical AWS us-east-1', 'SQLi Last 24h', 'New Ransomware Attempts'].map(filter => (
          <div key={filter} className="flex items-center gap-2 px-3 py-1 bg-muted/50 border border-border rounded-full group cursor-pointer hover:border-cyan-500/30 transition-all">
            <span className="text-[9px] font-bold text-muted-foreground group-hover:text-cyan-500 uppercase tracking-widest">{filter}</span>
            <X size={10} className="text-muted-foreground/30 hover:text-red-500" />
          </div>
        ))}
      </div>
    </div>
  );
}
