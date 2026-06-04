import React, { useState } from "react";
import { 
  Settings, 
  RefreshCw, 
  Lock, 
  FileText, 
  Flame, 
  BookOpen,
  Sparkles
} from "lucide-react";
import { cn } from "../../lib/utils";

export function SecurityActionCenter() {
  const [toasts, setToasts] = useState<{ id: string; msg: string; type: "info" | "success" | "warn" }[]>([]);

  const addToast = (msg: string, type: "info" | "success" | "warn" = "info") => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-start shadow-sm select-none relative overflow-hidden h-fit self-start">
      
      {/* Toast notifications rendering container */}
      <div className="absolute top-2 right-2规则 z-50 flex flex-col gap-1.5 pointer-events-none select-none max-w-xs text-[8.5px] font-mono leading-none font-black shadow-lg">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={cn(
              "p-2 px-2.5 rounded-lg border shadow-lg border-l-4 pointer-events-auto select-none",
              t.type === "success" 
                ? "bg-emerald-50/95 dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-400" 
                : t.type === "warn" 
                  ? "bg-red-50/95 dark:bg-red-950 border-red-500 text-red-800 dark:text-red-400" 
                  : "bg-cyan-50/95 dark:bg-cyan-950 border-cyan-500 text-cyan-800 dark:text-cyan-400"
            )}
          >
            {t.msg}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4 border-b border-border/20 pb-2 shrink-0">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Settings className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-pulse" />
          SECURITY OPERATIONS IMMEDIATE MITIGATION ACTION CENTER
        </h3>
        <span className="text-[7px] bg-cyan-500/10 dark:bg-[#06b6d4]/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/15 dark:border-cyan-500/15 px-2 py-0.5 rounded uppercase font-black font-mono">
          MITIGATION ENGINE
        </span>
      </div>

      {/* Grid actions buttons list */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 select-none">
        
        {/* Action 1: View Alerts */}
        <button
          onClick={() => addToast("Querying Realtime Alert Index Console...", "info")}
          className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-border bg-secondary/15 hover:bg-secondary/40 hover:border-cyan-500/30 transition-all text-center cursor-pointer"
        >
          <FileText size={16} className="text-cyan-600 dark:text-cyan-400" />
          <span className="text-[8.5px] font-black uppercase tracking-wider text-foreground">View Alerts</span>
        </button>

        {/* Action 2: Investigate Campaign */}
        <button
          onClick={() => addToast("Reconstructing Multi-Stage Graph Map for current campaign...", "info")}
          className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-border bg-secondary/15 hover:bg-secondary/40 hover:border-cyan-500/30 transition-all text-center cursor-pointer"
        >
          <Flame size={16} className="text-purple-600 dark:text-purple-400" />
          <span className="text-[8.5px] font-black uppercase tracking-wider text-foreground">Investigate Camp</span>
        </button>

        {/* Action 3: Generate Summary */}
        <button
          onClick={() => addToast("AI Incident Summary compile sequences dispatched.", "success")}
          className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-border bg-secondary/15 hover:bg-secondary/40 hover:border-cyan-500/30 transition-all text-center cursor-pointer"
        >
          <Sparkles size={16} className="text-amber-600 dark:text-amber-400" />
          <span className="text-[8.5px] font-black uppercase tracking-wider text-foreground">Gen AI Summary</span>
        </button>

        {/* Action 4: Block Source Ip */}
        <button
          onClick={() => addToast("Security Rules deployed to WAF firewall: Ad IP isolated successfully.", "warn")}
          className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-border bg-secondary/15 hover:bg-secondary/40 hover:border-red-500/30 transition-all text-center cursor-pointer"
        >
          <Lock size={16} className="text-red-500 animate-pulse" />
          <span className="text-[8.5px] font-black uppercase tracking-wider text-red-650 dark:text-red-500">Block Source IP</span>
        </button>

        {/* Action 5: Create Playbook */}
        <button
          onClick={() => addToast("Mitigation Playbook created for current threat signature.", "success")}
          className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-border bg-secondary/15 hover:bg-secondary/40 hover:border-cyan-500/30 transition-all text-center cursor-pointer"
        >
          <BookOpen size={16} className="text-cyan-600 dark:text-cyan-400" />
          <span className="text-[8.5px] font-black uppercase tracking-wider text-foreground">Create Playbook</span>
        </button>

        {/* Action 6: Clear Stream */}
        <button
          onClick={() => addToast("Consolidated stream cache cleared successfully.", "info")}
          className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-border bg-secondary/15 hover:bg-secondary/40 hover:border-cyan-500/30 transition-all text-center cursor-pointer"
        >
          <RefreshCw size={16} className="text-muted-foreground" />
          <span className="text-[8.5px] font-black uppercase tracking-wider text-foreground">Clear Stream</span>
        </button>

      </div>
    </div>
  );
}

export default SecurityActionCenter;
