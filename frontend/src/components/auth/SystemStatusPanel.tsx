import React from "react";
import { Shield, Radio, Cpu, Network, Cloud, CheckCircle2, Server, Key, Activity } from "lucide-react";

export function SystemStatusPanel() {
  const capabilities = [
    {
      icon: Network,
      title: "Zeek Network Telemetry",
      subtitle: "Full-duplex non-intrusive stream capture on core backbone",
    },
    {
      icon: Cpu,
      title: "AI Threat Detection",
      subtitle: "Multi-model orchestration layer evaluating pipeline entropy",
    },
    {
      icon: Activity,
      title: "Fusion Correlation Engine",
      subtitle: "Cross-platform alerts synthesis and attack vector clustering",
    },
    {
      icon: Cloud,
      title: "Cloud Security Monitoring",
      subtitle: "Multi-tenant cloud-trail ingress and asset risk indexing",
    },
  ];

  const subServices = [
    { name: "Zeek Sensors Engine", status: "ONLINE", type: "success" },
    { name: "Suricata IDS Core", status: "ONLINE", type: "success" },
    { name: "AWS SQS Ingress Queue", status: "HEALTHY", type: "success" },
    { name: "Fusion Heuristics Agent", status: "ACTIVE", type: "success" },
  ];

  return (
    <div className="space-y-6 text-left font-mono" id="system-status-hero-deck">
      {/* Overview Block */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[9px] font-black uppercase tracking-wider">
          <Shield size={9} className="stroke-[2.5]" />
          Platform Cluster Architecture
        </div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
          SOVEREIGN DEFENSE PIPELINE
        </h3>
        <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
          Welcome to the unified Command Security Platform. Our multi-engine architecture aggregates enterprise telemetry, validates asset trust baselines, and flags advanced persistent threat agents automatically.
        </p>
      </div>

      {/* Core Static Capability Decks */}
      <div className="space-y-3">
        <h4 className="text-[9.5px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest border-b border-slate-100 dark:border-zinc-900/60 pb-2">
          INTEGRATED DETECTORS &amp; PLATFORM ENGELS
        </h4>
        
        <div className="grid grid-cols-1 gap-2.5">
          {capabilities.map((it, idx) => {
            const Icon = it.icon;
            return (
              <div 
                key={idx} 
                className="flex gap-3 p-3.5 bg-slate-50/50 dark:bg-zinc-950/20 border border-slate-200/80 dark:border-zinc-900/50 rounded-xl hover:border-slate-300 dark:hover:border-zinc-800/80 transition-all"
              >
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 text-slate-600 dark:text-cyan-400 group-hover:text-cyan-455 shrink-0">
                  <Icon size={14} className="stroke-2" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] font-black uppercase text-slate-800 dark:text-zinc-200 block">
                    {it.title}
                  </span>
                  <span className="text-[9.5px] text-slate-450 dark:text-zinc-550 leading-snug block">
                    {it.subtitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Status Deck */}
      <div className="space-y-3 pt-2">
        <h4 className="text-[9.5px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest border-b border-slate-100 dark:border-zinc-900/60 pb-2">
          INGRESS HEALTH &amp; TELEMETRY TELEMETRICS
        </h4>

        <div className="grid grid-cols-2 gap-2">
          {subServices.map((srv, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-2 truncate">
                <Server size={11} className="text-slate-400 dark:text-zinc-600 shrink-0" />
                <span className="text-[9.5px] text-slate-700 dark:text-zinc-400 truncate uppercase font-bold">
                  {srv.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400">
                  {srv.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance / Signature Status */}
      <div className="flex items-center gap-2 py-2 px-3 bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-900 rounded-lg text-[9px] uppercase font-semibold text-slate-500 dark:text-zinc-500">
        <CheckCircle2 size={11} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
        <span>FIPS 140-3 Cryptographic Cryptosystem Core: Certified &amp; Operational</span>
      </div>
    </div>
  );
}
