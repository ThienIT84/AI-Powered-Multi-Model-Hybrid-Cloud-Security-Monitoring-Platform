import React from "react";
import { useSettingsStore } from "../../store/useSettingsStore";
import { cn } from "../../lib/utils";
import { BrainCircuit, Zap, ShieldCheck, AreaChart } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const perfData = [
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">AI Intelligence Core</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Model parameters and detection sensitivity</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
           <ShieldCheck size={14} className="text-emerald-500" />
           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">AI Engine: Operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">AI Service Provider</label>
                <select 
                  value={data.provider}
                  onChange={(e) => updateDraft('ai.provider', e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-[11px] font-bold text-foreground focus:outline-none focus:border-cyan-500/50 transition-all appearance-none"
                >
                  <option value="Google Gemini">Google Gemini (Vertex AI)</option>
                  <option value="Azure OpenAI">Azure OpenAI</option>
                  <option value="Anthropic">Anthropic (Claude 3.5)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Primary Analytical Model</label>
                <select 
                  value={data.model}
                  onChange={(e) => updateDraft('ai.model', e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-[11px] font-bold text-foreground focus:outline-none focus:border-cyan-500/50 transition-all appearance-none"
                >
                  <option value="gemini-2.0-pro-exp">Gemini 2.0 Pro Experimental</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Low Latency)</option>
                  <option value="gpt-4o">GPT-4o Security-Tuned</option>
                </select>
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Detection Confidence Threshold</label>
                 <span className="text-[10px] font-mono font-black text-cyan-500">{(data.confidenceThreshold * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range"
                min="0.5"
                max="0.99"
                step="0.01"
                value={data.confidenceThreshold}
                onChange={(e) => updateDraft('ai.confidenceThreshold', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-full appearance-none accent-cyan-500"
              />
              <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                 <span>Balanced</span>
                 <span>Strict Security</span>
              </div>
           </div>

           <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl flex items-start gap-4">
              <div className="bg-purple-500/20 p-2 rounded-xl">
                 <BrainCircuit className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                 <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1">Autonomous Investigation</h4>
                 <p className="text-[9px] text-muted-foreground leading-relaxed font-medium">Automatically triggers full forensic summary and attack path analysis for alerts exceeding { (data.confidenceThreshold * 100).toFixed(0)}% confidence.</p>
                 <button 
                   onClick={() => updateDraft('ai.autoInvestigate', !data.autoInvestigate)}
                   className={cn(
                    "mt-3 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                    data.autoInvestigate ? "bg-purple-500 text-white" : "bg-muted text-muted-foreground"
                   )}
                 >
                   {data.autoInvestigate ? 'Feature Enabled' : 'Enable Feature'}
                 </button>
              </div>
           </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
           <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <AreaChart size={14} className="text-cyan-500" />
              Inference Latency (MS)
           </h4>
           <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={perfData}>
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', fontSize: '10px' }}
                      itemStyle={{ color: 'var(--cyan-500)' }}
                    />
                    <Line type="monotone" dataKey="latency" stroke="#06b6d4" strokeWidth={2} dot={false} />
                 </LineChart>
              </ResponsiveContainer>
           </div>
           <div className="space-y-3 pt-2">
              <div className="flex justify-between text-[10px] uppercase font-black tracking-widest">
                 <span className="text-muted-foreground">Tokens / Day</span>
                 <span className="text-foreground">1.2M</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase font-black tracking-widest">
                 <span className="text-muted-foreground">Est. Cost / Month</span>
                 <span className="text-foreground">$142.50</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
