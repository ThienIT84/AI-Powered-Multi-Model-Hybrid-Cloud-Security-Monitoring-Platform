import React from "react";
import { Layers } from "lucide-react";
import { cn } from "../../lib/utils";
import { SettingsStateData } from "./settingsConfig";

interface GeneralSettingsTabProps {
  data: SettingsStateData;
  onChange: (path: string, value: any) => void;
  onToast: (msg: string, type?: "success" | "warning" | "info") => void;
  onLog: (text: string) => void;
}

export function GeneralSettingsTab({ data, onChange, onToast, onLog }: GeneralSettingsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-500" />
          General Platform Settings
        </h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] leading-normal">
          Assign global identifier tags, declare execution environment states, and manage translation frameworks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card/40 border border-border/70 rounded-xl p-5 shadow-sm">
        <div className="space-y-2">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 block">
            System Display Tag Name
          </label>
          <input 
            type="text"
            value={data.systemName}
            onChange={(e) => onChange("systemName", e.target.value)}
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-[11px] font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all uppercase"
            placeholder="ANTIGRAVITY SOC"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 block">
            Build Platform version
          </label>
          <div className="bg-muted/50 border border-border/80 rounded-xl px-4 py-3 text-[11px] font-mono text-muted-foreground select-none">
            {data.version} <span className="text-[8px] bg-cyan-500/10 text-cyan-400 p-1 rounded font-bold ml-2">CORE RELEASE</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 block">
            Execution Environment
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["Development", "Staging", "Production"] as const).map((env) => (
              <button
                key={env}
                onClick={() => {
                  onChange("environment", env);
                  onToast(`ENVIRONMENT VALUE STAGED: ${env.toUpperCase()}`, "info");
                  onLog(`[ENV] Set environment context to ${env.toUpperCase()}`);
                }}
                className={cn(
                  "py-2.5 rounded-xl border text-[9px] font-mono font-black uppercase tracking-widest transition-all cursor-pointer",
                  data.environment === env
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-505/20 border-cyan-500/35"
                    : "bg-muted/40 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {env}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 block">
            System Zone Timezone
          </label>
          <div className="relative">
            <select 
              value={data.timezone}
              onChange={(e) => onChange("timezone", e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-[11px] font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all appearance-none cursor-pointer"
            >
              <option value="UTC">UTC / GMT Protocol</option>
              <option value="UTC+7">UTC+7 (Vietnam / Indochina Region)</option>
              <option value="UTC+8">UTC+8 (Singapore / Manila Region)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground text-[10px]">
              ▼
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 block">
            Global Display Language
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["English", "Vietnamese"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  onChange("language", lang);
                  onToast(`STAGED CORE LANGUAGE: ${lang.toUpperCase()}`, "info");
                }}
                className={cn(
                  "py-2.5 rounded-xl border text-[9px] font-mono font-black uppercase tracking-widest transition-all cursor-pointer",
                  data.language === lang
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/35"
                    : "bg-muted/40 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
