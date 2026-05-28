import { 
  Database, 
  ShieldCheck, 
  Cloud, 
  Cpu, 
  Activity, 
  Zap,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Clock
} from "lucide-react";
import { cn } from "../../lib/utils";

export function BottomWidgets() {
  
  // 6.2 AI MODELS STATUS
  const aiModelsStatus = [
    { name: "AI1 Isolation Forest", status: "Healthy", latency: "0.8ms", accuracy: "94.5%", state: "RUNNING" },
    { name: "AI2A Network Classifier", status: "Healthy", latency: "1.4ms", accuracy: "96.2%", state: "RUNNING" },
    { name: "AI2B HTTP Semantic Detector", status: "Healthy", latency: "2.1ms", accuracy: "98.1%", state: "RUNNING" },
    { name: "Fusion Layer Correlation", status: "Healthy", latency: "0.4ms", accuracy: "99.0%", state: "PROCESSING" }
  ];

  // 6.3 EXPLAINABILITY INDICATORS
  const explainabilityIndicators = [
    { indicator: "URI Entropy Analysis", weight: "Critical factor", reason: "Detects randomized queries and SQL keywords" },
    { indicator: "Script Tag Frequency", weight: "Active alert", reason: "Detects embedded HTML blocks or DOM actions" },
    { indicator: "Encoded Character Ratio", weight: "Trigger check", reason: "Flags high hex encoding or suspicious chars" },
    { indicator: "Payload Length Statistics", weight: "Heuristic trace", reason: "Isolates abnormal data transfers" }
  ];

  // 6.4 DATA SOURCES HEALTH
  const dataSourcesHealth = [
    { name: "Zeek Logs", status: "Healthy", eps: "1,240/s", icon: Database },
    { name: "Suricata Alerts", status: "Healthy", eps: "680/s", icon: ShieldCheck },
    { name: "AWS VPC Flow Logs", status: "Healthy", eps: "320/s", icon: Cloud },
    { name: "SQS Queue Data", status: "Healthy", eps: "450/s", icon: Cpu },
    { name: "PostgreSQL Database", status: "Healthy", eps: "88/s", icon: Activity },
    { name: "WebSocket Alert Stream", status: "Healthy", eps: "Active Connection", icon: Zap }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pb-8 select-none">
      
      {/* 6.1 AI DETECTION PIPELINE */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm min-h-60 max-h-60">
        <div className="flex items-center justify-between shadow-xs mb-3">
          <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-500" />
            AI DETECTION PIPELINE FLOW
          </h3>
          <span className="text-[7.5px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded leading-none">ACTIVE</span>
        </div>

        {/* Modular simplified pipeline row design */}
        <div className="flex-1 flex flex-col justify-center space-y-3 px-1">
          <div className="flex flex-col gap-1.5 font-bold">
            <span className="text-[7.5px] text-muted-foreground uppercase tracking-widest leading-none">Data processing path</span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2 mt-1">
              <PipelineBadge label="Sources" />
              <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
              <PipelineBadge label="Feature Extractor" />
              <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
              <PipelineBadge label="AI Models" isHighlight />
              <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
              <PipelineBadge label="Fusion Layer" isHighlight />
              <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
              <PipelineBadge label="Risk Engine" />
              <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
              <PipelineBadge label="Alert" isSuccess />
            </div>
          </div>
          
          <p className="text-[9.5px] text-muted-foreground leading-relaxed mt-2 border-l border-border/80 pl-2.5 italic">
            "Pipeline continuously compiles raw network streams, translates payload features, runs sub-model checks, fuses consensus and outputs alerts under 5ms."
          </p>
        </div>
      </div>

      {/* 6.2 AI MODELS STATUS */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm min-h-60 max-h-60 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            AI MODELS PERFORMANCE
          </h3>
        </div>

        {/* Custom table density representation */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar my-1 text-[8.5px] font-bold">
          <div className="grid grid-cols-4 pb-1 text-muted-foreground border-b border-border/20 text-[7.5px] font-black uppercase shrink-0">
            <span className="col-span-2">Model name</span>
            <span>Latency</span>
            <span className="text-right">Accuracy</span>
          </div>

          <div className="space-y-2 py-2 flex-1 overflow-y-auto custom-scrollbar">
            {aiModelsStatus.map((model) => (
              <div key={model.name} className="grid grid-cols-4 items-center gap-1">
                <div className="col-span-2 flex flex-col gap-0.5 truncate pr-1">
                  <span className="text-foreground text-[9px] font-black truncate">{model.name}</span>
                  <span className="text-emerald-500 text-[6.5px] font-black tracking-widest">{model.state} // {model.status}</span>
                </div>
                <span className="text-muted-foreground font-mono">{model.latency}</span>
                <span className="text-cyan-500 font-mono text-right font-black">{model.accuracy}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6.3 EXPLAINABILITY INDICATORS */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm min-h-60 max-h-60 overflow-hidden">
        <div className="flex items-center justify-between mb-2 font-bold select-none shrink-0">
          <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-500" />
            EXPLAINABILITY INDICATORS
          </h3>
        </div>

        {/* List layout detailing heuristics */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 py-1 pr-1">
          {explainabilityIndicators.map((ind) => (
            <div key={ind.indicator} className="flex flex-col p-1.5 rounded bg-muted/20 border border-border/30 gap-0.5">
              <div className="flex justify-between items-center text-[9px] font-black">
                <span className="text-foreground">{ind.indicator}</span>
                <span className="text-[7px] text-cyan-500 uppercase font-bold tracking-wider">{ind.weight}</span>
              </div>
              <p className="text-[8.5px] text-muted-foreground leading-none mt-0.5">{ind.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 6.4 DATA SOURCES HEALTH */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm min-h-60 max-h-60 overflow-hidden">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-cyan-500" />
            DATA SOURCES HEALTH
          </h3>
        </div>

        {/* Dynamic sources health layout */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 font-bold text-[8.5px]">
          {dataSourcesHealth.map((source) => (
            <div key={source.name} className="flex items-center justify-between group/src">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-secondary/60 border border-border/50 text-muted-foreground group-hover/src:text-cyan-500 transition-colors">
                  <source.icon className="w-3 h-3" />
                </div>
                <div className="flex flex-col">
                  <span className="text-foreground text-[9px] font-black">{source.name}</span>
                  <span className="text-[7px] text-muted-foreground/60 leading-none mt-0.5">{source.eps === "Active Connection" ? "Websocket Active" : `${source.eps} Event flow`}</span>
                </div>
              </div>
              
              {/* Healthy label state indicator */}
              <div className="flex items-center gap-1.5">
                 <span className="text-[7.5px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded leading-none">Healthy</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function PipelineBadge({ label, isHighlight, isSuccess }: { label: string, isHighlight?: boolean, isSuccess?: boolean }) {
  return (
    <span className={cn(
      "text-[8.5px] font-bold px-2 py-1 rounded border tracking-tight leading-none text-center block uppercase shrink-0 font-sans",
      isSuccess
        ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-500 font-black"
        : isHighlight
          ? "bg-cyan-500/15 border-cyan-500/25 text-cyan-400 font-extrabold"
          : "bg-muted border-border text-muted-foreground"
    )}>
      {label}
    </span>
  );
}
