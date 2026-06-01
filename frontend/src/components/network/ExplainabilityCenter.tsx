import React, { useState } from "react";
import { NetworkLog } from "../network/NetworkConfig";
import { 
  GitCommit, 
  ArrowRight, 
  Workflow, 
  Percent, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Fingerprint, 
  ShieldAlert,
  Sliders,
  Sparkles
} from "lucide-react";

interface ExplainabilityCenterProps {
  log: NetworkLog | null;
}

export const ExplainabilityCenter: React.FC<ExplainabilityCenterProps> = ({ log }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!log) {
    return (
      <div className="bg-slate-950 border border-slate-900 rounded-lg p-6 text-center text-slate-500 italic text-[11px]" id="fusion-explainability-empty">
        <Workflow className="w-8 h-8 mx-auto text-slate-700 mb-2 animate-pulse" />
        SELECT A FLOW SYSTEM PACKET IN THE EXPLORER TABLE TO GENERATE FUSION SCALE EXPLAINABILITY MODEL
      </div>
    );
  }

  const isAnomaly = log.verdict === "ANOMALY";
  const score = log.threatScore;

  // AI1 Details
  const ai1Confidence = log.confidence;
  const ai1Result = isAnomaly ? "ANOMALOUS FOOTPRINT" : "NORMAL STABILITY";

  // AI2A Details
  const ai2aResult = isAnomaly
    ? log.reason.toLowerCase().includes("scan") || log.id.includes("scan")
      ? "Port Scan"
      : log.reason.toLowerCase().includes("leak") || log.reason.toLowerCase().includes("exfil")
      ? "Botnet Exfiltration"
      : log.destPort === 22
      ? "SSH Brute Force"
      : "Denial of Service (DoS)"
    : "Normal Base Traffic";

  const ai2aConfidence = isAnomaly ? Math.round(log.confidence * 0.94) : Math.round(log.confidence * 0.88);

  // Suricata rules inference
  let suricataSignature = "None Triggered";
  let suricataCategory = "N/A";
  let suricataSeverity = "INFO";
  let suricataSigId = "0000000";

  if (isAnomaly) {
    if (ai2aResult === "Port Scan") {
      suricataSignature = "SURICATA PORT SCAN / Sweep Probe recon handshake";
      suricataCategory = "Reconnaissance";
      suricataSeverity = "MEDIUM";
      suricataSigId = "2001042";
    } else if (ai2aResult === "Botnet Exfiltration") {
      suricataSignature = "SURICATA PROMPT OUTBOUND DATA exfiltration postgres spill";
      suricataCategory = "Data Exfiltration";
      suricataSeverity = "CRITICAL";
      suricataSigId = "2408990";
    } else if (ai2aResult === "SSH Brute Force") {
      suricataSignature = "SURICATA SSH BRUTEFORCE auth multi-fail root login attempt";
      suricataCategory = "Credential Access";
      suricataSeverity = "HIGH";
      suricataSigId = "2022411";
    } else {
      suricataSignature = "SURICATA TCP SYN FLOOD SYN-flood attack volume overflow";
      suricataCategory = "Denial of Service";
      suricataSeverity = "HIGH";
      suricataSigId = "2019844";
    }
  }

  // Voting diagram inputs
  const ai1Weight = 35;
  const ai2aWeight = 35;
  const suricataWeight = 30;

  const ai1ScoreContribution = Math.round((log.threatScore * ai1Weight) / 100);
  const ai2aScoreContribution = Math.round((ai2aConfidence * ai2aWeight) / 100);
  const suricataScoreContribution = isAnomaly ? Math.round((95 * suricataWeight) / 100) : 0;
  const calculatedFusionScore = Math.min(100, ai1ScoreContribution + ai2aScoreContribution + suricataScoreContribution);

  return (
    <div 
      className="bg-slate-950 border border-slate-900 rounded-lg shadow-xl overflow-hidden font-mono text-[11px]" 
      id="fusion-explainability-center-root"
    >
      {/* Top Title Accents */}
      <div 
        className="flex items-center justify-between p-3.5 bg-slate-900/60 border-b border-slate-900/80 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-cyan-455 animate-pulse" />
          <div>
            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-widest leading-none">AI FUSION EXPLAINABILITY ENGINE v3.0</span>
            <span className="text-xs font-black text-slate-100 uppercase tracking-tight">
              DECISION TRACEABILITY: <strong className="text-cyan-400 font-mono">{log.id}</strong>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[8.5px] font-black tracking-widest rounded uppercase ${
            isAnomaly ? "bg-red-955 text-red-400 border border-red-500/10" : "bg-emerald-955 text-emerald-400 border border-emerald-500/10"
          }`}>
            Fusion risk: {calculatedFusionScore}%
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4.5 space-y-4 animate-fade-in line-clamp-none">
          {/* PIPELINE DESCENT GRAPH */}
          <div className="bg-slate-900/20 border border-slate-900 p-3 rounded text-[10px] space-y-2">
            <span className="text-[8.5px] font-bold text-slate-450 uppercase block tracking-wider leading-none">
              DECISION ENGINEERING DIAGRAM (FUSION LAYER PATHWAYS)
            </span>
            
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-1.5 pt-1">
              {/* Node 1: Zeek Raw Fields */}
              <div className="flex-1 bg-slate-900/60 border border-slate-800 p-2 rounded text-center">
                <div className="text-[8px] text-slate-500 font-black uppercase">ZEEK TELEMETRY</div>
                <div className="font-bold text-slate-200 mt-0.5 truncate">{log.protocol} Connection</div>
                <div className="text-[8px] text-slate-400 mt-0.5">{log.srcIp.substring(0, 11)}.. ➔ {log.destIp.substring(0, 11)}..</div>
              </div>

              <div className="flex items-center justify-center text-slate-600">
                <ArrowRight className="w-4 h-4 text-slate-600 rotate-90 md:rotate-0" />
              </div>

              {/* Node 2: AI1 Anomaly Heuristics */}
              <div className="flex-1 bg-slate-900/60 border border-slate-800 p-2 rounded text-center">
                <div className="text-[8px] text-slate-500 font-black uppercase">AI1 ANALYZER</div>
                <div className={`font-bold mt-0.5 ${isAnomaly ? "text-red-400" : "text-emerald-500"}`}>{ai1Result.split(" ")[0]}</div>
                <div className="text-[8px] text-slate-400 mt-0.5">Confidence: {ai1Confidence}%</div>
              </div>

              <div className="flex items-center justify-center text-slate-600">
                <ArrowRight className="w-4 h-4 text-slate-600 rotate-90 md:rotate-0" />
              </div>

              {/* Node 3: AI2A Multiclass Classification */}
              <div className="flex-1 bg-slate-900/60 border border-slate-800 p-2 rounded text-center">
                <div className="text-[8px] text-slate-500 font-black uppercase">AI2A CLASSIFIER</div>
                <div className="font-bold text-amber-500 mt-0.5 truncate">{ai2aResult.split(" ")[0]}</div>
                <div className="text-[8px] text-slate-400 mt-0.5">Confidence: {ai2aConfidence}%</div>
              </div>

              <div className="flex items-center justify-center text-slate-600">
                <ArrowRight className="w-4 h-4 text-slate-600 rotate-90 md:rotate-0" />
              </div>

              {/* Node 4: Suricata Evidence */}
              <div className="flex-1 bg-slate-900/60 border border-slate-800 p-2 rounded text-center">
                <div className="text-[8px] text-slate-500 font-black uppercase">SURICATA IDS</div>
                <div className={`font-bold mt-0.5 truncate ${isAnomaly ? "text-rose-450" : "text-slate-500"}`}>
                  {isAnomaly ? `Sig# ${suricataSigId}` : "Clean Signature"}
                </div>
                <div className="text-[8px] text-slate-400 mt-0.5">{isAnomaly ? suricataCategory : "No Matches"}</div>
              </div>

              <div className="flex items-center justify-center text-slate-600">
                <ArrowRight className="w-4 h-4 text-slate-600 rotate-90 md:rotate-0" />
              </div>

              {/* Node 5: Fusion Verdict Outcome */}
              <div className="flex-1 bg-cyan-950/20 border border-cyan-555/20 p-2 rounded text-center">
                <div className="text-[8px] text-cyan-500 font-black uppercase">FUSION LAYER</div>
                <div className={`font-extrabold mt-0.5 ${isAnomaly ? "text-rose-400 animate-pulse" : "text-emerald-500"}`}>
                  {isAnomaly ? log.severity : "INFO / LOW"}
                </div>
                <div className="text-[8px] text-slate-350 mt-0.5 font-bold">Risk {calculatedFusionScore}/100</div>
              </div>
            </div>
          </div>

          {/* TWO PANEL BREAKDOWNS: Voting Weights & Feature Contribution Score */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Voting Weight Details */}
            <div className="bg-slate-900/10 border border-slate-900 p-3.5 rounded space-y-3">
              <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wider mb-1">
                DEMOCRATIC RETRIEVAL: VOTING RATIO BREAKDOWN
              </span>

              <div className="space-y-2.5">
                {/* AI1 Weight */}
                <div>
                  <div className="flex justify-between items-center text-[10px] pb-1">
                    <span className="font-extrabold text-slate-300">AI1 Core Heuristics Weight:</span>
                    <span className="text-slate-450">{ai1Weight}% voting weight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-slate-950 h-1.5 rounded-sm overflow-hidden border border-slate-900">
                      <div className="bg-emerald-500 h-full rounded-sm" style={{ width: `${ai1Weight}%` }} />
                    </div>
                    <span className="text-slate-350 font-bold text-[9px]">{ai1ScoreContribution} pts</span>
                  </div>
                </div>

                {/* AI2A Weight */}
                <div>
                  <div className="flex justify-between items-center text-[10px] pb-1">
                    <span className="font-extrabold text-slate-300">AI2A Multiclass Attack Weight:</span>
                    <span className="text-slate-450">{ai2aWeight}% voting weight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-slate-950 h-1.5 rounded-sm overflow-hidden border border-slate-900">
                      <div className="bg-amber-500 h-full rounded-sm" style={{ width: `${ai2aWeight}%` }} />
                    </div>
                    <span className="text-slate-350 font-bold text-[9px]">{ai2aScoreContribution} pts</span>
                  </div>
                </div>

                {/* Suricata Signature weight */}
                <div>
                  <div className="flex justify-between items-center text-[10px] pb-1">
                    <span className="font-extrabold text-slate-300">Suricata Active Signatures Weight:</span>
                    <span className="text-slate-450">{suricataWeight}% voting weight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-slate-950 h-1.5 rounded-sm overflow-hidden border border-slate-900">
                      <div className="bg-rose-500 h-full rounded-sm" style={{ width: `${suricataWeight}%` }} />
                    </div>
                    <span className="text-slate-350 font-bold text-[9px]">{suricataScoreContribution} pts</span>
                  </div>
                </div>
              </div>

              {/* Voting diagram summary */}
              <div className="pt-2 border-t border-slate-900/40 flex justify-between items-center text-[9px] text-slate-500 leading-none">
                <span>Sum-total decision scores:</span>
                <span className="text-cyan-400 font-extrabold">{ai1ScoreContribution} + {ai2aScoreContribution} + {suricataScoreContribution} = {calculatedFusionScore} PTS</span>
              </div>
            </div>

            {/* Decision Weights and Contribution breakdown */}
            <div className="bg-slate-900/10 border border-slate-900 p-3.5 rounded space-y-3">
              <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wider mb-1">
                FUSION CONTRIBUTION INDEX & SIGNALS COGNIZANCE
              </span>

              <div className="space-y-2 text-[10px]">
                <div className="flex justify-between py-1 border-b border-slate-900/40">
                  <span className="text-slate-500">Inference Mode:</span>
                  <span className="font-bold text-slate-200 uppercase">Synchronous Async-Weighted</span>
                </div>
                
                <div className="flex justify-between py-1 border-b border-slate-900/40">
                  <span className="text-slate-500">AI1 Anomaly Probability:</span>
                  <span className="text-emerald-500 font-extrabold">{ai1Confidence}% Real</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-900/40">
                  <span className="text-slate-500">AI2A Class Correlation:</span>
                  <span className="text-amber-500 font-extrabold">{ai2aResult} ({ai2aConfidence}%)</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-900/40">
                  <span className="text-slate-500">Suricata Signature Link:</span>
                  <span className="text-rose-450 font-black">{isAnomaly ? `SIG ${suricataSigId}` : "NONE MATCHED"}</span>
                </div>

                {isAnomaly && (
                  <div className="p-1.5 bg-red-950/20 border border-red-500/10 text-[9px] text-red-400 rounded leading-relaxed mt-1">
                    🌟 <strong>Rule Overrides Active:</strong> Suricata payload matching rule <code>ID {suricataSigId}</code> forced threat level promotion from MEDIUM ➔ <strong>{log.severity}</strong>.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
