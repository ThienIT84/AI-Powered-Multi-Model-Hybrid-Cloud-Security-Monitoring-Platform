import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Database, 
  Brain, 
  Cpu, 
  ShieldAlert, 
  Activity, 
  Flame, 
  ArrowRight,
  Info 
} from "lucide-react";
import { Alert, getAlertFusionMeta } from "../../../types";
import { cn } from "../../../lib/utils";

interface FusionFlowDiagramProps {
  alert: Alert;
}

export function FusionFlowDiagram({ alert }: FusionFlowDiagramProps) {
  const meta = getAlertFusionMeta(alert);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // States check
  const isAnomaly = meta.ai1Result === "ANOMALY";
  const hasSuricata = meta.suricataEvidence !== "NO MATCH";
  const hasWebThreat = meta.ai2bWeb !== "NONE";
  const hasTrafficThreat = meta.ai2aClass !== "Normal";

  const nodes = [
    {
      id: "zeek",
      label: "Zeek Ingestion",
      type: "ingest",
      icon: Database,
      colorClass: "border-cyan-500/40 bg-cyan-500/10 dark:bg-cyan-950/20 text-cyan-650 dark:text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]",
      textClass: "text-cyan-650 dark:text-cyan-400",
      glowing: false,
      status: alert.protocol,
      confidence: 1.0,
      description: "Extracts flow metadata & socket parameters",
      details: [
        `Protocol: ${alert.protocol}`,
        `Origin IP: ${alert.sourceIp}`,
        `Target Port: ${alert.destinationPort}`,
        `Timestamp: ${new Date(alert.timestamp).toLocaleTimeString()}`
      ]
    },
    {
      id: "ai1",
      label: "AI1 Behavioral",
      type: "model",
      icon: Brain,
      colorClass: isAnomaly 
        ? "border-red-500/40 bg-red-500/10 dark:bg-red-950/20 text-red-650 dark:text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]" 
        : "border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-950/10 text-emerald-650 dark:text-emerald-400",
      textClass: isAnomaly ? "text-red-650 dark:text-red-400" : "text-emerald-650 dark:text-emerald-400",
      glowing: isAnomaly,
      status: meta.ai1Result,
      confidence: 0.72 + (alert.riskScore * 0.0025),
      description: "Classifies connection behaviour anomalies",
      details: [
        `Verdict: ${meta.ai1Result}`,
        `Anomaly Threshold: 0.35`,
        `Extracted Score: ${(0.72 + (alert.riskScore * 0.0025)).toFixed(2)}`,
        "Algorithm: Deep Isolation Forest"
      ]
    },
    {
      id: "ai2a",
      label: "AI2A Multi-Class",
      type: "model",
      icon: Cpu,
      colorClass: hasTrafficThreat 
        ? "border-orange-500/40 bg-orange-500/10 dark:bg-orange-950/20 text-orange-650 dark:text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.15)]" 
        : "border-muted text-muted-foreground",
      textClass: hasTrafficThreat ? "text-orange-650 dark:text-orange-400" : "text-muted-foreground/60",
      glowing: hasTrafficThreat,
      status: meta.ai2aClass,
      confidence: alert.confidenceScore,
      description: "Identifies packet rate & structural attack profile",
      details: [
        `Category: ${meta.ai2aClass}`,
        `Model Confidence: ${(alert.confidenceScore * 100).toFixed(0)}%`,
        `Primary target port: ${alert.destinationPort}`,
        "Algorithm: Extreme Gradient Boosting"
      ]
    },
    {
      id: "ai2b",
      label: "AI2B Deep Payload",
      type: "model",
      icon: Cpu,
      colorClass: hasWebThreat
        ? "border-purple-500/40 bg-purple-500/10 dark:bg-purple-950/20 text-purple-650 dark:text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.15)]" 
        : "border-muted text-muted-foreground",
      textClass: hasWebThreat ? "text-purple-650 dark:text-purple-400" : "text-muted-foreground/60",
      glowing: hasWebThreat,
      status: meta.ai2bWeb,
      confidence: hasWebThreat ? 0.94 : 0.12,
      description: "Inspects HTTP parameters for code injections",
      details: [
        `Extracted Type: ${meta.ai2bWeb}`,
        `Regex Alignment: ${hasWebThreat ? "MATCHED" : "CLEAN"}`,
        `Inferred Score: ${hasWebThreat ? "0.94" : "0.00"}`,
        "Algorithm: Char-CNN Embeddings"
      ]
    },
    {
      id: "suricata",
      label: "Suricata Rule",
      type: "rule",
      icon: ShieldAlert,
      colorClass: hasSuricata
        ? "border-blue-500/40 bg-blue-500/10 dark:bg-blue-950/20 text-blue-650 dark:text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.15)]" 
        : "border-muted text-muted-foreground",
      textClass: hasSuricata ? "text-blue-650 dark:text-blue-400" : "text-muted-foreground/60",
      glowing: hasSuricata,
      status: hasSuricata ? "ID MATCH" : "BYPASSED",
      confidence: hasSuricata ? 1.0 : 0.0,
      description: "Executes static signature matches on packets",
      details: [
        `Evidence: ${meta.suricataEvidence}`,
        `Pattern Index: ${hasSuricata ? "HARD HIT" : "UNREGISTRABLE"}`,
        `Category: ${alert.suricataData?.category || "N/A"}`
      ]
    },
    {
      id: "fusion",
      label: "Fusion Engine",
      type: "fusion",
      icon: Flame,
      colorClass: "border-yellow-500 bg-yellow-500/10 dark:bg-yellow-950/35 text-yellow-600 dark:text-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.25)]",
      textClass: "text-yellow-600 dark:text-yellow-400",
      glowing: true,
      status: `RISK ${alert.riskScore}`,
      confidence: alert.confidenceScore * 0.9 + 0.1,
      description: "Decision-Level synthesis with weighted votes",
      details: [
        `Final Decision: ${meta.fusionDecision}`,
        `Fitted Risk Score: ${alert.riskScore}/100`,
        `Attribution Rate: ${Math.round((alert.confidenceScore * 0.9 + 0.1) * 100)}%`,
        `Assigned Severity: ${alert.severity}`
      ]
    }
  ];

  const activeNode = nodes.find(n => n.id === selectedNode) || nodes[nodes.length - 1];

  return (
    <div className="space-y-4">
      {/* 1. Header Row */}
      <div className="flex items-center justify-between select-none leading-none">
        <div>
          <span className="text-[8px] text-muted-foreground uppercase tracking-widest block font-black">
            DECISION TRACE MULTI-MODEL STREAM
          </span>
          <span className="text-[9.5px] font-black text-[#06b6d4] uppercase tracking-wider block mt-0.5">
            Realtime Fusion Data Processing Nodes
          </span>
        </div>
        <Activity size={14} className="text-cyan-500 animate-pulse" />
      </div>

      {/* 2. Layout Grid Map Wrapper */}
      <div className="bg-background/40 border border-border/70 rounded-xl p-4 relative overflow-hidden select-none">
        
        <div className="grid grid-cols-3 gap-3.5 relative z-10">
          {nodes.map((node, idx) => {
            const Icon = node.icon;
            const isSel = selectedNode === node.id || (selectedNode === null && node.id === "fusion");

            return (
              <div key={node.id} className="relative flex flex-col items-center">
                
                {/* Node Box card with motion animation */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedNode(node.id)}
                  className={cn(
                    "w-full h-15.5 border rounded-lg p-2 flex flex-col justify-between cursor-pointer transition-all border-dashed select-none relative group",
                    node.colorClass,
                    isSel ? "border-solid border-2" : "border-border"
                  )}
                >
                  <div className="flex justify-between items-start leading-none">
                    <span className="text-[7.5px] font-mono opacity-80 uppercase tracking-widest font-black">0{idx + 1}</span>
                    <Icon size={11} className={cn("shrink-0", node.glowing ? "text-cyan-500 animate-pulse" : "text-muted-foreground")} />
                  </div>

                  <div className="space-y-0.5 mt-2">
                    <span className="text-[8px] font-black uppercase text-foreground leading-none block truncate">{node.label}</span>
                    <span className={cn("text-[7.2px] font-mono font-black tracking-wider uppercase block leading-none", node.textClass)}>{node.status}</span>
                  </div>
                </motion.div>

                {/* Horizontal directed gap pointers for columns, avoiding the end of each row */}
                {(idx % 3 !== 2) && (
                  <ArrowRight size={10} className="text-muted-foreground/35 absolute -right-2.5 top-6.5 hidden md:block shrink-0 z-20" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Node Context Detail Overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeNode.id}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.12 }}
          className="p-3 bg-card border border-border/70 rounded-xl leading-normal space-y-2 relative shadow-inner"
        >
          <div className="flex items-center gap-2">
            <div className="p-1 px-1.5 text-[7.5px] font-mono font-extrabold border rounded bg-secondary uppercase text-muted-foreground">
              {activeNode.type} BLOCK
            </div>
            <span className="text-[9.5px] font-black text-foreground uppercase tracking-wide">
              {activeNode.label} Profile
            </span>
          </div>

          <p className="text-[8.5px] text-muted-foreground leading-normal font-medium">
            {activeNode.description} with calculated confidence weight of <span className="text-cyan-500 font-bold font-mono">{(activeNode.confidence * 100).toFixed(0)}%</span>.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[7.8px] font-mono pt-1 text-muted-foreground/90 uppercase font-bold">
            {activeNode.details.map((detail, keyIdx) => (
              <span key={keyIdx} className="bg-secondary/40 border border-border/50 px-2 py-0.5 rounded leading-none block truncate">
                - {detail}
              </span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
export default FusionFlowDiagram;
