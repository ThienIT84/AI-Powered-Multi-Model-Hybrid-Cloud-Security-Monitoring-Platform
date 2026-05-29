import React, { useState, useEffect, useRef } from "react";
import { Playbook, PlaybookAction } from "./playbooksConfig";
import { 
  X, 
  Settings, 
  Zap, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Ticket, 
  ShieldAlert, 
  UserX, 
  ServerCrash, 
  Webhook, 
  Mail, 
  Play, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Activity, 
  Terminal, 
  Layers, 
  TrendingUp, 
  Sliders, 
  RotateCcw,
  Code
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PlaybookModalProps {
  playbook: Playbook | null; // null means Create mode
  isOpen: boolean;
  onClose: () => void;
  onSave: (playbook: Playbook) => void;
}

export function PlaybookModal({ playbook, isOpen, onClose, onSave }: PlaybookModalProps) {
  // Tabs
  const [activeTab, setActiveTab] = useState<"visualizer" | "edit">("edit");

  // Form States
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState<"automated" | "manual">("automated");
  const [triggerCondition, setTriggerCondition] = useState("");
  const [severity, setSeverity] = useState<"critical" | "high" | "medium" | "low">("high");
  const [actions, setActions] = useState<PlaybookAction[]>([]);
  
  // Simulation States
  const [simulationActive, setSimulationActive] = useState(false);
  const [simStep, setSimStep] = useState(0); // 0: Idle, 1 to actions.length: steps, actions.length+1: Success Complete
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll for simulation terminal logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [simLogs]);

  // Update inputs on change
  useEffect(() => {
    if (playbook) {
      setName(playbook.name);
      setDescription(playbook.description);
      setTriggerType(playbook.triggerType);
      setTriggerCondition(playbook.triggerCondition);
      setSeverity(playbook.severity);
      setActions([...playbook.actions].sort((a, b) => a.step - b.step));
      setActiveTab("visualizer");
    } else {
      setName("");
      setDescription("");
      setTriggerType("automated");
      setTriggerCondition("IF: Fusion Risk Score > 82 && Threat Category === Web Attack");
      setSeverity("high");
      setActions([
        {
          id: "act-1",
          step: 1,
          name: "Slack Critical Notification Dispatcher",
          description: "Send urgent encrypted webhook payloads directly to Slack channel #soc-auto-responses",
          type: "slack",
          status: "idle",
          target: "#soc-auto-responses",
          severity: "high"
        },
        {
          id: "act-2",
          step: 2,
          name: "AWS IAM Leak Session Invalidation",
          description: "Revoke active temporal tokens on suspected compromise credential user keys",
          type: "aws_iam",
          status: "idle",
          target: "arn:aws:iam::881204:user/Compromised-Access",
          severity: "critical"
        }
      ]);
      setActiveTab("edit"); // Default to configure mode on new playbook
    }
    // Cancel simulation on playbook load
    setSimulationActive(false);
    setSimStep(0);
    setSimLogs([]);
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
      avgDurationMs: playbook?.avgDurationMs || (Math.floor(Math.random() * 80) + 70),
      confidenceThreshold: playbook?.confidenceThreshold || 92,
      riskScoreThreshold: playbook?.riskScoreThreshold || 80,
      lastExecutionStatus: playbook?.lastExecutionStatus || "success",
      lastExecutedTime: playbook?.lastExecutedTime || "Just now"
    };
    onSave(savedPlaybook);
  };

  const addActionStep = () => {
    const idSeed = Date.now();
    const newStep: PlaybookAction = {
      id: `act-${idSeed}`,
      step: actions.length + 1,
      name: "Auto-Remediation Workflow Rule Block",
      description: "Define containment response instructions here...",
      type: "webhook",
      status: "idle",
      target: "https://api.internal.sec/v1/mitigate",
      severity: "medium"
    };
    setActions([...actions, newStep]);
  };

  const updateActionStep = (id: string, updatedFields: Partial<PlaybookAction>) => {
    setActions(actions.map(act => act.id === id ? { ...act, ...updatedFields } as PlaybookAction : act));
  };

  const removeActionStep = (id: string) => {
    const updated = actions.filter(act => act.id !== id);
    setActions(updated.map((act, idx) => ({ ...act, step: idx + 1 })));
  };

  // Run the Simulation
  const startSimulation = async () => {
    if (simulationActive) return;
    setSimulationActive(true);
    setSimStep(1);
    setSimLogs([
      `[2026-05-22 04:52:10] INITIALIZING SOAR PIPELINE SIMULATION FOR PLAYBOOK: "${name.toUpperCase()}"`,
      `[2026-05-22 04:52:11] PRE-FLIGHT CHECKS: checking dependencies... OK`,
      `[2026-05-22 04:52:11] VALIDATING TRIGGER LOGIC RULE STATUS: `,
      `             >> rule: "${triggerCondition}"`,
      `             >> check: PASSED (Match score 96.8%)`,
      `[2026-05-22 04:52:12] PREPARING TIMELINE DISPATCH ENGINE (${actions.length} CONFIGURATED STEPS)...`
    ]);

    let stepCounter = 1;
    for (const act of actions) {
      // Simulate running
      setSimStep(stepCounter);
      setSimLogs(prev => [
        ...prev,
        `[2026-05-22 04:52:13] dispatching action step ${stepCounter}: [${act.type.toUpperCase()}] "${act.name.toUpperCase()}"`,
        `             >> targeting component endpoint: "${act.target || 'INTERNAL_RESOURCES'}"`
      ]);

      await new Promise(resolve => setTimeout(resolve, 1200));

      // Simulate completion
      setSimLogs(prev => [
        ...prev,
        `             >> completed mitigation callback check (resolved in ${Math.floor(Math.random() * 40) + 15}ms)`,
        `[SUCCESS] step ${stepCounter} finished successfully`
      ]);
      stepCounter++;
    }

    setSimStep(actions.length + 1);
    setSimLogs(prev => [
      ...prev,
      `[2026-05-22 04:52:18] ----------------------------------------------------------------------`,
      `[SUCCESS] ORCHESTRATION PIPELINE EXECUTED SUCCESSFULLY IN ALL SUB-DOMAINS.`,
      `[SYSTEM] playbooks executions count incremented. Remediated status logged inside SOC logs.`
    ]);
  };

  const cancelSimulation = () => {
    setSimulationActive(false);
    setSimStep(0);
    setSimLogs([]);
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
        return <Mail className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      {/* Cinematic Modal Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-card border border-border rounded-2xl w-full max-w-5xl overflow-hidden max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(37,99,235,0.08)] relative"
      >
        {/* Decorative subtle header line glow */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-cyan-500 to-transparent" />

        {/* Header Console Section */}
        <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/40 relative">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-455 dark:text-cyan-400 rounded-xl shadow-inner">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black text-cyan-550 dark:text-cyan-400 tracking-[0.25em] uppercase">
                  SOAR CORES ORCHESTRATION CONSOLE
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <h2 className="text-base font-mono font-black text-foreground uppercase tracking-wider leading-tight">
                {playbook ? `INSPECT: ${name || "Untitled Playbook"}` : "PROVISION NEW INCIDENT FLOW"}
              </h2>
            </div>
          </div>

          {/* Action Tabs Selector */}
          <div className="flex items-center gap-2">
            <div className="bg-muted p-1 rounded-lg border border-border flex">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono font-black uppercase tracking-widest transition duration-200 ${
                  activeTab === "edit" 
                    ? "bg-cyan-500/10 text-cyan-550 dark:text-cyan-400 border border-cyan-500/20 shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Blueprint Variables</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("visualizer")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono font-black uppercase tracking-widest transition duration-200 ${
                  activeTab === "visualizer" 
                    ? "bg-cyan-500/10 text-cyan-550 dark:text-cyan-400 border border-cyan-500/20 shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Workflow Pipeline</span>
              </button>
            </div>

            {/* Standard Close button */}
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground bg-muted border border-border hover:border-foreground/15 rounded-lg transition duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Dynamic Body panes */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <AnimatePresence mode="wait">
            {activeTab === "visualizer" ? (
              <motion.div
                key="visualizer-pane"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* Left Side: Pipeline Workflow Map */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-[11px] font-mono font-extrabold text-cyan-555 dark:text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5" />
                      Visual Execution Blueprint Pipeline
                    </h3>
                    <p className="text-[10px] text-muted-foreground uppercase leading-normal">
                      Sơ đồ này biểu diễn trình tự các hành động giảm thiểu rủi ro tự động khi phát hiện mối đe dọa.
                    </p>
                  </div>

                  {/* IF Rule Condition Block (TRIGGER ENGINE EXPERIENCE) */}
                  <div className="border border-dashed border-amber-500/35 bg-amber-500/2 rounded-xl p-4 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-amber-500/10 px-2 py-0.5 text-[8px] font-mono text-amber-550 dark:text-amber-400 uppercase tracking-widest rounded-bl border-l border-b border-amber-500/20">
                      Rule Evaluation
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-550 dark:text-amber-400 animate-pulse" />
                      <span className="text-[10px] font-black font-mono text-amber-550 dark:text-amber-400 uppercase tracking-widest select-none">
                        IF ENGINE TRIGGER MATCHES:
                      </span>
                    </div>

                    <p className="text-xs font-mono font-black text-amber-600 dark:text-amber-300 uppercase tracking-wide bg-amber-500/5 p-3 rounded-lg border border-amber-500/10 leading-relaxed">
                      {triggerCondition || "NO PRECONDITION LOGGED"}
                    </p>

                    <div className="flex gap-2">
                      <span className="text-[8px] font-mono text-muted-foreground">Confidence Match: <strong>&gt;92%</strong></span>
                      <span className="text-muted-foreground/30 text-[8px]">•</span>
                      <span className="text-[8px] font-mono text-muted-foreground">Auto-Remediate Action: <strong>Enabled</strong></span>
                    </div>
                  </div>

                  {/* Actions Timeline Flow */}
                  <div className="relative pl-8 space-y-6 mt-4">
                    {/* Glowing vertical connector line */}
                    <div className="absolute left-3.25 top-4 bottom-5 w-0.5 bg-linear-to-b from-cyan-500 via-blue-500/80 to-indigo-500/50" />

                    {actions.map((act, idy) => {
                      const isSimActiveNow = simulationActive && simStep === (idy + 1);
                      const isSimCompleted = simulationActive && simStep > (idy + 1);
                      const isSimIdle = !simulationActive || simStep < (idy + 1);

                      return (
                        <div key={act.id} className="relative group">
                          {/* Circle step metadata indicator */}
                          <div className={`absolute -left-12 top-0.5 w-8 h-8 rounded-full bg-background border flex items-center justify-center font-mono text-[10px] font-black z-10 transition-all duration-300 ${
                            isSimActiveNow 
                              ? "border-amber-400 text-amber-455 dark:text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)] animate-pulse scale-105" 
                              : isSimCompleted
                              ? "border-emerald-500 text-emerald-500 bg-emerald-500/5 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                              : "border-border text-muted-foreground group-hover:border-foreground/20"
                          }`}>
                            {isSimCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> : `S${act.step}`}
                          </div>

                          {/* Outer card shell */}
                          <div className={`bg-muted/45 hover:bg-muted/70 border rounded-xl p-4 transition-all duration-200 relative overflow-hidden ${
                            isSimActiveNow 
                              ? "border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.06)] bg-muted" 
                              : "border-border/60"
                          }`}>
                            {/* Visual background gradient if step is active */}
                            {isSimActiveNow && (
                              <div className="absolute inset-0 bg-amber-500/1.5 pointer-events-none" />
                            )}

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/10 pb-2 mb-2">
                              {/* Metadata block */}
                              <div className="flex items-center gap-2">
                                <span className="p-1.5 bg-background border border-border rounded-lg text-cyan-550 dark:text-cyan-400 shrink-0 select-none">
                                  {getActionIcon(act.type)}
                                </span>
                                <div>
                                  <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest block font-bold leading-none mb-1">
                                    STEP ORDER #{act.step} / TYPE: {act.type.toUpperCase()}
                                  </span>
                                  <h4 className="text-xs font-mono font-bold uppercase text-foreground tracking-widest leading-none">
                                    {act.name}
                                  </h4>
                                </div>
                              </div>

                              {/* Target endpoint banner info */}
                              {act.target && (
                                <span className="text-[8.5px] font-mono text-muted-foreground bg-background border border-border px-2 py-0.5 rounded tracking-wide">
                                  Target: {act.target}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-muted-foreground leading-normal">
                              {act.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Interactive Simulation Terminal console logs (EXECUTION & AUTOMATION FEEDBACK) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-[11px] font-mono font-extrabold text-indigo-550 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5" />
                      SOC Remediations Sandbox Runtime
                    </h3>
                    <p className="text-[10px] text-muted-foreground uppercase leading-normal">
                      Bấm "Simulate" để kiểm tra tính toàn vẹn và lập trình của kịch bản an ninh mạng.
                    </p>
                  </div>

                         <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col h-100 shadow-2xl relative">
                    {/* Header bar of terminal */}
                    <div className="bg-muted p-3 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                        <span className="text-[8px] font-mono font-semibold text-muted-foreground uppercase tracking-widest ml-1 bg-background px-2 rounded">
                          soar-sim-node-v1: active
                        </span>
                      </div>

                      {/* Status indicator pill */}
                      {simulationActive && (
                        <span className="flex items-center gap-1 text-[8px] font-mono text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-ping" />
                          RUNNING
                        </span>
                      )}
                    </div>

                    {/* Console Output Screen */}
                    <div className="flex-1 p-4 overflow-y-auto font-mono text-[9px] text-zinc-400 uppercase space-y-2.5 custom-scrollbar bg-neutral-950">
                      {simLogs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 uppercase p-4 space-y-3">
                          <Code className="w-6 h-6 text-zinc-700 animate-pulse" />
                          <p className="text-[8.5px] font-bold text-zinc-500 tracking-wider">
                            CONSOLE IDLE // READY FOR DISPATCH SIMULATOR
                          </p>
                        </div>
                      ) : (
                        simLogs.map((log, index) => {
                          let colorStyle = "text-zinc-400";
                          if (log.startsWith("[SUCCESS]")) {
                            colorStyle = "text-emerald-400 font-bold bg-emerald-950/20 px-1 rounded";
                          } else if (log.startsWith("[2026-")) {
                            colorStyle = "text-cyan-400";
                          } else if (log.includes(">>")) {
                            colorStyle = "text-amber-300";
                          }

                          return (
                            <div key={index} className={`leading-relaxed break-all ${colorStyle}`}>
                                {log}
                            </div>
                          );
                        })
                      )}
                      <div ref={logsEndRef} />
                    </div>

                    {/* Simulation footer action keys */}
                    <div className="p-3 bg-card border-t border-border flex justify-between gap-3">
                      {simulationActive ? (
                        <button
                          onClick={cancelSimulation}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded text-[9px] font-mono font-black uppercase tracking-wider transition border border-border"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Stop Simulation</span>
                        </button>
                      ) : (
                        <button
                          onClick={startSimulation}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-[9px] font-mono font-black uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] active:scale-95 border border-cyan-400/25"
                        >
                          <Play className="w-3.5 h-3.5 text-white" />
                          <span>Test Remediation Sim Run</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="edit-pane"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Specs block form */}
                <div className="bg-card border border-border p-5 rounded-xl space-y-4">
                  <h3 className="text-[10px] font-black font-mono text-cyan-405 dark:text-cyan-400 uppercase tracking-widest border-b border-border pb-2 flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5" />
                    Playbook Parameters Spec
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-wider font-mono">
                        SOAR Title Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Auto-Isolate Web Exploit Source"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder-muted-foreground/45 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-wider font-mono">
                          Trigger Mode
                        </label>
                        <select
                          value={triggerType}
                          onChange={(e) => setTriggerType(e.target.value as any)}
                          className="w-full bg-background border border-border rounded-lg px-3 py-1.75 text-xs text-foreground font-mono font-bold focus:outline-none focus:border-cyan-500"
                        >
                          <option value="automated" className="bg-card text-foreground">AUTOMATED</option>
                          <option value="manual" className="bg-card text-foreground">MANUAL ONLY</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-wider font-mono">
                          Priority Risk Level
                        </label>
                        <select
                          value={severity}
                          onChange={(e) => setSeverity(e.target.value as any)}
                          className="w-full bg-background border border-border rounded-lg px-3 py-1.75 text-xs text-foreground font-mono font-bold focus:outline-none focus:border-cyan-500"
                        >
                          <option value="critical" className="text-red-500 font-bold bg-card">CRITICAL</option>
                          <option value="high" className="text-orange-500 font-bold bg-card">HIGH</option>
                          <option value="medium" className="text-yellow-650 dark:text-yellow-500 font-bold bg-card">MEDIUM</option>
                          <option value="low" className="text-cyan-600 dark:text-cyan-500 font-bold bg-card">LOW</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-wider font-mono">
                      Mitigation strategy and response checklist description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Upon detecting risk-based critical threats, this playbook restricts AWS resources and deploys immediate rules..."
                      rows={2}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder-muted-foreground/45 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Edit Rule IF Condition */}
                <div className="bg-card border border-border p-5 rounded-xl space-y-4">
                  <h3 className="text-[10px] font-black font-mono text-amber-550 dark:text-amber-400 uppercase tracking-widest border-b border-border pb-2 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" />
                    Modify Rule Engine Evaluators
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded leading-none">IF TRIGGER:</span>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">Detection and Correlation matching parameters</span>
                    </div>
                    <input
                      type="text"
                      value={triggerCondition}
                      onChange={(e) => setTriggerCondition(e.target.value)}
                      placeholder="e.g., IF: AI Anomaly Score of Zeek records > 0.88"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono font-bold text-amber-600 dark:text-amber-300 placeholder-muted-foreground/30 focus:outline-none focus:border-cyan-500 uppercase tracking-wider"
                    />
                  </div>
                </div>

                {/* Edit actions table list */}
                <div className="bg-card border border-border p-5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h3 className="text-[10px] font-black font-mono text-indigo-550 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5" />
                      Configure Mitigation Actions Mapping
                    </h3>
                    <button
                      type="button"
                      onClick={addActionStep}
                      className="flex items-center gap-1.5 px-3 py-1 bg-muted border border-border hover:border-foreground/15 text-cyan-555 dark:text-cyan-400 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider transition duration-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Append New Step</span>
                    </button>
                  </div>

                  {actions.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground text-center py-4 uppercase font-bold tracking-wider font-mono">
                      No mitigation actions programmed yet. Click "Append New Step" to add one.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {actions.map((act, idy) => (
                        <div key={act.id} className="bg-muted/30 border border-border rounded-xl p-4 space-y-3 hover:border-foreground/10 transition">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border/15 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono font-bold bg-background text-muted-foreground px-2.5 py-0.5 rounded select-none">
                                STEP {act.step}
                              </span>
                              
                              <select
                                value={act.type}
                                onChange={(e) => updateActionStep(act.id, { type: e.target.value as any })}
                                className="bg-transparent border-none outline-none text-[9px] font-mono font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 cursor-pointer focus:ring-0 select-none pr-3"
                              >
                                <option value="slack" className="bg-card text-muted-foreground">SLACK ALERT INTEGRATION</option>
                                <option value="jira" className="bg-card text-muted-foreground">JIRA TICKET AUTOMATION</option>
                                <option value="firewall" className="bg-card text-muted-foreground">PFSENSE IP BLOCKER</option>
                                <option value="aws_iam" className="bg-card text-muted-foreground">AWS IAM DEACTIVATE</option>
                                <option value="isolate" className="bg-card text-muted-foreground">VM VPC SUB-ISOLATION</option>
                                <option value="webhook" className="bg-card text-muted-foreground">DISPATCH SECURE WEBHOOK</option>
                                <option value="email" className="bg-card text-muted-foreground">SEND SEC ALERT EMAIL</option>
                              </select>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeActionStep(act.id)}
                              className="text-muted-foreground hover:text-rose-500 p-1.5 hover:bg-rose-500/10 rounded transition shrink-0 border border-transparent hover:border-rose-500/10 inline-flex items-center gap-1 text-[8px] font-mono uppercase font-bold justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Decommission</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <span className="text-[8px] font-mono text-muted-foreground uppercase font-black">Mitigation Step Action Title</span>
                              <input
                                type="text"
                                value={act.name}
                                onChange={(e) => updateActionStep(act.id, { name: e.target.value })}
                                placeholder="e.g. AWS Temporal Access Deny"
                                className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-[10px] text-foreground placeholder-muted-foreground/35 font-mono focus:outline-none focus:border-cyan-500"
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[8px] font-mono text-muted-foreground uppercase font-semibold">Step Mitigation Description</span>
                              <input
                                type="text"
                                value={act.description}
                                onChange={(e) => updateActionStep(act.id, { description: e.target.value })}
                                placeholder="Describe what the step secures..."
                                className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-[10px] text-foreground placeholder-muted-foreground/35 focus:outline-none focus:border-cyan-500"
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[8px] font-mono text-muted-foreground uppercase font-black">Mitigation Interface Target Target ID</span>
                              <input
                                type="text"
                                value={act.target || ""}
                                onChange={(e) => updateActionStep(act.id, { target: e.target.value })}
                                placeholder="e.g. #incident-alerts, rule-91a..."
                                className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-[10px] text-foreground placeholder-muted-foreground/35 font-mono focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Standard Action Footer */}
        <div className="p-5 border-t border-border bg-card/85 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
              SecOps verification code: OK // compilation readiness active
            </span>
          </div>

          <div className="flex gap-2 justify-end">
            <button
               onClick={onClose}
               className="px-4 py-2 bg-muted hover:bg-muted/80 border border-border hover:border-foreground/15 text-muted-foreground hover:text-foreground rounded-lg text-[10px] font-mono font-black uppercase tracking-widest transition"
            >
              DISMISS
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-500/20 text-white rounded-lg text-[10px] font-mono font-black uppercase tracking-widest transition shadow-lg shadow-emerald-950/40 active:scale-95"
            >
              {playbook ? "RE-DEPLOY PLAYBOOK" : "DEPLOY NEW FLOW"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
