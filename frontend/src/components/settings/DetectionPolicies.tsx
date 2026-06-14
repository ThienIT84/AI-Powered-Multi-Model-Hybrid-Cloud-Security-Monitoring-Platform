import React, { useState } from "react";
import { z } from "zod";
import { Brain, Sliders, ShieldCheck, HelpCircle, Activity, Merge, AlertTriangle } from "lucide-react";

export const detectionPoliciesSchema = z.object({
  ai1Threshold: z.number().min(0, "Must be at least 0.0").max(1.0, "Must be at most 1.0"),
  ai2aConfidence: z.number().min(0, "Must be at least 0%").max(100, "Must be at most 100%"),
  ai2bThreshold: z.number().min(0, "Must be at least 0%").max(100, "Must be at most 100%"),
  consensusThreshold: z.number().min(10, "Minimum consensus threshold is 10%").max(95, "Maximum consensus threshold is 95%"),
  thresholdCritical: z.number().min(1, "Risk must be greater than 0").max(100),
  thresholdHigh: z.number().min(1).max(100),
  thresholdMedium: z.number().min(1).max(100),
  thresholdLow: z.number().min(1).max(100),
});

export type DetectionPoliciesType = z.infer<typeof detectionPoliciesSchema>;

interface DetectionPoliciesProps {
  data: DetectionPoliciesType;
  onChange: (path: string, value: any) => void;
}

export function DetectionPolicies({ data, onChange }: DetectionPoliciesProps) {
  const [activeHint, setActiveHint] = useState<string | null>(null);

  const handleSliderChange = (field: keyof DetectionPoliciesType, value: number) => {
    onChange(`ai.${field}`, value);
  };

  const explainField = (field: string, text: string) => {
    setActiveHint(activeHint === field ? null : field);
  };

  return (
    <div className="space-y-6" id="detection-policies-panel">
      {/* Header Info */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-500 animate-pulse" />
          Detection Policy Configuration
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Administer active multi-model AI sensitivity limits and score-pooling consensus thresholds routing risk behaviors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-[9px] uppercase">
        
        {/* Left Side: Sliders for AI Detection Thresholds */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wider flex items-center gap-2 border-b border-border/40 pb-2.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-500" />
              AI Core Security Thresholds
            </h4>

            {/* AI1 Anomaly Threshold */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-900 dark:text-white flex items-center gap-1.5 hover:text-cyan-500 cursor-help" onClick={() => explainField("ai1", "Controls network flow grouping sensitivity. Higher value filters packet sweeps and prioritizes active command tunnels.")}>
                  AI1 Deep Anomaly Threshold
                  <HelpCircle className="w-3 h-3 text-slate-500" />
                </span>
                <span className="text-cyan-500 font-extrabold">{data.ai1Threshold?.toFixed(2) || "0.65"} / 1.00</span>
              </div>
              <input
                type="range"
                className="w-full accent-cyan-500"
                min="0.1"
                max="1.0"
                step="0.05"
                value={data.ai1Threshold || 0.65}
                onChange={(e) => handleSliderChange("ai1Threshold", parseFloat(e.target.value))}
              />
              {activeHint === "ai1" && (
                <div className="p-2 bg-slate-100 dark:bg-slate-950 rounded text-[8px] text-zinc-500 italic tracking-wider leading-normal normal-case">
                  Controls network flow grouping sensitivity. Higher value filters packet sweeps and prioritizes active command tunnels.
                </div>
              )}
            </div>

            {/* AI2A Classification Confidence */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-900 dark:text-white flex items-center gap-1.5 hover:text-cyan-500 cursor-help" onClick={() => explainField("ai2a", "Minimum model confidence score required to flag structural patterns (Port Swings, DoS, Brute Forcing).")}>
                  AI2A Classifier Confidence Limit
                  <HelpCircle className="w-3 h-3 text-slate-500" />
                </span>
                <span className="text-cyan-500 font-extrabold">{data.ai2aConfidence || 75}%</span>
              </div>
              <input
                type="range"
                className="w-full accent-cyan-500"
                min="10"
                max="100"
                step="5"
                value={data.ai2aConfidence || 75}
                onChange={(e) => handleSliderChange("ai2aConfidence", parseInt(e.target.value, 10))}
              />
              {activeHint === "ai2a" && (
                <div className="p-2 bg-slate-100 dark:bg-slate-950 rounded text-[8px] text-zinc-500 italic tracking-wider leading-normal normal-case">
                  Minimum model confidence score required to flag structural patterns (Port Swings, DoS, Brute Forcing).
                </div>
              )}
            </div>

            {/* AI2B Web Detection Confidence */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-900 dark:text-white flex items-center gap-1.5 hover:text-cyan-500 cursor-help" onClick={() => explainField("ai2b", "Web App threat payload confidence boundary (SQL Injection, Cross-Site Scripting, directory attempts).")}>
                  AI2B Web Payload Confidence
                  <HelpCircle className="w-3 h-3 text-slate-500" />
                </span>
                <span className="text-cyan-500 font-extrabold">{data.ai2bThreshold || 82}%</span>
              </div>
              <input
                type="range"
                className="w-full accent-cyan-500"
                min="10"
                max="100"
                step="5"
                value={data.ai2bThreshold || 82}
                onChange={(e) => handleSliderChange("ai2bThreshold", parseInt(e.target.value, 10))}
              />
              {activeHint === "ai2b" && (
                <div className="p-2 bg-slate-100 dark:bg-slate-950 rounded text-[8px] text-zinc-500 italic tracking-wider leading-normal normal-case">
                  Web App threat payload confidence boundary (SQL Injection, Cross-Site Scripting, directory attempts).
                </div>
              )}
            </div>

            <div className="bg-cyan-500/5 p-3 rounded-lg border border-cyan-500/10 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
              <p className="text-[8px] text-slate-500 dark:text-zinc-500 uppercase leading-normal font-semibold">
                High sensitivity targets decrease latency threshold but might trigger non-malicious ingress probes. Calibrate with live traffic counts.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Bayesian Fusion & Alarm Severity Thresholds */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wider flex items-center gap-2 border-b border-border/40 pb-2.5">
              <Merge className="w-3.5 h-3.5 text-cyan-500" />
              Fusion & Risk Consensus Policy
            </h4>

            {/* Consensus Threshold */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-900 dark:text-white flex items-center gap-1.5 hover:text-cyan-500 cursor-help" onClick={() => explainField("consensus", "Pooled minimum score mapping consensus of multiple isolated pipelines before escalating.")}>
                  Bayesian Correlation Consensus Minimum
                  <HelpCircle className="w-3 h-3 text-slate-500" />
                </span>
                <span className="text-cyan-500 font-extrabold">{data.consensusThreshold || 65}%</span>
              </div>
              <input
                type="range"
                className="w-full accent-cyan-500"
                min="20"
                max="90"
                step="5"
                value={data.consensusThreshold || 65}
                onChange={(e) => handleSliderChange("consensusThreshold", parseInt(e.target.value, 10))}
              />
              {activeHint === "consensus" && (
                <div className="p-2 bg-slate-100 dark:bg-slate-950 rounded text-[8px] text-zinc-500 italic tracking-wider leading-normal normal-case">
                  Pooled minimum score mapping consensus of multiple isolated pipelines before escalating.
                </div>
              )}
            </div>

            {/* Risk Levels Segment Controls */}
            <div className="space-y-3 pt-2">
              <span className="text-[8.5px] font-black tracking-widest text-[#64748b] block uppercase">
                Consensus Score SLA Routing Levels (%)
              </span>
              
              <div className="grid grid-cols-2 gap-2.5">
                {/* Critical */}
                <div className="p-2 bg-slate-50 dark:bg-slate-900/60 border border-border/40 rounded-lg">
                  <div className="flex justify-between items-center mb-1 text-[8px] font-bold text-rose-500">
                    <span>Critical Level</span>
                    <span>&ge; {data.thresholdCritical || 90}%</span>
                  </div>
                  <input
                    type="range"
                    className="w-full accent-rose-500"
                    min="80"
                    max="100"
                    value={data.thresholdCritical || 90}
                    onChange={(e) => handleSliderChange("thresholdCritical", parseInt(e.target.value, 10))}
                  />
                </div>

                {/* High */}
                <div className="p-2 bg-slate-50 dark:bg-slate-900/60 border border-border/40 rounded-lg">
                  <div className="flex justify-between items-center mb-1 text-[8px] font-bold text-orange-400">
                    <span>High Level</span>
                    <span>&ge; {data.thresholdHigh || 70}%</span>
                  </div>
                  <input
                    type="range"
                    className="w-full accent-orange-400"
                    min="60"
                    max="85"
                    value={data.thresholdHigh || 70}
                    onChange={(e) => handleSliderChange("thresholdHigh", parseInt(e.target.value, 10))}
                  />
                </div>

                {/* Medium */}
                <div className="p-2 bg-slate-50 dark:bg-slate-900/60 border border-border/40 rounded-lg">
                  <div className="flex justify-between items-center mb-1 text-[8px] font-bold text-yellow-500">
                    <span>Medium Level</span>
                    <span>&ge; {data.thresholdMedium || 40}%</span>
                  </div>
                  <input
                    type="range"
                    className="w-full accent-yellow-500"
                    min="30"
                    max="65"
                    value={data.thresholdMedium || 40}
                    onChange={(e) => handleSliderChange("thresholdMedium", parseInt(e.target.value, 10))}
                  />
                </div>

                {/* Low */}
                <div className="p-2 bg-slate-50 dark:bg-slate-900/60 border border-border/40 rounded-lg">
                  <div className="flex justify-between items-center mb-1 text-[8px] font-bold text-cyan-400">
                    <span>Low Level</span>
                    <span>&ge; {data.thresholdLow || 15}%</span>
                  </div>
                  <input
                    type="range"
                    className="w-full accent-cyan-400"
                    min="5"
                    max="35"
                    value={data.thresholdLow || 15}
                    onChange={(e) => handleSliderChange("thresholdLow", parseInt(e.target.value, 10))}
                  />
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/15 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
              <span className="text-[7.5px] text-zinc-500 font-semibold leading-relaxed">
                Warning: Changing consensus scores immediately overrides alert status histories. Realtime pipelines active.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
