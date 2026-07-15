import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Moon,
  Settings as SettingsIcon,
  Sliders,
  Sun,
} from "lucide-react";
import { FloatingPanel } from "../common/FloatingPanel";
import { cn } from "../../lib/utils";
import { settingsService } from "../../services/settings.service";

interface SettingsQuickPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onFullSettings: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

type BackendPreferenceState =
  | { status: "idle" | "checking"; updatedAt: null; deploymentTarget: null; message: null }
  | { status: "available"; updatedAt: string | null; deploymentTarget: "local" | "aws" | "unknown"; message: null }
  | { status: "unavailable"; updatedAt: null; deploymentTarget: null; message: string };

const INITIAL_STATE: BackendPreferenceState = {
  status: "idle",
  updatedAt: null,
  deploymentTarget: null,
  message: null,
};

export function SettingsQuickPanel({
  isOpen,
  onClose,
  onFullSettings,
  isDarkMode,
  onThemeToggle,
}: SettingsQuickPanelProps) {
  const [backendPreferences, setBackendPreferences] = useState<BackendPreferenceState>(INITIAL_STATE);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    setBackendPreferences({ status: "checking", updatedAt: null, deploymentTarget: null, message: null });
    void settingsService.load(isDarkMode ? "Dark" : "Light")
      .then((snapshot) => {
        if (!active) return;
        setBackendPreferences({
          status: "available",
          updatedAt: snapshot.updatedAt,
          deploymentTarget: snapshot.runtime.deploymentTarget,
          message: null,
        });
      })
      .catch((caught) => {
        if (!active) return;
        setBackendPreferences({
          status: "unavailable",
          updatedAt: null,
          deploymentTarget: null,
          message: caught instanceof Error ? caught.message : "Settings endpoint unavailable",
        });
      });

    return () => {
      active = false;
    };
  }, [isDarkMode, isOpen]);

  const preferencesAvailable = backendPreferences.status === "available";
  const statusLabel = backendPreferences.status === "checking"
    ? "Checking"
    : preferencesAvailable
      ? "Available"
      : backendPreferences.status === "unavailable"
        ? "Unavailable"
        : "Unknown";

  return (
    <FloatingPanel isOpen={isOpen} onClose={onClose} title="Quick Preferences">
      <div className="flex flex-col gap-1 p-1">
        <div className="group rounded-xl border border-transparent p-3 transition-all hover:border-border hover:bg-muted/30">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2 text-muted-foreground transition-colors group-hover:text-yellow-500">
                {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Interface Appearance</span>
            </div>
            <button
              type="button"
              onClick={onThemeToggle}
              className={cn(
                "relative h-5 w-10 rounded-full transition-all",
                isDarkMode ? "bg-cyan-600" : "border border-border bg-muted",
              )}
              aria-label="Toggle interface theme"
            >
              <span className={cn(
                "absolute top-1 h-3 w-3 rounded-full bg-white transition-all",
                isDarkMode ? "right-1" : "left-1",
              )} />
            </button>
          </div>
          <p className="ml-11 text-[9px] uppercase tracking-widest text-muted-foreground">
            Current browser theme: {isDarkMode ? "Dark" : "Light"}
          </p>
        </div>

        <div className="group rounded-xl border border-transparent p-3 transition-all hover:border-border hover:bg-muted/30">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-muted p-2 text-muted-foreground transition-colors group-hover:text-cyan-500">
              {backendPreferences.status === "checking"
                ? <Loader2 size={16} className="animate-spin" />
                : preferencesAvailable
                  ? <CheckCircle2 size={16} />
                  : <AlertCircle size={16} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Backend preferences</span>
                <span className={cn(
                  "rounded border px-2 py-0.5 text-[8px] font-black uppercase",
                  preferencesAvailable
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-500"
                    : backendPreferences.status === "checking"
                      ? "border-amber-500/25 bg-amber-500/10 text-amber-500"
                      : "border-border bg-muted text-muted-foreground",
                )}>
                  {statusLabel}
                </span>
              </div>
              <p className="mt-1 text-[8.5px] leading-relaxed text-muted-foreground">
                {preferencesAvailable
                  ? `Reported target: ${backendPreferences.deploymentTarget}. ${backendPreferences.updatedAt ? `Updated ${new Date(backendPreferences.updatedAt).toLocaleString()}.` : "Update time not reported."}`
                  : backendPreferences.status === "checking"
                    ? "Reading /api/settings..."
                    : backendPreferences.message ?? "Open this panel to check the settings API."}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/10 p-3 text-[8.5px] leading-relaxed text-muted-foreground">
          <div className="mb-1 flex items-center gap-2 font-black uppercase tracking-widest text-foreground">
            <Sliders size={13} className="text-cyan-500" />
            Runtime status
          </div>
          Notification delivery, density, integrations, and policy enforcement are not inferred in this quick panel. Open full settings for backend-reported values.
        </div>

        <div className="p-2 pt-4">
          <button
            type="button"
            onClick={() => {
              onFullSettings();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-foreground py-3 text-[10px] font-black uppercase tracking-[0.2em] text-background shadow-xl shadow-foreground/10 transition-all hover:opacity-90"
          >
            <SettingsIcon size={14} /> Full backend settings
          </button>
        </div>
      </div>
    </FloatingPanel>
  );
}
