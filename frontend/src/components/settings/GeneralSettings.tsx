import React from "react";
import { useSettingsStore } from "../../store/useSettingsStore";
import { Server, Cpu, Clock, RefreshCw, Layers } from "lucide-react";

export function GeneralSettings() {
  const { draftSettings, updateDraft } = useSettingsStore();
  const data = draftSettings.general;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div>
        <h3 className="text-base font-black text-foreground uppercase tracking-widest mb-1.5 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-500" />
          General Platform Settings
        </h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Global identification, scheduling preferences, and environment status</p>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="space-y-2">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 block">
            Platform Display Name
          </label>
          <input 
            type="text"
            value={data.platformName}
            onChange={(e) => updateDraft('general.platformName', e.target.value)}
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-[11px] font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all uppercase"
            placeholder="ANTIGRAVITY SOC"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 block">
            Organization Name
          </label>
          <input 
            type="text"
            value={data.organization}
            onChange={(e) => updateDraft('general.organization', e.target.value)}
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-[11px] font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all uppercase"
            placeholder="Global Defense Corp"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 block">
            SOC Timezone
          </label>
          <div className="relative">
            <select 
              value={data.timezone}
              onChange={(e) => updateDraft('general.timezone', e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-[11px] font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all uppercase appearance-none cursor-pointer"
            >
              <option value="UTC-5">UTC-5 (New York / Washington)</option>
              <option value="UTC+0">UTC+0 (London / GMT)</option>
              <option value="UTC+7">UTC+7 (Bangkok / Saigon)</option>
              <option value="UTC+9">UTC+9 (Tokyo / Seoul)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground text-[10px]">
              ▼
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 block">
            Dashboard Refresh Interval
          </label>
          <div className="relative">
            <input 
              type="number"
              value={data.refreshInterval}
              onChange={(e) => updateDraft('general.refreshInterval', parseInt(e.target.value) || 30)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-[11px] font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
              placeholder="30"
              min="5"
              max="300"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[9px] font-mono font-black text-muted-foreground uppercase">
              SECONDS
            </div>
          </div>
        </div>
      </div>

      {/* SOC Environment Status Card */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 bg-muted/30 border-b border-border flex items-center justify-between">
          <span className="text-[9px] font-mono font-black text-muted-foreground tracking-[0.2em] uppercase">
            🧪 SOC ENVIRONMENT STATUS CARD
          </span>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[9px] font-mono font-black text-emerald-500 uppercase tracking-widest">
              OPTIMIZED
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 bg-muted/30 border border-border/80 p-4 rounded-xl">
              <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-lg border border-purple-500/20 shrink-0">
                <Server className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] font-mono font-black text-muted-foreground uppercase tracking-widest">ACTIVE NODE</span>
                <span className="text-[11px] font-mono font-bold text-foreground truncate uppercase">ANTIGRAVITY-01</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-muted/30 border border-border/80 p-4 rounded-xl">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-500 rounded-lg border border-cyan-500/20 shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] font-mono font-black text-muted-foreground uppercase tracking-widest">SYSTEM STATUS</span>
                <span className="text-[11px] font-mono font-bold text-emerald-500 truncate uppercase">OPTIMIZED (GREEN)</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-muted/30 border border-border/80 p-4 rounded-xl">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-500 rounded-lg border border-cyan-500/20 shrink-0">
                <Clock className="w-4 h-4 animate-spin-slow" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] font-mono font-black text-muted-foreground uppercase tracking-widest">NETWORK LATENCY</span>
                <span className="text-[11px] font-mono font-bold text-foreground truncate uppercase">12ms</span>
              </div>
            </div>
          </div>

          {/* Read Only System Health Panel */}
          <div className="mt-5 p-4 bg-muted/20 border border-border/60 rounded-xl space-y-3">
            <h4 className="text-[9px] font-mono font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1 h-3 bg-cyan-500 rounded-sm inline-block" />
              READ-ONLY SYSTEM HEALTH PANEL
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[9px] font-mono">
              <div className="space-y-0.5">
                <span className="text-muted-foreground block uppercase">KERNEL ARCHITECTURE</span>
                <span className="text-foreground font-bold">Linux-X86_64-GNU</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground block uppercase">MEMORY DISPATCHED</span>
                <span className="text-foreground font-bold">3.2 GB / 16.0 GB</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground block uppercase">DISK HEALTH INDEX</span>
                <span className="text-emerald-500 font-bold">99.8% OPTIMAL</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground block uppercase">INGEST DRIVER BUILD</span>
                <span className="text-foreground font-bold">v3.12.0rc1-TLS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
