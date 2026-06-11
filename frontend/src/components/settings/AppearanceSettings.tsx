import React, { useState } from "react";
import { z } from "zod";
import { Palette, Eye, Sun, Moon, Sparkles, Layout, Sliders, ShieldCheck } from "lucide-react";
import { cn } from "../../lib/utils";

// Zod Schema
export const appearanceSettingsSchema = z.object({
  theme: z.enum(["Dark", "Light", "System"]),
  density: z.enum(["Compact", "Comfortable"]),
  sidebarMode: z.enum(["Expanded", "Collapsed"]),
  animations: z.enum(["Enable", "Disable"]),
  severityColorCritical: z.string().min(4, "Invalid color code"),
  severityColorHigh: z.string().min(4, "Invalid color code"),
  severityColorMedium: z.string().min(4, "Invalid color code"),
  severityColorLow: z.string().min(4, "Invalid color code"),
});

export type AppearanceSettingsType = z.infer<typeof appearanceSettingsSchema>;

interface AppearanceSettingsProps {
  data: AppearanceSettingsType;
  onChange: (path: string, value: any) => void;
}

export function AppearanceSettings({ data, onChange }: AppearanceSettingsProps) {
  // Setup color blind indicator toggle
  const [colorBlindActive, setColorBlindActive] = useState(false);

  const themeOptions = [
    { value: "Dark", label: "Lunar Dark", icon: Moon, desc: "Absolute pure carbon slate backplane with bright neon overlays" },
    { value: "Light", label: "Solar Light", icon: Sun, desc: "Slightly reflective high contrast cream backdrop for direct sunlight" },
    { value: "System", label: "Agent Follows OS", icon: Layout, desc: "Let OS security parameters command style layouts dynamically" },
  ];

  const densityOptions = [
    { value: "Compact", label: "Developer Compact", desc: "High density padding (4px border-bounds) for intense monitoring screens" },
    { value: "Comfortable", label: "Security Executive", desc: "Generous breathing negative space (12px padding-bounds) for summaries" },
  ];

  const handleOptionChange = (field: keyof AppearanceSettingsType, val: any) => {
    onChange(`appearance.${field}`, val);
  };

  return (
    <div className="space-y-6" id="appearance-settings-panel">
      {/* Visual Identity Brief */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Palette className="w-4 h-4 text-cyan-500" />
          Appearance & UX Preferences
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Customize UI aesthetics, layout typography grids, density formats, micro-animations, and operational severity marker palettes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Theme Selectors */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card: Theme Style */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-border/40 pb-2">
              <Sun className="w-3.5 h-3.5 text-cyan-500" />
              General Window Interface Theme
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = data.theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleOptionChange("theme", opt.value)}
                    className={cn(
                      "flex flex-col items-start p-4 rounded-xl border text-left transition cursor-pointer select-none",
                      isSelected 
                        ? "bg-cyan-500/5 border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold" 
                        : "bg-slate-50/50 dark:bg-slate-900/30 border-border/85 hover:bg-slate-100 dark:hover:bg-slate-900/60"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 mb-3", isSelected ? "text-cyan-500" : "text-slate-400")} />
                    <span className="text-xs font-mono font-black uppercase tracking-wider text-slate-900 dark:text-white mb-1">
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-500 leading-normal font-medium font-mono uppercase">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid Layout settings: Density & Sidebar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Density */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-500" />
                Display Sizing Density
              </h4>
              <div className="flex flex-col gap-2 pt-1">
                {densityOptions.map((opt) => {
                  const isSelected = data.density === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleOptionChange("density", opt.value)}
                      className={cn(
                        "flex flex-col p-3 rounded-lg border text-left cursor-pointer transition select-none",
                        isSelected 
                          ? "bg-cyan-500/5 border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold" 
                          : "bg-slate-50/60 dark:bg-slate-900/30 border-border/85 hover:border-border"
                      )}
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white">{opt.label}</span>
                      <span className="text-[8.5px] text-slate-500 dark:text-zinc-500 uppercase leading-normal font-mono font-medium">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar & Animations */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm font-mono">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-cyan-500" />
                Sidebar & Canvas Mechanics
              </h4>

              {/* Sidebar expanding */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase block">Default Sidebar Position</span>
                  <span className="text-[8px] text-slate-500 uppercase block font-medium">Auto expanded nested groups</span>
                </div>
                <div className="bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-border/80 flex">
                  {["Expanded", "Collapsed"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleOptionChange("sidebarMode", mode)}
                      className={cn(
                        "px-2 py-1 text-[8.5px] font-black uppercase rounded cursor-pointer border-none transition",
                        data.sidebarMode === mode ? "bg-cyan-500 text-slate-950" : "text-slate-500"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animations */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase block">Animate UI Canvas Elements</span>
                  <span className="text-[8px] text-slate-500 uppercase block font-medium">Hover actions and card fades</span>
                </div>
                <div className="bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-border/80 flex">
                  {["Enable", "Disable"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleOptionChange("animations", mode)}
                      className={cn(
                        "px-2.5 py-1 text-[8.5px] font-black uppercase rounded cursor-pointer border-none transition",
                        data.animations === mode ? "bg-cyan-500 text-slate-950" : "text-slate-500"
                      )}
                    >
                      {mode === "Enable" ? "On" : "Off"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Severity Color Preview Panel */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm font-mono flex flex-col justify-between h-full">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-border/40 pb-2">
                <Eye className="w-3.5 h-3.5 text-cyan-500" />
                Color Guard Previews
              </h4>
              <p className="text-[9px] text-slate-500 dark:text-zinc-500 uppercase font-medium leading-normal">
                Review core compliance severity indicators. Modify any of these hex parameters optionally to override alerts panel badges:
              </p>

              {/* Critical */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] uppercase font-bold">
                  <span className="text-rose-500">Critical Alarms (Level 4)</span>
                  <input
                    type="text"
                    className="bg-transparent text-right outline-none w-16 text-[9.5px] font-bold text-slate-800 dark:text-slate-200"
                    value={data.severityColorCritical || "#ef4444"}
                    onChange={(e) => handleOptionChange("severityColorCritical", e.target.value)}
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <div className="h-5 w-12 rounded border border-border/40" style={{ backgroundColor: data.severityColorCritical || "#ef4444" }} />
                  <span className="text-[8px] text-slate-500 uppercase font-semibold">Immediate active host takeover or ransomware breach</span>
                </div>
              </div>

              {/* High */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] uppercase font-bold">
                  <span className="text-orange-500">High Operations (Level 3)</span>
                  <input
                    type="text"
                    className="bg-transparent text-right outline-none w-16 text-[9.5px] font-bold text-slate-800 dark:text-slate-200"
                    value={data.severityColorHigh || "#f97316"}
                    onChange={(e) => handleOptionChange("severityColorHigh", e.target.value)}
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <div className="h-5 w-12 rounded border border-border/40" style={{ backgroundColor: data.severityColorHigh || "#f97316" }} />
                  <span className="text-[8px] text-slate-500 uppercase font-semibold">Persistent port probes, SSH triggers or malware payloads</span>
                </div>
              </div>

              {/* Medium */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] uppercase font-bold">
                  <span className="text-yellow-500">Medium Incidents (Level 2)</span>
                  <input
                    type="text"
                    className="bg-transparent text-right outline-none w-16 text-[9.5px] font-bold text-slate-800 dark:text-slate-200"
                    value={data.severityColorMedium || "#eab308"}
                    onChange={(e) => handleOptionChange("severityColorMedium", e.target.value)}
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <div className="h-5 w-12 rounded border border-border/40" style={{ backgroundColor: data.severityColorMedium || "#eab308" }} />
                  <span className="text-[8px] text-slate-500 uppercase font-semibold">Abnormal DNS volume or network policy bypass warnings</span>
                </div>
              </div>

              {/* Low */}
              <div className="space-y-1 pb-3">
                <div className="flex justify-between items-center text-[9px] uppercase font-bold">
                  <span className="text-[#3b82f6]">Low Telemetry (Level 1)</span>
                  <input
                    type="text"
                    className="bg-transparent text-right outline-none w-16 text-[9.5px] font-bold text-slate-800 dark:text-slate-200"
                    value={data.severityColorLow || "#3b82f6"}
                    onChange={(e) => handleOptionChange("severityColorLow", e.target.value)}
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <div className="h-5 w-12 rounded border border-border/40" style={{ backgroundColor: data.severityColorLow || "#3b82f6" }} />
                  <span className="text-[8px] text-slate-500 uppercase font-semibold">Standard routine credential audit logs or ping Sweeps</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setColorBlindActive(!colorBlindActive)}
              className={cn(
                "w-full py-2 border rounded-lg text-[9px] font-black uppercase text-center transition cursor-pointer select-none",
                colorBlindActive 
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/35" 
                  : "bg-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white border-border"
              )}
            >
              {colorBlindActive ? "Disable Deuteranopia Shield View" : "Inject High Contrast / Deuteranopia Colors"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
