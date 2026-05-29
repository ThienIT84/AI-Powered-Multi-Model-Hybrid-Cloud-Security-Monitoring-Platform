import React from "react";
import {
  Bell,
  Settings,
  Search,
  Shield,
  Moon,
  Sun
} from "lucide-react";
import { cn } from "../../lib/utils";

interface StatusIndicatorProps {
  label: string;
  status: string;
  active?: boolean;
  warning?: boolean;
}

function StatusIndicator({ label, status, active, warning }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors cursor-default">
      <div className={cn(
        "w-1.5 h-1.5 rounded-full ring-2 ring-opacity-20",
        active ? "bg-green-500 ring-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : 
        warning ? "bg-yellow-500 ring-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]" : 
        "bg-gray-600 ring-gray-600"
      )} />
      <div className="flex flex-col">
        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none">{label}</span>
        <span className={cn(
          "text-[9px] font-bold uppercase tracking-tighter leading-tight",
          active ? "text-green-500" : warning ? "text-yellow-500" : "text-gray-400"
        )}>{status}</span>
      </div>
    </div>
  );
}

import { Alert } from "../../types";
import { AlertDropdownPanel } from "../alerts/AlertDropdownPanel";
import { SettingsQuickPanel } from "../panels/SettingsQuickPanel";

interface HeaderProps {
  isConnected: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  currentView: "dashboard" | "alerts" | "network" | "endpoints" | "integrations" | "playbooks" | "reports" | "settings";
  onViewChange: (view: "dashboard" | "alerts" | "network" | "endpoints" | "integrations" | "playbooks" | "reports" | "settings") => void;
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
  isAlertsOpen: boolean;
  isSettingsOpen: boolean;
  onToggleAlerts: () => void;
  onToggleSettings: () => void;
  onClosePanels: () => void;
  socketError?: string | null;
  dataMode?: "mock" | "api";
}

export function Header({
  isConnected,
  searchQuery,
  onSearchChange,
  isDarkMode,
  onThemeToggle,
  currentView,
  onViewChange,
  alerts,
  onSelectAlert,
  isAlertsOpen,
  isSettingsOpen,
  onToggleAlerts,
  onToggleSettings,
  onClosePanels,
  socketError,
  dataMode = "mock",
}: HeaderProps) {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 sticky top-0 z-50 transition-all duration-300 bg-card/80 backdrop-blur-md shadow-sm">
      <div className="flex items-center">
        <div className="flex items-center">
          <div className="flex flex-col pr-6 border-r border-border">
            <span className="text-[7px] font-black text-muted-foreground uppercase tracking-[0.22em] leading-none mb-1">SYSTEM STATUS</span>
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                isConnected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]"
              )} />
              <span className={cn(
                "text-[9px] font-black uppercase tracking-[0.15em]",
                isConnected ? "text-green-500" : "text-red-500"
              )}>{isConnected ? "OPERATIONAL" : "DISCONNECTED"}</span>
            </div>
          </div>

          <div className="flex flex-col px-6 border-r border-border">
            <span className="text-[7px] font-black text-muted-foreground uppercase tracking-[0.22em] leading-none mb-1">DATA SOURCES</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black leading-none text-green-400">12</span>
              <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-none text-muted-foreground">Online</span>
            </div>
          </div>

          <div className="flex flex-col px-6 border-r border-border">
            <span className="text-[7px] font-black text-muted-foreground uppercase tracking-[0.22em] leading-none mb-1">AI MODELS</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black leading-none text-purple-400">3</span>
              <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-none text-muted-foreground">Active</span>
            </div>
          </div>

          <div className="md:flex flex-col px-6 border-r hidden border-border">
            <span className="text-[7px] font-black text-muted-foreground uppercase tracking-[0.22em] leading-none mb-1">EVENT RATE</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black leading-none text-cyan-400">2.48K</span>
              <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-none text-muted-foreground">/s</span>
            </div>
          </div>

          <div className="hidden lg:flex flex-col px-6 border-r border-border">
            <span className="text-[7px] font-black text-muted-foreground uppercase tracking-[0.22em] leading-none mb-1">LAST UPDATED</span>
            <span className="text-[9px] font-black uppercase tracking-widest font-mono leading-none text-foreground">{formatTime(time)} / {dataMode}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-end items-center gap-4 lg:gap-8 px-4 lg:px-8">
        <div className="relative group hidden sm:flex items-center bg-muted border border-border rounded px-4 py-2 gap-3 transition-all max-w-95 w-full focus-within:border-cyan-500/50">
          <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-cyan-400 transition-colors" />
          <div className="flex-1 flex items-center relative">
            <input
              type="text"
              placeholder="SEARCH EVENTS, IPS, PAYLOADS, INCIDENTS..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-[0.15em] w-full placeholder:text-muted-foreground text-foreground mb-0"
            />
            {!searchQuery && (
              <div className="absolute left-66.25 w-0.5 h-3 bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,1)] animate-[pulse_1s_infinite]" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          {socketError && (
            <span className="hidden xl:inline text-[8px] font-black text-red-500 uppercase tracking-widest max-w-55 truncate">
              {socketError}
            </span>
          )}

          <div className="relative cursor-pointer" onClick={onToggleAlerts}>
            <Bell className={cn(
              "w-4 h-4 cursor-pointer transition-colors",
              isAlertsOpen ? "text-cyan-500" : "text-muted-foreground hover:text-foreground"
            )} />
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[7px] font-black px-1.5 rounded-full border border-current shadow-[0_0_10px_rgba(239,68,68,0.3)]">
              {Math.min(alerts.length, 99)}
            </span>
          </div>

          <Settings
            className={cn(
              "w-4 h-4 cursor-pointer transition-colors",
              isSettingsOpen || currentView === "settings" ? "text-cyan-500" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={onToggleSettings}
          />

          <button
            onClick={onThemeToggle}
            className="p-1.5 rounded-lg transition-all transform hover:scale-110 hover:bg-muted"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-cyan-600" />}
          </button>

          <div className="relative group cursor-pointer" onClick={() => onViewChange("settings")}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-black transition-all bg-secondary border border-border text-foreground hover:border-cyan-500">
              SO
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)] transition-colors" />
          </div>
        </div>
      </div>

      <AlertDropdownPanel
        isOpen={isAlertsOpen}
        onClose={onClosePanels}
        alerts={alerts}
        onSelectAlert={onSelectAlert}
      />

      <SettingsQuickPanel
        isOpen={isSettingsOpen}
        onClose={onClosePanels}
        isDarkMode={isDarkMode}
        onThemeToggle={onThemeToggle}
        onFullSettings={() => onViewChange("settings")}
      />
    </header>
  );
}
