import React, { useState } from "react";
import { UserPlus, MoreVertical, Shield, User, Clock, Activity, Users } from "lucide-react";
import { cn } from "../../lib/utils";

export function UserManagementSettings() {
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const showActionMessage = (message: string) => {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(null), 3500);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-foreground uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-500" />
            User Management (SOC RBAC)
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Manage analyst credentials, authorization groups, and check audit session metadata</p>
        </div>
        
        {/* Action button */}
        <button 
          onClick={() => showActionMessage("Invite operator workflow queued.")}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all cursor-pointer shrink-0 border border-cyan-500/20"
        >
          <UserPlus size={13} /> Invite User
        </button>
      </div>

      {actionMessage && (
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-500 px-3 py-2 text-[9px] font-black uppercase tracking-widest">
          {actionMessage}
        </div>
      )}

      {/* Users Database list table */}
      <div className="space-y-3">
        <label className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest ml-1 block">
          ACTIVE SOC PERSONNEL DATABASE
        </label>
        
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  <th className="px-6 py-4">IDENTITY</th>
                  <th className="px-6 py-4">ACCESS ROLE</th>
                  <th className="px-6 py-4">LAST ACTIVE</th>
                  <th className="px-6 py-4 text-right">MITIGATION CONTROL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {[
                  { name: 'Phu D. Tran', email: 'phu.tran@defense.soc', role: 'Admin', last: 'NOW', avatar: 'PT' },
                  { name: 'Sarah Jenkins', email: 's.jenkins@defense.soc', role: 'Analyst', last: '12M AGO', avatar: 'SJ' },
                  { name: 'Robert Chen', email: 'r.chen@defense.soc', role: 'Junior Analyst', last: '2H AGO', avatar: 'RC' },
                  { name: 'AI Sentinel 01', email: 'sentinel.01@antigravity', role: 'Automation Node', last: 'NOW', avatar: 'AI' },
                ].map((user: { name: string; email: string; role: string; last: string; avatar: string }, i: number) => (
                  <tr key={user.email} className="group hover:bg-muted/10 transition-all text-[11px]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/15 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                          {user.avatar}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-black text-foreground uppercase tracking-wide truncate">{user.name}</span>
                          <span className="text-[9px] text-muted-foreground lowercase mt-0.5 truncate">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield size={12} className={cn(
                          user.role === 'Admin' ? "text-red-500" : "text-cyan-500"
                        )} />
                        <span className="font-bold text-foreground uppercase tracking-wider">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-muted-foreground tracking-widest">{user.last}</td>
                    <td className="px-6 py-4 text-right">
                      {/* Action trigger */}
                      <button 
                        onClick={() => showActionMessage(`Operator context selected for ${user.name}.`)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all cursor-pointer inline-block"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RBAC details summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left summary info */}
        <div className="p-6 bg-card border border-border rounded-xl space-y-4 shadow-sm">
          <div>
            <span className="text-[8px] font-mono font-black text-muted-foreground uppercase tracking-widest">SYSTEM DECREE</span>
            <h4 className="text-[11px] font-black text-foreground uppercase tracking-wider mt-0.5">🔐 RBAC SUMMARY</h4>
          </div>
          
          <div className="space-y-3 font-mono text-[10px]">
            {[
              { role: 'Admin', count: '1', desc: 'GLOBAL INFRASTRUCTURE COMMAND & CRITICAL WRITE' },
              { role: 'Analyst', count: '2', desc: 'Mitigations, triage and playbook executions' },
              { role: 'Auditor', count: '0', desc: 'Secure zero-write administrative logs viewing' },
            ].map((role, i) => (
              <div key={role.role} className="flex items-center justify-between p-3.5 bg-muted/40 border border-border rounded-lg gap-4">
                <div className="flex flex-col min-w-0">
                  <span className="font-black text-foreground uppercase tracking-wider">{role.role} LEVEL</span>
                  <span className="text-[8px] text-muted-foreground uppercase mt-1 truncate tracking-wide">{role.desc}</span>
                </div>
                <span className="text-[12px] font-black text-cyan-500 bg-cyan-500/5 border border-cyan-500/15 px-2.5 py-0.5 rounded shrink-0">
                  {role.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right metrics dashboard */}
        <div className="p-6 bg-card border border-border rounded-xl space-y-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 text-cyan-500/5 rotate-12 pointer-events-none">
            <User size={140} />
          </div>
          
          <div>
            <span className="text-[8px] font-mono font-black text-muted-foreground uppercase tracking-widest">OPERATIONAL PERFORMANCE</span>
            <h4 className="text-[11px] font-black text-foreground uppercase tracking-wider mt-0.5">📊 TEAM METRICS</h4>
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono select-none">
            
            {/* Active Users */}
            <div className="p-4 bg-muted/30 rounded-xl border border-border">
              <div className="flex items-center gap-1.5 text-cyan-500">
                <Users size={12} />
                <span className="text-[8px] font-black text-muted-foreground uppercase">Active Users</span>
              </div>
              <div className="text-2xl font-black text-foreground mt-2 leading-none">4</div>
              <span className="text-[7.5px] text-muted-foreground/80 block mt-1.5 uppercase">VERIFIED ACTIVE ROLES</span>
            </div>

            {/* Resolution Time */}
            <div className="p-4 bg-muted/30 rounded-xl border border-border">
              <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                <Clock size={12} />
                <span className="text-[8px] font-black text-muted-foreground uppercase">Avg Resolution</span>
              </div>
              <div className="text-2xl font-black text-foreground mt-2 leading-none">22h</div>
              <span className="text-[7.5px] text-muted-foreground/80 block mt-1.5 uppercase">PLAYBOOK RUN LATENCY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
