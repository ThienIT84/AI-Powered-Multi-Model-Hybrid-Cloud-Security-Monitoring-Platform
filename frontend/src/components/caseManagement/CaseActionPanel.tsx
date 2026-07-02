import React, { useState } from "react";
import { Case, CaseStatus, CaseSeverity } from "./caseTypes";
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Send, 
  AlertTriangle, 
  MessageSquare,
  UserCheck,
  Award
} from "lucide-react";
import { cn } from "../../lib/utils";

interface CaseActionPanelProps {
  activeCase: Case | null;
  onUpdateCase: (caseId: string, updates: Partial<Case>) => void;
}

export function CaseActionPanel({ activeCase, onUpdateCase }: CaseActionPanelProps) {
  const [commentInput, setCommentInput] = useState("");

  if (!activeCase) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center h-155 select-none">
        <ShieldCheck size={44} className="text-muted-foreground/20 mb-3" />
        <h4 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">
          NO CASE SELECTION
        </h4>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1.5 max-w-xs leading-relaxed font-mono">
          Interactive firewall overrides, diagnostic annotations, and status escalations are gated until a ticket is chosen from the queue.
        </p>
      </div>
    );
  }

  const handleStatusChange = (status: CaseStatus) => {
    const nowStr = new Date().toISOString();
    const eventText = `Status switched to [${status}] in SOC workstation.`;
    
    onUpdateCase(activeCase.id, {
      status,
      timeline: {
        events: [...activeCase.timeline.events, `${nowStr} - ${eventText}`]
      }
    });
  };

  const handleAssignToAnalyst = (analystName: string) => {
    const nowStr = new Date().toISOString();
    const eventText = `Incident delegated to analyst: ${analystName}.`;

    onUpdateCase(activeCase.id, {
      assignedTo: analystName,
      status: "In Progress",
      timeline: {
        events: [...activeCase.timeline.events, `${nowStr} - ${eventText}`]
      }
    });
  };

  const handleToggleBlockIp = () => {
    const nowStr = new Date().toISOString();
    const nextBlockState = !activeCase.isIpBlocked;
    const eventText = nextBlockState
      ? `Simulated firewall block rule issued globally for attacker source IP ${activeCase.source_ip}.`
      : `Simulated firewall block rule lifted for attacker source IP ${activeCase.source_ip}.`;

    onUpdateCase(activeCase.id, {
      isIpBlocked: nextBlockState,
      timeline: {
        events: [...activeCase.timeline.events, `${nowStr} - ${eventText}`]
      }
    });
  };

  const handleMarkFalsePositive = () => {
    const nowStr = new Date().toISOString();
    const eventText = "Marked as FALSE_POSITIVE during forensic review. Status closed.";

    onUpdateCase(activeCase.id, {
      status: "Resolved",
      notes: activeCase.notes 
        ? `${activeCase.notes}\n\n[Dismissed] Marked as a false positive during audit.`
        : "[Dismissed] Marked as a false positive during audit.",
      timeline: {
        events: [...activeCase.timeline.events, `${nowStr} - ${eventText}`]
      }
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const nowStr = new Date().toISOString();
    const newComment = {
      id: `comm-${Date.now()}`,
      author: "Analyst",
      timestamp: nowStr,
      text: commentInput.trim()
    };

    const currentComments = activeCase.comments || [];
    const eventText = `Analyst logged remark: "${commentInput.trim()}"`;

    onUpdateCase(activeCase.id, {
      comments: [...currentComments, newComment],
      timeline: {
        events: [...activeCase.timeline.events, `${nowStr} - ${eventText}`]
      }
    });

    setCommentInput("");
  };

  return (
    <div className="space-y-4 select-none animate-fade-in w-full pb-6">
      {/* 1. STATUS CONTROL */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
        <h4 className="text-[9px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-1.5 border-b border-border/40 pb-2">
          <ShieldCheck size={12} className="text-cyan-500" />
          INCIDENT STATUS CONTROL
        </h4>

        <div className="grid grid-cols-2 gap-2">
          {(["Open", "In Progress", "Resolved", "Pending Review"] as CaseStatus[]).map((status) => {
            const isActive = activeCase.status === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusChange(status)}
                className={cn(
                  "px-2.5 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg border transition-all cursor-pointer text-center",
                  isActive
                    ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400 font-extrabold"
                    : "border-border bg-muted/40 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. RESPONSE PLAYBOOKS */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3.5">
        <h4 className="text-[9px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-1.5 border-b border-border/40 pb-2">
          <AlertTriangle size={12} className="text-cyan-500" />
          RESPONSE PLAYBOOKS
        </h4>

        <div className="space-y-3">
          {/* Firewall simulation */}
          <button
            type="button"
            onClick={handleToggleBlockIp}
            className={cn(
              "w-full py-2.5 text-[8.5px] font-black uppercase tracking-widest rounded-lg border flex items-center justify-center gap-2 transition-all cursor-pointer leading-none",
              activeCase.isIpBlocked
                ? "bg-red-500/10 hover:bg-red-500/15 border-red-500/25 text-red-500"
                : "bg-cyan-600 hover:bg-cyan-500 border-transparent text-white shadow-sm"
            )}
          >
            {activeCase.isIpBlocked ? (
              <>
                <Unlock size={11} />
                LIFT IP FIREWALL BLOCK
              </>
            ) : (
              <>
                <Lock size={11} />
                BLOCK SOURCE HOST IP ({activeCase.source_ip})
              </>
            )}
          </button>

          {/* Analyst assignment list */}
          <div className="space-y-1 pt-1 border-t border-border/20">
            <span className="text-[6.5px] font-black font-mono text-muted-foreground uppercase tracking-widest block mb-1">
              ASSIGN TO ANALYST WORKPLACE
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {["Sarah Smith", "John Doe", "Emily Wilson", "David Lee"].map((n) => {
                const assigned = activeCase.assignedTo === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleAssignToAnalyst(n)}
                    className={cn(
                      "px-2 py-1.5 text-[7.5px] font-bold uppercase tracking-wider rounded border transition-all cursor-pointer text-left truncate leading-none",
                      assigned
                        ? "bg-amber-500/10 border-amber-500/25 text-amber-500"
                        : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {assigned ? `Assigned: ${n.split(" ")[0]}` : n}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mark False Positive action */}
          <button
            type="button"
            onClick={handleMarkFalsePositive}
            className="w-full py-2 bg-secondary border border-border text-foreground hover:bg-muted font-black uppercase text-[8.5px] tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer leading-none mt-1"
          >
            Dismiss / False Positive
          </button>
        </div>
      </div>

      {/* 3. CASE CONTEXTUAL COMMENT STREAM */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3.5">
        <h4 className="text-[9px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-1.5 border-b border-border/40 pb-2">
          <MessageSquare size={12} className="text-cyan-500" />
          ANALYST DIALOG FEED
        </h4>

        <div className="space-y-2 max-h-35 overflow-y-auto custom-scrollbar select-text">
          {(!activeCase.comments || activeCase.comments.length === 0) ? (
            <div className="py-5 text-center text-[7.5px] font-mono text-muted-foreground/60 uppercase tracking-widest">
              Zero analyst comments posted on trail
            </div>
          ) : (
            <div className="space-y-2">
              {activeCase.comments.map((comm) => (
                <div key={comm.id} className="p-2 rounded bg-muted/50 border border-border/60 text-[8px] space-y-1">
                  <div className="flex items-center justify-between font-mono text-[6.5px] text-muted-foreground/80 leading-none">
                    <span className="font-extrabold uppercase text-[#06b6d4]">{comm.author}</span>
                    <span>{new Date(comm.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-foreground font-semibold leading-normal">
                    {comm.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleAddComment} className="flex gap-1.5 pt-1">
          <input
            type="text"
            placeholder="Add quick triage notes..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-[8px] font-medium text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:border-cyan-500/40"
          />
          <button
            type="submit"
            className="px-2.5 bg-cyan-600 hover:bg-cyan-500 transition-colors text-white text-[8px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center cursor-pointer"
          >
            <Send size={10} />
          </button>
        </form>
      </div>

      {/* 4. OPERATOR REMARKS PERSISTENCE */}
      {activeCase.notes && (
        <div className="p-3.5 bg-muted/20 border border-dashed border-border rounded-xl space-y-1 select-text">
          <span className="text-[6.5px] font-mono font-black text-muted-foreground uppercase tracking-widest block">
            HISTORIC AUDIT NOTE
          </span>
          <p className="text-[8.5px] font-mono font-medium text-foreground leading-relaxed">
            {activeCase.notes}
          </p>
        </div>
      )}
    </div>
  );
}
