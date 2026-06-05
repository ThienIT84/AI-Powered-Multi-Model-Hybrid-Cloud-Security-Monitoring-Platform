import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle } from "lucide-react";

interface SettingsDiscardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SettingsDiscardModal({ isOpen, onClose, onConfirm }: SettingsDiscardModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card/95 border border-border/80 p-6 rounded-2xl max-w-sm w-full space-y-4"
          >
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
              <h4 className="text-[11px] font-mono font-black uppercase tracking-widest">Discard Structural Changes?</h4>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase leading-relaxed">
              Are you absolutely sure you want to revert all current configurations? Doing so will purge all your unsaved drafts back to live settings.
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-muted text-muted-foreground hover:text-foreground text-[9px] font-mono font-black uppercase rounded-xl transition-all cursor-pointer border border-border"
              >
                Cancel Revert
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 bg-red-650 hover:bg-red-500 text-white text-[9px] font-mono font-black uppercase rounded-xl transition-all cursor-pointer"
              >
                Purge Draft
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
export default SettingsDiscardModal;
