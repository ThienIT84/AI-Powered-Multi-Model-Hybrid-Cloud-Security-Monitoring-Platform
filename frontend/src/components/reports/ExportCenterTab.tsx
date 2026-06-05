import React from "react";
import { FileText, Download } from "lucide-react";

interface ExportCenterTabProps {
  triggerExportSimulation: (title: string, format: string) => void;
  timeframe: string;
}

export function ExportCenterTab({
  triggerExportSimulation,
  timeframe,
}: ExportCenterTabProps) {
  return (
    <div className="space-y-6 animate-fadeIn" id="export-center-view">
      
      {/* EXPORT COMPLETED CARD ACTIONS */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        
        <div className="border-b border-border pb-3">
          <h3 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase tracking-wider block">
            Security Report Compilation & Export Center
          </h3>
          <p className="text-[10px] uppercase font-mono tracking-wide text-slate-500 dark:text-slate-400 mt-1">
            Download verified briefing packages containing model parameters, matrix states, and offending threat records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-[9.5px]">
          
          {/* Action 1: Full briefing PDF */}
          <div className="bg-slate-50 dark:bg-[#090d16] border border-border dark:border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-500 border border-rose-500/10 rounded-lg inline-block">
                <FileText className="w-5 h-5" />
              </span>
              <p className="font-extrabold text-slate-900 dark:text-white uppercase text-[10.5px]">Executive briefing brief</p>
              <p className="text-[8px] text-slate-500 uppercase leading-relaxed font-bold">Generates a fully stylized executive overview, metrics, charts, tables, and mitigation highlights in PDF format.</p>
            </div>
            <button
              onClick={() => triggerExportSimulation(`Executive Assessment Overview (${timeframe})`, "PDF")}
              className="bg-cyan-500 hover:opacity-90 text-slate-950 font-black py-2 rounded text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Compile PDF Briefing
            </button>
          </div>

          {/* Action 2: Raw data logs CSV */}
          <div className="bg-slate-50 dark:bg-[#090d16] border border-border dark:border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="p-2 bg-cyan-500/10 text-cyan-600 dark:text-cyan-500 border border-cyan-500/10 rounded-lg inline-block">
                <FileText className="w-5 h-5" />
              </span>
              <p className="font-extrabold text-slate-900 dark:text-white uppercase text-[10.5px]">Hacker IP log entries</p>
              <p className="text-[8px] text-slate-500 uppercase leading-relaxed font-bold">Compiles standard CSV matrices containing raw attacker logs, country origins, vulnerability vectors, and target assets.</p>
            </div>
            <button
              onClick={() => triggerExportSimulation(`Hacker IP Source Matrix (${timeframe})`, "CSV")}
              className="bg-slate-100 dark:bg-slate-950 border border-border dark:border-slate-850 hover:bg-slate-200 dark:hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-extrabold py-2 rounded text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download IP CSV
            </button>
          </div>

          {/* Action 3: Model parameters metadata JSON */}
          <div className="bg-slate-50 dark:bg-[#090d16] border border-border dark:border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-500 border border-purple-500/10 rounded-lg inline-block">
                <FileText className="w-5 h-5" />
              </span>
              <p className="font-extrabold text-slate-900 dark:text-white uppercase text-[10.5px]">Deep model metadata JSON</p>
              <p className="text-[8px] text-slate-500 uppercase leading-relaxed font-bold">Dispatches full high-fidelity raw model weights, confusion matrix cells, drift indexes, and SHAP output indices in JSON format.</p>
            </div>
            <button
              onClick={() => triggerExportSimulation(`Multi-Model Parameters Metadata (${timeframe})`, "JSON")}
              className="bg-slate-100 dark:bg-slate-950 border border-border dark:border-slate-850 hover:bg-slate-200 dark:hover:bg-slate-200 text-purple-700 dark:text-purple-400 font-extrabold py-2 rounded text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download JSON Model
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
