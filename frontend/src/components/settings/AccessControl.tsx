import React, { useState } from "react";
import { z } from "zod";
import { Users2, ShieldCheck, Clock, KeyRound, AlertTriangle, Check, X, ShieldAlert, Key } from "lucide-react";
import { cn } from "../../lib/utils";

export const accessControlSchema = z.object({
  sessionTimeout: z.number().min(5, "Minimum timeout is 5 minutes").max(1440, "Maximum session timeout is 1440 minutes"),
  mfaRequired: z.boolean(),
  passwordRotationValue: z.enum(["30 Days", "60 Days", "90 Days", "None"]),
  operatorUsers: z.array(z.object({
    id: z.number(),
    username: z.string(),
    role: z.enum(["Admin", "SOC Analyst", "Security Engineer", "Viewer"]),
    status: z.enum(["Active", "Suspended"]),
    lastLogin: z.string(),
  })),
  permissions: z.record(z.string(), z.record(z.string(), z.boolean())),
});

export type AccessControlType = z.infer<typeof accessControlSchema>;

interface AccessControlProps {
  data: AccessControlType;
  onChange: (path: string, value: any) => void;
  onToast?: (message: string, type: any) => void;
}

export function AccessControl({ data, onChange, onToast }: AccessControlProps) {
  const [selectedRole, setSelectedRole] = useState<string>("Admin");
  const [operatorSearch, setOperatorSearch] = useState("");

  const roles = ["Admin", "SOC Analyst", "Security Engineer", "Viewer"];
  const pages = ["Dashboard", "Alerts", "Cases", "Reports", "Settings"];

  const handleToggleMfa = () => {
    onChange("users.mfaRequired", !data.mfaRequired);
    if (onToast) {
      onToast(`MFA REQUISITION HAS BEEN ${!data.mfaRequired ? "ENABLED" : "DISABLED"} FOR ALL OPERATORS`, "warning");
    }
  };

  const handleTimeoutChange = (val: string) => {
    const min = parseInt(val, 10) || 15;
    onChange("users.sessionTimeout", min);
  };

  const handleRotationChange = (val: any) => {
    onChange("users.passwordRotationValue", val);
  };

  const handleTogglePermission = (pageName: string, roleName: string) => {
    const currentVal = data.permissions[pageName]?.[roleName] ?? false;
    onChange(`users.permissions.${pageName}.${roleName}`, !currentVal);
    if (onToast) {
      onToast(`PERMISSION HAS BEEN TOGGLED FOR: ${roleName} AT ${pageName.toUpperCase()}`, "success");
    }
  };

  const filteredUsers = (data.operatorUsers || []).filter((u: { username: string; role: string; id: number; status: string; lastLogin: string }) => 
    u.username.toLowerCase().includes(operatorSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(operatorSearch.toLowerCase())
  );

  return (
    <div className="space-y-6" id="access-control-panel">
      {/* Overview Head */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Users2 className="w-4 h-4 text-cyan-500" />
          User & Access Control Settings
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Review operator user profiles, configure role-based app page permissions, and define strict session verification requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-[9px] uppercase">
        
        {/* Left column: Operator user ledger & session policy */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Section: Session Security Policies */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm h-fit">
            <span className="text-[10px] font-black tracking-wider text-slate-900 dark:text-white border-b border-border/25 pb-2 flex items-center gap-1.5 animate-pulse">
              <KeyRound className="w-3.5 h-3.5 text-cyan-500" />
              Administrative Security Policy
            </span>

            {/* Session Timeout */}
            <div className="space-y-1.5">
              <label className="text-[8.5px] font-bold text-[#64748b] block">Inactivity Session Timeout (minutes)</label>
              <input
                type="number"
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 rounded-lg px-3 py-1.5 text-xs font-bold"
                value={data.sessionTimeout || 30}
                onChange={(e) => handleTimeoutChange(e.target.value)}
              />
              <span className="text-[7.5px] text-zinc-500 block leading-none">Sets standard JWT session expiration bounds</span>
            </div>

            {/* Password rotation */}
            <div className="space-y-1.5 focus-within:text-cyan-500 transition-colors">
              <label className="text-[8.5px] font-bold text-[#64748b] block">Forced Password Rotation Limit</label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer"
                value={data.passwordRotationValue || "60 Days"}
                onChange={(e) => handleRotationChange(e.target.value)}
              >
                <option value="30 Days">30 Days (Military Special Grade)</option>
                <option value="60 Days">60 Days (Enterprise Standard)</option>
                <option value="90 Days">90 Days (Relaxed routine limit)</option>
                <option value="None">None (De-activated)</option>
              </select>
            </div>

            {/* MFA requisition */}
            <div className="flex items-center justify-between border-t border-border/10 pt-3">
              <div>
                <span className="text-[9.5px] font-black text-slate-900 dark:text-white block">Enforce Multi-Factor MFA Logins</span>
                <span className="text-[7.5px] text-zinc-500 block">Required for all admin accounts</span>
              </div>
              <button
                type="button"
                onClick={handleToggleMfa}
                className={cn(
                  "w-10 h-5 rounded-full transition relative cursor-pointer border-none",
                  data.mfaRequired ? "bg-cyan-600" : "bg-zinc-800"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                  data.mfaRequired ? "right-1" : "left-1"
                )} />
              </button>
            </div>
          </div>

          {/* Section: Operational Users List */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
            <span className="text-[10px] font-black tracking-wider text-slate-900 dark:text-white block border-b border-border/25 pb-2">
              Registered Security Personnel
            </span>

            <div className="flex bg-slate-50 dark:bg-slate-900/40 rounded border border-border/80 px-2 py-1 items-center gap-1.5">
              <input
                type="text"
                className="bg-transparent w-full border-none outline-none text-[10px] font-bold"
                placeholder="search operator profiles..."
                value={operatorSearch}
                onChange={(e) => setOperatorSearch(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex justify-between items-center bg-slate-100/50 dark:bg-zinc-950/20 border border-border/40 hover:border-cyan-500/20 p-2 rounded-lg transition">
                  <div>
                    <span className="text-[9px] font-black text-slate-900 dark:text-white block">{user.username}</span>
                    <span className="text-[7px] text-zinc-500 inline-block uppercase bg-slate-100 dark:bg-slate-900 px-1 rounded font-extrabold mt-0.5">{user.role}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-emerald-500 font-bold block">{user.status}</span>
                    <span className="text-[6.5px] text-zinc-500 block">login: {user.lastLogin.split(" ")[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Role-Based Authorization Grid */}
        <div className="lg:col-span-6 h-full">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm h-full flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-black tracking-wider text-slate-900 dark:text-white border-b border-border/25 pb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                Page Authorization Grid
              </span>

              <p className="text-[8px] text-slate-500 normal-case tracking-normal mb-1">
                Toggle the boolean matrix values directly to update accessibility rules mapped to core system interface modules:
              </p>

              {/* Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="border-b border-border/20 text-[8px] text-slate-500">
                      <th className="py-2 text-left font-bold text-slate-900 dark:text-white">Workspace Page</th>
                      {roles.map(r => (
                        <th key={r} className="py-2 text-[7.5px] font-black tracking-wider">{r.split(" ")[0]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    {pages.map((p) => (
                      <tr key={p} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td className="py-2.5 text-left font-black text-slate-900 dark:text-white text-[8.5px]">{p}</td>
                        {roles.map((r) => {
                          const permitted = data.permissions[p]?.[r] ?? false;
                          return (
                            <td key={r} className="py-2.5">
                              <button
                                onClick={() => handleTogglePermission(p, r)}
                                className={cn(
                                  "mx-auto w-4 h-4 rounded border flex items-center justify-center transition cursor-pointer scale-95",
                                  permitted 
                                    ? "bg-cyan-500 border-cyan-500 text-slate-950 hover:bg-cyan-400" 
                                    : "border-border hover:border-cyan-500/50 bg-transparent"
                                )}
                              >
                                {permitted ? <Check className="w-3 h-3" /> : <X className="w-2.5 h-2.5 text-zinc-600" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-cyan-500/5 p-3 rounded-lg border border-cyan-500/10 flex items-start gap-2 pt-2 mt-4">
              <ShieldAlert className="w-4 h-4 text-cyan-500 shrink-0" />
              <span className="text-[7.5px] text-zinc-500 font-bold leading-normal">
                Updating permission sets triggers audit logging. Deactivating default system dashboard visibility for admins is locked to prevent locking out operators.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
