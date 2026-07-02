import React from "react";
import { useSettingsStore } from "../../store/useSettingsStore";
import { cn } from "../../lib/utils";
import { Shield, Key, Laptop, Smartphone, AlertCircle, Plus, Trash2, ShieldCheck, Lock, Globe, User, AlertTriangle } from "lucide-react";

export function SecuritySettings() {
  const { draftSettings, updateDraft } = useSettingsStore();
  const data = draftSettings.security;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Upper header block with score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-foreground uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-500" />
            Security (Access Control + Session)
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Hardened multi-factor enrollment, static route firewalls, and active agent lease lists</p>
        </div>
        
        {/* Platform Score */}
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-2.5 shrink-0 select-none">
          <div className="text-left font-mono">
            <span className="text-[8px] font-black text-emerald-500/80 uppercase tracking-widest leading-none flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>PLATFORM SCORE</span>
            </span>
            <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest block mt-0.5">5/5 HIGH TRUST</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-2.5 h-4 bg-emerald-500 rounded-sm shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Main grid splits settings and admin logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left column config */}
        <div className="space-y-6">
          <label className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-cyan-500" />
            <span>CORE SETTINGS</span>
          </label>
          
          <div className="bg-card border border-border rounded-xl p-5 space-y-6 shadow-sm">
            
            {/* MFA toggle switch */}
            <div className="flex items-center justify-between p-3.5 bg-muted/30 border border-border rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 rounded-lg shrink-0">
                  <Key size={16} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10.5px] font-mono font-black text-foreground uppercase tracking-widest">Multi-Factor Auth (MFA)</span>
                  <p className="text-[8.5px] font-mono text-muted-foreground uppercase">Mandatory enrollment for all SOC roles</p>
                </div>
              </div>
              <button 
                onClick={() => updateDraft('security.mfaEnabled', !data.mfaEnabled)}
                className={cn(
                  "w-10 h-5.5 rounded-full transition-all relative border border-border/60 cursor-pointer",
                  data.mfaEnabled ? "bg-cyan-500" : "bg-muted"
                )}
              >
                <div className={cn(
                  "absolute top-0.75 w-3.5 h-3.5 rounded-full bg-slate-900 dark:bg-white transition-all shadow-sm",
                  data.mfaEnabled ? "right-1" : "left-1"
                )} />
              </button>
            </div>

            {/* Admin Session Timeout Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest">
                  Admin Session Timeout
                </label>
                <span className="text-[12px] font-mono font-black text-cyan-500 bg-cyan-500/5 px-2.5 py-0.5 border border-cyan-500/20 rounded">
                  {data.sessionTimeout} MINUTES
                </span>
              </div>
              
              <input 
                type="range"
                min="15"
                max="240"
                step="15"
                value={data.sessionTimeout}
                onChange={(e) => updateDraft('security.sessionTimeout', parseInt(e.target.value) || 60)}
                className="w-full h-1.5 bg-muted rounded-full appearance-none accent-cyan-500 cursor-pointer border border-border/50"
              />
              <p className="text-[8px] font-mono text-muted-foreground uppercase">Idle console leases are terminated for audit compliance</p>
            </div>
          </div>

          {/* IP Allowlist settings */}
          <div className="space-y-3">
            <label className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-500" />
              <span>IP ALLOWLIST (IPS COMPLIANCE UNIT)</span>
            </label>
            
            <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-sm">
              {data.ipAllowlist && data.ipAllowlist.length > 0 ? (
                <div className="space-y-2">
                  {data.ipAllowlist.map((ip, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        <span className="text-[10px] font-mono font-bold text-foreground">{ip}</span>
                      </div>
                      <button 
                        onClick={() => {
                          const updated = data.ipAllowlist.filter((_, idx) => idx !== i);
                          updateDraft('security.ipAllowlist', updated);
                        }}
                        className="p-1 px-2.5 text-[9px] font-mono font-black text-red-500 uppercase hover:bg-red-500/10 border border-transparent hover:border-red-500/10 rounded-sm cursor-pointer transition-all flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> REMOVE
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-[9px] font-mono text-muted-foreground uppercase">
                  No active CIDR boundaries defined. Allow all.
                </div>
              )}

              <button 
                onClick={() => {
                  const newIp = prompt("Enter active network CIDR range to approve (e.g. 10.0.0.0/8):");
                  if (newIp && newIp.trim().length > 0) {
                    updateDraft('security.ipAllowlist', [...(data.ipAllowlist || []), newIp.trim()]);
                  }
                }}
                className="w-full py-3 border border-dashed border-border/80 hover:border-cyan-500/40 hover:text-cyan-500 rounded-lg text-[9px] font-mono font-black text-muted-foreground transition-all uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer bg-muted/10 hover:bg-cyan-500/5"
              >
                <Plus size={12} /> ADD NETWORK RANGE
              </button>
            </div>
          </div>
        </div>

        {/* Right column audits */}
        <div className="space-y-6">
          <label className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-cyan-500" />
            <span>ACTIVE SESSIONS</span>
          </label>
          
          <div className="space-y-3">
            {[
              { id: 'mbp', device: 'MacBook Pro', location: 'BANGKOK, TH', ip: '14.161.12.45', current: true, icon: Laptop, elapsed: 'CURRENT' },
              { id: 'iph', device: 'iPhone 15 Pro', location: 'SAIGON, VN', ip: '102.45.1.92', current: false, icon: Smartphone, elapsed: 'ACTIVE 8M AGO' },
            ].map((session, i) => (
              <div key={i} className="p-4 bg-card border border-border rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="bg-muted border border-border text-muted-foreground p-2.5 rounded-xl shrink-0">
                    <session.icon size={16} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] font-black text-foreground uppercase tracking-widest truncate">{session.device}</span>
                      {session.current && (
                        <span className="bg-cyan-500/10 text-cyan-500 text-[8px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-cyan-500/20">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-mono font-bold text-muted-foreground mt-0.5 truncate uppercase tracking-wide">
                      {session.location} - {session.ip} - {session.elapsed}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (confirm(`Terminate session on ${session.device}?`)) {
                      alert(`Session for ${session.device} revoked successfully.`);
                    }
                  }}
                  className="text-[9px] font-mono font-black text-muted-foreground hover:text-red-500 hover:border-red-500/20 border border-transparent transition-colors uppercase tracking-widest cursor-pointer px-2.5 py-1.5 rounded bg-muted/60 hover:bg-red-500/5"
                >
                  TERMINATE SESSION
                </button>
              </div>
            ))}
          </div>

          {/* Suspicious Warn Panel */}
          <div className="p-5 bg-orange-500/5 dark:bg-orange-500/5 border border-orange-500/25 rounded-xl flex gap-4 shadow-sm animate-pulse">
            <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-black text-orange-500 uppercase tracking-widest leading-none flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>SECURITY WARNING PANEL</span>
              </span>
              <p className="text-[9px] font-mono text-muted-foreground leading-relaxed uppercase tracking-wide">
                Suspicious logins detected: <strong className="text-orange-500">3 attempts (24h)</strong> from unverified geolocations. Suggestion: rotate API keys and audit allowlist CIDRs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
