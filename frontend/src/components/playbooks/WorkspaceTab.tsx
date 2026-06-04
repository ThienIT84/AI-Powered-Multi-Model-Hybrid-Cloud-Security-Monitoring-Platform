import React, { useMemo } from "react";
import { 
  AlertOctagon, 
  RotateCcw, 
  Check, 
  Search, 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Terminal, 
  Layers, 
  Database, 
  Info 
} from "lucide-react";
import { MockIncident } from "./playbookMockData";

export interface WorkspaceTabProps {
  incidents: MockIncident[];
  setIncidents: React.Dispatch<React.SetStateAction<MockIncident[]>>;
  selectedIncidentId: string;
  setSelectedIncidentId: (id: string) => void;
  terminalLogs: { [incidentId: string]: string[] };
  setTerminalLogs: React.Dispatch<React.SetStateAction<{ [incidentId: string]: string[] }>>;
}

export function WorkspaceTab({
  incidents,
  setIncidents,
  selectedIncidentId,
  setSelectedIncidentId,
  terminalLogs,
  setTerminalLogs
}: WorkspaceTabProps) {
  
  // Selected incident details computed
  const activeIncident = useMemo(() => {
    return incidents.find(inc => inc.id === selectedIncidentId) || incidents[0];
  }, [incidents, selectedIncidentId]);

  const activeIncidentsCount = useMemo(() => {
    return incidents.filter(i => i.status !== "Closed" && i.status !== "Contained").length;
  }, [incidents]);

  // Simulation handler inside Workspace Simulator
  const executeSimAction = (actionType: "Investigate" | "Contain" | "Monitor" | "Escalate" | "Close") => {
    if (!activeIncident) return;
    const timestamp = new Date().toISOString().split("T")[1].slice(0, 8);
    let logLine = "";
    let nextStatus: MockIncident["status"] = activeIncident.status;

    switch (actionType) {
      case "Investigate":
        nextStatus = "Investigating";
        logLine = `[${timestamp}] [INVESTIGATION] SOC Analyst initiated core forensic diagnostics. Reviewing payload matching UID...`;
        break;
      case "Contain":
        nextStatus = "Contained";
        logLine = `[${timestamp}] [MITIGATION] Dispatched isolate request. Core pfSense alias state injected. Bad traffic severed!`;
        break;
      case "Monitor":
        nextStatus = "Monitoring";
        logLine = `[${timestamp}] [MONITORING] Enabled passive watch loop. Flow delta interval tracing activated. Host clean.`;
        break;
      case "Escalate":
        nextStatus = "Escalated";
        logLine = `[${timestamp}] [ESCALATION] Created threat file Jira task SEC-${activeIncident.id}. Elevating threat to Tier 2 squad.`;
        break;
      case "Close":
        nextStatus = "Closed";
        logLine = `[${timestamp}] [RESOLUTION] Case completed. Incident confirmed resolved under FCAJ v3.0 playbook standards. Log archived.`;
        break;
    }

    // Update Incident State
    setIncidents(prev => prev.map(inc => {
      if (inc.id === activeIncident.id) {
        return { ...inc, status: nextStatus };
      }
      return inc;
    }));

    // Append Logs
    setTerminalLogs(prev => {
      const current = prev[activeIncident.id] || [];
      return {
        ...prev,
        [activeIncident.id]: [...current, logLine]
      };
    });
  };

  // Reset simulator
  const resetIncidentSimulator = () => {
    if (!activeIncident) return;
    setIncidents(prev => prev.map(inc => {
      if (inc.id === activeIncident.id) {
        return { ...inc, status: "New Alert" };
      }
      return inc;
    }));
    const timestamp = new Date().toISOString().split("T")[1].slice(0, 8);
    setTerminalLogs(prev => ({
      ...prev,
      [activeIncident.id]: [
        `[${timestamp}] [SYS_RESET] Incident state rejuvenated. Telemetry buffers synchronized. Target active.`
      ]
    }));
  };

  if (!activeIncident) {
    return (
      <div className="p-8 text-center text-muted-foreground uppercase font-mono">
        No active incidents compiled.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="playbooks-workspace-tab">
      {/* LEFT COLUMN: ACTIVE CASE SELECTOR LIST */}
      <div className="xl:col-span-3 space-y-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
            <h3 className="text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1 text-rose-500">
              <AlertOctagon className="w-4 h-4 shrink-0" /> Open Incidents ({activeIncidentsCount})
            </h3>
            <span className="text-[8px] font-mono bg-rose-500/10 text-rose-500 border border-rose-500/20 px-1.5 py-0.5 rounded font-black">
              SIMULATOR ACTIVE
            </span>
          </div>

          <p className="text-[10px] text-muted-foreground mb-4">
            Select an active alert vector block to drive interactive FCAJ v3.0 forensic investigations and container workflows.
          </p>

          {/* INCIDENTS VERTICAL TRACK */}
          <div className="space-y-2 max-h-115 overflow-y-auto custom-scrollbar pr-1">
            {incidents.map(inc => {
              const isSelected = inc.id === selectedIncidentId;
              const statusColors = {
                "New Alert": "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse",
                "Investigating": "bg-blue-500/10 text-blue-500 border-blue-500/20",
                "Contained": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                "Monitoring": "bg-purple-500/10 text-purple-500 border-purple-500/20",
                "Escalated": "bg-amber-500/10 text-amber-500 border-amber-500/20",
                "Closed": "bg-slate-500/10 text-slate-500 border-slate-500/20"
              }[inc.status];

              return (
                <button
                  type="button"
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`w-full text-left p-3 rounded-lg border transition ${isSelected ? "bg-muted border-cyan-500/50 shadow-sm" : "bg-card border-border hover:bg-muted/40"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono font-bold text-muted-foreground">{inc.id}</span>
                    <span className={`text-[7.5px] font-mono font-black uppercase px-2 py-0.5 rounded border ${statusColors}`}>
                      {inc.status}
                    </span>
                  </div>
                  <h4 className="text-[10.5px] font-mono font-bold truncate text-foreground mb-1 uppercase tracking-wide">
                    {inc.name}
                  </h4>
                  <div className="flex items-center justify-between text-[8.5px] text-muted-foreground font-mono">
                    <span>SRC: {inc.sourceIp}</span>
                    <span className="text-cyan-500 font-bold">FScore: {inc.fusionScore}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTION QUICK SUMMARY MAP */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm font-mono text-[9.5px]">
          <div className="border-b border-border pb-2 mb-3">
            <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Incident Guidance</span>
          </div>
          <div className="space-y-1 text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Incident Target:</span>
              <span className="text-foreground font-bold">{activeIncident.destinationIp}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Attack Vector:</span>
              <span className="text-rose-500 font-bold">{activeIncident.attackType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Severity index:</span>
              <span className="text-foreground uppercase font-bold">{activeIncident.severity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE & RIGHT COMBINED WORKSPACE: ACTIVE SIMULATION HUB */}
      <div className="xl:col-span-9 space-y-6">
        {/* TARGET WORKSPACE FRAME - CARD SECTION */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.05),transparent)] pointer-events-none" />
          
          {/* Active Incident Metadata Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-4 mb-4 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[9px] font-mono bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 px-2 py-0.5 rounded font-black">
                  {activeIncident.mitre.split(" - ")[0]}
                </span>
                <span className="text-[9px] font-mono bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded font-black uppercase">
                  {activeIncident.severity} priority
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Generated: {activeIncident.createdAt}
                </span>
              </div>
              <h3 className="text-base font-mono font-black text-foreground uppercase tracking-tight">
                Analyzing: {activeIncident.name}
              </h3>
            </div>

            <button
              type="button"
              onClick={resetIncidentSimulator}
              className="px-2.5 py-1.5 rounded bg-muted hover:bg-muted-foreground/10 border border-border font-mono text-[9.5px] font-black uppercase text-muted-foreground flex items-center gap-1.5 self-start"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Rejuvenate Case
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* CENTRAL SIMULATION TERMINAL PATH */}
            <div className="lg:col-span-7 space-y-5">
              {/* STEP 5: VISUAL TIMELINE */}
              <div>
                <span className="text-[9.5px] font-mono font-bold text-muted-foreground tracking-widest uppercase block mb-2.5">
                  Response Workflow Visualization
                </span>
                
                <div className="grid grid-cols-5 gap-1 text-center font-mono text-[8px] tracking-wide uppercase">
                  {[
                    { label: "Alert", match: ["New Alert", "Investigating", "Contained", "Monitoring", "Escalated", "Closed"] },
                    { label: "Investigate", match: ["Investigating", "Contained", "Monitoring", "Escalated", "Closed"] },
                    { label: "Contain", match: ["Contained", "Monitoring", "Escalated", "Closed"] },
                    { label: "Monitor", match: ["Monitoring", "Escalated", "Closed"] },
                    { label: "Resolved", match: ["Closed"] }
                  ].map((node, i) => {
                    const isActive = node.match.includes(activeIncident.status);
                    return (
                      <div key={node.label} className="relative py-2 px-1">
                        {/* Background Connector Pipe */}
                        {i < 4 && (
                          <div className={`absolute top-4 left-1/2 w-full h-0.5 z-0 ${isActive && node.match.includes(activeIncident.status) ? "bg-cyan-500" : "bg-border"}`} />
                        )}
                        <div className={`relative z-10 w-5 h-5 mx-auto rounded-full flex items-center justify-center border text-[9px] font-bold ${isActive ? "bg-cyan-500 text-slate-950 border-cyan-400" : "bg-muted text-muted-foreground border-border"}`}>
                          {isActive ? <Check className="w-3 h-3" /> : i + 1}
                        </div>
                        <span className={`block mt-2 font-black text-[7.5px] ${isActive ? "text-cyan-500 font-bold" : "text-muted-foreground"}`}>{node.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* INTERACTIVE COMPONENT: SIMULATION HUB ACTION ACTIONS */}
              <div className="bg-muted/40 border border-border p-4 rounded-xl space-y-3 relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold font-mono text-foreground uppercase tracking-widest flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-cyan-500" /> Response Simulator Actions
                  </span>
                  <span className="text-[8px] font-mono text-muted-foreground">FCAJ COMPLIANT EXECUTOR</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Investigation trigger */}
                  <button
                    type="button"
                    onClick={() => executeSimAction("Investigate")}
                    disabled={activeIncident.status !== "New Alert"}
                    className={`flex-1 py-2 px-2 rounded-lg font-mono text-[10px] font-black uppercase transition flex items-center justify-center gap-1.5 ${activeIncident.status === "New Alert" ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer" : "bg-muted text-muted-foreground border border-border cursor-not-allowed"}`}
                  >
                    <Search className="w-3.5 h-3.5" /> Investigate
                  </button>

                  {/* Containment trigger */}
                  <button
                    type="button"
                    onClick={() => executeSimAction("Contain")}
                    disabled={activeIncident.status !== "Investigating"}
                    className={`flex-1 py-2 px-2 rounded-lg font-mono text-[10px] font-black uppercase transition flex items-center justify-center gap-1.5 ${activeIncident.status === "Investigating" ? "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer" : "bg-muted text-muted-foreground border border-border cursor-not-allowed"}`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Contain Host
                  </button>

                  {/* Monitor trigger */}
                  <button
                    type="button"
                    onClick={() => executeSimAction("Monitor")}
                    disabled={activeIncident.status !== "Contained"}
                    className={`flex-1 py-2 px-2 rounded-lg font-mono text-[10px] font-black uppercase transition flex items-center justify-center gap-1.5 ${activeIncident.status === "Contained" ? "bg-purple-600 text-white hover:bg-purple-700 cursor-pointer" : "bg-muted text-muted-foreground border border-border cursor-not-allowed"}`}
                  >
                    <Activity className="w-3.5 h-3.5" /> Monitor
                  </button>

                  {/* Escalate Trigger */}
                  <button
                    type="button"
                    onClick={() => executeSimAction("Escalate")}
                    disabled={activeIncident.status !== "Investigating" && activeIncident.status !== "New Alert"}
                    className={`flex-1 py-2 px-2 rounded-lg font-mono text-[10px] font-black uppercase transition flex items-center justify-center gap-1.5 ${activeIncident.status === "Investigating" || activeIncident.status === "New Alert" ? "bg-amber-600 text-white hover:bg-amber-700 cursor-pointer" : "bg-muted text-muted-foreground border border-border cursor-not-allowed"}`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Escalate
                  </button>

                  {/* Close incident Trigger */}
                  <button
                    type="button"
                    onClick={() => executeSimAction("Close")}
                    disabled={activeIncident.status === "Closed" || activeIncident.status === "New Alert"}
                    className={`flex-1 py-2 px-2 rounded-lg font-mono text-[10px] font-black uppercase transition flex items-center justify-center gap-1.5 ${activeIncident.status !== "Closed" && activeIncident.status !== "New Alert" ? "bg-slate-700 text-white hover:bg-slate-800 cursor-pointer" : "bg-muted text-muted-foreground border border-border cursor-not-allowed"}`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Close Incident
                  </button>
                </div>

                <p className="text-[9px] text-muted-foreground italic font-mono text-center pt-1.5 leading-snug">
                  *Note: Simulating process flow alters the active state of incident metrics. Dispatches mock firewall filters and credentials deactivators.
                </p>
              </div>

              {/* LIVE SIMULATED CONSOLE STREAMS */}
              <div className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner p-4 font-mono text-[9.5px] transition-all duration-300">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
                  <span className="text-[9px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" /> SOC Investigation Case Terminal Logs
                  </span>
                  <span className="text-[8px] text-emerald-600 dark:text-emerald-400 uppercase animate-pulse font-black font-mono">
                    CONNECTOR ONLINE
                  </span>
                </div>
                
                <div className="space-y-1.5 min-h-27.5 max-h-35 overflow-y-auto custom-scrollbar select-text leading-relaxed">
                  {(terminalLogs[activeIncident.id] || []).map((logLine, idx) => (
                    <div key={idx} className="flex items-start gap-1">
                      <span className="text-slate-400 dark:text-slate-500 select-none">&gt;&gt;</span>
                      <span className={logLine.includes("[Resolution]") || logLine.toLowerCase().includes("[sys_reset]") ? "text-emerald-600 dark:text-emerald-400 font-semibold" : logLine.toLowerCase().includes("[mitigation]") ? "text-cyan-600 dark:text-cyan-400 font-black" : logLine.toLowerCase().includes("[escalation]") ? "text-amber-600 dark:text-amber-400 font-semibold" : "text-slate-700 dark:text-slate-300"}>
                        {logLine}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: DECISION FORMULA EXPLAINER EXCEL FRAME */}
            <div className="lg:col-span-5 space-y-4">
              {/* FCAJ v3.0 Multi-Sensor Decision Tree Graphic */}
              <div className="bg-muted p-4 rounded-xl border border-border space-y-3.5">
                <div className="border-b border-border pb-1.5">
                  <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-rose-500" /> FCAJ v3.0 Decision Flow Explainer
                  </span>
                </div>

                {/* Math weight explainer block */}
                <div className="space-y-2.5 font-mono text-[9px] leading-snug text-muted-foreground">
                  <p className="text-[9.5px] text-foreground leading-normal font-bold">
                    FCAJ fusion layers compute scores dynamically based on sensor multipliers:
                  </p>

                  {/* Formula box */}
                  <div className="bg-card border border-border p-2.5 rounded-lg text-center text-foreground font-black text-[10px] select-all shadow-inner">
                    Score = Σ(Weight_i * S_i) / ΣWeight_i
                  </div>

                  {/* Weighted parameters */}
                  <div className="space-y-1.5 bg-card border border-border/85 p-3 rounded-lg text-foreground">
                    {/* Parameter 1 */}
                    <div className="flex items-center justify-between border-b border-border/40 pb-1">
                      <span className="text-muted-foreground">AI Payload (W1: {activeIncident.decisionFlow.w1}):</span>
                      <span className="font-bold">{activeIncident.decisionFlow.s1}% score</span>
                    </div>
                    {/* Parameter 2 */}
                    <div className="flex items-center justify-between border-b border-border/40 pb-1 font-mono">
                      <span className="text-muted-foreground">Suricata Alert (W2: {activeIncident.decisionFlow.w2}):</span>
                      <span className="font-bold">{activeIncident.decisionFlow.s2}% score</span>
                    </div>
                    {/* Parameter 3 */}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Protocol Rate (W3: {activeIncident.decisionFlow.w3}):</span>
                      <span className="font-bold">{activeIncident.decisionFlow.s3}% score</span>
                    </div>
                  </div>

                  {/* Output verdict summary indicator */}
                  <div className="p-2.5 rounded bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 font-bold space-y-1 text-center font-mono">
                    <div className="text-[8px] uppercase tracking-wider text-muted-foreground font-black">Consensus Classifier Verdict</div>
                    <div className="text-[9.5px] uppercase tracking-tight">{activeIncident.decisionFlow.finalDecision}</div>
                    <div className="text-[10.5px] text-emerald-500">Confidence: {activeIncident.decisionFlow.confidence}%</div>
                  </div>
                </div>
              </div>

              {/* INVESTIGATION CHECKS - STEP INSPECTOR (ITEM 6) */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm font-mono text-[9px]">
                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest block mb-2">Investigation Guide Checklist</span>
                <div className="space-y-1.5">
                  {activeIncident.steps.map((st, sidx) => (
                    <div key={sidx} className="flex gap-2 items-start text-muted-foreground">
                      <span className="p-0.5 rounded bg-muted text-foreground text-[8px] font-black shrink-0">ST-{sidx+1}</span>
                      <span className="leading-snug">{st}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* REACTIVE EVENT ANALYSIS LOG TAB BOXES (ITEM 7) */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <h3 className="text-xs font-mono font-black uppercase tracking-widest flex items-center gap-1">
              <Database className="w-4 h-4 text-cyan-500" /> Evidence Analysis Panel & Telemetry Payload
            </h3>
            <span className="text-[8px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded border">
              ACTIVE SOURCE: {activeIncident.id} Payload
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[9.5px]">
            {/* Left Box: Zeek raw telemetry payload inside inspector */}
            <div className="space-y-1.5">
              <span className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-widest">Zeek Log (conn.log / http.log) Payload</span>
              <pre className="p-3 bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-slate-800 dark:text-slate-300 rounded-lg max-h-35 overflow-y-auto custom-scrollbar select-text leading-relaxed transition-all duration-300">
                {JSON.stringify(activeIncident.zeekLog, null, 2)}
              </pre>
            </div>

            {/* Right Box: Suricata Alert payload inside inspector */}
            <div className="space-y-1.5">
              <span className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-widest">Suricata Threat Signature Alert Entry</span>
              <pre className="p-3 bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-slate-800 dark:text-slate-300 rounded-lg max-h-35 overflow-y-auto custom-scrollbar select-text leading-relaxed transition-all duration-300">
                {JSON.stringify(activeIncident.suricataAlert, null, 2)}
              </pre>
            </div>
          </div>

          {/* RECOMMENDED MITIGATION ACTIONS BOX */}
          <div className="p-3.5 bg-yellow-550/5 text-amber-800 dark:text-amber-400 border border-yellow-500/10 rounded-lg flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 text-amber-500" />
            <div className="space-y-1 text-[9.5px] font-mono">
              <span className="font-extrabold uppercase text-[10px] tracking-wider block">FCAJ v3.0 Mitigation Safeguard Recommendations</span>
              <ul className="list-disc pl-4 space-y-1 leading-relaxed">
                {activeIncident.attackType === "XSS" && (
                  <>
                    <li>Block immediate requester host <strong className="text-rose-500 font-extrabold">{activeIncident.sourceIp}</strong> in edge pfSense aliases dynamic lists.</li>
                    <li>Check target redirect parameter configurations on web controller route: <strong className="text-foreground">{activeIncident.zeekLog.uri}</strong>.</li>
                    <li>Sanitize database inputs and audit cookie safety indicators (HttpOnly, Secure bindings).</li>
                  </>
                )}
                {activeIncident.attackType === "SQLi" && (
                  <>
                    <li>Audit transaction payload indices targeting database path parameters on: <strong className="text-foreground">{activeIncident.zeekLog.uri}</strong>.</li>
                    <li>Downgrade API role credentials used on route session immediately to protect DB assets.</li>
                    <li>Engage parameterized queries validator checks across all REST endpoints.</li>
                  </>
                )}
                {activeIncident.attackType === "Port Scan" && (
                  <>
                    <li>Instruct pfSense firewall interface nodes to throttle scanning source segment: <strong className="text-foreground">{activeIncident.sourceIp}</strong>.</li>
                    <li>Confirm active socket connection state (State REJ implies request was rejected successfully).</li>
                    <li>Review host reconnaissance logs to track sweep scope variables.</li>
                  </>
                )}
                {activeIncident.attackType === "Brute Force" && (
                  <>
                    <li>Revoke active authorization keys from Bastion node <strong className="text-foreground">{activeIncident.destinationIp}</strong>.</li>
                    <li>Instruct SSH/LDAP network registers to trigger a temporary password locking profile.</li>
                    <li>Audit credential spray records inside secure terminal logs folders.</li>
                  </>
                )}
                {activeIncident.attackType === "DoS" && (
                  <>
                    <li>Enforce strict SYN proxies checkpoints on cloud load balancers.</li>
                    <li>Halt traffic routing pools associated with anomalous ingress rate volumes.</li>
                    <li>Activate CDN buffer rate limits to screen client connections dynamically.</li>
                  </>
                )}
                {activeIncident.attackType === "Beaconing" && (
                  <>
                    <li>Maintain mirror PCAP logging channel on target destination coordinate <strong className="text-foreground">{activeIncident.destinationIp}</strong>.</li>
                    <li>Coordinate memory inspection process with local machine administrators to isolate threat processes.</li>
                    <li>Re-verify domain reputation ratings matching outbound targets.</li>
                  </>
                )}
                {activeIncident.attackType === "Data Exfiltration" && (
                  <>
                    <li>Apply immediate QoS bottleneck limits across network interface gateways (restricted DB egress).</li>
                    <li>Revoke temporal AWS storage bucket privilege structures to contain data leaks.</li>
                    <li>Decompile transmission payloads context to confirm volume classification thresholds.</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
