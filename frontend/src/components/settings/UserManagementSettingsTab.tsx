import React from "react";
import { Users2, Shield, User } from "lucide-react";
import { cn } from "../../lib/utils";
import { SettingsStateData } from "../settings/settingsConfig";

interface UserManagementSettingsTabProps {
  data: SettingsStateData;
  onChange: (path: string, value: any) => void;
  onToast: (msg: string, type?: "success" | "warning" | "info") => void;
}

export function UserManagementSettingsTab({ data, onChange, onToast }: UserManagementSettingsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
          <Users2 className="w-4 h-4 text-cyan-500" />
          Access Roles & Identity Management
        </h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] leading-normal">
          Assign credentials, review active users, and manage custom system level permissions
        </p>
      </div>

      {/* USERS TABLE */}
      <div className="bg-card/40 border border-border/80 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-border bg-muted/20">
          <span className="text-[9px] font-mono font-black text-muted-foreground tracking-[0.22em] uppercase flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <span>Active Operator Accounts</span>
          </span>
        </div>

        <div className="overflow-x-auto text-[10px] font-mono">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/10 border-b border-border/60 text-[8.5px] text-muted-foreground uppercase tracking-wider font-extrabold select-none">
                <th className="p-3 px-4">Operator Username</th>
                <th className="p-3">Role Authority</th>
                <th className="p-3">Node Status</th>
                <th className="p-3 text-right pr-4">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {data.users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-3 px-4 font-black text-foreground">{user.username}</td>
                  <td className="p-3">
                    <span className="text-[8.5px] uppercase font-bold text-cyan-400 bg-cyan-400/5 px-2 py-0.5 rounded border border-cyan-400/10">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="flex items-center gap-1.5 text-emerald-400 text-[8px] uppercase tracking-widest font-black">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_#10b981]" />
                      {user.status}
                    </span>
                  </td>
                  <td className="p-3 text-right pr-4 text-muted-foreground text-[9px]">{user.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PERMISSIONS MATRIX */}
      <div className="bg-card/40 border border-border/80 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-border bg-muted/20 flex items-center justify-between">
          <span className="text-[9px] font-mono font-black text-muted-foreground tracking-[0.22em] uppercase flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            Security Permissions Matrix settings
          </span>
          <span className="text-[8px] font-mono text-muted-foreground uppercase">Interactive Toggles</span>
        </div>

        <div className="overflow-x-auto text-[10px] font-mono">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/10 border-b border-border/40 text-[8px] font-extrabold text-muted-foreground uppercase tracking-wider select-none">
                <th className="p-3 px-4">Portal Module</th>
                {["Admin", "SOC Analyst", "Security Engineer", "Viewer"].map((role) => (
                  <th key={role} className="p-3 text-center">{role}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {Object.keys(data.permissions).map((moduleName) => (
                <tr key={moduleName} className="hover:bg-muted/10 transition-colors">
                  <td className="p-3 px-4 font-black uppercase tracking-wide text-foreground">{moduleName} Portal</td>
                  {["Admin", "SOC Analyst", "Security Engineer", "Viewer"].map((role) => {
                    const isGranted = data.permissions[moduleName]?.[role];
                    return (
                      <td key={role} className="p-3 text-center">
                        <button
                          onClick={() => {
                            // Admins cannot lose permission easily in this mock, but let's toggle with constraint
                            if (role === "Admin") {
                              onToast("GLOBAL PRIVILEGES REQUIRE TWO FACTOR BYPASS HANDLES.", "warning");
                              return;
                            }
                            onChange(`permissions.${moduleName}.${role}`, !isGranted);
                            onToast(`PERMISSIONS VALUE ${moduleName} MODULE FOR ${role.toUpperCase()} COMPROMISED.`, "info");
                          }}
                          className={cn(
                            "mx-auto w-5 h-5 rounded flex items-center justify-center border cursor-pointer transition-all",
                            isGranted 
                              ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400 font-extrabold" 
                              : "bg-muted border-border text-muted-foreground/45"
                          )}
                        >
                          {isGranted ? "✓" : "✗"}
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
    </div>
  );
}
