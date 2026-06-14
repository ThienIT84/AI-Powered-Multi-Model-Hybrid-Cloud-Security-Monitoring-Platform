import React from "react";
import { Download, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ExportProgressModalProps {
  exportModalOpen: boolean;
  setExportModalOpen: (isOpen: boolean) => void;
  exportTitle: string;
  exportFormat: string;
  exportProgress: number;
  exportStep: string;
}

export function ExportProgressModal({
  exportModalOpen,
  setExportModalOpen,
  exportTitle,
  exportFormat,
  exportProgress,
  exportStep,
}: ExportProgressModalProps) {
  return (
    <AnimatePresence>
      {exportModalOpen && (
        <div className="fixed inset-0 z-300 overflow-hidden flex items-center justify-center select-none font-mono text-[9.5px]">
          {/* Backdrop filter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (exportProgress >= 100) setExportModalOpen(false);
            }}
            className="absolute inset-0 bg-[#020617]"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-card border border-border/80 rounded-2xl shadow-2xl p-6 relative z-10 space-y-5 flex flex-col items-center text-center text-slate-800 dark:text-slate-100"
          >
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 dark:text-cyan-400 rounded-full">
              <Download className={`w-6 h-6 ${exportProgress < 100 ? "animate-bounce" : ""}`} />
            </div>

            <div className="space-y-1.5 select-none w-full">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                Compiling Security SOC Report assets
              </h3>
              <p className="text-slate-500 dark:text-slate-400 uppercase leading-snug line-clamp-1">
                Target: {exportTitle} ({exportFormat})
              </p>
            </div>

            {/* Progress bar state */}
            <div className="w-full space-y-2 text-center uppercase font-bold tracking-widest text-[#06b6d4] text-[8.5px]">
              <div className="flex justify-between items-center text-[9px] font-black">
                <span>{exportStep}</span>
                <span>{exportProgress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden border border-border dark:border-slate-900">
                <div className="h-full bg-cyan-500 transition-all duration-300 rounded-full" style={{ width: `${exportProgress}%` }} />
              </div>
            </div>

            {/* Success validation feedback */}
            {exportProgress >= 100 ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2.5 w-full pt-1"
              >
                <div className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase text-[9px] flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> SUCCESS • ARCHIVE COMPILED SECURELY
                </div>
                <button
                  onClick={() => setExportModalOpen(false)}
                  className="bg-cyan-500 text-slate-950 font-black py-2 rounded-xl text-[10px] uppercase w-full block hover:opacity-95 text-center mt-2 cursor-pointer"
                >
                  Download Compiled Asset
                </button>
              </motion.div>
            ) : (
              <div className="text-[8px] text-slate-500 uppercase font-extrabold border-t border-border pt-3 w-full text-center">
                Consensus layer lock indicators active. Do not close browser window during report generation pipelines.
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
