import React from "react";
import { ArrowRightLeft, BookOpen, ShieldCheck } from "lucide-react";

export function FusionMitreMappingReference() {
  const dictionary = [
    { source: "Brute Force", target: "T1110", tactic: "Credential Access" },
    { source: "Port Scan", target: "T1046", tactic: "Discovery" },
    { source: "XSS Vulnerability", target: "T1190", tactic: "Initial Access" },
    { source: "SQL Injection", target: "T1190", tactic: "Initial Access" },
    { source: "DoS Flood", target: "T1498", tactic: "Impact" },
    { source: "Beaconing Domain", target: "T1071", tactic: "Command & Control" }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4 select-none h-full flex flex-col justify-between min-h-[320px]">
      <div className="flex items-center gap-1.5 border-b border-border/40 pb-2.5">
        <ArrowRightLeft size={13} className="text-[#06b6d4]" />
        <div>
          <h4 className="text-[9px] font-black text-foreground uppercase tracking-[0.2em]">
            FUSION-TO-MITRE MAPPING RULES
          </h4>
          <p className="text-[7.5px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">
            Model decision classification translator
          </p>
        </div>
      </div>

      <div className="space-y-2 text-[9px] font-mono">
        <div className="grid grid-cols-3 text-muted-foreground/80 font-black uppercase tracking-wider border-b border-border/20 pb-1.5">
          <span>Fusion Term</span>
          <span className="text-center">ATT&amp;CK ID</span>
          <span className="text-right">Tactic Class</span>
        </div>

        <div className="space-y-1.5">
          {dictionary.map((rule) => (
            <div
              key={rule.source}
              className="grid grid-cols-3 py-1.5 px-2 rounded hover:bg-muted/30 transition-all border border-border/10 justify-between items-center"
            >
              <span className="text-foreground font-black text-[9.5px]">
                {rule.source}
              </span>
              <span className="text-cyan-400 font-extrabold text-center text-[10px]">
                {rule.target}
              </span>
              <span className="text-muted-foreground/90 font-semibold text-right text-[8.5px] truncate">
                {rule.tactic}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-2.5 bg-muted/60 border border-border/50 rounded-lg flex gap-2">
        <BookOpen size={12} className="text-cyan-400 shrink-0 mt-0.5" />
        <p className="text-[7.5px] font-mono text-muted-foreground uppercase tracking-wider leading-relaxed">
          Dynamic rules translate model confidence levels ($P(Attack)$) alongside Suricata L7 flags into high-fidelity technique tags.
        </p>
      </div>
    </div>
  );
}
