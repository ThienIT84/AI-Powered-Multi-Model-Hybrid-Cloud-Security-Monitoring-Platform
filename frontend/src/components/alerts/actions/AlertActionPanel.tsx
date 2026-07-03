import React, { useState } from "react";
import { Alert } from "../../../types";
import { MOCK_PLAYBOOKS } from "../alertsConfig";
import { cn } from "../../../lib/utils";
import { PlaybookTriggerButton } from "./PlaybookTriggerButton";
import { Radio, ShieldAlert, KeyRound, Hammer, HelpCircle, ServerCrash } from "lucide-react";
import {
  AlertActionState,
  createCaseFromAlert,
  markFalsePositive,
  updateAlertStatus,
} from "../../../services/alerts.service";
import { AlertStatus } from "../../../types";
import { useAuth } from "../../../hooks/useAuth";
import { canPerform, permissionTitle } from "../../../lib/permissions";

interface AlertActionPanelProps {
  alert: Alert;
  onUpdateAlert?: (alertId: string, updates: Partial<Alert>, persist?: () => Promise<unknown>) => Promise<void> | void;
}

export function AlertActionPanel({ alert, onUpdateAlert }: AlertActionPanelProps) {
  const { user } = useAuth();
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>(MOCK_PLAYBOOKS[0].id);
  const [ipBlocked, setIpBlocked] = useState<boolean>(false);
  const [hostIsolated, setHostIsolated] = useState<boolean>(false);
  const [actionState, setActionState] = useState<AlertActionState>("idle");
  const [actionMessage, setActionMessage] = useState<string>("");

  const activePlaybook = MOCK_PLAYBOOKS.find(p => p.id === selectedPlaybookId) || MOCK_PLAYBOOKS[0];
  const canTriage = canPerform(user?.role, "alert:triage");
  const canCreateCase = canPerform(user?.role, "alert:create_case");
  const canRespond = canPerform(user?.role, "alert:response");

  const runAction = async (
    label: string,
    action: () => Promise<unknown>,
    optimistic?: () => void,
    rollback?: () => void,
    alertUpdate?: Partial<Alert>
  ) => {
    setActionState("pending");
    setActionMessage(`${label}: Pending`);
    optimistic?.();
    try {
      if (alertUpdate && onUpdateAlert) {
        await onUpdateAlert(alert.id, alertUpdate, action);
      } else {
        await action();
      }
      setActionState("success");
      setActionMessage(`${label}: Success`);
    } catch (err) {
      rollback?.();
      setActionState("failed");
      setActionMessage(`${label}: Failed`);
    }
  };

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

      {actionMessage && (
        <div className={cn(
          "border rounded-lg px-3 py-2 text-[8px] font-black uppercase tracking-widest",
          actionState === "pending" && "bg-amber-500/10 border-amber-500/20 text-amber-500",
          actionState === "success" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
          actionState === "failed" && "bg-red-500/10 border-red-500/20 text-red-500"
        )}>
          {actionMessage}
        </div>
      )}

      <div className="bg-background/40 border border-border/70 rounded-xl p-3.5 space-y-4 select-none">
        {/* Dynamic actions list (Quarantine, Block IP, Create Incident) */}
        <div className="flex flex-wrap items-center gap-2 select-none">
          <button
            onClick={() => {
              if (!canRespond) return;
              const previous = ipBlocked;
              runAction(
                "Block sender IP",
                () => updateAlertStatus(alert.id, AlertStatus.BLOCKING),
                () => setIpBlocked(!previous),
                () => setIpBlocked(previous),
                { status: AlertStatus.BLOCKING }
              );
            }}
            disabled={!canRespond}
            title={permissionTitle(canRespond)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-wider cursor-pointer leading-none",
              ipBlocked
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500 hover:bg-emerald-500/20"
                : "bg-red-500/10 border-red-500/25 text-red-500 hover:bg-red-500/20",
              !canRespond && "opacity-40 cursor-not-allowed"
            )}
          >
            <ShieldAlert size={10} />
            {ipBlocked ? "IP Address Blocked!" : "Block Sender IP"}
          </button>

          <button
            onClick={() => {
              if (!canRespond) return;
              const previous = hostIsolated;
              runAction(
                "Quarantine host",
                () => updateAlertStatus(alert.id, AlertStatus.MONITORING),
                () => setHostIsolated(!previous),
                () => setHostIsolated(previous),
                { status: AlertStatus.MONITORING }
              );
            }}
            disabled={!canRespond}
            title={permissionTitle(canRespond)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-wider cursor-pointer leading-none",
              hostIsolated
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500 hover:bg-emerald-500/20"
                : "bg-orange-500/10 border-orange-500/25 text-orange-500 hover:bg-orange-500/20",
              !canRespond && "opacity-40 cursor-not-allowed"
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

          <div className="flex flex-wrap gap-2">
            <button
              disabled={!canCreateCase}
              title={permissionTitle(canCreateCase)}
              onClick={() => runAction(
                "Create case",
                () => createCaseFromAlert(alert.id),
                undefined,
                undefined,
                { status: AlertStatus.ESCALATED }
              )}
              className={cn(
                "px-3 py-1.5 rounded-lg border border-cyan-500/25 text-cyan-500 bg-cyan-500/10 text-[8px] font-black uppercase tracking-wider",
                !canCreateCase && "opacity-40 cursor-not-allowed"
              )}
            >
              Create Case
            </button>
            <button
              disabled={!canTriage}
              title={permissionTitle(canTriage)}
              onClick={() => runAction(
                "False positive",
                () => markFalsePositive(alert.id),
                undefined,
                undefined,
                { status: AlertStatus.FALSE_POSITIVE }
              )}
              className={cn(
                "px-3 py-1.5 rounded-lg border border-muted text-muted-foreground bg-secondary/30 text-[8px] font-black uppercase tracking-wider",
                !canTriage && "opacity-40 cursor-not-allowed"
              )}
            >
              Mark False Positive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AlertActionPanel;
