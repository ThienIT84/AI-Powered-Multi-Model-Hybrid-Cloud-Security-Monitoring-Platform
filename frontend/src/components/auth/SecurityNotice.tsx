import React from "react";
import { ShieldAlert, Info, Key, Eye, FileSpreadsheet } from "lucide-react";

export function SecurityNotice() {
  const notices = [
    {
      icon: Key,
      title: "MFA Authentication Enforced",
      desc: "Multi-factor verification is heavily recommended for administrator and high-clearance SOC operator credentials.",
    },
    {
      icon: Eye,
      title: "Real-time Auditing Active",
      desc: "All keyboard interactions, query histories, session allocations, and active tasks are logged to secure backend systems.",
    },
    {
      icon: FileSpreadsheet,
      title: "RBAC Policies Enabled",
      desc: "Access control matrices restrict operators to specific cluster environments, telemetry levels, and case updates.",
    },
  ];

  return (
    <div
      className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-250 dark:border-zinc-900 rounded-xl p-5 space-y-4 font-mono text-left"
      id="soc-security-notice-panel"
    >
      {/* Alert Header */}
      <div className="flex items-start gap-2.5">
        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
          <ShieldAlert size={14} className="stroke-[2.5]" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200">
            AUTHORIZED SECURE ACCESS ONLY
          </h4>
          <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-semibold uppercase block">
            Government &amp; Enterprise Compliance Mandate
          </span>
        </div>
      </div>

      <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-normal font-medium border-t border-slate-100 dark:border-zinc-900/60 pt-3">
        This is a guarded operational security hub. Unauthorized connection, exploitation, or credential mining is strictly prohibited and subject to immediate civil and criminal penalties under federal cyber protection standard statutes.
      </p>

      {/* Mini bullets list */}
      <div className="space-y-3 pt-1">
        {notices.map((n, i) => {
          const IconComp = n.icon;
          return (
            <div key={i} className="flex gap-2.5">
              <IconComp size={12} className="text-cyan-550 dark:text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[9.5px] font-black uppercase text-slate-800 dark:text-zinc-300 block leading-tight">
                  {n.title}
                </span>
                <span className="text-[8.5px] text-slate-400 dark:text-zinc-500 leading-normal block">
                  {n.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
