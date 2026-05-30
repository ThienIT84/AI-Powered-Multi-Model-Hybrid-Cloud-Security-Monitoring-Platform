import React, { useState } from "react";
import { Alert } from "../../../types";
import { MOCK_PLAYBOOKS } from "../alertsConfig";
import { cn } from "../../../lib/utils";
import { PlaybookTriggerButton } from "./PlaybookTriggerButton";
import { Radio, ShieldAlert, KeyRound, Hammer, HelpCircle, ServerCrash } from "lucide-react";

interface AlertActionPanelProps {
  alert: Alert;
}

export function AlertActionPanel({ alert }: AlertActionPanelProps) {
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>(MOCK_PLAYBOOKS[0].id);
  const [ipBlocked, setIpBlocked] = useState<boolean>(false);
  const [hostIsolated, setHostIsolated] = useState<boolean>(false);

  const activePlaybook = MOCK_PLAYBOOKS.find(p => p.id === selectedPlaybookId) || MOCK_PLAYBOOKS[0];

  return (
    <div className="space-y-4 select-none leading-none">
      <div className="flex items-center justify-between select-none">
        <div>
          <span className="text-[8px] text-muted-foreground uppercase tracking-widest block font-black">
            SOAR PLAYBOOK ORCHESTRATION
          </span>
          <span className="text-[9.5px] font-black text-cyan-500 uppercase tracking-wider block mt-0.5">
            Active security response playbooks
          </span>
        </div>
        <Hammer size={13} className="text-cyan-500 animate-pulse" />
      </div>

      <div className="bg-background/40 border border-border/70 rounded-xl p-3.5 space-y-4 select-none">
        {/* Dynamic actions list (Quarantine, Block IP, Create Incident) */}
        <div className="flex flex-wrap items-center gap-2 select-none">
          <button
            onClick={() => setIpBlocked(prev => !prev)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-wider cursor-pointer leading-none",
              ipBlocked
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500 hover:bg-emerald-500/20"
                : "bg-red-500/10 border-red-500/25 text-red-500 hover:bg-red-500/20"
            )}
          >
            <ShieldAlert size={10} />
            {ipBlocked ? "IP Address Blocked!" : "Block Sender IP"}
          </button>

          <button
            onClick={() => setHostIsolated(prev => !prev)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-wider cursor-pointer leading-none",
              hostIsolated
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500 hover:bg-emerald-500/20"
                : "bg-orange-500/10 border-orange-500/25 text-orange-500 hover:bg-orange-500/20"
            )}
          >
            <ServerCrash size={10} />
            {hostIsolated ? "Host Quarantined!" : "Quarantine Host"}
          </button>
        </div>

        {/* Playbook selector dropdown */}
        <div className="space-y-3 pt-3 border-t border-border/40 select-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[8px] font-extrabold text-muted-foreground uppercase">SELECT ACTIVE PLAYBOOK:</span>
            <select
              value={selectedPlaybookId}
              onChange={(e) => setSelectedPlaybookId(e.target.value)}
              className="bg-muted px-2 py-1 rounded border border-border text-[9.5px] font-black uppercase text-foreground cursor-pointer focus:outline-none focus:border-cyan-500/40"
            >
              {MOCK_PLAYBOOKS.map(pb => (
                <option key={pb.id} value={pb.id}>{pb.id.toUpperCase()}: {pb.name}</option>
              ))}
            </select>
          </div>

          <div className="p-2.5 bg-secondary/10 border border-border/70 rounded-lg space-y-1.5">
            <span className="text-[7.5px] text-cyan-400 uppercase tracking-widest block font-black">
              PLAYBOOK OPERATIONS PROFILE:
            </span>
            <p className="text-[8px] text-muted-foreground font-semibold leading-normal">
              {activePlaybook.desc}. Automated workflow routes through cloud API scopes directly.
            </p>
          </div>

          {/* Dedicated dispatch execution trigger */}
          <div className="flex justify-start">
            <PlaybookTriggerButton playbookName="Run Playbook Engine" />
          </div>
        </div>
      </div>
    </div>
  );
}
export default AlertActionPanel;
