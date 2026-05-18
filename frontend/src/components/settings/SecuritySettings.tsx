import React from "react";
import { useSettingsStore } from "../../store/useSettingsStore";
import { cn } from "../../lib/utils";
import { Shield, Key, Map, Laptop, Smartphone, AlertCircle } from "lucide-react";

export function SecuritySettings() {
  const { draftSettings, updateDraft } = useSettingsStore();
  const data = draftSettings.security;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Access & Identity</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Platform security hardening and session policies</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Platform Score:</span>
           <div className="flex gap-0.5">
             {[1,2,3,4,5].map(i => <div key={i} className="w-4 h-1.5 bg-emerald-500 rounded-full" />)}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
           <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-2xl group hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-4">
                 <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-500">
                    <Key size={18} />
                 </div>
                 <div>
                    <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">Multi-Factor Auth (MFA)</h4>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Required for all Analyst roles</p>
                 </div>
              </div>
              <button 
                onClick={() => updateDraft('security.mfaEnabled', !data.mfaEnabled)}
                className={cn(
                  "w-10 h-5 rounded-full transition-all relative",
                  data.mfaEnabled ? "bg-cyan-500" : "bg-border"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                  data.mfaEnabled ? "right-1" : "left-1"
                )} />
              </button>
           </div>

           <div className="space-y-4">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Admin Session Timeout (MINUTES)</label>
              <div className="flex items-center gap-6">
                 <input 
                   type="range"
                   min="15"
                   max="240"
                   step="15"
                   value={data.sessionTimeout}
                   onChange={(e) => updateDraft('security.sessionTimeout', parseInt(e.target.value))}
                   className="flex-1 h-1.5 bg-muted rounded-full appearance-none accent-cyan-500"
                 />
                 <span className="text-[12px] font-mono font-black text-foreground w-12">{data.sessionTimeout}M</span>
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">IP Access Control List (Allowlist)</label>
              <div className="space-y-2">
                 {data.ipAllowlist.map((ip, i) => (
                   <div key={i} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
                      <span className="text-[10px] font-mono font-bold text-foreground">{ip}</span>
                      <button className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500/10 px-2 py-1 rounded">Remove</button>
                   </div>
                 ))}
                 <button className="w-full py-3 border-2 border-dashed border-border rounded-xl text-[9px] font-black text-muted-foreground hover:text-cyan-500 hover:border-cyan-500/30 transition-all uppercase tracking-widest">
                   + Add Network Range
                 </button>
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Active Administrator Sessions</h4>
           <div className="space-y-3">
              {[
                { device: 'MacBook Pro 16"', location: 'Saigon, VN', ip: '14.161.12.45', current: true, icon: Laptop },
                { device: 'iPhone 15 Pro', location: 'Saigon, VN', ip: '102.45.1.92', current: false, icon: Smartphone },
              ].map((session, i) => (
                <div key={i} className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="bg-muted p-2.5 rounded-xl text-muted-foreground">
                         <session.icon size={16} />
                      </div>
                      <div className="flex flex-col">
                         <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black text-foreground uppercase tracking-widest">{session.device}</span>
                            {session.current && <span className="bg-cyan-500/10 text-cyan-500 text-[8px] font-black px-1.5 rounded uppercase tracking-tighter">Current</span>}
                         </div>
                         <span className="text-[9px] font-bold text-muted-foreground mt-0.5">{session.location} • {session.ip}</span>
                      </div>
                   </div>
                   <button className="text-[10px] font-black text-muted-foreground hover:text-red-500 transition-colors uppercase tracking-widest">Terminate</button>
                </div>
              ))}
           </div>

           <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl flex gap-4">
              <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
              <div>
                 <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Suspicious Logins</span>
                 <p className="text-[9px] text-muted-foreground mt-1 leading-relaxed">3 login attempts from unverified geolocation detected in the last 24 hours. Consider rotating API secrets.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
