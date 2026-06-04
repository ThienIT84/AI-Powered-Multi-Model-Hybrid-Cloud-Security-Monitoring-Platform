import React from "react";
import { Alert } from "../../types";
import { Target, ExternalLink } from "lucide-react";

interface MitreAttackPanelProps {
  alert: Alert;
}

export function MitreAttackPanel({ alert }: MitreAttackPanelProps) {
  const attackLower = (alert.attackType || "").toLowerCase();

  let code = "T1190";
  let name = "Exploit Public-Facing Application";
  let tactic = "Initial Access";
  let description = "Adversaries may attempt to exploit a weakness in an Internet-facing computer or program to gain access to cloud environments or internal networks.";

  if (attackLower.includes("scan") || attackLower.includes("port")) {
    code = "T1046";
    name = "Network Service Scanning";
    tactic = "Reconnaissance";
    description = "Adversaries may attempt to examine client/server network sockets to discover active operating ports and services, revealing weak points for further attacks.";
  } else if (attackLower.includes("brute") || attackLower.includes("credential") || attackLower.includes("stuffing")) {
    code = "T1110";
    name = "Brute Force";
    tactic = "Credential Access";
    description = "Adversaries may attempt to utilize multiple systematic trial password combinations against active login structures to bypass authorization boundaries.";
  } else if (attackLower.includes("xss") || attackLower.includes("cross-site")) {
    code = "T1190";
    name = "Exploit Public-Facing Application (XSS)";
    tactic = "Initial Access";
    description = "Adversaries may exploit input handling vulnerabilities to inject client-side scripts, executing arbitrary payloads inside the browser of accessing administrators.";
  } else if (attackLower.includes("sql") || attackLower.includes("injection") || attackLower.includes("lfi")) {
    code = "T1119";
    name = "Exploit Public-Facing Application (SQL Injection)";
    tactic = "Initial Access / Execution";
    description = "Adversaries may attempt to inject malicious SQL directives into active parameter queries, bypassing backend databases and exfiltrating secure credentials.";
  }

  const url = `https://attack.mitre.org/techniques/${code.split(".")[0]}`;

  return (
    <div className="space-y-4">
      {/* Target 14. Panel Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-[0.2em] block">
            MITRE ATT&CK MATRIX INTEGRATION
          </span>
          <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-wider block mt-0.5">
            Threat Taxonomy & Defensive Mapping
          </h3>
        </div>
        <Target size={12} className="text-cyan-500" />
      </div>

      {/* MITRE Block Container */}
      <div className="bg-secondary/15 border border-border/50 rounded-xl p-3.5 space-y-3.5">
        <div className="flex justify-between items-start bg-card border border-border p-3 rounded-lg leading-none">
          <div className="space-y-1.5">
            <span className="font-mono text-[8.5px] text-cyan-650 dark:text-[#06b6d4] font-black bg-cyan-500/10 dark:bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/15">
              {code}
            </span>
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-wide pt-1">{name}</h4>
            <span className="text-[8px] font-mono text-muted-foreground uppercase font-semibold block">Tactic: {tactic}</span>
          </div>

          <a 
            href={url} 
            target="_blank" 
            referrerPolicy="no-referrer"
            className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded border border-border shrink-0 transition-colors"
            title="View Mitre Wiki Link"
          >
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Technique description */}
        <div className="p-3 bg-background/50 rounded-lg border border-border/40 text-[9px] text-muted-foreground leading-relaxed">
          <span className="font-black text-[7.5px] text-foreground uppercase block mb-1">Technique Description</span>
          {description}
        </div>
      </div>
    </div>
  );
}

export default MitreAttackPanel;
