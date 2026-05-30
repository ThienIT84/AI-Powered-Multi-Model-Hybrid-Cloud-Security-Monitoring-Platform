import React from "react";
import { Alert } from "../../../types";
import { cn } from "../../../lib/utils";
import { MITRE_MAPPINGS } from "../alertsConfig";
import { Target, Info } from "lucide-react";

interface MitreAttackMapProps {
  alert?: Alert | null;
}

export function MitreAttackMap({ alert }: MitreAttackMapProps) {
  // Define grid structure for standard security techniques
  const tactics = [
    {
      name: "Initial Access",
      id: "TA0001",
      techniques: [
        { id: "T1190", name: "Exploit Public Application" },
        { id: "T1133", name: "External Remote Services" }
      ]
    },
    {
      name: "Credential Access",
      id: "TA0006",
      techniques: [
        { id: "T1110", name: "Brute Force Credentials" },
        { id: "T1555", name: "Credentials from Store" }
      ]
    },
    {
      name: "Discovery",
      id: "TA0007",
      techniques: [
        { id: "T1046", name: "Network Service Discovery" },
        { id: "T1018", name: "Remote System Discovery" }
      ]
    },
    {
      name: "Command & Control",
      id: "TA0011",
      techniques: [
        { id: "T1071", name: "Application Layer Protocol" },
        { id: "T1105", name: "Ingress Tool Transfer" }
      ]
    },
    {
      name: "Exfiltration",
      id: "TA0010",
      techniques: [
        { id: "T1041", name: "Exfiltration Over C2" },
        { id: "T1048", name: "Exfiltration Over Alternative" }
      ]
    }
  ];

  // See if current selected alert matches any of these IDs
  const activeTechniqueId = alert?.mitre?.techniqueId || "T1190";

  return (
    <div className="space-y-4 select-none leading-none">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[8px] text-muted-foreground uppercase tracking-widest block font-black">
            MITRE ATT&CK MATRIX COVERAGE
          </span>
          <span className="text-[9.5px] font-black text-cyan-500 uppercase tracking-wider block mt-0.5">
            Active Multi-Stage Techniques Map
          </span>
        </div>
        <Target size={14} className="text-cyan-500 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-background/40 border border-border/70 rounded-xl p-3.5 select-none">
        {tactics.map((tac) => (
          <div key={tac.id} className="space-y-2.5">
            <div className="border-b border-border/60 pb-1.5 leading-none">
              <span className="text-[7px] font-mono text-muted-foreground font-black uppercase tracking-wider">{tac.id}</span>
              <h4 className="text-[9px] font-black uppercase text-foreground mt-0.5 tracking-tight truncate">{tac.name}</h4>
            </div>

            <div className="space-y-2">
              {tac.techniques.map((tech) => {
                const isActive = tech.id === activeTechniqueId;

                return (
                  <div
                    key={tech.id}
                    className={cn(
                      "p-2 rounded border text-[8px] uppercase leading-snug transition-all flex flex-col justify-between h-14.5",
                      isActive
                        ? "border-red-500 bg-red-500/4 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.12)] font-black"
                        : "border-border bg-card/60 text-muted-foreground hover:border-border/80"
                    )}
                  >
                    <span className="font-mono text-[6.5px] opacity-70 block font-bold">{tech.id}</span>
                    <span className="font-bold truncate mt-1 block">{tech.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default MitreAttackMap;
