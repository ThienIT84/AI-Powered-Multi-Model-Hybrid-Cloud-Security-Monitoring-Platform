import React, { useState, useEffect } from "react";
import { Playbook, PlaybookAction } from "./playbooksConfig";
import { 
  X, 
  Settings, 
  Zap, 
  GitCommit, 
  GitPullRequest, 
  Plus, 
  Trash2, 
  MessageSquare, // Slack
  Ticket,        // Jira
  ShieldAlert,   // Firewall
  UserX,         // AWS IAM
  ServerCrash,   // Isolate
  Webhook,       // Webhook
  Mail,          // Email
  Play,
  CheckCircle,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PlaybookModalProps {
  playbook: Playbook | null; // null means Create mode
  isOpen: boolean;
  onClose: () => void;
  onSave: (playbook: Playbook) => void;
}

export function PlaybookModal({ playbook, isOpen, onClose, onSave }: PlaybookModalProps) {
  // Form States
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState<"automated" | "manual">("automated");
  const [triggerCondition, setTriggerCondition] = useState("");
  const [severity, setSeverity] = useState<"critical" | "high" | "medium" | "low">("high");
  const [actions, setActions] = useState<PlaybookAction[]>([]);

  // Update form inputs when playbook changes
  useEffect(() => {
    if (playbook) {
      setName(playbook.name);
      setDescription(playbook.description);
      setTriggerType(playbook.triggerType);
      setTriggerCondition(playbook.triggerCondition);
      setSeverity(playbook.severity);
      setActions([...playbook.actions].sort((a, b) => a.step - b.step));
    } else {
      // Create mode defaults
      setName("");
      setDescription("");
      setTriggerType("automated");
      setTriggerCondition("IF: Risk Score > 75");
      setSeverity("high");
      setActions([
        {
          id: "act-1",
          step: 1,
          name: "Slack Critical Notification Dispatcher",
          description: "Send urgent encrypted payload notifications directly to Slack channel #critical-alerts",
          type: "slack",
          status: "idle"
        },
        {
          id: "act-2",
          step: 2,
          name: "AWS IAM Secret Key Access Revoker",
          description: "Revoke temporal AWS tokens and block suspected IAM user session access",
          type: "aws_iam",
          status: "idle"
        }
      ]);
    }
  }, [playbook, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return;

    const savedPlaybook: Playbook = {
      id: playbook?.id || `pb-${Date.now()}`,
      name,
      description,
      status: playbook?.status || "active",
      triggerType,
      triggerCondition,
      executions: playbook?.executions || 0,
      updatedAt: "Just now",
      severity,
      actions: actions.map((act, idx) => ({ ...act, step: idx + 1 })),
    };
    onSave(savedPlaybook);
  };

  const addActionStep = () => {
    const newStep: PlaybookAction = {
      id: `act-${Date.now()}`,
      step: actions.length + 1,
      name: "New Automatic Response Step",
      description: "Enter specific containment action description...",
      type: "webhook",
      status: "idle"
    };
    setActions([...actions, newStep]);
  };

  const updateActionStep = (id: string, updatedFields: Partial<PlaybookAction>) => {
    setActions(actions.map(act => act.id === id ? { ...act, ...updatedFields } as PlaybookAction : act));
  };

  const removeActionStep = (id: string) => {
    const updated = actions.filter(act => act.id !== id);
    // Recalculate step orders
    setActions(updated.map((act, idx) => ({ ...act, step: idx + 1 })));
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "slack":
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case "jira":
        return <Ticket className="w-4 h-4 text-blue-400" />;
      case "firewall":
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case "aws_iam":
        return <UserX className="w-4 h-4 text-amber-500" />;
      case "isolate":
        return <ServerCrash className="w-4 h-4 text-purple-400" />;
      case "webhook":
        return <Webhook className="w-4 h-4 text-cyan-400" />;
      default:
        return <Mail className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden max-h-[85vh] flex flex-col shadow-2xl relative"
      >
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition duration-200"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Info Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3 bg-slate-900/40">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-black text-cyan-400 tracking-[0.25em] uppercase">
              {playbook ? "PLAYBOOK CONFIGURATION ENGINE" : "NEW INCIDENT RECOVERY PLAYBOOK"}
            </span>
            <h2 className="text-md font-black text-white uppercase tracking-wider font-mono">
              {playbook ? "SOAR Playbook Configuration" : "Create New Automated Response Playbook"}
            </h2>
          </div>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* Section 1: General Specs */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
              Mandatory: Playbook Specifications & Severity
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider font-mono">
                  Playbook Name (SOAR Title)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Auto-Isolate Web Exploit Source"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-0 uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider font-mono">
                    Trigger Type
                  </label>
                  <select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-bold focus:outline-none focus:border-cyan-500"
                  >
                    <option value="automated">AUTOMATED</option>
                    <option value="manual">MANUAL ONLY</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider font-mono">
                    Priority
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-bold focus:outline-none focus:border-cyan-500"
                  >
                    <option value="critical" className="text-red-500 font-bold">CRITICAL</option>
                    <option value="high" className="text-orange-500 font-bold">HIGH</option>
                    <option value="medium" className="text-yellow-500 font-bold">MEDIUM</option>
                    <option value="low" className="text-cyan-500 font-bold">LOW</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider font-mono">
                Containment actions workflow description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Upon detecting risk-based critical threats, this playbook restricts AWS resources and deploys immediate rules..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-0"
              />
            </div>
          </div>

          {/* Section 2: Triggers Config with neon border */}
          <div className="space-y-3.5">
            <h3 className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
              Trigger criteria (Conditions)
            </h3>

            <div className="border border-dashed border-cyan-500/35 bg-cyan-500/5 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-[10px] font-black font-mono text-cyan-400 uppercase tracking-widest">
                  IF PRECONDITION DETECTED:
                </span>
              </div>
              <input
                type="text"
                value={triggerCondition}
                onChange={(e) => setTriggerCondition(e.target.value)}
                placeholder="e.g., IF: Risk Score > 80 && detectedBy includes AI Engine"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 uppercase tracking-wider"
              />
            </div>
          </div>

          {/* Section 3: Actions Timeline list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest">
                Automated Actions Timeline (Orchestration Steps)
              </h3>
              <button
                type="button"
                onClick={addActionStep}
                className="flex items-center gap-1 px-2 py-1 bg-slate-800 border border-slate-700/60 hover:bg-slate-700 text-cyan-400 rounded text-[9px] font-black uppercase tracking-wider transition duration-200"
              >
                <Plus className="w-3 h-3" />
                <span>Add Step</span>
              </button>
            </div>

            {actions.length === 0 ? (
              <p className="text-[10px] text-slate-500 text-center py-4 uppercase font-bold tracking-wider">
                No active actions defined. Press "Add Step" to configure workflow.
              </p>
            ) : (
              <div className="relative pl-6 space-y-4">
                {/* Vertical line connection */}
                <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-slate-800 border-l border-dashed border-slate-700/80" />

                {actions.map((act, idy) => (
                  <div key={act.id} className="relative flex items-start gap-4 group">
                    {/* Step circle marker */}
                    <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-[9px] font-black text-slate-400 shrink-0 select-none">
                      {act.step}
                    </div>

                    {/* Action form fields container */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex-1 space-y-3 shadow-md hover:border-slate-750 transition-colors">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        {/* Selector of Type */}
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-md shrink-0">
                            {getActionIcon(act.type)}
                          </div>
                          <select
                            value={act.type}
                            onChange={(e) => updateActionStep(act.id, { type: e.target.value as any })}
                            className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-wider text-slate-300 cursor-pointer focus:ring-0 select-none pb-0.5"
                          >
                            <option value="slack" className="bg-slate-950 text-slate-400">SLACK COMMUNICATION ALERT</option>
                            <option value="jira" className="bg-slate-950 text-slate-400">JIRA AUTO TICKET CREATION</option>
                            <option value="firewall" className="bg-slate-950 text-slate-400">PFSENSE FIREWALL BLOCK IP</option>
                            <option value="aws_iam" className="bg-slate-950 text-slate-400">AWS IAM ACCESS REVOCATION</option>
                            <option value="isolate" className="bg-slate-950 text-slate-400">VM COLD ISOLATION SHELL</option>
                            <option value="webhook" className="bg-slate-950 text-slate-400">JSON WEBHOOK DISPATCH</option>
                          </select>
                        </div>

                        {/* Remove Step action */}
                        <button
                          type="button"
                          onClick={() => removeActionStep(act.id)}
                          className="text-slate-500 hover:text-red-400 p-1.5 bg-slate-900/60 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Custom input fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-1">
                        <input
                          type="text"
                          value={act.name}
                          onChange={(e) => updateActionStep(act.id, { name: e.target.value })}
                          placeholder="Action name..."
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-[10px] text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500 uppercase tracking-widest font-mono font-bold"
                        />
                        <input
                          type="text"
                          value={act.description}
                          onChange={(e) => updateActionStep(act.id, { description: e.target.value })}
                          placeholder="Containment step instruction description..."
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-[10px] text-slate-300 placeholder-slate-650 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <span className="text-[9px] font-mono text-slate-500 uppercase">
            Double Check Actions before compiling
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-450 rounded-lg text-[10px] font-black uppercase tracking-widest transition"
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 border border-cyan-500/25 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-cyan-500/5 transition active:scale-95"
            >
              {playbook ? "UPDATE PLAYBOOK" : "CREATE PLAYBOOK"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
