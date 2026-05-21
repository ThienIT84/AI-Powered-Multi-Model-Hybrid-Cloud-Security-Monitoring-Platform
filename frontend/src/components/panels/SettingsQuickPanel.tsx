import React from "react";
import { FloatingPanel } from "../common/FloatingPanel";
import { cn } from "../../lib/utils";
import { Sun, Moon, Palette, Sliders, Settings as SettingsIcon, Bell } from "lucide-react";
import { useSettingsStore } from "../../store/useSettingsStore";

interface SettingsQuickPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onFullSettings: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export function SettingsQuickPanel({ 
  isOpen, 
  onClose, 
  onFullSettings,
  isDarkMode,
  onThemeToggle
}: SettingsQuickPanelProps) {
  const { draftSettings, updateDraft, saveChanges } = useSettingsStore();
  const appearance = draftSettings.appearance;

  const handleQuickUpdate = (path: string, value: any) => {
    updateDraft(path, value);
    // For quick settings, we auto-save for immediate effect in this simplified panel
    // In a real app we might want to debounced or kept separate but user asked for realtime
    setTimeout(() => saveChanges(), 50); 
  };

  return (
    <FloatingPanel isOpen={isOpen} onClose={onClose} title="Quick Preferences">
      <div className="p-1 flex flex-col gap-1">
        
        {/* Theme Toggle */}
        <div className="p-3 hover:bg-muted/30 rounded-xl transition-all border border-transparent hover:border-border group">
           <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-muted rounded-lg text-muted-foreground group-hover:text-yellow-500 transition-colors">
                    {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
                 </div>
                 <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Interface Appearance</span>
              </div>
              <button 
                onClick={onThemeToggle}
                className={cn(
                  "w-10 h-5 rounded-full transition-all relative",
                  isDarkMode ? "bg-cyan-600" : "bg-muted border border-border"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                  isDarkMode ? "right-1" : "left-1"
                )} />
              </button>
           </div>
           <p className="text-[9px] text-muted-foreground uppercase tracking-widest ml-11">Current: {isDarkMode ? 'Lunar Protocol' : 'Solar Exposure'}</p>
        </div>

        {/* Accent Color */}
        <div className="p-3 hover:bg-muted/30 rounded-xl transition-all border border-transparent hover:border-border group">
           <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-muted rounded-lg text-muted-foreground group-hover:text-cyan-500 transition-colors">
                 <Palette size={16} />
              </div>
              <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Active Accent Color</span>
           </div>
           <div className="flex items-center gap-3 ml-11">
              {['#06b6d4', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981'].map(color => (
                <button
                  key={color}
                  onClick={() => handleQuickUpdate('appearance.accentColor', color)}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all transform hover:scale-110",
                    appearance.accentColor === color ? "border-foreground" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
           </div>
        </div>

        {/* Compact Mode */}
        <div className="p-3 hover:bg-muted/30 rounded-xl transition-all border border-transparent hover:border-border group">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-muted rounded-lg text-muted-foreground group-hover:text-cyan-500 transition-colors">
                    <Sliders size={16} />
                 </div>
                 <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Global Density Mode</span>
              </div>
              <button 
                onClick={() => handleQuickUpdate('appearance.compactMode', !appearance.compactMode)}
                className={cn(
                  "w-10 h-5 rounded-full transition-all relative",
                  appearance.compactMode ? "bg-cyan-600" : "bg-muted border border-border"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                  appearance.compactMode ? "right-1" : "left-1"
                )} />
              </button>
           </div>
        </div>

        {/* Notifications */}
        <div className="p-3 hover:bg-muted/30 rounded-xl transition-all border border-transparent hover:border-border group">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-muted rounded-lg text-muted-foreground group-hover:text-red-500 transition-colors">
                    <Bell size={16} />
                 </div>
                 <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Signal Notifications</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_#10b981]" />
           </div>
        </div>

        {/* Full Settings CTA */}
        <div className="p-2 pt-4">
           <button 
             onClick={() => {
                onFullSettings();
                onClose();
             }}
             className="w-full py-3 bg-foreground text-background rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-foreground/10"
           >
              <SettingsIcon size={14} /> Global Control Panel
           </button>
        </div>
      </div>
    </FloatingPanel>
  );
}
