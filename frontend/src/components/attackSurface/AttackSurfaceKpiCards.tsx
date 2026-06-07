import React from "react";
import { Cpu, Globe, Layers, ShieldAlert, CheckCircle2 } from "lucide-react";
import { cn } from "./utils";

interface AttackSurfaceKpiCardsProps {
  totalAssetsCount: number;
  internetFacingCount: number;
  activeAttackPathsCount: number;
  highRiskAssetsCount: number;
  averageExposureMultiplier: number;
}

export function AttackSurfaceKpiCards({
  totalAssetsCount,
  internetFacingCount,
  activeAttackPathsCount,
  highRiskAssetsCount,
  averageExposureMultiplier
}: AttackSurfaceKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5 mb-6">
      {[
        {
          label: "Total Monitored Assets",
          value: totalAssetsCount,
          sub: "EC2 • Web • API • DB • Terminals",
          color: "text-[#38BDF8]",
          borderColor: "hover:border-[#38BDF8]/40",
          glow: "hover:shadow-[0_0_15px_rgba(56,189,248,0.15)]",
          icon: Cpu
        },
        {
          label: "Internet-Facing Assets",
          value: internetFacingCount,
          sub: "Public IPs & Domain Proxies",
          color: "text-orange-400",
          borderColor: "hover:border-orange-500/40",
          glow: "hover:shadow-[0_0_15px_rgba(249,115,22,0.15)]",
          icon: Globe
        },
        {
          label: "Active Attack Paths",
          value: activeAttackPathsCount,
          sub: "Mitre Chained Pathways",
          color: "text-amber-400",
          borderColor: "hover:border-yellow-500/40",
          glow: "hover:shadow-[0_0_15px_rgba(234,179,8,0.15)]",
          icon: Layers
        },
        {
          label: "High Risk Assets (>80)",
          value: highRiskAssetsCount,
          sub: "Critical Isolation Priority",
          color: "text-red-400",
          borderColor: "hover:border-red-500/40",
          glow: "hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]",
          icon: ShieldAlert
        },
        {
          label: "Avg Exposure Score",
          value: `${averageExposureMultiplier}/100`,
          sub: "Corporate Vulnerability Rating",
          color: "text-emerald-400",
          borderColor: "hover:border-emerald-500/40",
          glow: "hover:shadow-[0_0_15px_rgba(34,197,94,0.15)]",
          icon: CheckCircle2
        }
      ].map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={cn(
              "bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-800 rounded-xl p-4 transition-all duration-300 relative overflow-hidden group shadow-sm dark:shadow-none",
              card.borderColor,
              card.glow
            )}
          >
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl bg-gray-700/5 group-hover:bg-gray-700/10 transition-colors pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-mono font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest leading-none">
                {card.label}
              </p>
              <Icon className={cn("w-4 h-4", card.color)} />
            </div>
            <p className={cn("text-2xl font-black font-mono tracking-tight", card.color)}>
              {card.value}
            </p>
            <p className="text-[9px] font-mono text-slate-400 dark:text-gray-500 mt-1 uppercase tracking-wide">
              {card.sub}
            </p>
          </div>
        );
      })}
    </div>
  );
}
