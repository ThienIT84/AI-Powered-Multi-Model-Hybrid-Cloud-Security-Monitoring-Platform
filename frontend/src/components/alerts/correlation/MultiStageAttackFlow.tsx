import React from "react";
import { cn } from "../../../lib/utils";
import { GitCommit, Activity, Flame } from "lucide-react";

export function MultiStageAttackFlow() {
  const steps = [
    { title: "Port Scan", desc: "Nmap port sweep identifies active hosts on subnet", status: "COMPLETED", color: "text-emerald-500" },
    { title: "SSH Brute Force", desc: "Rapid dictionary attempts trying credentials on EC2 instances", status: "COMPLETED", color: "text-emerald-500" },
    { title: "Web Exploit (SQLi)", desc: "Attempts structured command extraction via query parameters", status: "ACTIVE", color: "text-red-500 animate-pulse" },
    { title: "Data Exfiltration", desc: "Establish outbound C2 socket to copy database records", status: "PENDING", color: "text-muted-foreground/60" }
  ];

  return (
    <div className="space-y-4 select-none leading-none">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[8px] text-muted-foreground uppercase tracking-widest block font-black">
            ATTACK ESCALATION PATHWAY
          </span>
          <span className="text-[9.5px] font-black text-cyan-500 uppercase tracking-wider block mt-0.5">
            Interconnected Multi-Stage Attack Chains
          </span>
        </div>
        <Flame size={13} className="text-cyan-500 animate-pulse" />
      </div>

      <div className="border border-border rounded-xl p-3 bg-background/40 select-none divide-y divide-border/40">
        {steps.map((s, idx) => (
          <div key={idx} className="flex items-start gap-3 py-2.5 first:pt-1 last:pb-1">
            <span className="font-mono text-[8px] text-muted-foreground/60 font-black self-start mt-0.5 select-none shrink-0">[STAGE 0{idx + 1}]</span>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase text-foreground">{s.title}</span>
                <span className={cn("text-[7px] font-black uppercase tracking-wider font-mono", s.color)}>
                  ● {s.status}
                </span>
              </div>
              <p className="text-[8px] text-muted-foreground leading-normal font-medium">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default MultiStageAttackFlow;
