import React from "react";
import {
  Database,
  Cpu,
  Sparkles,
  ShieldAlert,
  Activity,
  Workflow,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  GitCommit,
  ArrowDown,
  LucideIcon
} from "lucide-react";
import { cn } from "../../lib/utils";

interface FusionLayerVisualizationProps {
  alertsCount?: number;
}

interface PipelineNode {
  name: string;
  val: string;
  icon: LucideIcon;

  info?: string;

  isAi?: boolean;
  isFusion?: boolean;
  isFinal?: boolean;
}

interface PipelineStep {
  title: string;
  nodes: PipelineNode[];
}

export function FusionLayerVisualization({ alertsCount = 0 }: FusionLayerVisualizationProps) {
  
  // Realtime pipeline stats
  const steps: PipelineStep[] = [
    {
      title: "Data Sources",
      nodes: [
        { name: "Zeek conn.log", val: "1,240 pkts/s", icon: Database },
        { name: "Zeek http.log", val: "382 pkts/s", icon: Database },
        { name: "Suricata alerts", val: "680 events/s", icon: ShieldAlert }
      ]
    },
    {
      title: "AI Sub-models Verification",
      nodes: [
        { name: "AI1 Anomaly Model", val: "verdict rate: 94.5%", info: "Isolation Forest", icon: Cpu, isAi: true },
        { name: "AI2A Multi-Classifier", val: "accuracy: 96.2%", info: "Logistic Classifier", icon: Cpu, isAi: true },
        { name: "AI2B Web Semantic", val: "confidence: 98.1%", info: "Lexer Transformer", icon: Sparkles, isAi: true }
      ]
    },
    {
      title: "Correlated Fusion Resolver",
      nodes: [
        { name: "Consensus Voting Panel", val: "agg agreement: 94.6%", info: "Majority Override Rule", icon: Activity, isFusion: true },
        { name: "Durable Risk Evaluator", val: "false positive red: 87.4%", info: "Zeek-Suricata Alignment", icon: Workflow, isFusion: true }
      ]
    },
    {
      title: "Real-time Operations Action",
      nodes: [
        { name: "XDR Automated Intercept", val: "latency: <5.2ms", info: "Threat Intel Correlated", icon: CheckCircle2, isFinal: true }
      ]
    }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm select-none">
      <div className="flex items-center justify-between mb-4 border-b border-border/20 pb-2">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Workflow className="w-4 h-4 text-cyan-500 animate-spin-slow" />
          MULTIVARIATED AI ENGINE DETAILED DETECTION PIPELINE FLOW
        </h3>
        <span className="text-[7.5px] bg-[#06b6d4]/10 text-cyan-500 border border-cyan-500/15 px-2.5 py-0.5 rounded font-black tracking-widest font-mono">
          CONSENSUS MAP VERIFIED
        </span>
      </div>

      {/* Grid of the pipeline hierarchy flow */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {steps.map((step, stepIdx) => (
          <div key={step.title} className="flex flex-col relative">
            <div className="flex items-center justify-between bg-secondary/35 border border-border/80 p-2 rounded-t-lg">
              <span className="text-[8px] font-black text-foreground uppercase tracking-widest leading-none">
                STAGE_0{stepIdx + 1}: {step.title}
              </span>
            </div>

            <div className="bg-card border border-border border-t-0 p-3 rounded-b-lg space-y-2.5 flex-1 flex flex-col justify-center min-h-55">
              {step.nodes.map((node, nodeIdx) => (
                <div 
                  key={node.name}
                  className={cn(
                    "p-2 rounded-lg border flex items-center justify-between font-mono relative leading-none select-none transition-all",
                    node.isAi 
                      ? "bg-purple-950/20 border-purple-950/30 text-purple-400 hover:border-purple-800/40" 
                      : node.isFusion 
                        ? "bg-cyan-950/20 border-cyan-950/30 text-cyan-400 hover:border-cyan-850/40"
                        : node.isFinal 
                          ? "bg-red-950/25 border-red-950/35 text-red-400 hover:border-red-900/40 shadow-[0_0_8px_rgba(239,68,68,0.1)] mb-0 animate-pulse"
                          : "bg-muted/30 border-border/40 text-foreground hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <node.icon className="w-3.5 h-3.5 shrink-0" />
                    <div className="truncate pr-1">
                      <span className="text-[8.5px] font-black uppercase text-foreground leading-none">{node.name}</span>
                      {node.info && (
                        <span className="text-[6.5px] text-muted-foreground/60 block mt-1 uppercase tracking-wider">{node.info}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[8px] font-bold tracking-tight">{node.val}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual connector arrows (Desktop only) */}
            {stepIdx < 3 && (
              <div className="hidden md:flex absolute top-[53%] -right-2.5 z-20 items-center justify-center p-0.5 rounded-full bg-[#06090e] border border-border">
                <ArrowRight size={11} className="text-cyan-500 animate-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FusionLayerVisualization;
