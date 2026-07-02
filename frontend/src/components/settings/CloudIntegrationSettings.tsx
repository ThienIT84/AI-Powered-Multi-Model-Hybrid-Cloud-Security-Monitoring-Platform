import React from "react";
import { useSettingsStore } from "../../store/useSettingsStore";
import { cn } from "../../lib/utils";
import { Cloud, RotateCw, RefreshCcw, HelpCircle } from "lucide-react";

export function CloudIntegrationSettings() {
  const { draftSettings, updateDraft } = useSettingsStore();
  const data = draftSettings.cloud;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header and sync button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-foreground uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <Cloud className="w-4 h-4 text-cyan-500" />
            Cloud Integration (Hybrid Cloud Sync)
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Static sync hooks for multicloud architectures and VPC asset boundaries</p>
        </div>
        
        {/* RE-SYNC ALL Action */}
        <button 
          onClick={() => alert('Global multi-cloud asset re-synchronization triggered!')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-muted border border-border rounded-xl text-[10px] font-black text-foreground uppercase tracking-widest hover:bg-border transition-all cursor-pointer shadow-sm shrink-0"
        >
          <RotateCw size={12} className="text-cyan-500 animate-spin-slow" /> RE-SYNC ALL
        </button>
      </div>

      {/* Cloud providers grid */}
      <div className="space-y-4">
        <label className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1.5">
          <Cloud size={12} className="text-cyan-500" />
          Cloud Provider Connectors
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              id: 'aws', 
              label: 'Amazon Web Services', 
              assets: '1,420', 
              status: 'HEALTHY', 
              colorClass: 'text-orange-500 bg-orange-500/5 border-orange-500/10', 
              active: data.aws,
              desc: 'Global IAM & EC2 metadata collector stream'
            },
            { 
              id: 'azure', 
              label: 'Microsoft Azure Core', 
              assets: '0', 
              status: 'NOT CONNECTED', 
              colorClass: 'text-blue-500 bg-blue-500/5 border-blue-500/10', 
              active: data.azure,
              desc: 'Active AD tenant security registry flow'
            },
            { 
              id: 'gcp', 
              label: 'Google Cloud Platform', 
              assets: '842', 
              status: 'HEALTHY', 
              colorClass: 'text-red-500 bg-red-500/5 border-red-500/10', 
              active: data.gcp,
              desc: 'Kubernetes audit log integration cluster' 
            },
          ].map((cloud) => (
            <div 
              key={cloud.id} 
              className={cn(
                "p-5 rounded-xl border-2 transition-all flex flex-col justify-between h-full relative overflow-hidden",
                cloud.active ? "bg-card border-border shadow-sm" : "bg-muted/15 border-dashed border-border/80 opacity-60"
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className={cn("p-2.5 rounded-lg border", cloud.colorClass)}>
                    <Cloud size={20} />
                  </div>
                  
                  {/* Connect/Disconnect button */}
                  <button 
                    onClick={() => updateDraft(`cloud.${cloud.id}`, !cloud.active)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-widest transition-all cursor-pointer border",
                      cloud.active 
                        ? "bg-red-500/10 hover:bg-red-500/15 text-red-500 border-red-500/20" 
                        : "bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-600 shadow-sm shadow-cyan-500/10"
                    )}
                  >
                    {cloud.active ? 'DISCONNECT' : 'CONNECT'}
                  </button>
                </div>

                <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest leading-none">{cloud.label}</h4>
                <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider mt-1.5 leading-snug">{cloud.desc}</p>
                
                <div className="flex items-center gap-1.5 mt-3">
                  <div className={cn("w-1.5 h-1.5 rounded-full", cloud.active && cloud.status === 'HEALTHY' ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground')} />
                  <span className="text-[8.5px] font-mono font-black text-muted-foreground uppercase tracking-widest">
                    {cloud.active ? cloud.status : 'NOT YET SYNCED'}
                  </span>
                </div>
              </div>

              {/* Real statistics on healthy states */}
              {cloud.active && (
                <div className="mt-5 pt-4 border-t border-border flex items-center justify-between font-mono gap-4 text-[9.5px]">
                  <div>
                    <span className="text-[7.5px] font-black text-muted-foreground block uppercase leading-none">TOTAL ASSETS</span>
                    <span className="text-foreground font-bold font-mono text-[11px] mt-0.5 block">{cloud.assets}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[7.5px] font-black text-muted-foreground block uppercase leading-none">LAST SYNC</span>
                    <span className="text-foreground font-medium text-[9.5px] mt-0.5 block">2M AGO</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Global Sync controls */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/80 pb-4 mb-6">
          <RefreshCcw size={16} className="text-cyan-500 animate-spin-slow" />
          <h4 className="text-[11px] font-mono font-black text-foreground uppercase tracking-widest">
            Auto Sync Configuration
          </h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Interval setting and warning */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest">
                Auto-Sync Interval
              </label>
              <span className="text-[11px] font-mono font-black text-cyan-500 bg-cyan-500/5 border border-cyan-500/15 rounded px-2.5 py-0.5">
                {data.syncInterval} minutes
              </span>
            </div>
            
            <input 
              type="range"
              min="5"
              max="60"
              step="5"
              value={data.syncInterval}
              onChange={(e) => updateDraft('cloud.syncInterval', parseInt(e.target.value) || 15)}
              className="w-full h-1.5 bg-muted rounded-full appearance-none accent-cyan-500 cursor-pointer border border-border"
            />
            
            {/* Warning block */}
            <div className="p-3.5 bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/20 text-muted-foreground rounded-lg flex items-start gap-2.5 leading-normal">
              <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-mono uppercase tracking-wide">
                Warning: setting faster intervals increases API cost and logs ingestion bandwidth for external cloud resources providers.
              </p>
            </div>
          </div>

          {/* Connected options list checkmarks */}
          <div className="space-y-3">
            <label className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest block mb-1">
              Enabled Integration Features
            </label>
            
            {[
              'Shadow IT Detection',
              'Billing Tag Sync',
              'Auto-Isolate Suspicious Resources'
            ].map((feature, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 bg-muted/40 border border-border rounded-xl">
                <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest">
                  {feature}
                </span>
                <div className="w-4.5 h-4.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
