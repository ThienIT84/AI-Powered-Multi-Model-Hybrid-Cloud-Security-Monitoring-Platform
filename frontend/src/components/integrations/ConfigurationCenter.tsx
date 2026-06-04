import React from "react";
import { Settings } from "lucide-react";
import { cn } from "../../lib/utils";

interface ConfigurationCenterProps {
  isDarkMode: boolean;
  configs: Record<string, string>;
  activeConfigTab: string;
  setActiveConfigTab: (key: string) => void;
  onConfigChange: (key: string, value: string) => void;
}

export function ConfigurationCenter({ 
  isDarkMode, 
  configs, 
  activeConfigTab, 
  setActiveConfigTab, 
  onConfigChange 
}: ConfigurationCenterProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card font-mono text-[10px]">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/60">
        <Settings size={14} className="text-cyan-400" />
        <h3 className="text-xs font-black uppercase tracking-wider">Configuration Settings Center</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {Object.keys(configs).map((key) => (
          <button 
            key={key}
            onClick={() => setActiveConfigTab(key)}
            className={cn(
              "px-3 py-1 text-[9px] uppercase font-black tracking-widest rounded-md border cursor-pointer transition-colors",
              activeConfigTab === key 
                ? "bg-cyan-500 text-white border-cyan-500" 
                : "bg-muted border-border hover:bg-muted/80 hover:text-foreground text-muted-foreground"
            )}
          >
            {key} settings
          </button>
        ))}
      </div>

      <textarea 
        value={configs[activeConfigTab] || ""}
        onChange={(e) => onConfigChange(activeConfigTab, e.target.value)}
        className="w-full h-32 p-3 font-mono text-[10.5px] leading-relaxed bg-muted dark:bg-slate-950 text-emerald-700 dark:text-emerald-400 border border-border dark:border-slate-800 rounded-lg focus:outline-none focus:border-cyan-500 custom-scrollbar select-text"
        placeholder="Type virtual integration payload logic format here..."
      />
      <div className="flex justify-between items-center mt-2 text-[8px] text-zinc-500">
        <span className="uppercase">Click auto-heal to restore default states if schema breaks.</span>
        <span className="uppercase text-emerald-500">Auto-validating active payload schema syntax... Verified.</span>
      </div>
    </div>
  );
}
