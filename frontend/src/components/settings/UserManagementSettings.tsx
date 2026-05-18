import React from "react";
import { UserPlus, MoreVertical, Shield, User } from "lucide-react";
import { cn } from "../../lib/utils";

export function UserManagementSettings() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Soc Personnel</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Manage analysts and administrative privileges</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20 transition-all">
           <UserPlus size={14} /> Invite User
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
           <thead>
              <tr className="bg-muted/50 border-b border-border">
                 <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Identity</th>
                 <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Access Role</th>
                 <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Last Active</th>
                 <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-border">
              {[
                { name: 'Phu D. Tran', email: 'phu.tran@defense.soc', role: 'System Admin', last: 'Now', avatar: 'PT' },
                { name: 'Sarah Jenkins', email: 's.jenkins@defense.soc', role: 'Senior Analyst', last: '12m ago', avatar: 'SJ' },
                { name: 'Robert Chen', email: 'r.chen@defense.soc', role: 'Security Junior', last: '2h ago', avatar: 'RC' },
                { name: 'AI Sentinel 01', email: 'agent.sentinel@antigravity', role: 'Automation Node', last: 'Now', avatar: 'AI' },
              ].map((user, i) => (
                <tr key={i} className="group hover:bg-muted/30 transition-all">
                   <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                         <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 text-xs font-black">
                            {user.avatar}
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[11px] font-black text-foreground uppercase tracking-widest">{user.name}</span>
                            <span className="text-[9px] text-muted-foreground lowercase">{user.email}</span>
                         </div>
                      </div>
                   </td>
                   <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <Shield size={12} className={cn(
                           user.role === 'System Admin' ? "text-red-500" : "text-cyan-500"
                         )} />
                         <span className="text-[10px] font-bold text-foreground">{user.role}</span>
                      </div>
                   </td>
                   <td className="px-6 py-4 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{user.last}</td>
                   <td className="px-6 py-4 text-right">
                      <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
                         <MoreVertical size={14} />
                      </button>
                   </td>
                </tr>
              ))}
           </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="p-6 bg-muted/30 border border-border rounded-2xl space-y-4">
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Role-Based Access Control (RBAC)</h4>
            <div className="space-y-3">
               {[
                 { role: 'Admin', count: 1, desc: 'Full system control and audit access' },
                 { role: 'Analyst', count: 2, desc: 'Incident triage and mitigation capabilities' },
                 { role: 'Auditor', count: 0, desc: 'ReadOnly access to logs and settings' },
               ].map((role, i) => (
                 <div key={i} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-foreground uppercase">{role.role}</span>
                       <span className="text-[8px] text-muted-foreground font-medium uppercase mt-1">{role.desc}</span>
                    </div>
                    <span className="text-[10px] font-mono font-black text-cyan-500">{role.count}</span>
                 </div>
               ))}
            </div>
         </div>
         <div className="p-6 bg-muted/30 border border-border rounded-2xl relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
               <User size={80} />
            </div>
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest mb-2">Team Statistics</h4>
            <div className="space-y-4 pt-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-card rounded-2xl border border-border">
                     <div className="text-xl font-black text-foreground">4</div>
                     <div className="text-[8px] font-black text-muted-foreground uppercase mt-1">Active Personnel</div>
                  </div>
                  <div className="p-4 bg-card rounded-2xl border border-border">
                     <div className="text-xl font-black text-foreground">22h</div>
                     <div className="text-[8px] font-black text-muted-foreground uppercase mt-1">Avg Resolution Time</div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
