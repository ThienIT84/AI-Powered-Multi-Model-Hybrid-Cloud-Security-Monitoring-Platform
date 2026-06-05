import React from "react";
import { Brain, Cpu, Play, Sliders, CheckCircle2, ShieldAlert } from "lucide-react";

interface AiEngineSettingsTabProps {
  data: {
    ai1Status: string;
    ai1Model: string;
    ai1Version: string;
    ai1Threshold: number;
    ai2aStatus: string;
    ai2aModel: string;
    ai2aClasses: string[];
    ai2aConfidence: number;
    ai2bStatus: string;
    ai2bModel: string;
    ai2bThreshold: number;
    ai2bAttackTypes: string[];
    batchSize: number;
    inferenceMode: "Realtime" | "Batch";
  };
  onChange: (path: string, value: any) => void;
  onToast: (msg: string, type?: "success" | "warning" | "info") => void;
}

export function AiEngineSettingsTab({ data, onChange, onToast }: AiEngineSettingsTabProps) {
  const triggerModelReload = (modelName: string) => {
    onToast(`RELOADING CYBERNETIC WEIGHTS FOR: ${modelName.toUpperCase()}...`, "info");
    setTimeout(() => {
      onToast(`MODEL ${modelName.toUpperCase()} RE-DEPLOYED SUCCESSFULLY!`, "success");
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Tab Header */}
      <div className="flex flex-col gap-1.5 md:flex-row md:items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyan-500 animate-pulse" />
            AI Core Engine Optimization
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] leading-normal">
            Configure multi-model endpoints, classification tiers, thresholds, and execution modes
          </p>
        </div>
        <div className="flex gap-2">
          <span className="text-[9px] font-mono font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md uppercase tracking-wider h-fit">
            AI Engine: Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MODEL AI1: Isolation Forest */}
        <div className="bg-card/40 border border-border/70 rounded-xl p-5 space-y-4 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
              <h4 className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest leading-none">
                AI_1: AD-DETECTION
              </h4>
            </div>
            <span className="text-[8px] font-mono bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20">
              {data.ai1Status}
            </span>
          </div>

          <div className="space-y-3 pt-1 border-t border-border/40">
            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono my-2">
              <div>
                <span className="text-muted-foreground block text-[8px]">MODEL CLASS</span>
                <span className="text-foreground font-black">{data.ai1Model}</span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block text-[8px]">BUILD VERSION</span>
                <span className="text-foreground font-black">v{data.ai1Version}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-muted-foreground uppercase">ANOMALY THRESHOLD</span>
                <span className="text-cyan-400 font-bold">{data.ai1Threshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={data.ai1Threshold}
                onChange={(e) => onChange("ai1Threshold", parseFloat(e.target.value))}
                className="w-full accent-cyan-500 bg-muted h-1 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[8px] font-mono text-muted-foreground/60">
                <span>0.1 (SENSITIVE)</span>
                <span>1.0 (CONSERVATIVE)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => triggerModelReload("Isolation Forest")}
            className="w-full py-2 bg-muted hover:bg-muted/80 text-[9px] font-mono font-black tracking-widest text-muted-foreground hover:text-foreground border border-border/85 rounded-lg transition-all"
          >
            RE-LOAD PIPELINE
          </button>
        </div>

        {/* MODEL AI2A: XGBoost Multiclass */}
        <div className="bg-card/40 border border-border/70 rounded-xl p-5 space-y-4 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
              <h4 className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest leading-none">
                AI_2A: TACTICAL-CLASSIFIER
              </h4>
            </div>
            <span className="text-[8px] font-mono bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">
              {data.ai2aStatus}
            </span>
          </div>

          <div className="space-y-3 pt-1 border-t border-border/40">
            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono my-2">
              <div>
                <span className="text-muted-foreground block text-[8px]">ALGORITHM TYPE</span>
                <span className="text-foreground font-black">{data.ai2aModel}</span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block text-[8px]">TOTAL CLASSES</span>
                <span className="text-foreground font-black">{data.ai2aClasses.length} TYPES</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider block">SUPPORTED ATTACK SIGNALS</span>
              <div className="flex flex-wrap gap-1">
                {data.ai2aClasses.map((cls, idx) => (
                  <span
                    key={idx}
                    className="text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 bg-muted border border-border/50 text-muted-foreground rounded"
                  >
                    {cls}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-muted-foreground uppercase">CONFIDENCE CUTOFF</span>
                <span className="text-purple-400 font-bold">{data.ai2aConfidence}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="1"
                value={data.ai2aConfidence}
                onChange={(e) => onChange("ai2aConfidence", parseInt(e.target.value))}
                className="w-full accent-purple-500 bg-muted h-1 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[8px] font-mono text-muted-foreground/60">
                <span>50%</span>
                <span>100% (STRICT)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => triggerModelReload("XGBoost Multiclass")}
            className="w-full py-2 bg-muted hover:bg-muted/80 text-[9px] font-mono font-black tracking-widest text-muted-foreground hover:text-foreground border border-border/85 rounded-lg transition-all"
          >
            RE-TRAIN MOCK DATA
          </button>
        </div>

        {/* MODEL AI2B: XGBoost Binary */}
        <div className="bg-card/40 border border-border/70 rounded-xl p-5 space-y-4 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
              <h4 className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest leading-none">
                AI_2B: PAYLOAD-ANALYZER
              </h4>
            </div>
            <span className="text-[8px] font-mono bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
              {data.ai2bStatus}
            </span>
          </div>

          <div className="space-y-3 pt-1 border-t border-border/40">
            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono my-2">
              <div>
                <span className="text-muted-foreground block text-[8px]">CORE CLASSIFIER</span>
                <span className="text-foreground font-black">{data.ai2bModel} Binary</span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block text-[8px]">TARGET ATTACKS</span>
                <span className="text-foreground font-black">{data.ai2bAttackTypes.length} THREATS</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider block font-black">EXPERT RULES DETECTED</span>
              <div className="flex flex-wrap gap-1">
                {data.ai2bAttackTypes.map((type, idx) => (
                  <span
                    key={idx}
                    className="text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 bg-muted/65 border border-amber-500/10 text-amber-500/80 rounded"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-muted-foreground uppercase">DETECTION SENSITIVITY</span>
                <span className="text-amber-400 font-bold">{data.ai2bThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="1"
                value={data.ai2bThreshold}
                onChange={(e) => onChange("ai2bThreshold", parseInt(e.target.value))}
                className="w-full accent-amber-500 bg-muted h-1 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[8px] font-mono text-muted-foreground/60">
                <span>50%</span>
                <span>100% (STRICT)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => triggerModelReload("XGBoost Payload")}
            className="w-full py-2 bg-muted hover:bg-muted/80 text-[9px] font-mono font-black tracking-widest text-muted-foreground hover:text-foreground border border-border/85 rounded-lg transition-all"
          >
            TEST INFERENCE PING
          </button>
        </div>

      </div>

      {/* INFERENCE ENGINE PREFERENCES */}
      <div className="border border-border/80 rounded-xl bg-card/25 p-5 space-y-4">
        <h4 className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          Runtime Performance Hardware & Execution Profile
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[10px] font-mono">
          <div className="space-y-2">
            <label className="text-[9px] font-extrabold text-muted-foreground tracking-widest uppercase">
              GPU/CPU Batch Ingestion Capacity
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 20, 50, 100].map((size) => (
                <button
                  key={size}
                  onClick={() => onChange("batchSize", size)}
                  className={`py-2 rounded-lg border text-[9px] font-black uppercase font-mono tracking-widest transition-all ${
                    data.batchSize === size
                      ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                      : "bg-muted/30 border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <span className="text-[8px] text-muted-foreground/60 uppercase">Higher size boosts throughput at cost of initial latency.</span>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-extrabold text-muted-foreground tracking-widest uppercase">
              Inference Processing Loop
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["Realtime", "Batch"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => onChange("inferenceMode", mode as any)}
                  className={`py-2 rounded-lg border text-[9px] font-black uppercase font-mono tracking-widest transition-all ${
                    data.inferenceMode === mode
                      ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                      : "bg-muted/30 border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode} Stream
                </button>
              ))}
            </div>
            <span className="text-[8px] text-muted-foreground/60 uppercase">Realtime forces instant micro-decisioning on incoming pcap logs.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
