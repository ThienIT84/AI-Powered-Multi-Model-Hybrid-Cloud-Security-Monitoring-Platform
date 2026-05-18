import React from "react";
import { useSettingsStore } from "../../store/useSettingsStore";
import { cn } from "../../lib/utils";
import { Cloud, RotateCcw, Link, Link2Off, RefreshCw, CheckCircle2 } from "lucide-react";

export function CloudIntegrationSettings() {
  const { draftSettings, updateDraft } = useSettingsStore();
  const data = draftSettings.cloud;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Hybrid Cloud Connectors</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Multi-cloud ingestion and asset synchronization</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-xl text-[10px] font-black text-foreground uppercase tracking-widest hover:bg-border transition-all">
           <RotateCcw size={14} /> Re-sync All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: 'aws', label: 'Amazon Web Services', assets: '1,420', status: 'Healthy', color: 'text-orange-500', active: data.aws },
          { id: 'azure', label: 'Microsoft Azure', assets: '0', status: 'Not Connected', color: 'text-blue-500', active: data.azure },
          { id: 'gcp', label: 'Google Cloud Platform', assets: '842', status: 'Healthy', color: 'text-red-500', active: data.gcp },
        ].map((cloud) => (
          <div key={cloud.id} className={cn(
            "p-6 rounded-2xl border-2 transition-all flex flex-col h-full",
            cloud.active ? "bg-card border-border shadow-sm" : "bg-muted/30 border-transparent opacity-60"
          )}>
            <div className="flex items-start justify-between mb-6">
              <div className={cn("p-3 bg-muted rounded-2xl", cloud.color)}>
                 <Cloud size={24} />
              </div>
              <button 
                onClick={() => updateDraft(`cloud.${cloud.id}`, !cloud.active)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                  cloud.active ? "bg-red-500/10 text-red-500 border border-red-500/30" : "bg-cyan-500 text-white"
                )}
              >
                {cloud.active ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest mb-1">{cloud.label}</h4>
            <div className="flex items-center gap-2 mb-4">
              <div className={cn("w-1.5 h-1.5 rounded-full", cloud.status === 'Healthy' ? 'bg-emerald-500' : 'bg-muted-foreground')} />
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{cloud.status}</span>
            </div>

            {cloud.active && (
              <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                 <div className="flex flex-col">
                   <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Global Assets</span>
                   <span className="text-sm font-black text-foreground font-mono">{cloud.assets}</span>
                 </div>
                 <div className="text-right">
                   <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Last Sync</span>
                   <span className="text-[10px] font-bold text-foreground block">2m ago</span>
                 </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-muted/30 border border-border rounded-2xl p-6">
         <div className="flex items-center gap-4 mb-6">
            <RefreshCw size={18} className="text-cyan-500" />
            <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">Global Sync Configuration</h4>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
               <div className="flex justify-between">
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Auto-Sync Interval</label>
                  <span className="text-[10px] font-mono font-black text-cyan-500">{data.syncInterval} Minutes</span>
               </div>
               <input 
                 type="range"
                 min="5"
                 max="60"
                 step="5"
                 value={data.syncInterval}
                 onChange={(e) => updateDraft('cloud.syncInterval', parseInt(e.target.value))}
                 className="w-full h-1.5 bg-muted rounded-full appearance-none accent-cyan-500"
               />
               <p className="text-[9px] text-muted-foreground leading-relaxed">Faster intervals increase API costs but provide near real-time asset discovery.</p>
            </div>
            <div className="space-y-3">
               {[
                 'Enable Shadow IT Detection',
                 'Synchronize Billing Tags',
                 'Auto-isolate Suspicious Resources'
               ].map((setting, i) => (
                 <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-card border border-border rounded-xl">
                    <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{setting}</span>
                    <CheckCircle2 size={14} className="text-emerald-500" />
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
