import React from "react";
import { Shield, Check, X } from "lucide-react";

interface PasswordStrengthProps {
  value: string;
}

export function PasswordStrength({ value }: PasswordStrengthProps) {
  if (!value) return null;

  const checks = {
    length: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let strengthLabel = "Weak";
  let colorClass = "bg-rose-500";
  let textColorClass = "text-rose-500 dark:text-rose-400";
  let levelIndex = 1;

  if (score >= 5) {
    strengthLabel = "Strong";
    colorClass = "bg-emerald-500";
    textColorClass = "text-emerald-500 dark:text-emerald-400";
    levelIndex = 3;
  } else if (score >= 3) {
    strengthLabel = "Medium";
    colorClass = "bg-amber-500";
    textColorClass = "text-amber-500 dark:text-amber-400";
    levelIndex = 2;
  }

  return (
    <div className="space-y-2 mt-2 font-mono text-[10px]" id="password-strength-validator">
      {/* Label and Score Indicators */}
      <div className="flex justify-between items-center">
        <span className="text-slate-500 dark:text-zinc-500 font-black uppercase tracking-wider">
          Entropy Strength:
        </span>
        <div className="flex items-center gap-1.5">
          <Shield size={10} className={`${textColorClass}`} />
          <span className={`font-black uppercase tracking-wider ${textColorClass}`}>
            {strengthLabel}
          </span>
        </div>
      </div>

      {/* Progress Bar Segments */}
      <div className="grid grid-cols-3 gap-1">
        <div className={`h-1.5 rounded-sm transition-all duration-300 ${levelIndex >= 1 ? colorClass : "bg-slate-200 dark:bg-zinc-900"}`} />
        <div className={`h-1.5 rounded-sm transition-all duration-300 ${levelIndex >= 2 ? colorClass : "bg-slate-200 dark:bg-zinc-900"}`} />
        <div className={`h-1.5 rounded-sm transition-all duration-300 ${levelIndex >= 3 ? colorClass : "bg-slate-200 dark:bg-zinc-900"}`} />
      </div>

      {/* Checklist items */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1.5 text-[9px] uppercase font-bold border-t border-slate-100 dark:border-zinc-900">
        <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
          {checks.length ? (
            <Check size={9} className="text-emerald-500 shrink-0 stroke-3" />
          ) : (
            <X size={9} className="text-slate-400 dark:text-zinc-650 shrink-0 stroke-[2.5]" />
          )}
          <span className={checks.length ? "text-slate-800 dark:text-zinc-350" : "opacity-60"}>8+ Chars</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
          {checks.uppercase ? (
            <Check size={9} className="text-emerald-500 shrink-0 stroke-3" />
          ) : (
            <X size={9} className="text-slate-400 dark:text-zinc-650 shrink-0 stroke-[2.5]" />
          )}
          <span className={checks.uppercase ? "text-slate-800 dark:text-zinc-350" : "opacity-60"}>A-Z Cap</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
          {checks.lowercase ? (
            <Check size={9} className="text-emerald-500 shrink-0 stroke-3" />
          ) : (
            <X size={9} className="text-slate-400 dark:text-zinc-650 shrink-0 stroke-[2.5]" />
          )}
          <span className={checks.lowercase ? "text-slate-800 dark:text-zinc-350" : "opacity-60"}>a-z Lower</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
          {checks.number ? (
            <Check size={9} className="text-emerald-500 shrink-0 stroke-3" />
          ) : (
            <X size={9} className="text-slate-400 dark:text-zinc-650 shrink-0 stroke-[2.5]" />
          )}
          <span className={checks.number ? "text-slate-800 dark:text-zinc-350" : "opacity-60"}>Digit (0-9)</span>
        </div>
        <div className="col-span-2 flex items-center gap-1 text-slate-500 dark:text-zinc-400">
          {checks.special ? (
            <Check size={9} className="text-emerald-500 shrink-0 stroke-3" />
          ) : (
            <X size={9} className="text-slate-400 dark:text-zinc-650 shrink-0 stroke-[2.5]" />
          )}
          <span className={checks.special ? "text-slate-800 dark:text-zinc-350" : "opacity-60"}>Special Char (!@#$...)</span>
        </div>
      </div>
    </div>
  );
}
