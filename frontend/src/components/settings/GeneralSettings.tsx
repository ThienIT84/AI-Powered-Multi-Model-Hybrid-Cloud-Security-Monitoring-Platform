import React from "react";
import { useSettingsStore } from "../../store/useSettingsStore";

export function GeneralSettings() {
  const { draftSettings, updateDraft } = useSettingsStore();
  const data = draftSettings.general;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">General Platform Settings</h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Global identification and regional preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Platform Display Name</label>
          <input 
            type="text"
            value={data.platformName}
            onChange={(e) => updateDraft('general.platformName', e.target.value)}
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-[11px] font-bold text-foreground focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Organization Name</label>
          <input 
            type="text"
            value={data.organization}
            onChange={(e) => updateDraft('general.organization', e.target.value)}
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-[11px] font-bold text-foreground focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">SOC Timezone</label>
          <select 
            value={data.timezone}
            onChange={(e) => updateDraft('general.timezone', e.target.value)}
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-[11px] font-bold text-foreground focus:outline-none focus:border-cyan-500/50 transition-all appearance-none"
          >
            <option value="UTC-5">UTC-5 (New York)</option>
            <option value="UTC+0">UTC+0 (London)</option>
            <option value="UTC+7">UTC+7 (Bangkok/Saigon)</option>
            <option value="UTC+9">UTC+9 (Tokyo)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Dashboard Refresh Interval (sec)</label>
          <input 
            type="number"
            value={data.refreshInterval}
            onChange={(e) => updateDraft('general.refreshInterval', parseInt(e.target.value))}
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-[11px] font-bold text-foreground focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>
      </div>

      <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
        <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-2">SOC Environment Preview</h4>
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
            <div>NODE: <span className="text-foreground">ANTIGRAVITY-01</span></div>
            <div>STATUS: <span className="text-emerald-500">OPTIMIZED</span></div>
            <div>LATENCY: <span className="text-foreground">12MS</span></div>
        </div>
      </div>
    </div>
  );
}
