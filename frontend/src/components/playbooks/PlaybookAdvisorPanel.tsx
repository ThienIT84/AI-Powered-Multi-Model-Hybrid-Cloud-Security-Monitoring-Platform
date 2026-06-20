import React, { useState } from "react";
import { Sparkles, ArrowRight, Zap, RefreshCw, HelpCircle, AlertTriangle } from "lucide-react";

interface MatchResult {
  alertName: string;
  recommendedProcedure: string;
  confidence: string;
  reason: string;
  category: string;
}

export function PlaybookAdvisorPanel() {
  const [selectedAlert, setSelectedAlert] = useState<string>("SQL Injection Attempt");
  const [customAlert, setCustomAlert] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Hardcoded matching registry matching standard threat alert parameters
  const matchRegistry: Record<string, MatchResult> = {
    "SQL Injection Attempt": {
      alertName: "SQL Injection Attempt",
      recommendedProcedure: "SQL Injection Response Procedure",
      confidence: "96%",
      reason: "Matched query concatenation syntax rules and single-quote pg_sleep timing triggers.",
      category: "Web Attacks"
    },
    "CSP Script Ingestion Reflected": {
      alertName: "CSP Script Ingestion Reflected",
      recommendedProcedure: "XSS Response",
      confidence: "92%",
      reason: "Matched Content Security Policy violations reports and unescaped HTML tag buffers.",
      category: "Web Attacks"
    },
    "Incoming Volumetric TCP Flood": {
      alertName: "Incoming Volumetric TCP Flood",
      recommendedProcedure: "DoS Response",
      confidence: "98%",
      reason: "Matched Link connection pool consumption thresholds and high half-open connection counts.",
      category: "Network Attacks"
    },
    "Authentication failure spike from Tor exit IPs": {
      alertName: "Authentication failure spike from Tor exit IPs",
      recommendedProcedure: "Brute Force Response",
      confidence: "94%",
      reason: "High failures density exceeding lockout rules mapped to active credential spray profiles.",
      category: "Authentication Attacks"
    },
    "Mass login checks on administrative gateway": {
      alertName: "Mass login checks on administrative gateway",
      recommendedProcedure: "Credential Stuffing Response",
      confidence: "97%",
      reason: "Matches rotating subnets residential client headers matching massive breach repositories.",
      category: "Authentication Attacks"
    },
    "Suspicious lateral PowerShell remote command": {
      alertName: "Suspicious lateral PowerShell remote command",
      recommendedProcedure: "Lateral Movement Investigation",
      confidence: "89%",
      reason: "Multiple unauthorized server token jumps mapped directly within Active Directory event audits.",
      category: "Insider Threat"
    },
    "High volume database cloud bucket egress": {
      alertName: "High volume database cloud bucket egress",
      recommendedProcedure: "Data Exfiltration Response",
      confidence: "95%",
      reason: "DLP outbound byte transfer limits exceeded standard consumer volume baseline models.",
      category: "Data Exposure"
    }
  };

  const handleCustomAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAlert.trim()) return;
    
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 450);
  };

  // Safe fallback if user inputs a custom/unmapped alert
  const getRecommendation = (): MatchResult => {
    if (customAlert.trim()) {
      // Find fuzzy match
      const query = customAlert.toLowerCase();
      if (query.includes("sql") || query.includes("database")) return matchRegistry["SQL Injection Attempt"];
      if (query.includes("script") || query.includes("xss")) return matchRegistry["CSP Script Ingestion Reflected"];
      if (query.includes("flood") || query.includes("dos") || query.includes("traffic")) return matchRegistry["Incoming Volumetric TCP Flood"];
      if (query.includes("auth") || query.includes("login") || query.includes("lock")) return matchRegistry["Authentication failure spike from Tor exit IPs"];
      if (query.includes("stuffing") || query.includes("credential")) return matchRegistry["Mass login checks on administrative gateway"];
      if (query.includes("powershell") || query.includes("lateral") || query.includes("hop")) return matchRegistry["Suspicious lateral PowerShell remote command"];
      if (query.includes("exfil") || query.includes("egress") || query.includes("data")) return matchRegistry["High volume database cloud bucket egress"];
      
      // Default fallback
      return {
        alertName: customAlert,
        recommendedProcedure: "Generic Incident Response Triage SOP",
        confidence: "78%",
        reason: "Generic pattern matching. Fallback to basic NIST triage and incident scoping parameters.",
        category: "General Threat Isolation"
      };
    }

    return matchRegistry[selectedAlert] || matchRegistry["SQL Injection Attempt"];
  };

  const matchedResult = getRecommendation();

  return (
    <div
      id="playbook-advisor-panel"
      className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-xs flex flex-col gap-4 font-mono select-none"
    >
      {/* Header */}
      <div className="border-b border-border/40 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <Zap size={13} className="text-cyan-500 shrink-0 select-none animate-pulse" />
          <div>
            <h2 className="text-[10px] md:text-xs font-black text-foreground uppercase tracking-widest leading-none">
              Playbook Advisor Matching Engine
            </h2>
            <span className="text-[7.5px] text-muted-foreground uppercase tracking-widest mt-1 block">
              Match incoming Fusion SIEM/SOAR alert tags directly with standard SOPs
            </span>
          </div>
        </div>
        <span className="text-[7px] bg-cyan-50/70 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 dark:bg-cyan-950/30 dark:border-cyan-500/20 px-1.5 py-0.5 rounded uppercase font-black tracking-widest leading-none w-fit self-start sm:self-center select-none">
          ENGINE VERSION 2.5
        </span>
      </div>

      {/* Input controls block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        
        {/* Dropdown alert tag select */}
        <div className="space-y-1.5 text-left">
          <label className="text-[7.5px] text-muted-foreground uppercase font-black tracking-widest block leading-none">
            Select Active Fusion Alert Tag:
          </label>
          <select
            value={selectedAlert}
            onChange={(e) => {
              setCustomAlert("");
              setSelectedAlert(e.target.value);
            }}
            className="w-full bg-muted/40 border border-border/80 focus:border-cyan-500 rounded-lg px-2.5 py-2 text-[8.5px] uppercase font-black cursor-pointer outline-hidden transition-all text-foreground"
          >
            {Object.keys(matchRegistry).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        {/* Custom text tag analyzer */}
        <form onSubmit={handleCustomAnalyze} className="space-y-1.5 text-left">
          <label className="text-[7.5px] text-muted-foreground uppercase font-black tracking-widest block leading-none">
            Or Type Custom Alert Signature:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., AD MIN HOP DETECTED..."
              value={customAlert}
              onChange={(e) => setCustomAlert(e.target.value)}
              className="flex-1 bg-muted/40 border border-border/80 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-[8.5px] uppercase placeholder:text-muted-foreground/50 outline-hidden tracking-wide transition-all"
            />
            <button
              type="submit"
              className="px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[8px] font-black uppercase tracking-wider shrink-0 cursor-pointer transition-colors"
            >
              Check
            </button>
          </div>
        </form>
      </div>

      {/* Advisor Recommendation Output block */}
      <div className="bg-muted/15 border border-border/85 rounded-xl p-3 md:p-4 text-left relative min-h-36.25 flex flex-col justify-between">
        {isAnalyzing ? (
          <div className="absolute inset-0 bg-card/80 backdrop-blur-xs flex items-center justify-center rounded-xl">
            <div className="flex items-center gap-2 text-[8.5px] text-cyan-400 font-extrabold uppercase animate-pulse">
              <RefreshCw size={11} className="animate-spin text-cyan-400" />
              Calculating Matching Signatures...
            </div>
          </div>
        ) : null}

        {/* Matches output summary */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between border-b border-border/40 pb-1.5 gap-2 select-none">
            <div className="flex items-center gap-1 text-[8.5px] text-cyan-400 font-black uppercase">
              <Sparkles size={11} className="shrink-0" />
              <span>Recommended matching blueprint</span>
            </div>
            
            <div className="flex items-center gap-1 bg-emerald-600/15 border border-emerald-500/25 text-emerald-400 px-2 py-0.5 rounded-lg text-[7px] font-black uppercase">
              <span>CONFIDENCE:</span>
              <span className="text-[8.5px] font-black">{matchedResult.confidence}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-1 border-b border-border/25">
            {/* Procedure Name */}
            <div>
              <span className="text-[7.5px] text-muted-foreground font-black block uppercase">Recommended Procedure Title:</span>
              <span className="text-[10px] text-foreground font-black uppercase tracking-tight block mt-0.5">
                {matchedResult.recommendedProcedure}
              </span>
            </div>

            {/* RELATED THREAT CATEGORY */}
            <div>
              <span className="text-[7.5px] text-muted-foreground font-black block uppercase">Threat Category:</span>
              <span className="text-[9.5px] text-cyan-400 font-black uppercase block mt-0.5">
                {matchedResult.category}
              </span>
            </div>
          </div>

          {/* Reason matching logic */}
          <div>
            <span className="text-[7.5px] text-muted-foreground font-black block uppercase">Sig Match Reason:</span>
            <p className="text-[8px] text-muted-foreground font-semibold leading-relaxed uppercase mt-0.5">
              {matchedResult.reason}
            </p>
          </div>
        </div>

        {/* Footer info note */}
        <div className="text-[7px] text-muted-foreground/80 uppercase font-bold text-right pt-2 select-none">
          Note: Matching calculations operate by signature lookup triggers. AI internals suppressed.
        </div>
      </div>
    </div>
  );
}
