import React from "react";
import { cn } from "../lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip,
  Cell
} from "recharts";
import { Activity, ShieldCheck, Zap, Brain, Database, Cloud, Network } from "lucide-react";

export function BottomWidgets() {
  const shapData = [
    { name: "Contains SQL Keyword", value: 0.42 },
    { name: "SQL Comment Pattern", value: 0.28 },
    { name: "Special Characters", value: 0.13 },
    { name: "Login Field Detected", value: 0.09 },
    { name: "Payload Length", value: 0.04 },
  ];

  const modelStatus = [
    { name: "NLP Threat Detection", status: "Active", accuracy: "96.3%", lastTrained: "May 19, 2025 02:15 AM" },
    { name: "Behavior Analysis", status: "Active", accuracy: "94.7%", lastTrained: "May 18, 2025 11:40 PM" },
    { name: "Traffic Analysis", status: "Active", accuracy: "93.1%", lastTrained: "May 19, 2025 01:05 AM" },
  ];

  const dataSourceHealth = [
    { name: "Zeek Logs", status: "Healthy", eps: "1.2K/s", icon: Database },
    { name: "Suricata Alerts", status: "Healthy", eps: "850/s", icon: ShieldCheck },
    { name: "AWS VPC Flow Logs", status: "Healthy", eps: "320/s", icon: Cloud },
    { name: "CloudTrail", status: "Healthy", eps: "45/s", icon: Activity },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pb-8">
      {/* AI Detection Pipeline */}
      <div className="bg-[#0f1115] border border-white/5 rounded-xl p-4 flex flex-col shadow-2xl relative overflow-hidden h-55">
        <h3 className="text-[10px] font-black text-gray-100 uppercase tracking-[0.2em] mb-4">AI DETECTION PIPELINE</h3>
        <div className="flex-1 grid grid-cols-4 gap-2 text-[7px] font-black uppercase tracking-widest leading-none">
           {/* Section 1: Sources */}
           <div className="space-y-2">
              <p className="text-blue-500 mb-2">Sources</p>
              <PipelineSmallNode label="Zeek" />
              <PipelineSmallNode label="Suricata" />
              <PipelineSmallNode label="VPC Flow" />
              <PipelineSmallNode label="DNS" />
           </div>
           {/* Section 2: Preprocess */}
           <div className="space-y-2">
              <p className="text-purple-500 mb-2">Process</p>
              <PipelineSmallNode label="Normal" />
              <PipelineSmallNode label="Extract" />
              <PipelineSmallNode label="Enrich" />
              <PipelineSmallNode label="Session" />
           </div>
           {/* Section 3: Models */}
           <div className="space-y-2">
              <p className="text-red-500 mb-2">Models</p>
              <PipelineSmallNode label="NLP-SQLi" active />
              <PipelineSmallNode label="Anomaly" />
              <PipelineSmallNode label="NLP-XSS" />
              <PipelineSmallNode label="Behavior" />
           </div>
           {/* Section 4: Output */}
           <div className="space-y-2">
              <p className="text-green-500 mb-2">Output</p>
              <PipelineSmallNode label="Alerts" active />
              <PipelineSmallNode label="SOAR" />
              <PipelineSmallNode label="Case Mgmt" />
              <PipelineSmallNode label="Reporting" />
           </div>
        </div>
      </div>

      {/* AI Models Status */}
      <div className="bg-[#0f1115] border border-white/5 rounded-xl p-4 flex flex-col shadow-2xl">
        <h3 className="text-[10px] font-black text-gray-100 uppercase tracking-[0.2em] mb-4">AI MODELS STATUS</h3>
        <div className="space-y-4">
           {modelStatus.map((model, idx) => (
             <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                   <span className="text-[9px] font-black text-gray-300 uppercase tracking-tight">{model.name}</span>
                   <span className="text-[8px] font-black text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">{model.status}</span>
                </div>
                <div className="flex items-center justify-between text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                   <span>Accuracy: {model.accuracy}</span>
                   <span className="text-[7px] text-gray-600 italic">Last Trained: {model.lastTrained}</span>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* SHAP Explainability */}
      <div className="bg-[#0f1115] border border-white/5 rounded-xl p-4 flex flex-col shadow-2xl">
        <h3 className="text-[10px] font-black text-gray-100 uppercase tracking-[0.2em] mb-4">SHAP EXPLAINABILITY (SQL INJECTION)</h3>
        <div className="flex-1 min-h-35">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={shapData} layout="vertical" margin={{ left: -10, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={7} 
                width={85} 
                tick={{ fontWeight: 'bold' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} content={<CustomBarTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={8}>
                {shapData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? "#ef4444" : index === 1 ? "#f97316" : "#3b82f6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Sources Health */}
      <div className="bg-[#0f1115] border border-white/5 rounded-xl p-4 flex flex-col shadow-2xl">
        <h3 className="text-[10px] font-black text-gray-100 uppercase tracking-[0.2em] mb-4">DATA SOURCES HEALTH</h3>
        <div className="grid grid-cols-1 gap-3">
           {dataSourceHealth.map((source, idx) => (
             <div key={idx} className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 rounded bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
                      <source.icon className="w-3 h-3 text-gray-400 group-hover:text-blue-400" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-gray-300 uppercase leading-none tracking-tight">{source.name}</span>
                      <span className="text-[7px] text-gray-600 font-bold uppercase tracking-widest mt-1">{source.eps} EPS</span>
                   </div>
                </div>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                   <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Healthy</span>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

function PipelineSmallNode({ label, active }: { label: string, active?: boolean }) {
  return (
    <div className={cn(
      "px-1.5 py-1 rounded border transition-all duration-500",
      active 
        ? "bg-white/10 border-white/20 text-white shadow-[0_0_8px_rgba(255,255,255,0.1)]" 
        : "bg-black/20 border-white/5 text-gray-600"
    )}>
      {label}
    </div>
  );
}

function PipelineNode({ label, color }: { label: string, color: string }) {
  return (
    <div className={cn("px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border", color)}>
      {label}
    </div>
  );
}

const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border border-white/10 p-2 rounded shadow-xl backdrop-blur-md">
        <p className="text-[8px] font-black text-gray-100 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
        <p className="text-[10px] font-mono text-cyan-400 font-black">+{payload[0].value.toFixed(2)} SHAP Value</p>
      </div>
    );
  }
  return null;
};
