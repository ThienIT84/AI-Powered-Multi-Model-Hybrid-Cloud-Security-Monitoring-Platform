import React from "react";
import { X, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AlertRecord } from "./reportsConfig";

interface ReportDetailsPanelProps {
  selectedReportDetail: AlertRecord | null;
  onClose: () => void;
  triggerExportSimulation: (title: string, format: string) => void;
}

export function ReportDetailsPanel({
  selectedReportDetail,
  onClose,
  triggerExportSimulation,
}: ReportDetailsPanelProps) {
  return (
    <AnimatePresence>
      {selectedReportDetail && (
        <motion.div
          initial={{ opacity: 0, width: 0, scale: 0.95 }}
          animate={{ opacity: 1, width: 440, scale: 1 }}
          exit={{ opacity: 0, width: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 28, stiffness: 250 }}
          className="bg-card border border-border/80 rounded-xl p-5 shadow-2xl overflow-hidden select-none font-mono text-[9.5px] shrink-0 sticky top-4 max-h-[85vh] flex flex-col justify-between text-slate-800 dark:text-slate-100"
        >
          <div className="w-99.5 space-y-5 flex-1 overflow-y-auto pr-1">
            {/* Header inside panel */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="space-y-1">
                  <span className="text-[8px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded uppercase font-black tracking-wider block w-fit">
                    {selectedReportDetail.id} INCIDENT RECORD
                  </span>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                    SOC Deep Threat Assessment
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 border border-border dark:border-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sub sections info */}
              <div className="grid grid-cols-2 gap-2.5 uppercase font-semibold leading-normal">
                <div className="bg-slate-50 dark:bg-[#090d14] border border-border dark:border-slate-850 p-2 rounded font-mono">
                  <span className="text-slate-500 dark:text-slate-400 block text-[7.5px] font-black uppercase tracking-widest">
                    Attacker Source IP
                  </span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-extrabold text-[9.5px] tracking-wider">
                    {selectedReportDetail.sourceIp}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-[#090d14] border border-border dark:border-slate-850 p-2 rounded font-mono">
                  <span className="text-slate-500 dark:text-slate-400 block text-[7.5px] font-black uppercase tracking-widest">
                    Target Location / Code
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-extrabold text-[9.5px] tracking-wider">
                    {selectedReportDetail.country} Region
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-[#090d14] border border-border dark:border-slate-850 p-2 rounded col-span-2 font-mono">
                  <span className="text-slate-500 dark:text-slate-400 block text-[7.5px] font-black uppercase tracking-widest">
                    Affected Asset Target
                  </span>
                  <span className="text-slate-850 dark:text-slate-200 font-extrabold block text-[9px] leading-tight line-clamp-1">
                    {selectedReportDetail.affectedAsset}
                  </span>
                </div>
              </div>
            </div>

            {/* Section: Raw Evidence Log */}
            <div className="space-y-1.5">
              <span className="text-[8px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest block">
                Raw Intrusion Evidence Logs
              </span>
              <pre className="p-3 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-350 border border-border dark:border-slate-800 rounded-lg max-h-35 overflow-y-auto custom-scrollbar select-text leading-relaxed font-mono whitespace-pre-wrap text-[9px]">
                {selectedReportDetail.evidence}
              </pre>
            </div>

            {/* Model Consensus Analytics */}
            <div className="space-y-2 border-t border-border/80 pt-4">
              <span className="text-[8px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest block">
                Multi-Model ML consensus
              </span>

              <div className="grid grid-cols-2 gap-2 leading-normal">
                <div className="bg-slate-50 dark:bg-[#090d14] border border-border dark:border-slate-850 p-2 rounded">
                  <span className="text-slate-500 dark:text-slate-400 block text-[7px] font-bold">AI1 Anomaly Eng</span>
                  <div className="flex justify-between items-center text-[8.5px] font-black uppercase tracking-wider mt-1">
                    <span className="text-slate-800 dark:text-slate-200">
                      {selectedReportDetail.aiDecisions?.ai1?.label || "NORMAL"}
                    </span>
                    <span className="text-cyan-600 dark:text-cyan-400">
                      {selectedReportDetail.aiDecisions?.ai1?.confidence || 0}% Conf
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#090d14] border border-border dark:border-slate-850 p-2 rounded">
                  <span className="text-slate-500 dark:text-slate-400 block text-[7px] font-bold">
                    AI2A Attack Classifier
                  </span>
                  <div className="flex justify-between items-center text-[8.5px] font-black uppercase tracking-wider mt-1">
                    <span className="text-slate-800 dark:text-slate-200">
                      {selectedReportDetail.aiDecisions?.ai2a?.label || "Normal"}
                    </span>
                    <span className="text-purple-600 dark:text-purple-400">
                      {selectedReportDetail.aiDecisions?.ai2a?.confidence || 0}% Conf
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#090d14] border border-border dark:border-slate-850 p-2 rounded">
                  <span className="text-slate-500 dark:text-slate-400 block text-[7px] font-bold">
                    AI2B Web Attack Eng
                  </span>
                  <div className="flex justify-between items-center text-[8.5px] font-black uppercase tracking-wider mt-1">
                    <span className="text-slate-800 dark:text-slate-200">
                      {selectedReportDetail.aiDecisions?.ai2b?.label || "Normal"}
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      {selectedReportDetail.aiDecisions?.ai2b?.confidence || 0}% Conf
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#090d14] border border-border dark:border-slate-850 p-2 rounded">
                  <span className="text-slate-500 dark:text-slate-400 block text-[7px] font-bold">
                    Fusion Layer Consensus
                  </span>
                  <div className="flex justify-between items-center text-[8.5px] font-black uppercase tracking-wider mt-1">
                    <span className="text-slate-800 dark:text-slate-200">
                      {selectedReportDetail.aiDecisions?.fusion?.action || "LOG_ONLY"}
                    </span>
                    <span className="text-rose-600 dark:text-rose-500">
                      {selectedReportDetail.aiDecisions?.fusion?.risk || 0}% Risk
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* MITRE Mapping & Recommendations */}
            <div className="space-y-4 border-t border-border/80 pt-4 font-semibold uppercase leading-relaxed">
              <div className="space-y-1">
                <span className="text-[8px] text-slate-500 dark:text-slate-400 block font-bold">
                  MITRE Enterprise Techniques
                </span>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {selectedReportDetail.mitreMapping.map((item, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-100 dark:bg-[#090d14] border border-border dark:border-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[8px] font-black tracking-widest"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[8px] text-slate-505 dark:text-slate-400 block font-bold">
                  Mitigation recommendations
                </span>
                <div className="p-3 bg-cyan-55 dark:bg-cyan-950/10 border border-cyan-500/10 text-slate-600 dark:text-slate-350 rounded-lg text-[8.5px] leading-relaxed">
                  Deploy mitigation triggers instantly to block target source IP, sync state to WAF
                  edge networks, and redirect malicious DNS sweeps to mock sinkhole honeypots. Verify
                  microservice connectivity matches normal baselines before system reset.
                </div>
              </div>
            </div>
          </div>

          {/* Close controls at bottom */}
          <div className="border-t border-border pt-3 flex gap-2 w-99.5">
            <button
              type="button"
              onClick={() =>
                triggerExportSimulation(`Assessment Report for ${selectedReportDetail.id}`, "PDF")
              }
              className="flex-1 bg-cyan-550 dark:bg-cyan-500 text-white dark:text-slate-950 py-2 rounded text-[9.5px] font-black uppercase flex items-center justify-center gap-1 hover:opacity-90 transition cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Generate PDF Brief</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-150 dark:bg-[#020617] border border-border dark:border-slate-800 text-slate-500 dark:text-slate-400 px-3 py-2 rounded font-black hover:text-slate-800 dark:hover:text-white uppercase text-[9.5px] transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
