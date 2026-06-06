import React, { useState, useRef, useEffect } from "react";
import { Database, Cpu, Scale, Shield, Network, ChevronRight, X, Play, Info, CheckSquare, Zap, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GraphColors } from "./types";
import { cn } from "../../lib/utils";

export interface PipelineVisualProps {
  setActiveTab: (tab: "overview" | "models" | "fusion" | "datasets") => void;
  graphColors: GraphColors;
}

interface NodeDetail {
  title: string;
  type: string;
  status: string;
  badge: string;
  badgeColor: string;
  description: string;
  metrics: { label: string; value: string }[];
  code: string;
  insight: string;
}

const NODE_DETAILS: Record<string, NodeDetail> = {
  conn: {
    title: "Zeek Connection Stream Ingress",
    type: "Ingress Traffic",
    status: "Active",
    badge: "Stream",
    badgeColor: "text-cyan-500 bg-cyan-500/10 border-cyan-500/25",
    description: "Ingests raw IP metadata and network protocol flows (TCP/UDP/ICMP), extracting session active durations, total payload byte transfers, and socket state characteristics in real-time.",
    metrics: [
      { label: "Throughput", value: "3,400 PPS" },
      { label: "Bandwidth", value: "125 Mbps" },
      { label: "Active Ports", value: "14,812 open" }
    ],
    code: `{\n  "timestamp": "1717658932.145",\n  "uid": "CHf7a13KOPm9fW",\n  "id.orig_h": "10.0.4.15",\n  "id.orig_p": 49210,\n  "id.resp_h": "192.168.1.100",\n  "id.resp_p": 443,\n  "proto": "tcp",\n  "duration": 0.082,\n  "orig_bytes": 1042,\n  "resp_bytes": 48122\n}`,
    insight: "Feeds directly into AI1 for rapid volumetric profiling and anomaly scoring."
  },
  http: {
    title: "Zeek HTTP Application Ingress",
    type: "Ingress Protocol",
    status: "Active",
    badge: "Stream",
    badgeColor: "text-cyan-500 bg-cyan-500/10 border-cyan-500/25",
    description: "Decodes Layer 7 HTTP traffic metrics, reconstructing request methods, target URI strings, serialized post-bodies, user-agent vectors, and HTTP response headers.",
    metrics: [
      { label: "Requests Avg", value: "980 Req/s" },
      { label: "Success Ratio", value: "85% (200 OK)" },
      { label: "SSL Coverage", value: "99.1% HTTPS" }
    ],
    code: `{\n  "method": "POST",\n  "host": "api.cloud.services.internal",\n  "uri": "/v2/auth/login",\n  "referrer": "https://dashboard.internal",\n  "user_agent": "Mozilla/5.0 (X11; Linux x86_64)",\n  "payload": "user=admin' UNION SELECT ALL NULL--"\n}`,
    insight: "Monitored closely by AI2B for Web Injection, evasion scripts, and semantic parameter anomalies."
  },
  suricata: {
    title: "Suricata Signature Intrusion Engine",
    type: "Rule Engine",
    status: "Active",
    badge: "Deterministic",
    badgeColor: "text-amber-500 bg-amber-500/10 border-amber-500/25",
    description: "Evaluates raw packet attributes against tens of thousands of known malicious signatures. Acts as a baseline filter for identified payloads and CVE exploitation vectors.",
    metrics: [
      { label: "Rules Loaded", value: "10,488 active" },
      { label: "Bypass Ratio", value: "0.24% low" },
      { label: "Alert Latency", value: "1.15ms avg" }
    ],
    code: `alert http $EXTERNAL_NET any -> $HTTP_SERVERS any (\n  msg:"ET WEB_SERVER SQL Injection Attempt";\n  flow:established,to_server;\n  content:"UNION"; nocase;\n  sid:2018591; rev:5;\n)`,
    insight: "Outputs instant hard deterministic alerts directly to the Bayesian Fusion Consensus layer."
  },
  ai1: {
    title: "AI1: Network Anomaly Engine",
    type: "Isolation Forest Model",
    status: "Active",
    badge: "Cognitive",
    badgeColor: "text-cyan-500 bg-cyan-500/10 border-cyan-500/25",
    description: "Estimates anomaly probability by recursively partitioning feature domains. Focuses on packet volumes, session densities, and rate deviations to identify brand new vectors.",
    metrics: [
      { label: "Accuracy AUC", value: "0.942 index" },
      { label: "Dataset Split", value: "385K Samples" },
      { label: "Inference Latency", value: "18 ms avg" }
    ],
    code: `model = IsolationForest(\n  n_estimators=150,\n  contamination=0.05,\n  random_state=42\n)\nprediction = model.fit_predict(X_scaled)`,
    insight: "Pipes real-time continuous anomaly percentages to the Bayesian Fusion layer."
  },
  ai2a: {
    title: "AI2A: Network Attack Classifier",
    type: "XGBoost Multiclass Model",
    status: "Active",
    badge: "Cognitive",
    badgeColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/25",
    description: "Analyzes anomaly logs to classify threats into multiclass attack signatures. Resolves the precise nature of the scan, brute-force, or intrusion action.",
    metrics: [
      { label: "F1-Score", value: "0.967 optimized" },
      { label: "Max Depth", value: "6 trees" },
      { label: "Inference Latency", value: "24 ms avg" }
    ],
    code: `xgb_model = XGBClassifier(\n  max_depth=6,\n  learning_rate=0.08,\n  objective='multi:softprob'\n)\nprobs = xgb_model.predict_proba(X_test)`,
    insight: "Feeds multiclass probability estimations to the consensus matrix."
  },
  ai2b: {
    title: "AI2B: HTTP Semantic Query score",
    type: "Char-CNN Neural Model",
    status: "Active",
    badge: "Cognitive",
    badgeColor: "text-violet-500 bg-violet-500/10 border-violet-500/25",
    description: "Evaluates GET and POST parameters on a character level. Uses deep embedding spaces to extract semantic meaning, effectively identifying SQLi, XSS, and command injections.",
    metrics: [
      { label: "F1-Score", value: "0.981 high" },
      { label: "Char Vocabulary", value: "128 tokens" },
      { label: "Inference Latency", value: "22 ms avg" }
    ],
    code: `char_embedding = Embedding(\n  input_dim=128,\n  output_dim=32\n)\nsemantic_score = CharCNNModel.predict(uri_string)`,
    insight: "Checks parameter blocks recursively on administrative web gateways."
  },
  fusion: {
    title: "Bayesian Fusion Consensus Core",
    type: "Joint Probability Optimizer",
    status: "Active",
    badge: "Optimizer",
    badgeColor: "text-yellow-500 bg-yellow-500/10 border-yellow-500/25",
    description: "Applies Bayesian joint distribution theory to combine probability weights from AI1, AI2A, AI2B, and Suricata rules. Controls for individual model biases and reduces false alarms by 38.4%.",
    metrics: [
      { label: "FP Reduction", value: "38.4% filtered" },
      { label: "Processing Latency", value: "4 ms avg" },
      { label: "Consensus Rate", value: "94.2% confident" }
    ],
    code: `p_threat = (p_ai1 * p_ai2a * p_ai2b * p_suri_alert) \\\n  / (evidence_normalization_constant)\nif p_threat > threshold:\n  trigger_dispatcher_alert()`,
    insight: "Adjusts consensus thresholds dynamically using analyst verification inputs."
  },
  dispatch: {
    title: "SOC Dispatch Alert Output Queue",
    type: "Event Dispatcher",
    status: "Active",
    badge: "Outflow",
    badgeColor: "text-rose-500 bg-rose-500/10 border-rose-500/25",
    description: "Translates high-risk consensus alerts into standard JSON structures mapped to the MITRE ATT&CK framework, sending priority tickets straight to active analyst consoles.",
    metrics: [
      { label: "Dispatch Min High", value: "Risk >85%" },
      { label: "Avg Load Time", value: "112ms sync" },
      { label: "Output Format", value: "STIX / JSON" }
    ],
    code: `{\n  "event_type": "FUSION_ALIGNED_ALERT",\n  "severity": "Critical",\n  "mitre_id": "T1190",\n  "action": "AUTOMATED_PLAYBOOK_BLOCK_IP",\n  "status": "Awaiting_Manual_Review"\n}`,
    insight: "Connected straight into playbooks to block or quarantine hostile IPs."
  }
};

export function PipelineVisual({ setActiveTab, graphColors }: PipelineVisualProps) {
  // Start with 'fusion' open by default so the fly-out panel is immediately visible!
  const [activeNodeId, setActiveNodeId] = useState<string>("fusion");

  const detail = activeNodeId ? NODE_DETAILS[activeNodeId] : null;

  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<Record<string, { x1: number; y1: number; x2: number; y2: number }>>({});

  useEffect(() => {
    const updateCoords = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();

      const getRightMiddle = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          x: rect.right - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top
        };
      };

      const getLeftMiddle = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top
        };
      };

      const getBottomMiddle = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.bottom - containerRect.top
        };
      };

      const getTopMiddle = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top - containerRect.top
        };
      };

      const connR = getRightMiddle("btn-conn");
      const httpR = getRightMiddle("btn-http");
      const suriR = getRightMiddle("btn-suricata");
      const ai1L = getLeftMiddle("btn-ai1");
      const ai1R = getRightMiddle("btn-ai1");
      const ai2aL = getLeftMiddle("btn-ai2a");
      const ai2aR = getRightMiddle("btn-ai2a");
      const ai2bL = getLeftMiddle("btn-ai2b");
      const ai2bR = getRightMiddle("btn-ai2b");
      const fusionL = getLeftMiddle("btn-fusion");
      const fusionBottom = getBottomMiddle("btn-fusion");
      const dispatchTop = getTopMiddle("btn-dispatch");

      const newCoords: Record<string, { x1: number; y1: number; x2: number; y2: number }> = {};

      if (connR && ai1L) newCoords.conn_ai1 = { x1: connR.x, y1: connR.y, x2: ai1L.x, y2: ai1L.y };
      if (connR && ai2aL) newCoords.conn_ai2a = { x1: connR.x, y1: connR.y, x2: ai2aL.x, y2: ai2aL.y };
      if (httpR && ai2bL) newCoords.http_ai2b = { x1: httpR.x, y1: httpR.y, x2: ai2bL.x, y2: ai2bL.y };
      if (suriR && fusionL) newCoords.suri_fusion = { x1: suriR.x, y1: suriR.y, x2: fusionL.x, y2: fusionL.y };
      if (ai1R && fusionL) newCoords.ai1_fusion = { x1: ai1R.x, y1: ai1R.y, x2: fusionL.x, y2: fusionL.y };
      if (ai2aR && fusionL) newCoords.ai2a_fusion = { x1: ai2aR.x, y1: ai2aR.y, x2: fusionL.x, y2: fusionL.y };
      if (ai2bR && fusionL) newCoords.ai2b_fusion = { x1: ai2bR.x, y1: ai2bR.y, x2: fusionL.x, y2: fusionL.y };
      if (fusionBottom && dispatchTop) newCoords.fusion_dispatch = { x1: fusionBottom.x, y1: fusionBottom.y, x2: dispatchTop.x, y2: dispatchTop.y };

      setCoords(newCoords);
    };

    updateCoords();

    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      updateCoords();
    });
    observer.observe(containerRef.current);

    window.addEventListener("resize", updateCoords);

    // Dynamic animation loops during 300ms transition updates (e.g. details panel toggle)
    const startTime = Date.now();
    const runAnimation = () => {
      updateCoords();
      if (Date.now() - startTime < 450) {
        requestAnimationFrame(runAnimation);
      }
    };
    runAnimation();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateCoords);
    };
  }, [activeNodeId]);

  const getBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.max(16, Math.abs(x2 - x1) * 0.45);
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  };

  const getVerticalPath = (x1: number, y1: number, x2: number, y2: number) => {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden animate-fadeIn leading-normal text-foreground">
      {/* SVG Animation Definitions */}
      <style>{`
        @keyframes flowOffset {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-flow-line {
          stroke-dasharray: 6, 4;
          animation: flowOffset 1.5s linear infinite;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Network className="text-cyan-500 animate-pulse" size={16} />
          <h3 className="text-xs font-black uppercase tracking-wider">
            Hybrid Multi-Model Ensemble Threat Pipeline Diagram
          </h3>
        </div>
        <div className="flex items-center gap-1 text-[8.5px] font-mono text-muted-foreground uppercase">
          <span>Click any node to inspect telemetry metrics</span>
        </div>
      </div>

      {/* Responsive layout wrapper */}
      <div className="flex flex-col lg:flex-row gap-5 items-stretch relative">
        
        {/* LEFT: Pipeline Columns layout */}
        <div ref={containerRef} className={cn("transition-all duration-300 relative py-4", activeNodeId ? "w-full lg:w-[62%]" : "w-full")}>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 relative z-10 px-3">
            
            {/* COLUMN 1: INGESTION LOG SOURCES */}
            <div className="flex flex-col justify-between h-full space-y-2">
              <div className="text-[9px] font-mono font-black uppercase tracking-widest text-muted-foreground border-b border-border/60 pb-1 flex items-center gap-1.5 mb-1 px-2 h-6 shrink-0">
                <Database size={10} className="text-cyan-500" /> Log Sources
              </div>
              
              {/* Row 1 Slot */}
              <div className="flex-1 flex flex-col justify-center py-1.5 min-h-23">
                {/* Zeek conn.log */}
                <button
                  id="btn-conn"
                  onClick={() => setActiveNodeId("conn")}
                  className={cn(
                    "w-[75%] mx-auto text-left bg-zinc-50 dark:bg-zinc-900 border transition-all rounded-lg p-2.5 relative shadow-xs pointer-events-auto cursor-pointer",
                    activeNodeId === "conn" ? "border-cyan-500 ring-2 ring-cyan-500/20" : "border-border hover:border-cyan-500/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-mono font-black text-foreground">conn.log</h4>
                    <span className="text-[7px] font-mono text-cyan-500 bg-cyan-500/10 px-1 rounded-sm font-bold uppercase border border-cyan-500/10">Stream</span>
                  </div>
                  <div className="flex justify-between items-center mt-1.5 font-mono text-[8px] text-muted-foreground">
                    <div>Status: <span className="text-emerald-500 font-bold uppercase">Active</span></div>
                    <div>Rate: <span className="text-foreground font-black">3.4K/s</span></div>
                  </div>
                </button>
              </div>

              {/* Row 2 Slot */}
              <div className="flex-1 flex flex-col justify-center py-1.5 min-h-23">
                {/* Zeek http.log */}
                <button
                  id="btn-http"
                  onClick={() => setActiveNodeId("http")}
                  className={cn(
                    "w-[75%] mx-auto text-left bg-zinc-50 dark:bg-zinc-900 border transition-all rounded-lg p-2.5 relative shadow-xs pointer-events-auto cursor-pointer",
                    activeNodeId === "http" ? "border-cyan-500 ring-2 ring-cyan-500/20" : "border-border hover:border-cyan-500/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-mono font-black text-foreground">http.log</h4>
                    <span className="text-[7px] font-mono text-cyan-500 bg-cyan-500/10 px-1 rounded-sm font-bold uppercase border border-cyan-500/10">Stream</span>
                  </div>
                  <div className="flex justify-between items-center mt-1.5 font-mono text-[8px] text-muted-foreground">
                    <div>Status: <span className="text-emerald-500 font-bold uppercase">Active</span></div>
                    <div>Rate: <span className="text-foreground font-black">980/s</span></div>
                  </div>
                </button>
              </div>

              {/* Row 3 Slot */}
              <div className="flex-1 flex flex-col justify-center py-1.5 min-h-23">
                {/* Suricata Evidence */}
                <button
                  id="btn-suricata"
                  onClick={() => setActiveNodeId("suricata")}
                  className={cn(
                    "w-[75%] mx-auto text-left bg-zinc-50 dark:bg-zinc-900 border transition-all rounded-lg p-2.5 relative shadow-xs pointer-events-auto cursor-pointer",
                    activeNodeId === "suricata" ? "border-amber-500 ring-2 ring-amber-500/20" : "border-border hover:border-amber-500/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-mono font-black text-foreground">Suricata Rules</h4>
                    <span className="text-[7px] font-mono text-amber-500 bg-amber-500/10 px-1 rounded-sm font-bold uppercase border border-amber-500/10">Sigs</span>
                  </div>
                  <div className="flex justify-between items-center mt-1.5 font-mono text-[8px] text-muted-foreground">
                    <div>Status: <span className="text-emerald-500 font-bold uppercase">Sensing</span></div>
                    <div>Base: <span className="text-foreground font-black">10.4K Sigs</span></div>
                  </div>
                </button>
              </div>
            </div>

            {/* COLUMN 2: COGNITIVE DEEP DETECTORS */}
            <div className="flex flex-col justify-between h-full space-y-2 border-r border-l border-border/50 px-3">
              <div className="text-[9px] font-mono font-black uppercase tracking-widest text-muted-foreground border-b border-border/60 pb-1 flex items-center gap-1.5 mb-1 px-2 h-6 shrink-0">
                <Cpu size={10} className="text-cyan-500" /> AI Classifiers
              </div>

              {/* Row 1 Slot */}
              <div className="flex-1 flex flex-col justify-center py-1.5 min-h-23">
                {/* AI1 Network Anomaly */}
                <button
                  id="btn-ai1"
                  onClick={() => {
                    setActiveNodeId("ai1");
                    setActiveTab("models");
                  }}
                  className={cn(
                    "w-[75%] mx-auto text-left bg-zinc-50 dark:bg-zinc-900 border transition-all rounded-lg p-2.5 relative shadow-xs pointer-events-auto cursor-pointer",
                    activeNodeId === "ai1" ? "border-cyan-500 ring-2 ring-cyan-500/20" : "border-border hover:border-cyan-500/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-mono font-black text-foreground flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping" />
                      AI1 Anomaly
                    </h4>
                    <span className="text-[6.5px] font-mono text-rose-500 bg-rose-500/10 px-1 rounded-sm font-black uppercase">IsoForest</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-1.5 font-mono text-[7.5px] text-muted-foreground">
                    <div>Latency: <span className="text-foreground font-bold">18ms</span></div>
                    <div>Count: <span className="text-foreground font-bold">52K</span></div>
                  </div>
                </button>
              </div>

              {/* Row 2 Slot */}
              <div className="flex-1 flex flex-col justify-center py-1.5 min-h-23">
                {/* AI2A Network Attack Classifier */}
                <button
                  id="btn-ai2a"
                  onClick={() => {
                    setActiveNodeId("ai2a");
                    setActiveTab("models");
                  }}
                  className={cn(
                    "w-[75%] mx-auto text-left bg-zinc-50 dark:bg-zinc-900 border transition-all rounded-lg p-2.5 relative shadow-xs pointer-events-auto cursor-pointer",
                    activeNodeId === "ai2a" ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-border hover:border-emerald-500/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-mono font-black text-foreground flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      AI2A Classifier
                    </h4>
                    <span className="text-[6.5px] font-mono text-emerald-500 bg-emerald-500/10 px-1 rounded-sm font-black uppercase">XGBoost</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-1.5 font-mono text-[7.5px] text-muted-foreground">
                    <div>Latency: <span className="text-foreground font-bold">24ms</span></div>
                    <div>Count: <span className="text-foreground font-bold">49K</span></div>
                  </div>
                </button>
              </div>

              {/* Row 3 Slot */}
              <div className="flex-1 flex flex-col justify-center py-1.5 min-h-23">
                {/* AI2B HTTP Semantic Detector */}
                <button
                  id="btn-ai2b"
                  onClick={() => {
                    setActiveNodeId("ai2b");
                    setActiveTab("models");
                  }}
                  className={cn(
                    "w-[75%] mx-auto text-left bg-zinc-50 dark:bg-zinc-900 border transition-all rounded-lg p-2.5 relative shadow-xs pointer-events-auto cursor-pointer",
                    activeNodeId === "ai2b" ? "border-violet-500 ring-2 ring-violet-500/20" : "border-border hover:border-violet-500/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-mono font-black text-foreground flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
                      AI2B Semantic
                    </h4>
                    <span className="text-[6.5px] font-mono text-violet-500 bg-violet-500/10 px-1 rounded-sm font-black uppercase">CharCNN</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-1.5 font-mono text-[7.5px] text-muted-foreground">
                    <div>Latency: <span className="text-foreground font-bold">22ms</span></div>
                    <div>Count: <span className="text-foreground font-bold">51K</span></div>
                  </div>
                </button>
              </div>
            </div>

            {/* COLUMN 3: ENSEMBLE FUSION LAYER */}
            <div className="flex flex-col justify-between h-full space-y-2">
              <div className="text-[9px] font-mono font-black uppercase tracking-widest text-muted-foreground border-b border-border/60 pb-1 flex items-center gap-1.5 mb-1 px-2 h-6 shrink-0">
                <Scale size={10} className="text-cyan-500" /> Fusion Decision
              </div>

              {/* Row 1 Slot: Empty layout block to perfectly align Bayesian Fusion with row 2 of pipelines */}
              <div className="flex-1 flex-col justify-center py-1.5 min-h-23 hidden md:flex" />

              {/* Row 2 Slot */}
              <div className="flex-1 flex flex-col justify-center py-1.5 min-h-23">
                {/* Bayesian Fusion Core */}
                <button
                  id="btn-fusion"
                  onClick={() => setActiveNodeId("fusion")}
                  className={cn(
                    "w-[75%] mx-auto text-left bg-amber-500/5 dark:bg-zinc-900/40 border transition-all rounded-xl p-2 relative shadow-md pointer-events-auto cursor-pointer",
                    activeNodeId === "fusion" ? "border-amber-500 ring-2 ring-amber-500/35 shadow-[0_0_12px_rgba(245,158,11,0.2)]" : "border-amber-500/50 hover:border-amber-500"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-[10px] font-mono font-black text-amber-600 dark:text-cyan-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(234,179,8,0.6)]" />
                      Bayesian Fusion
                    </h4>
                    <span className="text-[6.5px] font-mono text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 px-1 rounded-sm font-black uppercase">Consensus</span>
                  </div>
                  <p className="text-[7.5px] text-muted-foreground leading-normal font-mono mb-1.5">Weighs joint distributions to filter False Positives.</p>
                  <div className="flex justify-between items-center pt-1.5 border-t border-border/50 font-mono text-[8px] text-muted-foreground">
                    <div>FP Filter: <span className="text-cyan-500 font-bold">-38%</span></div>
                    <div>Latency: <span className="text-foreground font-black">4ms</span></div>
                  </div>
                </button>
              </div>

              {/* Row 3 Slot */}
              <div className="flex-1 flex flex-col justify-center py-1.5 min-h-23">
                {/* Dispatcher Alert Output */}
                <button
                  id="btn-dispatch"
                  onClick={() => setActiveNodeId("dispatch")}
                  className={cn(
                    "w-[75%] mx-auto text-left bg-zinc-50 dark:bg-zinc-900 border transition-all rounded-lg p-2 relative shadow-xs pointer-events-auto cursor-pointer",
                    activeNodeId === "dispatch" ? "border-rose-500 ring-2 ring-rose-500/20" : "border-border hover:border-rose-500/50"
                  )}
                >
                  <div className="flex items-center gap-1 text-rose-500 font-black">
                    <Shield size={11} />
                    <h4 className="text-[10px] font-mono">MITRE Dispatch</h4>
                  </div>
                  <div className="flex justify-between items-center mt-1.5 font-mono text-[8px] text-muted-foreground">
                    <div>Queue: <span className="text-emerald-500 font-bold uppercase">Normal</span></div>
                    <div>Mitre: <span className="text-foreground font-black">T1190</span></div>
                  </div>
                </button>
              </div>
            </div>

          </div>

          {/* HIGH CONTRAST STREAMING CONNECTING SVG (only md and up) */}
          <div className="absolute inset-0 hidden md:block pointer-events-none z-0">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {coords.conn_ai1 && (
                <path d={getBezierPath(coords.conn_ai1.x1, coords.conn_ai1.y1, coords.conn_ai1.x2, coords.conn_ai1.y2)} fill="none" stroke={graphColors.cyan} strokeWidth="1.2" className="animate-flow-line stroke-cyan-500 dark:stroke-cyan-400" />
              )}
              {coords.conn_ai2a && (
                <path d={getBezierPath(coords.conn_ai2a.x1, coords.conn_ai2a.y1, coords.conn_ai2a.x2, coords.conn_ai2a.y2)} fill="none" stroke={graphColors.cyan} strokeWidth="1.2" className="animate-flow-line stroke-cyan-500 dark:stroke-cyan-400" />
              )}
              {coords.http_ai2b && (
                <path d={getBezierPath(coords.http_ai2b.x1, coords.http_ai2b.y1, coords.http_ai2b.x2, coords.http_ai2b.y2)} fill="none" stroke={graphColors.violet} strokeWidth="1.2" className="animate-flow-line stroke-violet-500 dark:stroke-violet-400" />
              )}
              {coords.suri_fusion && (
                <path d={getBezierPath(coords.suri_fusion.x1, coords.suri_fusion.y1, coords.suri_fusion.x2, coords.suri_fusion.y2)} fill="none" stroke={graphColors.amber} strokeWidth="1.2" className="animate-flow-line stroke-amber-500 dark:stroke-amber-400" />
              )}
              {coords.ai1_fusion && (
                <path d={getBezierPath(coords.ai1_fusion.x1, coords.ai1_fusion.y1, coords.ai1_fusion.x2, coords.ai1_fusion.y2)} fill="none" stroke={graphColors.cyan} strokeWidth="1.2" className="stroke-cyan-500 dark:stroke-cyan-400" />
              )}
              {coords.ai2a_fusion && (
                <path d={getBezierPath(coords.ai2a_fusion.x1, coords.ai2a_fusion.y1, coords.ai2a_fusion.x2, coords.ai2a_fusion.y2)} fill="none" stroke={graphColors.emerald} strokeWidth="1.2" className="stroke-emerald-500 dark:stroke-emerald-400" />
              )}
              {coords.ai2b_fusion && (
                <path d={getBezierPath(coords.ai2b_fusion.x1, coords.ai2b_fusion.y1, coords.ai2b_fusion.x2, coords.ai2b_fusion.y2)} fill="none" stroke={graphColors.violet} strokeWidth="1.2" className="stroke-violet-500 dark:stroke-violet-400" />
              )}
              {coords.fusion_dispatch && (
                <path d={getVerticalPath(coords.fusion_dispatch.x1, coords.fusion_dispatch.y1, coords.fusion_dispatch.x2, coords.fusion_dispatch.y2)} fill="none" stroke={graphColors.red} strokeWidth="2" className="animate-flow-line stroke-rose-500 dark:stroke-rose-400" />
              )}
            </svg>
          </div>

        </div>

        {/* RIGHT: Selected Node Detail Panel with sleek sliding animation */}
        <AnimatePresence mode="wait">
          {detail && (
            <motion.div
              key={activeNodeId}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full lg:w-[38%] bg-zinc-50/70 dark:bg-zinc-900/60 border border-border rounded-xl p-4 flex flex-col justify-between font-sans shadow-sm backdrop-blur-md relative"
            >
              {/* Close panel */}
              <button 
                onClick={() => setActiveNodeId("")}
                className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-rose-500 rounded-md transition-all border-none bg-transparent cursor-pointer"
                title="Collapse Panel"
              >
                <X size={14} />
              </button>

              {/* Content */}
              <div className="space-y-4">
                {/* ID Header */}
                <div className="flex items-center gap-2">
                  <span className={cn("text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded border", detail.badgeColor)}>
                    {detail.badge}
                  </span>
                  <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase">
                    Status: {detail.status}
                  </span>
                </div>

                {/* Node title */}
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-800 dark:text-zinc-100">{detail.title}</h4>
                  <span className="text-[8.5px] font-mono text-muted-foreground uppercase">{detail.type}</span>
                </div>

                {/* Descriptive text */}
                <p className="text-[10px] text-muted-foreground leading-relaxed">{detail.description}</p>

                {/* Real-time KPI micro indicators */}
                <div className="grid grid-cols-3 gap-2 py-2">
                  {detail.metrics.map((m, idx) => (
                    <div key={idx} className="bg-background border border-border/60 p-2 rounded-lg text-center">
                      <span className="text-[7.5px] text-muted-foreground font-mono block uppercase">{m.label}</span>
                      <strong className="text-[9.5px] text-foreground font-mono font-black block mt-1">{m.value}</strong>
                    </div>
                  ))}
                </div>

                {/* Dynamic mini block code snippet */}
                <div className="space-y-1.5">
                  <span className="text-[8.5px] font-black uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1">
                    <Info size={9.5} /> Cognitive Telemetry Structure
                  </span>
                  <pre className="text-[8px] font-mono text-muted-foreground bg-zinc-100 dark:bg-black/30 p-2 rounded-lg overflow-x-auto max-h-36 border border-border/40 leading-relaxed">
                    {detail.code}
                  </pre>
                </div>
              </div>

              {/* Bottom Insight action */}
              <div className="mt-4 pt-3 flex items-center gap-2 bg-amber-500/5 p-2 rounded-lg border border-amber-500/20 text-[8.5px] font-mono text-amber-700 dark:text-amber-300">
                <Zap size={11} className="shrink-0 animate-bounce" />
                <span>
                  <strong>Insight:</strong> {detail.insight}
                </span>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
