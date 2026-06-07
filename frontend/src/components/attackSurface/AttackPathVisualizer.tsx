import React from "react";
import { Layers, AlertTriangle, Database, Mail } from "lucide-react";
import { AttackPath } from "./types";
import { cn } from "./utils";
import { HARDCODED_ATTACK_PATHS } from "./mockData";

interface AttackPathVisualizerProps {
  selectedPathId: string;
  setSelectedPathId: (id: string) => void;
}

export function AttackPathVisualizer({
  selectedPathId,
  setSelectedPathId
}: AttackPathVisualizerProps) {
  const activePath =
    HARDCODED_ATTACK_PATHS.find((p) => p.id === selectedPathId) ||
    HARDCODED_ATTACK_PATHS[0];

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-800 rounded-xl p-5 shadow-sm dark:shadow-xl">
      <div className="flex items-start justify-between mb-4 pb-2 border-b border-slate-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider leading-none">
              Potential Attack Path Visualizer
            </h3>
            <span className="text-[9px] font-mono text-slate-500 dark:text-gray-400 uppercase tracking-widest">
              Chained Threat Pivoting and Mitigation Indices
            </span>
          </div>
        </div>
        <span className="text-[10px] text-amber-505 dark:text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          MITRE MAPPED
        </span>
      </div>

      {/* Path Selector Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {HARDCODED_ATTACK_PATHS.map((path) => (
          <button
            key={path.id}
            onClick={() => setSelectedPathId(path.id)}
            className={cn(
              "px-3 py-1.5 rounded text-[10px] font-mono uppercase tracking-wider transition-all border cursor-pointer",
              selectedPathId === path.id
                ? "bg-amber-500/10 border-amber-500 text-amber-500 dark:text-amber-400 font-bold shadow-[0_0_8px_rgba(230,150,20,0.15)]"
                : "bg-slate-50 dark:bg-[#0B1220] border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 text-slate-500 dark:text-gray-400"
            )}
            id={`path-tab-${path.id}`}
          >
             <span className="flex items-center gap-1.5 justify-center">
              {path.id === "path-1" && <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />}
              {path.id === "path-2" && <Database className="w-3.5 h-3.5 shrink-0 text-amber-500" />}
              {path.id !== "path-1" && path.id !== "path-2" && <Mail className="w-3.5 h-3.5 shrink-0 text-amber-500" />}
              <span>
                {path.id === "path-1"
                  ? "Corridor RCE (89%)"
                  : path.id === "path-2"
                  ? "Leakage Route (84%)"
                  : "Phishing Pivot (62%)"}
              </span>
             </span>
          </button>
        ))}
      </div>

      {/* Path details summary card */}
      <div className="bg-slate-50/75 dark:bg-[#0B1220]/80 border border-slate-200 dark:border-gray-800/80 rounded-lg p-3 sm:p-4 mb-4">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h4 className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 uppercase font-mono tracking-tight">
            {activePath.name}
          </h4>
          <div className="text-right shrink-0">
            <span className="text-[9px] font-mono text-slate-400 dark:text-gray-400 uppercase block">PATH SCORES</span>
            <span className="text-base font-black text-rose-500 font-mono tracking-tighter">
              {activePath.riskScore}% Risk
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-700 dark:text-gray-300 mb-3 leading-relaxed">
          {activePath.description}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[8px] font-mono text-slate-400 dark:text-gray-500 uppercase tracking-widest">
            Mitre Matrix Codes:
          </span>
          {activePath.mitreMapping.map((code) => (
            <span
              key={code}
              className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-[#111827] text-cyan-600 dark:text-[#38BDF8] border border-slate-200 dark:border-gray-800 rounded px-1.5 py-0.5"
            >
              {code}
            </span>
          ))}
        </div>
      </div>

      {/* Attack Chain Horizontal Steps */}
      <div className="relative pt-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {activePath.steps.map((step, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between h-full bg-slate-50/60 dark:bg-[#0B1220]/60 border border-slate-200 dark:border-gray-800 p-3 rounded-lg text-left"
              id={`path-step-${idx}`}
            >
              <div>
                {/* Step index */}
                <span className="inline-block text-[8px] font-mono bg-amber-500/10 text-amber-550 dark:text-amber-400 font-black border border-amber-500/20 px-1.5 py-0.2 select-none uppercase mb-2 rounded">
                  STEP 0{idx + 1}
                </span>
                <p className="text-xs font-black text-slate-900 dark:text-white font-mono leading-tight mb-1">
                  {step.label}
                </p>
                <p className="text-[10px] font-mono text-cyan-600 dark:text-[#38BDF8] font-bold uppercase mb-2">
                  {step.vector}
                </p>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 leading-tight italic bg-white dark:bg-[#111827] p-1.5 rounded border border-slate-200 dark:border-gray-800/80">
                {step.note}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
