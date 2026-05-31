import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Database, 
  Brain, 
  Cpu, 
  ShieldAlert, 
  Flame, 
  ArrowRight,
  Activity,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  TrendingUp
} from "lucide-react";
import { Alert, getAlertFusionMeta } from "../../types";
import { cn } from "../../lib/utils";

interface FusionDecisionFlowProps {
  alert: Alert;
}

export function FusionDecisionFlow({ alert }: FusionDecisionFlowProps) {
  const meta = getAlertFusionMeta(alert);
  const [activeNode, setActiveNode] = useState<string | null>(null);

  // Derive stable predictions and weights based on attack types and severity
  const isAnomaly = meta.ai1Result === "ANOMALY";
  const hasSuricata = meta.suricataEvidence !== "NO MATCH";
  const isWebUrl = alert.attackType.includes("XSS") || alert.attackType.includes("SQL") || alert.attackType.includes("Injection");

  // Multi-model nodes configuration
  const nodes = [
    {
      id: "zeek",
      label: "Zeek (conn.log / http.log)",
      prediction: isWebUrl ? "Web Traffic Logged" : "Network Flow Ingested",
      confidence: "100%",
      contribution: "Ingestion Base",
      status: "ACTIVE",
      colorClass: "border-cyan-500/50 bg-cyan-950/20 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]",
      icon: Database,
      details: [
        `Source Host: ${alert.sourceIp}`,
        `Destination Host: ${alert.destinationIp || "10.0.12.15"}`,
        `Payload Buffer Size: ${alert.payload?.length || alert.rawPayload?.length || 1024} bytes`,
        `Protocol state: ${alert.protocol}`
      ]
    },
    {
      id: "ai1",
      label: "AI1 Anomaly Model",
      prediction: meta.ai1Result,
      confidence: isAnomaly ? "91%" : "96%",
      contribution: "25% Weight",
      status: isAnomaly ? "TRIGGERED" : "CLEAN",
      colorClass: isAnomaly 
        ? "border-red-500/50 bg-red-950/30 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]" 
        : "border-emerald-500/50 bg-emerald-950/20 text-emerald-400",
      icon: Brain,
      details: [
        `Algorithm: Deep Isolation Forest`,
        `Extracted Score: ${isAnomaly ? "0.82" : "0.08"}`,
        `Threshold: s >= 0.35`,
        `Result Influence: Critical`
      ]
    },
    {
      id: "ai2a",
      label: "AI2A Flow Attack Classifier",
      prediction: meta.ai2aClass,
      confidence: meta.ai2aClass !== "Normal" ? "89%" : "94%",
      contribution: "30% Weight",
      status: meta.ai2aClass !== "Normal" ? "TRIGGERED" : "CLEAN",
      colorClass: meta.ai2aClass !== "Normal"
        ? "border-orange-500/50 bg-orange-950/30 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.15)]"
        : "border-emerald-500/50 bg-emerald-950/20 text-emerald-400",
      icon: Cpu,
      details: [
        `Algorithm: Extreme Gradient Boosting (XGBoost)`,
        `Determined Class: ${meta.ai2aClass}`,
        `Primary target port: ${alert.destinationPort}`,
        `Confidence Multiplier: ${alert.confidenceScore.toFixed(2)}`
      ]
    },
    {
      id: "ai2b",
      label: "AI2B Web Attack Classifier",
      prediction: meta.ai2bWeb,
      confidence: meta.ai2bWeb !== "NONE" ? "92%" : "98%",
      contribution: "25% Weight",
      status: meta.ai2bWeb !== "NONE" ? "TRIGGERED" : "CLEAN",
      colorClass: meta.ai2bWeb !== "NONE"
        ? "border-purple-500/50 bg-purple-950/35 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
        : "border-emerald-500/50 bg-emerald-950/10 text-emerald-400",
      icon: Cpu,
      details: [
        `Algorithm: Character-level CNN Embeddings`,
        `Identified Web Attack: ${meta.ai2bWeb}`,
        `Matched HTTP patterns: ${meta.ai2bWeb !== "NONE" ? "SQLi/XSS token hits" : "unmatched"}`,
        `Payload character entropy: High`
      ]
    },
    {
      id: "suricata",
      label: "Suricata Signature Intrusion Matcher",
      prediction: hasSuricata ? meta.suricataEvidence : "No Static Match",
      confidence: hasSuricata ? "95%" : "0%",
      contribution: hasSuricata ? "20% Weight" : "Bypassed Weight",
      status: hasSuricata ? "MATCHED" : "CLEAN",
      colorClass: hasSuricata
        ? "border-blue-500/50 bg-blue-950/30 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
        : "border-muted text-muted-foreground bg-card/10",
      icon: ShieldAlert,
      details: [
        `Suricata Evidence Code: ${meta.suricataEvidence}`,
        `Pattern Index: ${hasSuricata ? "Signature Hit" : "unmatched"}`,
        `Category: ${alert.suricataData?.category || "N/A"}`
      ]
    },
    {
      id: "fusion",
      label: "Consolidated Fusion Layer",
      prediction: meta.fusionDecision,
      confidence: `${(alert.confidenceScore * 100).toFixed(0)}%`,
      contribution: "Synthesis Consensus",
      status: alert.severity === "Critical" ? "CRITICAL ALERT" : "ALERT CONFIRMED",
      colorClass: alert.severity === "Critical"
        ? "border-red-500 bg-red-950/50 text-red-500 shadow-[0_0_16px_rgba(239,68,68,0.3)] animate-pulse"
        : "border-cyan-500 bg-cyan-950/40 text-cyan-500 shadow-[0_0_16px_rgba(6,182,212,0.25)]",
      icon: Flame,
      details: [
        `Fitted Risk Score: ${alert.riskScore}/100`,
        `Calculated Consensus Severity: ${alert.severity}`,
        `Consensus Verdict: ${alert.attackType}`,
        `Attack Campaign ID: CAMP-${alert.attackType.slice(0,3).toUpperCase()}`
      ]
    }
  ];

  const activeNodeData = nodes.find(n => n.id === activeNode) || nodes[nodes.length - 1];

  return (
    <div className="space-y-4">
      {/* Target 11. Flow Diagram header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[7.5px] font-black text-muted-foreground uppercase tracking-[0.2em] block">
            FISSION TO FUSION LAYER TRACE
          </span>
          <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-wider block mt-0.5">
            Active Multi-Model Pipeline Decision Path
          </h3>
        </div>
        <Activity size={12} className="text-cyan-500 animate-pulse" />
      </div>

      {/* Decision Path Graphical Nodes */}
      <div className="bg-secondary/10 border border-border/50 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-1.5 overflow-hidden">
        {nodes.map((node, index) => {
          const NodeIcon = node.icon;
          const isSelected = activeNode === node.id || (activeNode === null && node.id === "fusion");

          return (
            <React.Fragment key={node.id}>
              {/* Graphical Box representing the decision step */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveNode(node.id)}
                className={cn(
                  "flex-1 w-full md:w-auto h-19.5 border rounded-lg p-2 flex flex-col justify-between transition-all cursor-pointer relative select-none",
                  node.colorClass,
                  isSelected ? "border-solid border-2 ring-1 ring-cyan-500/20" : "border-dashed"
                )}
              >
                <div className="flex justify-between items-start leading-none gap-1">
                  <span className="text-[7px] font-mono font-bold uppercase tracking-wider text-muted-foreground/60">0{index + 1}</span>
                  <NodeIcon className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-cyan-500 animate-pulse" : "text-muted-foreground")} />
                </div>

                <div className="space-y-0.5 min-w-0">
                  <span className="text-[7.5px] font-black uppercase text-foreground truncate block">{node.label}</span>
                  <div className="flex items-center justify-between mt-1 text-[7px] leading-none">
                    <span className="font-mono text-[7px] font-black uppercase truncate text-cyan-400">{node.prediction}</span>
                    <span className="font-mono text-[7px] font-bold text-muted-foreground/90 shrink-0 ml-1">({node.confidence})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[6.5px] uppercase font-bold text-muted-foreground/80 leading-none mt-1 pt-1 border-t border-border/20">
                  <span>Contrib: {node.contribution}</span>
                  <span className={cn(
                    "font-mono font-extrabold text-[6.5px]",
                    node.status.includes("TRIGGERED") || node.status.includes("CRITICAL") ? "text-red-500" : "text-emerald-500"
                  )}>{node.status}</span>
                </div>
              </motion.div>

              {/* Connecting point pointer */}
              {index < nodes.length - 1 && (
                <ArrowRight size={12} className="text-muted-foreground/25 md:block hidden shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Selected Node Inspector Drawer Tab Info */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeNodeData.id}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.12 }}
          className="p-3 bg-card border border-border/80 rounded-xl leading-normal space-y-2"
        >
          <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
            <span className="text-[8.5px] font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              Detailed Model Ingress / Egress: {activeNodeData.label}
            </span>
            <span className="font-mono text-[7.5px] bg-secondary border border-border/60 px-1.5 rounded text-muted-foreground">
              {activeNodeData.id.toUpperCase()}_NODE
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 leading-none container text-[8px] font-mono text-muted-foreground uppercase pt-1">
            {activeNodeData.details.map((detail, dIdx) => (
              <span key={dIdx} className="bg-secondary/40 border border-border/50 px-2 py-1 rounded block truncate">
                • {detail}
              </span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default FusionDecisionFlow;
