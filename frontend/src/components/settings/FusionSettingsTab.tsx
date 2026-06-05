import React, { useMemo } from "react";
import { Merge, Sliders, Activity, Info, LayoutTemplate } from "lucide-react";

interface FusionSettingsTabProps {
  data: {
    weightAI1: number;
    weightAI2A: number;
    weightAI2B: number;
    weightSuricata: number;
    thresholdLow: number;
    thresholdMedium: number;
    thresholdHigh: number;
    thresholdCritical: number;
  };
  onChange: (path: string, value: any) => void;
  onToast: (msg: string, type?: "success" | "warning" | "info") => void;
}

export function FusionSettingsTab({ data, onChange, onToast }: FusionSettingsTabProps) {
  const sumWeights = useMemo(() => {
    return data.weightAI1 + data.weightAI2A + data.weightAI2B + data.weightSuricata;
  }, [data.weightAI1, data.weightAI2A, data.weightAI2B, data.weightSuricata]);

  const handleNormalize = () => {
    onToast("BALANCING INTEGRITY CO-EFFICIENTS TO EXACTLY 100%...", "info");
    const total = sumWeights || 1;
    onChange("weightAI1", Math.round((data.weightAI1 / total) * 100));
    onChange("weightAI2A", Math.round((data.weightAI2A / total) * 100));
    onChange("weightAI2B", Math.round((data.weightAI2B / total) * 100));
    onChange("weightSuricata", Math.round((data.weightSuricata / total) * 100));
    setTimeout(() => {
      onToast("FUSION CO-EFFICIENTS PERFECTLY NORMALIZED!", "success");
    }, 450);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
          <Merge className="w-4 h-4 text-cyan-500" />
          Fusion Logic Layer Configuration
        </h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] leading-normal">
          Adjust model weight coefficients, categorize risk values, and preview the real-time signal processing layout
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* FUSION RULE EDITOR */}
        <div className="bg-card/40 border border-border/70 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-border/30">
            <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Weight Coefficient Matrix
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                sumWeights === 100 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" 
                  : "bg-amber-500/10 text-amber-500 border border-amber-500/30 font-black animate-pulse"
              }`}>
                Current Total: {sumWeights}%
              </span>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* AI1 Weight */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-muted-foreground uppercase">AI1: Isolation Forest weight (Anomaly)</span>
                <span className="text-cyan-400 font-bold">{data.weightAI1}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={data.weightAI1}
                onChange={(e) => onChange("weightAI1", parseInt(e.target.value))}
                className="w-full accent-cyan-500 bg-muted h-1 rounded-lg cursor-pointer"
              />
            </div>

            {/* AI2A Weight */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-muted-foreground uppercase">AI2A: XGBoost Multiclass weight</span>
                <span className="text-purple-400 font-bold">{data.weightAI2A}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={data.weightAI2A}
                onChange={(e) => onChange("weightAI2A", parseInt(e.target.value))}
                className="w-full accent-purple-500 bg-muted h-1 rounded-lg cursor-pointer"
              />
            </div>

            {/* AI2B Weight */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-muted-foreground uppercase">AI2B: XGBoost Binary weight</span>
                <span className="text-amber-400 font-bold">{data.weightAI2B}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={data.weightAI2B}
                onChange={(e) => onChange("weightAI2B", parseInt(e.target.value))}
                className="w-full accent-amber-500 bg-muted h-1 rounded-lg cursor-pointer"
              />
            </div>

            {/* Suricata Weight */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-muted-foreground uppercase">Suricata rule match weight</span>
                <span className="text-red-400 font-bold">{data.weightSuricata}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={data.weightSuricata}
                onChange={(e) => onChange("weightSuricata", parseInt(e.target.value))}
                className="w-full accent-red-500 bg-muted h-1 rounded-lg cursor-pointer"
              />
            </div>

            {/* Weight Bar Visualizer */}
            <div className="pt-2">
              <span className="text-[8.5px] font-mono text-muted-foreground uppercase mb-1.5 block">Visual Distribution</span>
              <div className="flex h-3 w-full bg-muted rounded overflow-hidden">
                <div style={{ width: `${(data.weightAI1/sumWeights)*100 || 0}%` }} className="bg-cyan-500 h-full transition-all" title="AI1" />
                <div style={{ width: `${(data.weightAI2A/sumWeights)*100 || 0}%` }} className="bg-purple-500 h-full transition-all" title="AI2A" />
                <div style={{ width: `${(data.weightAI2B/sumWeights)*100 || 0}%` }} className="bg-amber-500 h-full transition-all" title="AI2B" />
                <div style={{ width: `${(data.weightSuricata/sumWeights)*100 || 0}%` }} className="bg-red-500 h-full transition-all" title="Suricata" />
              </div>
            </div>

            {sumWeights !== 100 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[9px] font-mono text-amber-500/90 leading-relaxed flex items-start gap-2.5">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <p className="font-extrabold uppercase">Sum mismatch detected!</p>
                  <p className="mt-1">The currently configured weights do not sum up to 100%. Click the balance button below to automatically adjust coefficients while preserving ratio settings.</p>
                </div>
              </div>
            )}

            <button
              onClick={handleNormalize}
              className="w-full py-2 bg-muted hover:bg-muted/80 text-[10px] font-mono font-black tracking-widest text-foreground hover:text-cyan-400 border border-border rounded-xl transition-all"
            >
              NORMALIZE INTEGRITY WEIGHTS (100%)
            </button>

          </div>
        </div>

        {/* RISK SCORE THRESHOLDS */}
        <div className="bg-card/40 border border-border/70 rounded-xl p-5 space-y-4">
          <div className="pb-2 border-b border-border/30">
            <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-red-400" />
              Threat Severity Risk Range Configuration
            </span>
          </div>

          <div className="space-y-4 pt-1">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider leading-relaxed">
              Define risk score splits that determine the target severity classification of alerts matched by the Fusion Engine.
            </p>

            <div className="grid grid-cols-2 gap-4 text-[10px] font-mono">
              <div className="space-y-1.5">
                <span className="text-[9px] text-cyan-400 font-extrabold tracking-wider uppercase block">Low Threat Threshold</span>
                <div className="relative">
                  <input
                    type="number"
                    value={data.thresholdLow}
                    onChange={(e) => onChange("thresholdLow", parseInt(e.target.value) || 0)}
                    className="w-full bg-muted border border-border rounded-xl p-2.5 pl-3 pr-8 text-[11px] text-foreground focus:outline-none"
                    max="100"
                    min="0"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[8px] text-muted-foreground">SCORE</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] text-yellow-400 font-extrabold tracking-wider uppercase block">Medium Threat Threshold</span>
                <div className="relative">
                  <input
                    type="number"
                    value={data.thresholdMedium}
                    onChange={(e) => onChange("thresholdMedium", parseInt(e.target.value) || 0)}
                    className="w-full bg-muted border border-border rounded-xl p-2.5 pl-3 pr-8 text-[11px] text-foreground focus:outline-none"
                    max="100"
                    min="0"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[8px] text-muted-foreground">SCORE</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] text-orange-400 font-extrabold tracking-wider uppercase block">High Threat Threshold</span>
                <div className="relative">
                  <input
                    type="number"
                    value={data.thresholdHigh}
                    onChange={(e) => onChange("thresholdHigh", parseInt(e.target.value) || 0)}
                    className="w-full bg-muted border border-border rounded-xl p-2.5 pl-3 pr-8 text-[11px] text-foreground focus:outline-none"
                    max="100"
                    min="0"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[8px] text-muted-foreground">SCORE</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] text-red-400 font-extrabold tracking-wider uppercase block">Critical Threat Threshold</span>
                <div className="relative">
                  <input
                    type="number"
                    value={data.thresholdCritical}
                    onChange={(e) => onChange("thresholdCritical", parseInt(e.target.value) || 0)}
                    className="w-full bg-muted border border-border rounded-xl p-2.5 pl-3 pr-8 text-[11px] text-foreground focus:outline-none"
                    max="100"
                    min="0"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[8px] text-muted-foreground">SCORE</span>
                </div>
              </div>
            </div>

            {/* Threshold Progress preview bar */}
            <div className="pt-2">
              <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest block mb-2">SCORE MULTI-TIER REPARTITION PREVIEW</span>
              <div className="flex h-4 items-center w-full font-mono text-[8px] text-center font-bold text-black select-none rounded overflow-hidden">
                <div style={{ width: `${data.thresholdLow}%` }} className="bg-cyan-500 h-full flex items-center justify-center truncate px-1" title="Low">
                  L: 0 - {data.thresholdLow}
                </div>
                <div style={{ width: `${Math.max(5, data.thresholdMedium - data.thresholdLow)}%` }} className="bg-yellow-500 h-full flex items-center justify-center truncate px-1" title="Medium">
                  M: {data.thresholdLow + 1} - {data.thresholdMedium}
                </div>
                <div style={{ width: `${Math.max(5, data.thresholdHigh - data.thresholdMedium)}%` }} className="bg-orange-500 h-full flex items-center justify-center truncate px-1" title="High">
                  H: {data.thresholdMedium + 1} - {data.thresholdHigh}
                </div>
                <div style={{ width: `${Math.max(5, 100 - data.thresholdHigh)}%` }} className="bg-red-500 h-full flex items-center justify-center truncate px-1 text-white" title="Critical">
                  CRIT: {data.thresholdHigh + 1} - 100
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ALERT LOGIC PREVIEW FLOW (VISUAL DIAGRAM) */}
      <div className="border border-border/80 rounded-xl bg-card/25 p-5 space-y-4">
        <h4 className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
          <LayoutTemplate className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
          Fusion Logic Data ingestion Pipeline Visualization
        </h4>

        {/* Beautiful Flex based Diagram */}
        <div className="hidden md:flex items-center justify-between p-4 py-8 bg-slate-100/50 dark:bg-black/40 border border-border/50 rounded-xl font-mono text-[9px] relative overflow-hidden">
          {/* Background grid */}
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[16px_16px] pointer-events-none" />

          {/* Node 1: ZEEK LOG */}
          <div className="relative z-10 flex flex-col items-center p-3 bg-white dark:bg-muted border border-border/80 rounded-xl w-32 text-center group hover:border-cyan-500/30 transition-all shadow-sm">
            <span className="text-[8px] text-zinc-500 dark:text-muted-foreground block uppercase font-black">INGESTION</span>
            <span className="text-zinc-900 dark:text-foreground font-black tracking-widest uppercase mt-0.5">ZEEK LOG MODULE</span>
            <span className="text-[7px] text-cyan-600 dark:text-cyan-500 uppercase tracking-widest mt-1.5 animate-pulse font-extrabold">PCAP TRAFFIC</span>
          </div>

          {/* Arrow */}
          <div className="flex-1 flex flex-col items-center mx-2 relative">
            <div className="h-0.5 bg-linear-to-r from-cyan-500 via-purple-500 to-amber-505/20 to-amber-500 w-full relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-ping" />
            </div>
            <span className="text-[7px] text-zinc-650 dark:text-muted-foreground uppercase mt-1 font-bold">Multi-Class Log payload</span>
          </div>

          {/* Node 2: AI DEPL */}
          <div className="relative z-10 flex flex-col items-center p-3 bg-white dark:bg-muted border border-border/80 rounded-xl w-44 text-center group hover:border-purple-500/30 transition-all shadow-sm">
            <span className="text-[8px] text-zinc-500 dark:text-muted-foreground block uppercase font-black">AI DISCORD</span>
            <span className="text-zinc-900 dark:text-foreground font-black tracking-widest uppercase mt-0.5">3-MODEL EVALUATION</span>
            <span className="text-[7.5px] text-purple-700 dark:text-purple-400 font-extrabold uppercase mt-1.5">
              AI_1({data.weightAI1}%) + AI_2A({data.weightAI2A}%) + AI_2B({data.weightAI2B}%)
            </span>
          </div>

          {/* Arrow */}
          <div className="flex-1 flex flex-col items-center mx-2 relative">
            <div className="h-0.5 bg-linear-to-r from-purple-500 to-red-500 w-full relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400 animate-ping" />
            </div>
            <span className="text-[7px] text-zinc-650 dark:text-muted-foreground mt-1 uppercase font-bold">Suricata co-weight: {data.weightSuricata}%</span>
          </div>

          {/* Node 3: FUSION */}
          <div className="relative z-10 flex flex-col items-center p-3 bg-cyan-500/10 dark:bg-cyan-950/20 border border-cyan-500/30 rounded-xl w-36 text-center group hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all">
            <span className="text-[8px] text-cyan-700 dark:text-cyan-400 block font-black uppercase">CORRELATOR</span>
            <span className="text-cyan-800 dark:text-cyan-300 font-black tracking-widest uppercase mt-0.5">FUSION PROTOCOL</span>
            <span className="text-[7px] text-zinc-650 dark:text-muted-foreground uppercase mt-1.5 font-bold">CALCULATING RISK INDEX</span>
          </div>

          {/* Arrow */}
          <div className="flex-1 flex flex-col items-center mx-2 relative">
            <div className="h-0.5 bg-linear-to-r from-cyan-500 to-red-500 w-full relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 animate-ping" />
            </div>
            <span className="text-[7px] text-zinc-650 dark:text-muted-foreground mt-1 uppercase font-bold">Low / Med / High / Crit filters</span>
          </div>

          {/* Node 4: ALERTS */}
          <div className="relative z-10 flex flex-col items-center p-3 bg-red-500/10 dark:bg-red-950/20 border border-red-500/35 rounded-xl w-32 text-center group hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] transition-all">
            <span className="text-[8px] text-red-700 dark:text-red-400 block font-black uppercase">ALARM DISPATCH</span>
            <span className="text-red-800 dark:text-red-300 font-black tracking-widest uppercase mt-0.5">ALERT ARCHITECTURE</span>
            <span className="text-[7.5px] text-emerald-700 dark:text-emerald-400 uppercase tracking-widest font-black mt-1.5">COMMIT STACK</span>
          </div>
        </div>

        {/* Small screen fallback notice */}
        <div className="block md:hidden text-center text-[9px] font-mono text-zinc-650 dark:text-muted-foreground uppercase p-3 bg-muted border border-border rounded-xl font-bold">
          👉 FLOW PREVIEW VISUALIZED: ZEEK ────▶ AI (WEIGHTS) ────▶ FUSION FITTINGS ────▶ ALERT PROTOCOL
        </div>
      </div>
    </div>
  );
}
