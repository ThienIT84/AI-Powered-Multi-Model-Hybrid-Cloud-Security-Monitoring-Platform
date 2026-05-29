import React from "react";
import { useSettingsStore } from "../../store/useSettingsStore";
import { cn } from "../../lib/utils";
import { Sun, Moon, Monitor, Eye, Palette } from "lucide-react";

const ACCENT_COLORS = [
  { name: 'Cyan', color: '#06b6d4', class: 'bg-cyan-500' },
  { name: 'Purple', color: '#8b5cf6', class: 'bg-purple-500' },
  { name: 'Red', color: '#ef4444', class: 'bg-red-500' },
  { name: 'Orange', color: '#f59e0b', class: 'bg-orange-500' },
  { name: 'Green', color: '#10b981', class: 'bg-emerald-500' },
];

export function AppearanceSettings() {
  const { draftSettings, updateDraft } = useSettingsStore();
  const data = draftSettings.appearance;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div>
        <h3 className="text-base font-black text-foreground uppercase tracking-widest mb-1.5 flex items-center gap-2">
          <Palette className="w-4 h-4 text-cyan-500" />
          Appearance (UI Config)
        </h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Interface themes, accent colorways, and layout density systems</p>
      </div>

      {/* Theme Selection Section */}
      <div className="space-y-4">
        <label className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest ml-1 block">
          🎨 Theme System Selection
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'light', label: 'LIGHT THEME', icon: Sun, desc: 'Clean high contrast UI' },
            { id: 'dark', label: 'DARK THEME (DEFAULT)', icon: Moon, desc: 'Immersive dark workspace' },
            { id: 'system', label: 'SYSTEM MODE', icon: Monitor, desc: 'Follow OS preferences' },
          ].map((theme) => (
            <button
              key={theme.id}
              onClick={() => updateDraft('appearance.theme', theme.id)}
              className={cn(
                "flex flex-col items-center sm:items-start text-center sm:text-left gap-3 p-5 rounded-xl border-2 transition-all relative overflow-hidden group cursor-pointer",
                data.theme === theme.id 
                  ? "border-cyan-500 bg-cyan-500/5 text-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.12)]" 
                  : "border-border bg-card text-muted-foreground hover:border-border/80"
              )}
            >
              <div className="flex items-center gap-2.5">
                <theme.icon className={cn("w-5 h-5", data.theme === theme.id ? "text-cyan-500 animate-pulse" : "text-muted-foreground")} />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">{theme.label}</span>
              </div>
              <p className="text-[8.5px] font-mono text-muted-foreground/80 uppercase tracking-wider mt-1">{theme.desc}</p>
              {data.theme === theme.id && (
                <div className="absolute right-3 top-3 w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Accents Selector & Density Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Accent Colors Card */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div>
            <span className="text-[8px] font-mono font-black text-muted-foreground uppercase tracking-widest">VISUAL VIBE</span>
            <h4 className="text-[11px] font-black text-foreground uppercase tracking-wider mt-0.5">🌈 Accent Colors Selection</h4>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-1">
            {ACCENT_COLORS.map((item) => {
              const isSelected = data.accentColor === item.color || 
                (item.name === 'Cyan' && (!data.accentColor || data.accentColor === '#06b6d4'));
              return (
                <button
                  key={item.name}
                  onClick={() => updateDraft('appearance.accentColor', item.color)}
                  className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer group"
                >
                  <div className="relative flex items-center justify-center">
                    <div 
                      className={cn(
                        "w-9 h-9 rounded-full transition-all flex items-center justify-center border",
                        isSelected 
                          ? "border-foreground scale-110 shadow-[0_0_10px_rgba(6,182,212,0.2)]" 
                          : "border-transparent group-hover:scale-105"
                      )}
                      style={{ backgroundColor: item.color }}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white opacity-90 shadow-sm" />
                      )}
                    </div>
                  </div>
                  <span className={cn(
                    "text-[8px] font-mono font-bold tracking-wider uppercase",
                    isSelected ? "text-cyan-500 font-black" : "text-muted-foreground"
                  )}>
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interface preferences Card */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div>
            <span className="text-[8px] font-mono font-black text-muted-foreground uppercase tracking-widest">TUNERS</span>
            <h4 className="text-[11px] font-black text-foreground uppercase tracking-wider mt-0.5">⚙️ Interface Preferences</h4>
          </div>

          <div className="space-y-3">
            {/* Compact Mode */}
            <div className="flex items-center justify-between p-3.5 bg-muted/35 border border-border rounded-xl">
              <div>
                <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest">Compact Mode</span>
                <p className="text-[8.5px] font-mono text-muted-foreground uppercase tracking-wide mt-0.5">Minimize layout spacing guidelines</p>
              </div>
              <button 
                onClick={() => updateDraft('appearance.compactMode', !data.compactMode)}
                className={cn(
                  "w-10 h-5.5 rounded-full transition-all relative border border-border/60 cursor-pointer",
                  data.compactMode ? "bg-cyan-500" : "bg-muted"
                )}
              >
                <div className={cn(
                  "absolute top-0.75 w-3.5 h-3.5 rounded-full bg-slate-900 dark:bg-white transition-all shadow-sm",
                  data.compactMode ? "right-1" : "left-1"
                )} />
              </button>
            </div>

            {/* Motion & Animations */}
            <div className="flex items-center justify-between p-3.5 bg-muted/35 border border-border rounded-xl">
              <div>
                <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest">Motion & Animations</span>
                <p className="text-[8.5px] font-mono text-muted-foreground uppercase tracking-wide mt-0.5">Smooth route and tab animations</p>
              </div>
              <button 
                onClick={() => updateDraft('appearance.animations', !data.animations)}
                className={cn(
                  "w-10 h-5.5 rounded-full transition-all relative border border-border/60 cursor-pointer",
                  data.animations ? "bg-cyan-500" : "bg-muted"
                )}
              >
                <div className={cn(
                  "absolute top-0.75  w-3.5 h-3.5 rounded-full bg-slate-900 dark:bg-white transition-all shadow-sm",
                  data.animations ? "right-1" : "left-1"
                )} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Panel Card */}
      <div className="p-6 bg-card border border-border rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-500" />
            <h4 className="text-[11px] font-mono font-black text-foreground uppercase tracking-widest ml-1">
              📐 UI PREVIEW PANEL
            </h4>
          </div>
          <span className="text-[8px] font-mono font-black text-cyan-500 border border-cyan-500/20 px-2 py-0.5 bg-cyan-500/5 rounded uppercase">
            LIVE CONFIG RENDER
          </span>
        </div>

        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-4">
          Live spacing preview showing layout density and spacing patterns:
        </p>

        {/* Dynamic preview elements based on configuration values */}
        <div className={cn(
          "border border-border/60 bg-muted/15 rounded-xl transition-all duration-300",
          data.compactMode ? "p-3 space-y-2" : "p-6 space-y-4"
        )}>
          {/* Header row in preview */}
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
              <span className="text-[9px] font-mono font-bold text-foreground">DEMO_SECURE_WIDGET.XML</span>
            </div>
            <span className="text-[8.5px] font-mono text-muted-foreground/60">12 SEC AGO</span>
          </div>

          {/* Dummy visual data list */}
          <div className="space-y-2">
            <div className={cn(
              "bg-card border border-border rounded-lg flex items-center justify-between shadow-sm",
              data.compactMode ? "px-3 py-1.5" : "px-4 py-2.5"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded flex items-center justify-center text-[8px] font-mono font-bold">
                  AI
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9.5px] font-mono font-bold text-foreground uppercase">Botnet Exfiltration Detector</span>
                  <p className="text-[7.5px] font-mono text-muted-foreground/80 leading-none">HIGH CONFIDENCE INDICATOR</p>
                </div>
              </div>
              <span className="text-[9.5px] font-mono font-black text-red-500 uppercase">99.2% MATCH</span>
            </div>

            <div className={cn(
              "bg-card border border-border rounded-lg flex items-center justify-between shadow-sm",
              data.compactMode ? "px-3 py-1.5" : "px-4 py-2.5"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 rounded flex items-center justify-center text-[8px] font-mono font-bold">
                  K
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9.5px] font-mono font-bold text-foreground uppercase">Kafka Consumer Pipeline Stream</span>
                  <p className="text-[7.5px] font-mono text-muted-foreground/80 leading-none">727,500 EVENTS PER SEC</p>
                </div>
              </div>
              <span className="text-[9.5px] font-mono font-black text-emerald-500 uppercase">HEALTHY</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[8px] font-mono text-muted-foreground uppercase">
              Current state: <strong className="text-foreground">{data.compactMode ? 'COMPACT (HIGH DENSITY)' : 'COMFORTABLE (STANDARD)'}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
