import React from "react";
import { cn } from "../../lib/utils";
import { Bell, Mail, MessageSquare, Send, Globe, Phone, Settings, ShieldAlert } from "lucide-react";

export function NotificationSettings() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div>
        <h3 className="text-base font-black text-foreground uppercase tracking-widest mb-1.5 flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-500" />
          Notifications (Communication Layer)
        </h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Active operational channels, direct integration webhooks, and escalation parameters</p>
      </div>

      {/* Core channels list */}
      <div className="space-y-4">
        <label className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1.5">
          <Send size={12} className="text-cyan-500" />
          Channel Status
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { 
              icon: Mail, 
              label: 'Email Alerts', 
              status: 'CONNECTED', 
              colorClass: 'text-cyan-500 border-cyan-500/10 bg-cyan-500/5',
              desc: 'SOC Primary Dispatch & Administrative Escalation Unit',
              statusLabelColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25'
            },
            { 
              icon: MessageSquare, 
              label: 'Slack Integration', 
              status: 'ACTIVE (#SECURITY-CRITICAL-ALERTS)', 
              colorClass: 'text-purple-500 border-purple-500/10 bg-purple-500/5',
              desc: 'Dedicated active channel for sub-second system events telemetry',
              statusLabelColor: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/25'
            },
            { 
              icon: Globe, 
              label: 'Webhook Streams', 
              status: '8 ACTIVE ENDPOINTS', 
              colorClass: 'text-cyan-600 border-cyan-500/10 dark:text-cyan-400 bg-cyan-600/5 dark:bg-cyan-400/5',
              desc: 'External custom SIEM clusters & security event brokers',
              statusLabelColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25'
            },
            { 
              icon: Phone, 
              label: 'SMS / PagerDuty', 
              status: 'DISABLED', 
              colorClass: 'text-zinc-500 border-zinc-500/10 bg-zinc-500/5',
              desc: 'Emergency on-call phone rotation (requires hardware sync)',
              statusLabelColor: 'bg-muted text-muted-foreground border border-border'
            },
          ].map((item, i) => (
            <div key={i} className="p-5 bg-card border border-border rounded-xl flex items-start justify-between group hover:border-cyan-500/30 transition-all shadow-sm">
              <div className="flex items-start gap-4">
                <div className={cn("p-2.5 rounded-xl border shrink-0", item.colorClass)}>
                  <item.icon size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">{item.label}</h4>
                  <p className="text-[9px] font-mono text-muted-foreground uppercase leading-relaxed tracking-wider mb-2">{item.desc}</p>
                  <span className={cn(
                    "inline-block text-[8px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded-sm",
                    item.statusLabelColor
                  )}>
                    {item.status}
                  </span>
                </div>
              </div>
              <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-all cursor-pointer">
                <Settings size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Escalation Policy Section */}
      <div className="space-y-4">
        <label className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1.5">
          <ShieldAlert size={12} className="text-red-500" />
          Escalation Policy
        </label>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono">
              <thead>
                <tr className="border-b border-border/80 text-[9px] font-black text-muted-foreground uppercase tracking-widest pb-3">
                  <th className="pb-3 font-black">SEVERITY GRADE</th>
                  <th className="pb-3 font-black">CHANNELS</th>
                  <th className="pb-3 font-black">DELAY LATENCY</th>
                  <th className="pb-3 font-black text-right">MITIGATION ROLE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {[
                  { sev: 'CRITICAL', channel: 'SLACK + EMAIL + SMS', delay: 'INSTANT', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
                  { sev: 'HIGH', channel: 'SLACK + EMAIL', delay: 'INSTANT', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
                  { sev: 'MEDIUM', channel: 'EMAIL', delay: '15 MINUTES', color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
                ].map((row, i) => (
                  <tr key={i} className="group hover:bg-muted/10 transition-all">
                    <td className="py-4">
                      <span className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-sm border",
                        row.color
                      )}>{row.sev}</span>
                    </td>
                    <td className="py-4 text-[10px] font-black text-foreground tracking-widest">{row.channel}</td>
                    <td className="py-4 text-[10px] font-bold text-muted-foreground">{row.delay}</td>
                    <td className="py-4 text-right">
                      <button className="text-[9px] font-black text-cyan-500 uppercase tracking-widest hover:underline cursor-pointer">
                        MODIFY RULE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
