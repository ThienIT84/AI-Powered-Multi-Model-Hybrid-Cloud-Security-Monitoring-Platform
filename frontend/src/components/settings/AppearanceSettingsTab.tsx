import React from "react";
import { Palette, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { SettingsStateData } from "./settingsConfig";

interface AppearanceSettingsTabProps {
  data: SettingsStateData;
  onChange: (path: string, value: any) => void;
}

export function AppearanceSettingsTab({ data, onChange }: AppearanceSettingsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
          <Palette className="w-4 h-4 text-cyan-500" />
          Appearance & User Preferences
        </h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] leading-normal">
          Toggle theme modes, choose grid layout compactness, and preview live alert colors
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card/40 border border-border/70 rounded-xl p-5 shadow-sm text-[10px] font-mono">
        {/* Theme select */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 block">
            Color Theme Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["Dark", "Light", "System"] as const).map((themeVal) => (
              <button
                key={themeVal}
                onClick={() => onChange("theme", themeVal)}
                className={cn(
                  "py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer",
                  data.theme === themeVal
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-505/20 border-cyan-500/35"
                    : "bg-muted/40 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {themeVal}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Density */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 block">
            Dashboard Density Index
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["Compact", "Comfortable"] as const).map((denVal) => (
              <button
                key={denVal}
                onClick={() => onChange("density", denVal)}
                className={cn(
                  "py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer",
                  data.density === denVal
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-505/20 border-cyan-500/35"
                    : "bg-muted/40 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {denVal}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar mode */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 block">
            Sidebar Mode Alignment
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["Expanded", "Collapsed"] as const).map((smVal) => (
              <button
                key={smVal}
                onClick={() => onChange("sidebarMode", smVal)}
                className={cn(
                  "py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer",
                  data.sidebarMode === smVal
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-505/20 border-cyan-500/35"
                    : "bg-muted/40 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {smVal}
              </button>
            ))}
          </div>
        </div>

        {/* Animations */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 block">
            Interface Transitions & Animations
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["Enable", "Disable"] as const).map((anim) => (
              <button
                key={anim}
                onClick={() => onChange("animations", anim)}
                className={cn(
                  "py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer",
                  data.animations === anim
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-505/20 border-cyan-500/35"
                    : "bg-muted/40 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {anim}
              </button>
            ))}
          </div>
        </div>

        {/* Color Blind Mode */}
        <div className="space-y-2 md:col-span-2 pt-2">
          <div className="flex items-center justify-between p-3.5 bg-muted/40 border border-border/80 rounded-xl">
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider block">Access Mode: Color Blind Adaptations</span>
              <span className="text-[8px] text-muted-foreground uppercase mt-0.5 block">Enhances contrast guidelines across dynamic chart legends.</span>
            </div>
            <button
              onClick={() => onChange("colorBlindMode", !data.colorBlindMode)}
              className={cn(
                "px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer",
                data.colorBlindMode
                  ? "bg-cyan-500/10 text-cyan-505/20 text-cyan-500 border-cyan-500/30"
                  : "bg-muted border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {data.colorBlindMode ? "Staged: Enabled" : "Staged: Disabled"}
            </button>
          </div>
        </div>
      </div>

      {/* SEVERITY VIEW COLOR PREVIEW (DYNAMICS REFLECTS ALERT COLORS) */}
      <div className="border border-border/80 rounded-xl bg-card/25 p-5 space-y-4 font-mono text-[10px]">
        <span className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
          <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
          Realtime Severity Swatch Preview
        </span>

        <p className="text-[9px] text-muted-foreground uppercase lg:w-4/5 leading-relaxed">
          The swatch levels below pull colors dynamically from the Alert Management setup. Configure colors in the Alerts tab to see immediate effects.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1 text-center font-bold">
          <div 
            className="p-4 rounded-xl border text-black transition-all"
            style={{ 
              backgroundColor: data.alertColors.Critical, 
              border: `1px solid ${data.alertColors.Critical}55`,
              boxShadow: `0 0 10px ${data.alertColors.Critical}18`
            }}
          >
            <span className="block text-[8px] uppercase tracking-wider text-black/60 font-black">CRITICAL ALARM</span>
            <span className="text-[11px] font-black text-black tracking-widest">CRITICAL</span>
          </div>

          <div 
            className="p-4 rounded-xl border text-black transition-all"
            style={{ 
              backgroundColor: data.alertColors.High, 
              border: `1px solid ${data.alertColors.High}55`,
              boxShadow: `0 0 10px ${data.alertColors.High}18`
            }}
          >
            <span className="block text-[8px] uppercase tracking-wider text-black/60 font-black">HIGH ANOMALY</span>
            <span className="text-[11px] font-black text-black tracking-widest">HIGH</span>
          </div>

          <div 
            className="p-4 rounded-xl border text-black transition-all"
            style={{ 
              backgroundColor: data.alertColors.Medium, 
              border: `1px solid ${data.alertColors.Medium}55`,
              boxShadow: `0 0 10px ${data.alertColors.Medium}18`
            }}
          >
            <span className="block text-[8px] uppercase tracking-wider text-black/60 font-black font-mono">MEDIUM INCIDENT</span>
            <span className="text-[11px] font-black text-black tracking-widest">MEDIUM</span>
          </div>

          <div 
            className="p-4 rounded-xl border bg-muted border-border/80 text-muted-foreground transition-all"
          >
            <span className="block text-[8px] uppercase tracking-wider text-muted-foreground/60 font-black font-mono">LOW EVENT</span>
            <span className="text-[11px] font-black tracking-widest uppercase">LOW (BASE)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
