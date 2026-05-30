import React, { useState } from "react";
import { 
  X, 
  Settings, 
  Play, 
  Save, 
  FileText, 
  Workflow, 
  Sparkles, 
  Network, 
  Cpu, 
  Fingerprint
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

interface CreateRuleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRule: (ruleData: any) => void;
  onTestRule: (ruleData: any) => void;
}

export function CreateRuleDrawer({ isOpen, onClose, onSaveRule, onTestRule }: CreateRuleDrawerProps) {
  // Setup Rule Form state
  const [ruleName, setRuleName] = useState("");
  const [description, setDescription] = useState("");
  const [ruleType, setRuleType] = useState("Network Detection");
  
  // Detection Conditions
  const [severity, setSeverity] = useState("CRITICAL");
  const [attackType, setAttackType] = useState("");
  const [protocol, setProtocol] = useState("TCP");
  const [sourceIp, setSourceIp] = useState("");
  const [destPort, setDestPort] = useState("");
  const [cloudProvider, setCloudProvider] = useState("AWS");
  const [confidence, setConfidence] = useState(90);

  // MITRE ATT&CK Mapping
  const [mitreId, setMitreId] = useState("");
  
  // Rule actions
  const [actions, setActions] = useState<Record<string, boolean>>({
    generateAlert: true,
    sendSlack: false,
    autoBlockIp: false,
    isolateAsset: false,
    escalateSeverity: false
  });

  // Rule Status
  const [isActive, setIsActive] = useState(true);

  // Quick preset loader function for an outstanding analyst workflow
  const loadPreset = (presetName: string) => {
    if (presetName === 'beacon') {
      setRuleName("Detect Beaconing Activity");
      setDescription("Alert when recurrent network beacons are transmitted to outbound range IPs with fixed cyclic rhythms.");
      setRuleType("Behavioral Detection");
      setSeverity("HIGH");
      setAttackType("Beaconing Command & Control");
      setProtocol("HTTPS");
      setSourceIp("10.0.0.0/8");
      setDestPort("443");
      setCloudProvider("AWS");
      setConfidence(85);
      setMitreId("T1071");
      setActions({
        generateAlert: true,
        sendSlack: true,
        autoBlockIp: false,
        isolateAsset: true,
        escalateSeverity: false
      });
    } else if (presetName === 'sqli') {
      setRuleName("Suspicious SQLi Burst");
      setDescription("Identify SQL statement strings inside URL parameters or payload bodies targeting API endpoints.");
      setRuleType("Web Attack Detection");
      setSeverity("CRITICAL");
      setAttackType("SQL Injection");
      setProtocol("HTTP");
      setSourceIp("192.168.10.15/32");
      setDestPort("80");
      setCloudProvider("GCP");
      setConfidence(95);
      setMitreId("T1190");
      setActions({
        generateAlert: true,
        sendSlack: true,
        autoBlockIp: true,
        isolateAsset: false,
        escalateSeverity: true
      });
    } else if (presetName === 'brute') {
      setRuleName("SSH Brute Force Detection");
      setDescription("Aggregate rapid failure logins coming from single host targeting TCP port 22 inside secure security groups.");
      setRuleType("Behavioral Detection");
      setSeverity("MEDIUM");
      setAttackType("Brute Force Attempt");
      setProtocol("TCP");
      setSourceIp("192.168.1.0/24");
      setDestPort("22");
      setCloudProvider("AWS");
      setConfidence(90);
      setMitreId("T1110");
      setActions({
        generateAlert: true,
        sendSlack: false,
        autoBlockIp: true,
        isolateAsset: false,
        escalateSeverity: false
      });
    }
  };

  const handleActionToggle = (key: string) => {
    setActions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) {
      alert("Please provide a descriptive rule name.");
      return;
    }
    onSaveRule({
      ruleName,
      description,
      ruleType,
      conditions: {
        severity,
        attackType,
        protocol,
        sourceIp,
        destPort,
        cloudProvider,
        confidence
      },
      mitreId,
      actions,
      isActive
    });
  };

  const handleTest = () => {
    if (!ruleName.trim()) {
      alert("Please enter a rule name before testing.");
      return;
    }
    onTestRule({
      ruleName,
      description,
      ruleType,
      conditions: {
        severity,
        attackType,
        protocol,
        sourceIp,
        destPort,
        cloudProvider,
        confidence
      },
      mitreId,
      actions,
      isActive
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Centered Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity flex items-center justify-center p-4 sm:p-6 md:p-8"
        onClick={onClose}
      >
        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full md:w-[75vw] lg:w-[70vw] xl:w-[65vw] max-w-275 h-[80vh] min-h-137.5 max-h-205 bg-card border border-border shadow-2xl rounded-xl flex flex-col overflow-hidden text-left"
        >
          {/* Panel Header (Fixed) */}
          <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
                <Workflow className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <h2 className="text-[11px] sm:text-[12px] font-black text-foreground uppercase tracking-widest leading-none">
                  CREATE DETECTION RULE
                </h2>
                <span className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-wider block mt-1">
                  AI-assisted Threat Monitoring Configuration Workspace
                </span>
              </div>
            </div>
            
            <button 
              type="button" 
              onClick={onClose} 
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Modal Content Split Grid (Scrollable Body) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            
            {/* Quick Templates Selector (Unified) */}
            <div className="bg-muted/10 border border-border/60 p-3.5 rounded-xl space-y-2">
              <label className="text-[8.5px] font-black text-muted-foreground uppercase tracking-wider block">
                Quick SOC Engineering Templates (Prepopulate Workspace)
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => loadPreset('beacon')}
                  className="px-2.5 py-1.5 bg-muted/60 hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/40 border border-border rounded-md text-[8px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  📡 outbound Beaconing
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('sqli')}
                  className="px-2.5 py-1.5 bg-muted/60 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40 border border-border rounded-md text-[8px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  💉 SQL Injection (HTTP Burst)
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('brute')}
                  className="px-2.5 py-1.5 bg-muted/60 hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/40 border border-border rounded-md text-[8px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  🔒 SSH Brute Force
                </button>
              </div>
            </div>

            {/* Responsive Split Workspace Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (Inputs for Form Specifications) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Basic Information Section */}
                <div className="space-y-3 bg-muted/10 border border-border/40 p-4 rounded-xl">
                  <h3 className="text-[9px] font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <FileText size={12} className="text-cyan-500" />
                    [ Basic Information ]
                  </h3>
                  
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">
                        Rule Signature Name *
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Detect cyclic outbound payload signaling"
                        value={ruleName}
                        onChange={(e) => setRuleName(e.target.value)}
                        className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-[10px] font-bold text-foreground placeholder:text-muted-foreground/35 focus:outline-none focus:border-cyan-500/40 focus:bg-muted/60 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">
                        Description / Operational Goal
                      </label>
                      <textarea 
                        rows={2}
                        placeholder="Briefly describe the criteria and trigger purpose of this firewall threshold policy..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-[10px] font-bold text-foreground placeholder:text-muted-foreground/35 focus:outline-none focus:border-cyan-500/40 focus:bg-muted/60 transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">
                          Classifier Rule Category
                        </label>
                        <select 
                          value={ruleType}
                          onChange={(e) => setRuleType(e.target.value)}
                          className="w-full bg-muted/40 border border-border rounded-lg px-2 text-[9.5px] py-1.5 font-bold text-foreground focus:outline-none focus:border-cyan-500/40 cursor-pointer"
                        >
                          <option value="Network Detection">Network Detection</option>
                          <option value="Web Attack Detection">Web Attack Detection</option>
                          <option value="Behavioral Detection">Behavioral Detection</option>
                          <option value="AI Anomaly Rule">AI Anomaly Rule</option>
                          <option value="Custom Correlation">Custom Correlation</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">
                          Cloud Service Provider
                        </label>
                        <select 
                          value={cloudProvider}
                          onChange={(e) => setCloudProvider(e.target.value)}
                          className="w-full bg-muted/40 border border-border rounded-lg px-2 text-[9.5px] py-1.5 font-bold text-foreground focus:outline-none focus:border-cyan-500/40 cursor-pointer"
                        >
                          <option value="AWS">AWS</option>
                          <option value="GCP">GCP</option>
                          <option value="AZURE">Microsoft Azure</option>
                          <option value="ON-PREMISE">On-Premise Private SOC</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Detection Trigger Conditions */}
                <div className="space-y-3 bg-muted/10 border border-border/40 p-4 rounded-xl">
                  <h3 className="text-[9px] font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Settings size={12} className="text-cyan-500" />
                    [ Detection Conditions ]
                  </h3>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">
                        Severity Trigger Threshold
                      </label>
                      <select 
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                        className="w-full bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-[9.5px] font-bold text-foreground focus:outline-none focus:border-cyan-500/40 cursor-pointer"
                      >
                        <option value="CRITICAL">Critical Alerts Only</option>
                        <option value="HIGH">High or Critical</option>
                        <option value="MEDIUM">Medium or higher</option>
                        <option value="LOW">All (Low/Med/High/Crit)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">
                        Payload Attack Vector Alignment
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. SQL Injection"
                        value={attackType}
                        onChange={(e) => setAttackType(e.target.value)}
                        className="w-full bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-[9.5px] font-bold text-foreground focus:outline-none placeholder:text-muted-foreground/35"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">
                        Ingress Network Protocol
                      </label>
                      <select 
                        value={protocol}
                        onChange={(e) => setProtocol(e.target.value)}
                        className="w-full bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-[9.5px] font-bold text-foreground focus:outline-none focus:border-cyan-500/40 cursor-pointer"
                      >
                        <option value="TCP">TCP</option>
                        <option value="UDP">UDP</option>
                        <option value="ICMP">ICMP</option>
                        <option value="HTTPS">HTTPS</option>
                        <option value="HTTP">HTTP</option>
                        <option value="TLS">TLS</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">
                        Source Subnet CIDR Block
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. 192.168.1.0/24"
                        value={sourceIp}
                        onChange={(e) => setSourceIp(e.target.value)}
                        className="w-full bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-[9.5px] font-bold text-foreground focus:outline-none placeholder:text-muted-foreground/35"
                      />
                    </div>

                    <div className="space-y-1 col-span-2">
                      <label className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">
                        Destination Boundary Port
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. 443"
                        value={destPort}
                        onChange={(e) => setDestPort(e.target.value)}
                        className="w-full bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-[9.5px] font-bold text-foreground focus:outline-none placeholder:text-muted-foreground/35"
                      />
                    </div>
                  </div>

                  {/* Range Slider for AI Confidence Threshold */}
                  <div className="space-y-2 pt-2.5 border-t border-border/30 mt-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">
                        Minimum AI Confidence Filter
                      </label>
                      <span className="font-mono font-bold text-[9px] text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/20 px-1.5 py-0.2 rounded">
                        {confidence}%
                      </span>
                    </div>
                    <input 
                      type="range"
                      min="50"
                      max="100"
                      step="5"
                      value={confidence}
                      onChange={(e) => setConfidence(Number(e.target.value))}
                      className="w-full h-1 bg-muted accent-cyan-500 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-[7.5px] font-mono text-muted-foreground/60 leading-normal uppercase">
                      Prune false alarms by matching only high confidence correlations.
                    </p>
                  </div>
                </div>

                {/* 3. MITRE Mapping Section */}
                <div className="space-y-3 bg-muted/10 border border-border/40 p-4 rounded-xl">
                  <h3 className="text-[9px] font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Fingerprint size={12} className="text-cyan-500" />
                    [ MITRE Mapping ]
                  </h3>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">
                      ATT&CK Alignment Technique ID
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. T1190 or T1071 / T1110"
                      value={mitreId}
                      onChange={(e) => setMitreId(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-[10px] font-bold text-foreground placeholder:text-muted-foreground/35 focus:outline-none focus:border-cyan-500/40 focus:bg-muted/50 transition-colors"
                    />
                    <div className="flex gap-1.5 mt-1">
                      {['T1190', 'T1071', 'T1110', 'T1046'].map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setMitreId(id)}
                          className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-mono font-bold transition-all border cursor-pointer",
                            mitreId === id 
                              ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400 font-extrabold"
                              : "bg-muted border-border hover:border-border/80 text-muted-foreground"
                          )}
                        >
                          #{id}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column (AI- assisted Automation, Actions, Logic Preview Card) */}
              <div className="lg:col-span-5 space-y-6">

                {/* 4. AI Recommendation Section */}
                <div className="bg-purple-500/2 border border-purple-500/15 p-4 rounded-xl space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/3 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">[ AI Recommendation ]</span>
                  </div>
                  <p className="text-[8.5px] text-muted-foreground/95 font-medium leading-relaxed uppercase">
                    “Recent traffic patterns suggest lowering threshold from <strong className="text-purple-400 font-extrabold">95%</strong> to <strong className="text-purple-400 font-extrabold">88%</strong> for improved detection coverage.”
                  </p>
                </div>

                {/* 5. Defense Action Configuration */}
                <div className="space-y-3 bg-muted/10 border border-border/40 p-4 rounded-xl">
                  <h3 className="text-[9px] font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Network size={12} className="text-cyan-500" />
                    [ Action Configuration ]
                  </h3>

                  <div className="space-y-2 bg-muted/30 border border-border/50 p-2.5 rounded-lg grid grid-cols-1 gap-2">
                    {[
                      { key: 'generateAlert', label: 'GENERATE REALTIME SOC ALARM', desc: 'Broadcast instantly in threat table and live feed dashboards.' },
                      { key: 'sendSlack', label: 'SEND SLACK payload NOTIFICATION', desc: 'Post JSON parameters to the team operations channel.' },
                      { key: 'autoBlockIp', label: 'AUTO-BLOCK SOURCE IP/SUBNET', desc: 'Trigger local firewall routes and boundary connection blocks.' },
                      { key: 'isolateAsset', label: 'ISOLATE VULNERABLE ASSET NODE', desc: 'Quarantine target internal device virtual cluster.' },
                      { key: 'escalateSeverity', label: 'FORCE CRITICAL TRIAGE ESCALATION', desc: 'Escalate automatically if correlated against other alerts.' },
                    ].map((item) => (
                      <div 
                        key={item.key} 
                        onClick={() => handleActionToggle(item.key)}
                        className={cn(
                          "flex items-start gap-2 p-1.5 rounded-md border border-transparent hover:bg-muted/50 cursor-pointer transition-all select-none",
                          actions[item.key] ? "bg-cyan-500/3" : ""
                        )}
                      >
                        <input 
                          type="checkbox"
                          checked={actions[item.key] || false}
                          onChange={() => {}} // toggled on container click
                          className="mt-0.5 accent-cyan-500 h-3 w-3 shrink-0 rounded cursor-pointer"
                        />
                        <div className="leading-tight flex flex-col font-medium">
                          <span className={cn(
                            "text-[8.5px] font-black tracking-wide uppercase",
                            actions[item.key] ? "text-cyan-500" : "text-foreground/90"
                          )}>{item.label}</span>
                          <span className="text-[7.5px] text-muted-foreground uppercase tracking-wider block mt-0.5">{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Interactive Rule Preview Card */}
                <div className="space-y-3 bg-muted/10 border border-border/40 p-4 rounded-xl">
                  <h3 className="text-[9px] font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Cpu size={12} className="text-cyan-500" />
                    [ Rule Preview ]
                  </h3>
                  
                  <div className="bg-muted/40 border border-cyan-500/15 p-4 rounded-xl space-y-3 font-mono text-[9px] relative">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="font-extrabold uppercase tracking-widest text-[8.5px] text-cyan-400">Rule Logic Preview</span>
                      <span className="text-[7px] px-1 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40 uppercase font-black tracking-widest">SIEM-COMPATIBLE</span>
                    </div>

                    <div className="space-y-3.5 text-foreground/80 leading-relaxed">
                      <div>
                        <span className="text-pink-500 font-extrabold text-[9.5px]">IF:</span>
                        <div className="pl-3 mt-1 space-y-1 text-muted-foreground font-mono uppercase">
                          <div>• rule_name = <span className="text-cyan-400 font-semibold">{ruleName ? `"${ruleName}"` : "Untitled Rule"}</span></div>
                          <div>• severity_threshold = <span className="text-cyan-400 font-semibold">"{severity}"</span></div>
                          {attackType && <div>• attack_type = <span className="text-cyan-400 font-semibold">"{attackType}"</span></div>}
                          <div>• protocol IN <span className="text-cyan-400 font-semibold">["{protocol}"]</span></div>
                          {sourceIp && <div>• source_subnet = <span className="text-cyan-400 font-semibold">"{sourceIp}"</span></div>}
                          {destPort && <div>• destination_port = <span className="text-cyan-400 font-semibold">"{destPort}"</span></div>}
                          <div>• cloud_provider = <span className="text-cyan-400 font-semibold">"{cloudProvider}"</span></div>
                          <div>• ai_confidence &gt;= <span className="text-cyan-400 font-semibold">{confidence}%</span></div>
                          {mitreId && <div>• mitre_id = <span className="text-cyan-400 font-semibold">"#{mitreId}"</span></div>}
                        </div>
                      </div>

                      <div className="border-t border-border/40 pt-2">
                        <span className="text-emerald-500 font-extrabold text-[9.5px]">THEN:</span>
                        <div className="pl-3 mt-1 space-y-1 text-muted-foreground font-mono uppercase">
                          {Object.entries(actions).filter(([_, val]) => val).length === 0 ? (
                            <div className="italic text-muted-foreground/50">No defensive automation programmed</div>
                          ) : (
                            Object.entries(actions)
                              .filter(([_, val]) => val)
                              .map(([key, _]) => {
                                let labelAction = "";
                                if (key === 'generateAlert') labelAction = "Generate realtime SIEM alert alarm";
                                else if (key === 'sendSlack') labelAction = "Relay payload details to target Slack operations channel";
                                else if (key === 'autoBlockIp') labelAction = "Engage egress/ingress firewall auto-block for source IP";
                                else if (key === 'isolateAsset') labelAction = "Contain & isolate vulnerable virtual asset node";
                                else if (key === 'escalateSeverity') labelAction = "Promote incident urgency hierarchy levels on match";
                                return (
                                  <div key={key}>• <span className="text-emerald-400 font-semibold">{labelAction}</span></div>
                                );
                              })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deployment Enablement State */}
                <div className="flex items-center justify-between p-3.5 bg-muted/40 border border-border rounded-xl">
                  <div className="leading-none">
                    <span className="text-[9px] font-black text-foreground uppercase tracking-wider block">Rule Deployment State</span>
                    <span className="text-[7.5px] text-muted-foreground uppercase font-black block tracking-widest mt-1">
                      {isActive ? "ACTIVE & ROUTED TO SIEM GATEWAY" : "DISABLED (SAVED IN POLICY SCRATCHPAD)"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={cn(
                      "relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      isActive ? "bg-cyan-600" : "bg-muted-foreground/30"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                        isActive ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

              </div>

            </div>

          </div>

          {/* Modal Footer Navigation Action Buttons (Fixed) */}
          <div className="p-4 border-t border-border bg-muted/40 gap-3 grid grid-cols-3 shrink-0">
            <button 
              type="button" 
              onClick={onClose}
              className="py-3 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-[9.5px] font-extrabold uppercase tracking-widest rounded-lg border border-border/80 transition-all cursor-pointer text-center leading-none"
            >
              Cancel
            </button>
            
            <button 
              type="button" 
              onClick={handleTest}
              className="py-3 bg-purple-600/10 hover:bg-purple-600 border border-purple-500/25 text-purple-400 hover:text-white text-[9.5px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 leading-none"
            >
              <Play size={11} /> Test Rule
            </button>

            <button 
              type="submit"
              onClick={handleSubmit}
              className="py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-[9.5px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-cyan-500/10 transition-all cursor-pointer flex items-center justify-center gap-1 leading-none"
            >
              <Save size={11} /> Save Rule
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
