import React from "react";
import { CloudAsset, Finding } from "./types";
import { Cloud, Eye, ShieldAlert, AlertTriangle, ShieldCheck, Award } from "lucide-react";

interface CloudSecurityKPIsProps {
  assets: CloudAsset[];
}

export function CloudSecurityKPIs({ assets }: CloudSecurityKPIsProps) {
  // Aggregate stats from the asset dataset
  const totalAssets = assets.length;
  const internetExposed = assets.filter((a) => a.isInternetExposed).length;
  
  // High risk assets defined as riskScore >= 70
  const highRiskAssets = assets.filter((a) => a.riskScore >= 70).length;

  // Total findings across all assets that are "Critical" severity
  const criticalMisconfigs = assets.flatMap(a => a.findings).filter(f => f.severity === "Critical").length;

  // Calculate average Cloud Security Score based on 100 - average riskScore
  const avgRisk = assets.reduce((sum, a) => sum + a.riskScore, 0) / (totalAssets || 1);
  const securityScore = Math.round(100 - avgRisk);

  // Calculate average Compliance Score
  const complianceScore = Math.round(
    assets.reduce((sum, a) => sum + a.complianceScore, 0) / (totalAssets || 1)
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" id="cloud-security-kpi-bar">
      
      {/* Card 1: Total Cloud Assets */}
      <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col justify-between hover:border-cyan-500/20 transition-all select-none">
        <div className="flex items-center justify-between">
          <span className="text-[8.5px] font-black uppercase text-muted-foreground tracking-wider font-mono">
            Total Assets
          </span>
          <div className="p-1 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Cloud size={12} />
          </div>
        </div>
        <div className="mt-2 text-foreground">
          <span className="text-xl font-black tracking-tight font-mono">
            {totalAssets}
          </span>
          <span className="text-[8px] text-zinc-400 block mt-0.5 font-bold font-mono uppercase">
            Monitored Cloud Objects
          </span>
        </div>
      </div>

      {/* Card 2: Internet Exposed Assets */}
      <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col justify-between hover:border-red-500/20 transition-all select-none">
        <div className="flex items-center justify-between">
          <span className="text-[8.5px] font-black uppercase text-muted-foreground tracking-wider font-mono">
            Internet Exposed
          </span>
          <div className="p-1 rounded-md bg-red-500/10 text-red-600 dark:text-red-400">
            <Eye size={12} />
          </div>
        </div>
        <div className="mt-2 text-foreground">
          <span className="text-xl font-black tracking-tight font-mono text-red-600 dark:text-red-400">
            {internetExposed}
          </span>
          <span className="text-[8px] text-zinc-400 block mt-0.5 font-bold font-mono uppercase">
            Active Attack Surface Nodes
          </span>
        </div>
      </div>

      {/* Card 3: High Risk Assets */}
      <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col justify-between hover:border-amber-500/20 transition-all select-none">
        <div className="flex items-center justify-between">
          <span className="text-[8.5px] font-black uppercase text-muted-foreground tracking-wider font-mono">
            High Risk Assets
          </span>
          <div className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ShieldAlert size={12} />
          </div>
        </div>
        <div className="mt-2 text-foreground">
          <span className="text-xl font-black tracking-tight font-mono text-amber-500">
            {highRiskAssets}
          </span>
          <span className="text-[8px] text-zinc-400 block mt-0.5 font-bold font-mono uppercase">
            Risk Index &ge; 70%
          </span>
        </div>
      </div>

      {/* Card 4: Critical Findings */}
      <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col justify-between hover:border-red-500/20 transition-all select-none">
        <div className="flex items-center justify-between">
          <span className="text-[8.5px] font-black uppercase text-muted-foreground tracking-wider font-mono">
            Critical Findings
          </span>
          <div className="p-1 rounded-md bg-red-500/15 text-red-500">
            <AlertTriangle size={12} />
          </div>
        </div>
        <div className="mt-2 text-foreground">
          <span className="text-xl font-black tracking-tight font-mono text-red-500 text-shadow">
            {criticalMisconfigs}
          </span>
          <span className="text-[8px] text-zinc-400 block mt-0.5 font-bold font-mono uppercase">
            Active CSOC Alarms
          </span>
        </div>
      </div>

      {/* Card 5: Cloud Security Score */}
      <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col justify-between hover:border-emerald-500/20 transition-all select-none">
        <div className="flex items-center justify-between">
          <span className="text-[8.5px] font-black uppercase text-muted-foreground tracking-wider font-mono">
            Security Score
          </span>
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck size={12} />
          </div>
        </div>
        <div className="mt-2 text-foreground">
          <span className="text-xl font-black tracking-tight font-mono text-emerald-600 dark:text-emerald-400">
            {securityScore}%
          </span>
          <span className="text-[8px] text-zinc-400 block mt-0.5 font-bold font-mono uppercase">
            Tenant Health Index
          </span>
        </div>
      </div>

      {/* Card 6: Compliance Score */}
      <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col justify-between hover:border-purple-500/20 transition-all select-none">
        <div className="flex items-center justify-between">
          <span className="text-[8.5px] font-black uppercase text-muted-foreground tracking-wider font-mono">
            Compliance Score
          </span>
          <div className="p-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Award size={12} />
          </div>
        </div>
        <div className="mt-2 text-foreground">
          <span className="text-xl font-black tracking-tight font-mono text-purple-600 dark:text-purple-400">
            {complianceScore}%
          </span>
          <span className="text-[8px] text-zinc-400 block mt-0.5 font-bold font-mono uppercase">
            Matched Framework Base
          </span>
        </div>
      </div>

    </div>
  );
}
export default CloudSecurityKPIs;
