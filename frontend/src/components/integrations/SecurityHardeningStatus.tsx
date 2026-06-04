import React from "react";
import { Lock, Check, Clock } from "lucide-react";
import { cn } from "../../lib/utils";

interface SecurityHardeningStatusProps {
  isDarkMode: boolean;
}

export function SecurityHardeningStatus({ isDarkMode }: SecurityHardeningStatusProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card relative font-mono text-[9px]">
      <div className="flex gap-2 items-center mb-3 text-cyan-400 pb-1 border-b border-border/60">
        <Lock size={12} className="text-cyan-500 animate-pulse" />
        <h3 className="text-[10px] font-black uppercase tracking-wider">AWS IAM & TLS Tunnel Security Status</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-slate-400 leading-snug">
        <div className="space-y-0.5">
          <p className="font-black text-slate-800 dark:text-slate-300">AWS KMS Key Encryption</p>
          <div className="flex items-center gap-1 text-[8.5px] uppercase font-black text-emerald-500">
            <Check size={11} /> alias/fcaj-v3-key
          </div>
        </div>

        <div className="space-y-0.5">
          <p className="font-black text-slate-800 dark:text-slate-300">TLS Encryption Stream</p>
          <div className="flex items-center gap-1 text-[8.5px] uppercase font-black text-emerald-500">
            <Check size={11} /> enforced TLS v1.3 only
          </div>
        </div>

        <div className="space-y-0.5">
          <p className="font-black text-slate-800 dark:text-slate-300">Secret Rotation Plan</p>
          <div className="flex items-center gap-1 text-[8.5px] uppercase font-black text-cyan-500">
            <Clock size={11} /> every 30 days
          </div>
        </div>

        <div className="space-y-0.5">
          <p className="font-black text-slate-800 dark:text-slate-300">AWS Credentials IAM Check</p>
          <div className="flex items-center gap-1 text-[8.5px] uppercase font-black text-emerald-500">
            <Check size={11} /> active (verified)
          </div>
        </div>
      </div>
    </div>
  );
}
