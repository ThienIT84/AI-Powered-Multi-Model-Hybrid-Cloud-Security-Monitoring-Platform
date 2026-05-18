import React from "react";
import { useSettingsStore } from "../../store/useSettingsStore";
import { cn } from "../../lib/utils";
import { Sun, Moon, Monitor } from "lucide-react";

export function AppearanceSettings() {
  const { draftSettings, updateDraft } = useSettingsStore();
  const data = draftSettings.appearance;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Visual Configuration</h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Interface themes and aesthetic parameters</p>
      </div>

      <div className="space-y-4">
        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Interface Theme</label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Monitor },
          ].map((theme) => (
            <button
              key={theme.id}
              onClick={() => updateDraft('appearance.theme', theme.id)}
              className={cn(
                "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                data.theme === theme.id 
                  ? "border-cyan-500 bg-cyan-500/5 text-cyan-500" 
                  : "border-border bg-muted/30 text-muted-foreground hover:border-border/80"
              )}
            >
              <theme.icon size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">{theme.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Accent Color Selection</label>
          <div className="flex flex-wrap gap-3">
             {['#06b6d4', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981'].map(color => (
               <button
                 key={color}
                 onClick={() => updateDraft('appearance.accentColor', color)}
                 className={cn(
                   "w-8 h-8 rounded-full border-2 transition-all",
                   data.accentColor === color ? "border-foreground scale-110" : "border-transparent"
                 )}
                 style={{ backgroundColor: color }}
               />
             ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Interface Preferences</label>
          <div className="space-y-3">
             <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border">
                <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Compact Mode</span>
                <button 
                  onClick={() => updateDraft('appearance.compactMode', !data.compactMode)}
                  className={cn(
                    "w-10 h-5 rounded-full transition-all relative",
                    data.compactMode ? "bg-cyan-500" : "bg-border"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                    data.compactMode ? "right-1" : "left-1"
                  )} />
                </button>
             </div>
             <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border">
                <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Motion & Animations</span>
                <button 
                  onClick={() => updateDraft('appearance.animations', !data.animations)}
                  className={cn(
                    "w-10 h-5 rounded-full transition-all relative",
                    data.animations ? "bg-cyan-500" : "bg-border"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                    data.animations ? "right-1" : "left-1"
                  )} />
                </button>
             </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">UI Density Preview</h4>
        <div className="space-y-3">
           <div className="h-8 w-full bg-muted rounded-lg flex items-center px-3">
             <div className="w-4 h-4 bg-cyan-500/20 rounded mr-3" />
             <div className="h-2 w-24 bg-border rounded" />
           </div>
           <div className="h-8 w-full bg-muted rounded-lg flex items-center px-3">
             <div className="w-4 h-4 bg-purple-500/20 rounded mr-3" />
             <div className="h-2 w-32 bg-border rounded" />
           </div>
        </div>
      </div>
    </div>
  );
}
