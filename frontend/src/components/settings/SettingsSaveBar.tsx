import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, Save } from "lucide-react";

interface SettingsSaveBarProps {
  isDirty: boolean;
  onDiscard: () => void;
  onSave: () => void;
}

export function SettingsSaveBar({ isDirty, onDiscard, onSave }: SettingsSaveBarProps) {
  return (
    <AnimatePresence>
      {isDirty && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 py-4 bg-card dark:bg-[#0a0a0d] border border-border/80 rounded-2xl shadow-2xl z-50 flex items-center justify-between select-none"
        >
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 animate-pulse border border-orange-500/20">
                <span className="text-lg font-black font-mono">!</span>
             </div>
             <div>
                <h4 className="text-[11px] font-mono font-black text-foreground uppercase tracking-widest leading-none">Unsaved Configuration Changes</h4>
                <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mt-2">Adjusted settings will only persist after commit</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
               onClick={onDiscard}
               className="px-5 py-2.5 bg-muted text-muted-foreground text-[10px] font-mono font-black uppercase tracking-widest rounded-xl hover:text-foreground hover:bg-muted/80 transition-all flex items-center gap-2 cursor-pointer border border-border"
             >
                <RotateCcw size={14} /> Discard
             </button>
             <button 
               onClick={onSave}
               className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-mono font-black uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all flex items-center gap-2 cursor-pointer"
             >
                <Save size={14} /> Commit Changes
             </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default SettingsSaveBar;
