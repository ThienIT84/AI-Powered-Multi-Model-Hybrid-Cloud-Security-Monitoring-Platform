import React from "react";
import { Alert } from "../../../types";
import { ExternalLink, Target } from "lucide-react";

interface MitreTechniqueCardProps {
  alert: Alert;
}

export function MitreTechniqueCard({ alert }: MitreTechniqueCardProps) {
  const code = alert.mitre?.techniqueId || "T1190";
  const name = alert.mitre?.techniqueName || "Exploit Public-Facing Application";
  const tactic = alert.mitre?.tactic || "Initial Access";
  const url = alert.mitre?.url || `https://attack.mitre.org/techniques/${code}`;

  return (
    <div className="bg-background/40 border border-border/70 rounded-xl p-3.5 space-y-3 select-none leading-none">
      <div className="flex items-center justify-between">
        <span className="text-[8.5px] text-cyan-500 uppercase tracking-widest font-black block">
          MITRE ATT&CK Mapping
        </span>
        <Target size={11} className="text-cyan-500 animate-pulse" />
      </div>

      <div className="flex justify-between items-center bg-secondary/20 border border-border p-2.5 rounded-lg">
        <div className="space-y-1">
          <span className="font-mono text-[7px] text-muted-foreground font-black uppercase">[{code}]</span>
          <h4 className="text-[9.5px] font-black text-foreground uppercase truncate max-w-50">{name}</h4>
          <span className="text-[7.5px] font-mono text-[#06b6d4] uppercase font-black tracking-wide block">{tactic}</span>
        </div>

        <a 
          href={url} 
          target="_blank" 
          referrerPolicy="no-referrer"
          className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded border border-border shrink-0"
        >
          <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}
export default MitreTechniqueCard;
