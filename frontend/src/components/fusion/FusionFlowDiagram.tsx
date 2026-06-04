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
import { Alert, getAlertFusionMeta } from "../../types";
import { cn } from "../../lib/utils";

interface FusionFlowDiagramProps {
  alert: Alert;
}

interface NodeDetails {
  title: string;
  verdict: string;
  confidence: number;
  description: string;
  details: string[];
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
      colorClass: "border-cyan-500 bg-cyan-950/20 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]",
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
        ? "border-red-500 bg-red-950/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]" 
        : "border-emerald-500 bg-emerald-950/10 text-emerald-400",
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
        ? "border-orange-500 bg-orange-950/20 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.15)]" 
        : "border-muted text-muted-foreground",
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
        ? "border-purple-500 bg-purple-950/20 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.15)]" 
        : "border-muted text-muted-foreground",
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
      label: "Suricata Signature",
      type: "signature",
      icon: ShieldAlert,
      colorClass: hasSuricata 
        ? "border-blue-500 bg-blue-950/20 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.15)]" 
        : "border-muted text-muted-foreground",
      glowing: hasSuricata,
      status: hasSuricata ? "SIG HIT" : "NO HIT",
      confidence: hasSuricata ? 1.0 : 0.0,
      description: "Cross-checks packet buffers for known static exploits",
      details: [
        `Captured Signature: ${meta.suricataEvidence}`,
        `Database Class: ${hasSuricata ? "Exploit Weaponization" : "Verified Safe"}`,
        `Severity Priority: ${alert.suricataData?.severity || "0"}`
      ]
    },
    {
      id: "fusion",
      label: "Consolidated Fusion",
      type: "decision",
      icon: Activity,
      colorClass: alert.riskScore > 75 
        ? "border-red-500 bg-red-950/40 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] ring-1 ring-red-500/20" 
        : "border-cyan-500 bg-cyan-950/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/20",
      glowing: true,
      status: `RISK: ${alert.riskScore}`,
      confidence: Math.max(0.85, alert.confidenceScore),
      description: "Correlates multi-layer logs into final verdict",
      details: [
        `Aggregate Score: ${alert.riskScore}/100`,
        `Consolidated Type: ${alert.attackType}`,
        `Unified Threat Tier: ${alert.severity}`,
        `Synthesized Reason: ${alert.aiDecision?.fusion?.reason || "Behavior matches threat footprints"}`
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">
            FUSION DECISION ARCHITECTURE FLOW
          </span>
          <span className="text-[9.5px] font-black text-[#06b6d4] uppercase tracking-wider block mt-0.5">
            Node-based pipeline execution trace
          </span>
        </div>
        <span className="text-[7.5px] text-muted-foreground font-semibold uppercase bg-muted/60 px-1.5 py-0.5 rounded border border-border">
          Interactive Diagram
        </span>
      </div>

      {/* Grid Flow Layout */}
      <div className="bg-background/40 border border-border/70 rounded-xl p-3 relative overflow-hidden">
        {/* Animated flow background effect */}
        <div className="absolute inset-0 bg-radial-gradient from-cyan-500/5 via-transparent to-transparent opacity-30 pointer-events-none" />

        {/* Nodes and Links Graph Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 relative z-10">
          {nodes.map((node, index) => {
            const Icon = node.icon;
            const isSelected = selectedNode === node.id;
            return (
              <div key={node.id} className="relative">
                {/* Node Box */}
                <motion.div
                  onHoverStart={() => setSelectedNode(node.id)}
                  onHoverEnd={() => setSelectedNode(null)}
                  onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "border rounded-xl p-2.5 cursor-pointer transition-all flex flex-col justify-between h-21.25 leading-tight select-none relative group",
                    node.colorClass,
                    node.glowing ? "animate-glowing" : ""
                  )}
                >
                  <div className="flex items-start justify-between">
                    <Icon className={cn("w-3.5 h-3.5", node.glowing ? "text-cyan-400 animate-pulse" : "opacity-80")} />
                    <span className="text-[7.2px] font-black tracking-widest uppercase bg-background/50 px-1.5 py-0.2 rounded border border-border/40">
                      {node.status}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <span className="text-[9px] font-black uppercase tracking-wider block text-foreground leading-none">
                      {node.label}
                    </span>
                    <span className="text-[7.2px] text-muted-foreground font-mono block mt-1 tracking-tight truncate">
                      {node.description}
                    </span>
                  </div>

                  <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Info size={9} className="text-muted-foreground/80 hover:text-cyan-500" />
                  </div>
                </motion.div>

                {/* Simulated connection points and pulse wires */}
                {index < nodes.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-2 w-2 h-px bg-border pointer-events-none z-0">
                    <div className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)] animate-ping" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Node Inspect Section */}
      <AnimatePresence mode="wait">
        {selectedNode ? (
          (() => {
            const nodeInfo = nodes.find(n => n.id === selectedNode);
            if (!nodeInfo) return null;
            return (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.12 }}
                className={cn(
                  "p-3 border rounded-xl leading-relaxed text-[8.5px]",
                  "border-[#06b6d4]/25 bg-[#020617]/95"
                )}
              >
                <div className="flex justify-between items-center pb-1.5 border-b border-border/40">
                  <span className="font-extrabold uppercase text-[#06b6d4] tracking-widest text-[9px] flex items-center gap-1">
                    <Info size={11} className="text-cyan-400" />
                    Telemetrics: {nodeInfo.label}
                  </span>
                  <span className="font-mono text-[7px] text-muted-foreground font-black uppercase bg-muted/60 px-1 rounded-sm">
                    Confidence Metric: {(nodeInfo.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="space-y-1">
                    <span className="text-[7px] font-black text-muted-foreground uppercase tracking-wide block">Functional Role</span>
                    <p className="text-muted-foreground/90 font-medium leading-normal">{nodeInfo.description}</p>
                  </div>
                  <div className="space-y-1 bg-background/50 p-2 rounded border border-border/40 font-mono text-[7.5px] text-muted-foreground">
                    <span className="text-[7px] font-black text-muted-foreground uppercase tracking-wide block mb-1">State Context</span>
                    {nodeInfo.details.map((v, i) => (
                      <p key={i} className="text-foreground/90 leading-normal truncate">{v}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })()
        ) : (
          <div className="text-[8px] font-extrabold text-muted-foreground/60 uppercase text-center py-1 tracking-widest border border-dashed border-border/50 rounded-lg">
            Hover or click any pipeline viewport node above to inspect real-time layers
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
