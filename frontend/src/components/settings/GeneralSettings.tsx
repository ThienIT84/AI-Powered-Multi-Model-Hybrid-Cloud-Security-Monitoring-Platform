import React, { useState } from "react";
import { z } from "zod";
import { Settings, Shield, Globe, Clock, Languages, Check,AlertCircle } from "lucide-react";
import { motion } from "motion/react";

// General Settings Zod Schema
export const generalSettingsSchema = z.object({
  platformName: z.string().min(3, "Platform name must be at least 3 characters").max(50, "Platform name must be less than 50 characters"),
  organization: z.string().min(2, "Organization name must be at least 2 characters"),
  environment: z.enum(["Development", "Staging", "Production"]),
  timezone: z.string().min(3, "Timezone designation is required"),
  language: z.enum(["en", "vi", "es", "ja"]),
  refreshInterval: z.number().min(5, "Refresh interval must be at least 5 seconds").max(600, "Maximum refresh interval is 600 seconds")
});

export type GeneralSettingsType = z.infer<typeof generalSettingsSchema>;

interface GeneralSettingsProps {
  data: GeneralSettingsType;
  onChange: (path: string, value: any) => void;
}

export function GeneralSettings({ data, onChange }: GeneralSettingsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: keyof GeneralSettingsType, value: any) => {
    try {
      const fieldSchema = generalSettingsSchema.shape[field];
      fieldSchema.parse(value);
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: (err as any).errors[0].message }));
      }
    }
  };

  const handleTextChange = (field: keyof GeneralSettingsType, value: string) => {
    onChange(`general.${field}`, value);
    validateField(field, value);
  };

  const handleNumberChange = (field: keyof GeneralSettingsType, value: string) => {
    const num = parseInt(value, 10) || 0;
    onChange(`general.${field}`, num);
    validateField(field, num);
  };

  return (
    <div className="space-y-6" id="general-settings-panel">
      {/* Intro Header */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Settings className="w-4 h-4 text-cyan-500" />
          General Platform Settings
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Configure core administrative identity parameters, host environment states, language translations, and default system ticker parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Identity & Profile */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2 mb-2">
            <Shield className="w-4 h-4 text-cyan-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">Platform Branding</h4>
          </div>

          {/* Platform Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Platform Interface Title Name
            </label>
            <input
              type="text"
              id="platformName"
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-cyan-500"
              value={data.platformName || ""}
              onChange={(e) => handleTextChange("platformName", e.target.value)}
            />
            {errors.platformName && (
              <p className="text-[10px] text-rose-500 font-mono font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.platformName}
              </p>
            )}
          </div>

          {/* Organization Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Owning Security Organization
            </label>
            <input
              type="text"
              id="organization"
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-cyan-500"
              value={data.organization || ""}
              onChange={(e) => handleTextChange("organization", e.target.value)}
            />
            {errors.organization && (
              <p className="text-[10px] text-rose-500 font-mono font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.organization}
              </p>
            )}
          </div>

          {/* Platform Version (Read-only) */}
          <div className="space-y-1.5 opacity-80">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Deployable Console Build Version (Read Only)
            </label>
            <div className="w-full bg-slate-100 dark:bg-slate-950 border border-border/40 rounded-lg px-3 py-2 text-xs font-bold font-mono text-cyan-600 dark:text-cyan-400">
              v3.0.12 - Enterprise LTS v3 Secure Core
            </div>
          </div>
        </div>

        {/* Card 2: Environment & Time Localization */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2 mb-2">
            <Globe className="w-4 h-4 text-cyan-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">Localization & Hosting</h4>
          </div>

          {/* Environment */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Target Hosting Environment
            </label>
            <select
              id="environment"
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              value={data.environment || "Development"}
              onChange={(e) => handleTextChange("environment", e.target.value as any)}
            >
              <option value="Development">Development (Local Sandbox debug mode)</option>
              <option value="Staging">Staging (Continuous integration sandbox)</option>
              <option value="Production">Production (Hardened restricted environment)</option>
            </select>
          </div>

          {/* Timezone */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Console Standard Display Timezone
            </label>
            <select
              id="timezone"
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              value={data.timezone || "UTC+7"}
              onChange={(e) => handleTextChange("timezone", e.target.value)}
            >
              <option value="UTC">UTC (Universal Coordinate Time)</option>
              <option value="UTC+7">UTC+7 (Bangkok, Hanoi, Jakarta)</option>
              <option value="UTC+8">UTC+8 (Singapore, Beijing, Taipei)</option>
              <option value="UTC-5">UTC-5 (Eastern Standard Time)</option>
            </select>
          </div>

          {/* Language */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Consensus Operations Language
            </label>
            <select
              id="language"
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              value={data.language || "en"}
              onChange={(e) => handleTextChange("language", e.target.value as any)}
            >
              <option value="en">English (US Standard)</option>
              <option value="vi">Tiếng Việt (Vietnamese Translation)</option>
              <option value="es">Español (Castellano Audits)</option>
              <option value="ja">日本語 (Japanese Terminal)</option>
            </select>
          </div>

          {/* Refresh Interval */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Dashboard Live Polling Interval (seconds)
            </label>
            <input
              type="number"
              id="refreshInterval"
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/80 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-cyan-500"
              value={data.refreshInterval || 30}
              onChange={(e) => handleNumberChange("refreshInterval", e.target.value)}
            />
            {errors.refreshInterval && (
              <p className="text-[10px] text-rose-500 font-mono font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.refreshInterval}
              </p>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
