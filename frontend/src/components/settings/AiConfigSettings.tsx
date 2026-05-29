import React from "react";
import { useSettingsStore } from "../../store/useSettingsStore";
import { cn } from "../../lib/utils";
import { BrainCircuit, ShieldAlert, Cpu, AreaChart, Settings } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const PERF_LATENCY_DATA = [
  { time: '00:00', latency: 45 },
  { time: '04:00', latency: 52 },
  { time: '08:00', latency: 48 },
  { time: '12:00', latency: 65 },
  { time: '16:00', latency: 58 },
  { time: '20:00', latency: 42 },
];

export function AiConfigSettings() {
  const { draftSettings, updateDraft } = useSettingsStore();
  const data = draftSettings.ai;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header and status shield */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-foreground uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-cyan-500" />
            AI Configuration (Model Control Layer)
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Manage Vertex AI LLMs, automated investigative flow thresholds, and model execution streams</p>
        </div>
        
        {/* AI STATUS */}
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-2 shrink-0 select-none">
          {/* Green shield icon */}
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-[10px] font-mono font-black text-emerald-500 uppercase tracking-widest">
            AI ENGINE: OPERATIONAL
          </span>
        </div>
      </div>

      {/* Main settings container split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left config side */}
        <div className="lg:col-span-2 space-y-6">
          <label className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest ml-1 block">
            🤖 AI SETTINGS
          </label>
          
          <div className="bg-card border border-border rounded-xl p-5 space-y-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Provider dropdown */}
              <div className="space-y-2">
                <label className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest ml-1 block">
                  AI Provider Selection
                </label>
                <div className="relative">
                  <select 
                    value={data.provider}
                    onChange={(e) => updateDraft('ai.provider', e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-[11px] font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all uppercase appearance-none cursor-pointer"
                  >
                    <option value="Google Gemini">Google Gemini (Vertex AI)</option>
                    <option value="Azure OpenAI">Azure OpenAI Sandbox</option>
                    <option value="Anthropic">Anthropic Security Core</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground text-[10px]">
                    ▼
                  </div>
                </div>
              </div>

              {/* Model dropdown */}
              <div className="space-y-2">
                <label className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest ml-1 block">
                  Analytical Logic Model
                </label>
                <div className="relative">
                  <select 
                    value={data.model}
                    onChange={(e) => updateDraft('ai.model', e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-[11px] font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all uppercase appearance-none cursor-pointer"
                  >
                    <option value="gemini-2.0-pro-exp">Gemini 2.0 Pro Experimental</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Speed Optimized)</option>
                    <option value="gpt-4o">GPT-4o Security-Tuned</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground text-[10px]">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            {/* Confidence threshold slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest block leading-none">
                  Detection Confidence Threshold
                </label>
                <span className="text-[11px] font-mono font-black text-cyan-500 bg-cyan-500/5 px-2.5 py-0.5 border border-cyan-500/15 rounded">
                  {(data.confidenceThreshold * 100).toFixed(0)}%
                </span>
              </div>
              
              <input 
                type="range"
                min="0.5"
                max="0.99"
                step="0.01"
                value={data.confidenceThreshold}
                onChange={(e) => updateDraft('ai.confidenceThreshold', parseFloat(e.target.value) || 0.85)}
                className="w-full h-1.5 bg-muted rounded-full appearance-none accent-cyan-500 cursor-pointer border border-border"
              />
              <div className="flex justify-between text-[8px] font-mono font-black text-muted-foreground uppercase tracking-wider">
                <span>0.50 (BALANCED CLASSIFIER)</span>
                <span>0.99 (STRICT CRYPTO PROOF)</span>
              </div>
            </div>
          </div>

          {/* Autonomous Mode Card */}
          <div className="space-y-3">
            <label className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest ml-1 block">
              🧠 AUTONOMOUS MODE
            </label>
            
            <div className="p-5 bg-purple-500/5 border border-purple-500/25 rounded-xl flex items-start gap-4">
              <div className="bg-purple-500/15 p-2.5 rounded-xl border border-purple-500/20 shrink-0">
                <BrainCircuit className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="text-[11px] font-mono font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    AUTONOMOUS FORENSIC TRIAGE
                  </h4>
                  <p className="text-[9.5px] font-mono text-muted-foreground uppercase tracking-wide leading-relaxed mt-1">
                    Triggers instant, detailed host forensic analysis, attack path mapping, and sandbox isolated checks automatically for any alerts exceeding the {(data.confidenceThreshold * 100).toFixed(0)}% threshold.
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-mono font-black text-muted-foreground uppercase">
                    CURRENT STATE:
                  </span>
                  <button 
                    onClick={() => updateDraft('ai.autoInvestigate', !data.autoInvestigate)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-widest transition-all cursor-pointer border",
                      data.autoInvestigate 
                        ? "bg-purple-500 text-white border-purple-600 shadow-sm" 
                        : "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    {data.autoInvestigate ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right metrics side */}
        <div className="space-y-6">
          <label className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest ml-1 block">
            📊 AI METRICS PANEL
          </label>
          
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-3xl" />
            
            <div className="space-y-1">
              <h4 className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <AreaChart size={14} className="text-cyan-500" />
                Inference Latency (ms)
              </h4>
              <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider leading-none">REAL-TIME INFERENCE LOG STREAM</p>
            </div>

            {/* Line Chart */}
            <div className="h-32 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PERF_LATENCY_DATA}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', fontSize: '9px', fontFamily: 'monospace' }}
                    itemStyle={{ color: 'var(--cyan-505)' }}
                  />
                  <Line type="monotone" dataKey="latency" stroke="#06b6d4" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Ingest Token Counters list */}
            <div className="space-y-3 pt-3 border-t border-border/80">
              <div className="flex justify-between items-center font-mono">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tokens / Day Intake</span>
                <span className="text-[11px] font-black text-foreground">1.2M</span>
              </div>
              <div className="flex justify-between items-center font-mono">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Monthly Running Cost</span>
                <span className="text-[11px] font-black text-cyan-600 dark:text-cyan-400">$142.50</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
