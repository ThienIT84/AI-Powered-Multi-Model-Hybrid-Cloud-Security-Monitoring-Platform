import React from "react";
import { useSettingsStore } from "../../store/useSettingsStore";
import { cn } from "../../lib/utils";
import { Bell, Mail, MessageSquare, Send, Globe, Phone, Settings } from "lucide-react";

export function NotificationSettings() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Communication Channels</h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Alert escalation and notification routing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { icon: Mail, label: 'Email Alerts', status: 'Connected', desc: 'Primary SOC contact distribution' },
          { icon: MessageSquare, label: 'Slack Integration', status: 'Active', desc: '#security-critical-alerts channel' },
          { icon: Globe, label: 'Webhooks', status: '8 Endpoints', desc: 'Custom integration for external SIEM' },
          { icon: Phone, label: 'SMS / Pager', status: 'Disabled', desc: 'Emergency on-call rotation' },
        ].map((item, i) => (
          <div key={i} className="p-5 bg-card border border-border rounded-2xl flex items-start justify-between group hover:border-cyan-500/30 transition-all">
            <div className="flex items-start gap-4">
               <div className="p-2.5 bg-muted rounded-xl text-muted-foreground group-hover:text-cyan-500 transition-colors">
                  <item.icon size={18} />
               </div>
               <div>
                  <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">{item.label}</h4>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1 mb-3">{item.desc}</p>
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                    item.status === 'Disabled' ? "bg-muted text-muted-foreground" : "bg-emerald-500/10 text-emerald-500"
                  )}>{item.status}</span>
               </div>
            </div>
            <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-all">
               <Settings size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-6">
         <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Escalation Policy</h4>
         <div className="bg-muted/30 border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-border bg-muted/50">
                     <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase">Severity</th>
                     <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase">Channel</th>
                     <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase">Delay</th>
                     <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border">
                  {[
                    { sev: 'Critical', channel: 'Slack + Email + SMS', delay: 'Instant' },
                    { sev: 'High', channel: 'Slack + Email', delay: 'Instant' },
                    { sev: 'Medium', channel: 'Email', delay: '15 Min' },
                  ].map((row, i) => (
                    <tr key={i} className="group hover:bg-muted/50 transition-all">
                       <td className="px-4 py-4">
                          <span className={cn(
                            "text-[9px] font-black uppercase px-2 py-0.5 rounded",
                            row.sev === 'Critical' ? "bg-red-500/10 text-red-500" : "bg-orange-500/10 text-orange-500"
                          )}>{row.sev}</span>
                       </td>
                       <td className="px-4 py-4 text-[10px] font-bold text-foreground">{row.channel}</td>
                       <td className="px-4 py-4 text-[10px] font-mono text-muted-foreground">{row.delay}</td>
                       <td className="px-4 py-4 text-right">
                          <button className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Edit</button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
