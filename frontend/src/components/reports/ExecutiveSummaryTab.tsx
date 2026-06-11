import React from "react";
import { ShieldCheck, Heart, AlertCircle, Terminal, HelpCircle } from "lucide-react";
import { CalculatedKPIs } from "./types";
import { ExecutiveRiskOverview } from "./ExecutiveRiskOverview";
import { ThreatActivitySummary } from "./ThreatActivitySummary";

interface ExecutiveSummaryTabProps {
  calculatedKPIs: CalculatedKPIs;
  selectedAttackTypes: string[];
}

export const ExecutiveSummaryTab: React.FC<ExecutiveSummaryTabProps> = React.memo(({
  calculatedKPIs,
  selectedAttackTypes,
}) => {
  // Extract top threat type or use standard fallback
  const topThreat = selectedAttackTypes[0] || "SQL Injection Probe (SQLi)";

  // Strategic Executive recommendations as requested
  const recommendations = [
    {
      title: "Improve Public-Facing Web Gateways Security Controls",
      desc: "Harden ingress paths and restrict unsanctioned parameters queries to suppress persistent SQLi and XSS probes.",
      impact: "HIGH",
      relevance: "MITRE T1190 Mitigation"
    },
    {
      title: "Consolidate Multi-Cloud IAM Privileges & S3 Rules",
      desc: "Perform a deep-dive audit of active AWS S3 bucket permissions to enforce zero public read permissions and mitigate credential exposure risk.",
      impact: "CRITICAL",
      relevance: "CIS Benchmark Compliance"
    },
    {
      title: "Harden Bastion Hosts & Secure Shell SSH Gateways",
      desc: "Enforce multi-factor authentication (MFA) and rate-limit access to isolate recurring automated credential brute-forcing probes.",
      impact: "HIGH",
      relevance: "Access Control Posture"
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn" id="executive-summary-tab">
      
      {/* 1. Header Hero Banner */}
      <div className="bg-linear-to-r from-cyan-500/10 via-slate-950/10 to-indigo-500/10 border border-cyan-500/15 rounded-2xl p-5 md:p-6 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 font-mono">
            <span className="px-2 py-0.5 bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 rounded text-[7.5px] font-black uppercase tracking-wider block w-fit">
              Strategic Executive Assessment
            </span>
            <h3 className="text-base md:text-lg font-black text-foreground tracking-tight uppercase">
              CISO Executive Assessment Briefing
            </h3>
            <p className="text-[9.5px] text-zinc-500 uppercase tracking-normal leading-relaxed max-w-2xl font-semibold">
              Consolidated operational indicators, system compliance, and security threat vectors under continuous Bayesian intelligence monitoring.
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono shrink-0">
            <div className="bg-background/80 px-3.5 py-2 rounded-xl border border-border/80 text-right">
              <span className="text-[7px] text-zinc-500 font-extrabold uppercase tracking-widest block">Operational SLA</span>
              <span className="text-[10px] uppercase text-emerald-400 font-black flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" /> CONSENSUS STABLE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Executive KPI Cards (Total Alerts, Critical Alerts, Open Cases, Resolved Cases, Average Risk Score, SLA Compliance) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 font-mono select-none">
        {/* Card 1: Total Alerts */}
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-1 hover:border-cyan-500/20 transition duration-150">
          <span className="text-[7.5px] text-zinc-500 font-black uppercase tracking-widest block">Total Alerts</span>
          <span className="text-xl font-black text-foreground block leading-none pt-1">
            {calculatedKPIs.totalAlerts.toLocaleString()}
          </span>
          <span className="text-[7.5px] text-zinc-500 uppercase block font-semibold leading-normal pt-1 break-all">
            Analyzed events stream
          </span>
        </div>

        {/* Card 2: Critical Alerts */}
        <div className="bg-card border border-rose-500/20 rounded-xl p-4 space-y-1 hover:border-rose-500/40 transition duration-150">
          <span className="text-[7.5px] text-rose-500 font-black uppercase tracking-widest block">Critical Alerts</span>
          <span className="text-xl font-black text-rose-500 block leading-none pt-1">
            {calculatedKPIs.criticalAlerts.toLocaleString()}
          </span>
          <span className="text-[7.5px] text-zinc-500 uppercase block font-semibold leading-normal pt-1">
            Immediate focus
          </span>
        </div>

        {/* Card 3: Open Cases */}
        <div className="bg-card border border-amber-500/20 rounded-xl p-4 space-y-1 hover:border-amber-500/40 transition duration-150">
          <span className="text-[7.5px] text-amber-500 font-black uppercase tracking-widest block">Open Cases</span>
          <span className="text-xl font-black text-amber-500 block leading-none pt-1">
            12
          </span>
          <span className="text-[7.5px] text-zinc-500 uppercase block font-semibold leading-normal pt-1">
            Mitigation active
          </span>
        </div>

        {/* Card 4: Resolved Cases */}
        <div className="bg-card border border-emerald-500/20 rounded-xl p-4 space-y-1 hover:border-emerald-500/45 transition duration-150">
          <span className="text-[7.5px] text-emerald-400 font-black uppercase tracking-widest block">Resolved Cases</span>
          <span className="text-xl font-black text-emerald-400 block leading-none pt-1">
            302
          </span>
          <span className="text-[7.5px] text-zinc-500 uppercase block font-semibold leading-normal pt-1">
            Mitigations verified
          </span>
        </div>

        {/* Card 5: Average Risk Score */}
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-1 hover:border-cyan-500/20 transition duration-155">
          <span className="text-[7.5px] text-zinc-500 font-black uppercase tracking-widest block">Avg Risk Score</span>
          <span className="text-xl font-black text-foreground block leading-none pt-1">
            {calculatedKPIs.averageRisk}%
          </span>
          <span className="text-[7.5px] text-zinc-500 uppercase block font-semibold leading-normal pt-1">
            Perimeter average
          </span>
        </div>

        {/* Card 6: SLA Compliance */}
        <div className="bg-card border border-border/50 rounded-xl p-4 space-y-1 hover:border-cyan-500/20 transition duration-150">
          <span className="text-[7.5px] text-zinc-500 font-black uppercase tracking-widest block">SLA Compliance</span>
          <span className="text-xl font-black text-cyan-400 block leading-none pt-1">
            94.8%
          </span>
          <span className="text-[7.5px] text-zinc-500 uppercase block font-semibold leading-normal pt-1">
            90.0% Standard target
          </span>
        </div>
      </div>

      {/* 3. Security Risk Overview Component */}
      <ExecutiveRiskOverview />

      {/* 4. Top Threat Summary */}
      <ThreatActivitySummary 
        topThreatType={topThreat}
        affectedAssetsCount={14}
        criticalIncidentsCount={calculatedKPIs.criticalAlerts}
        threatTrend="Increasing (+12.4% vs 24h)"
      />

      {/* 5. Executive Strategic Recommendations */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 font-mono text-[9px]">
        <div className="flex items-center gap-2 border-b border-border/20 pb-2.5 select-none">
          <ShieldCheck size={14} className="text-purple-500 animate-pulse" />
          <h3 className="text-xs font-black uppercase text-foreground tracking-widest leading-none">
            Strategic CISO Security Recommendations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="p-4 bg-secondary/10 border border-border/30 rounded-xl space-y-2 flex flex-col justify-between hover:border-border/60 transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[7.5px] uppercase font-black text-cyan-400 block tracking-wider px-1.5 py-0.5 bg-cyan-400/10 border border-cyan-400/15 rounded">
                    {rec.relevance}
                  </span>
                  <span className="text-[7px] uppercase font-black text-rose-500 block">
                    {rec.impact} IMPACT
                  </span>
                </div>
                <h4 className="text-[9.5px] font-black uppercase text-foreground leading-tight">
                  {rec.title}
                </h4>
                <p className="text-[8px] text-zinc-500 uppercase leading-relaxed font-semibold">
                  {rec.desc}
                </p>
              </div>

              <div className="border-t border-border/10 pt-2 text-[7px] uppercase text-zinc-550 font-semibold block text-right mt-1">
                Security Control Reference: ADVISORY-SEC-{100 + idx}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
});
