import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { Toast } from "../../types/settings";

interface SettingsToastPanelProps {
  toasts: Toast[];
}

export function SettingsToastPanel({ toasts }: SettingsToastPanelProps) {
  return (
    <div className="absolute top-18 right-6 space-y-2 z-50 flex flex-col pointer-events-none select-none max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            className={cn(
              "p-3.5 px-4 rounded-xl border flex items-start gap-3 shadow-2xl",
              toast.type === "success" 
                ? "bg-card/95 text-emerald-600 dark:bg-zinc-950/90 dark:text-emerald-400 border-emerald-500/20" 
                : toast.type === "warning"
                ? "bg-card/95 text-red-600 dark:bg-zinc-950/90 dark:text-red-400 border-red-500/20"
                : "bg-card/95 text-cyan-600 dark:bg-zinc-950/90 dark:text-cyan-400 border-cyan-500/20"
            )}
          >
            {toast.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
            {toast.type === "warning" && <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
            {toast.type === "info" && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
            <p className="text-[10px] font-mono tracking-wide font-black uppercase">{toast.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
export default SettingsToastPanel;
