import React from "react";
import { 
  Bell, 
  Settings, 
  Search, 
  Shield,
  Moon,
  Sun
} from "lucide-react";
import { cn } from "../lib/utils";

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

interface HeaderProps {
  isConnected: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  currentView: "dashboard" | "settings";
  onViewChange: (view: "dashboard" | "settings") => void;
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
  socketError,
  dataMode = "mock"
}: HeaderProps) {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  return (
    <header className={cn(
      "h-[56px] border-b flex items-center justify-between px-6 sticky top-0 z-50 transition-all duration-500",
      isDarkMode 
        ? "bg-[#030408] border-white/5 shadow-[0_4px_12px_rgba(0,0,0,0.5)]" 
        : "bg-white border-gray-200 shadow-sm"
    )}>
      <div className="flex items-center">
        {/* Metrics Section - Starts directly from left */}
        <div className="flex items-center">
          <div className={cn("flex flex-col pr-6 border-r", isDarkMode ? "border-white/5" : "border-gray-100")}>
            <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.22em] leading-none mb-1">SYSTEM STATUS</span>
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

          <div className={cn("flex flex-col px-6 border-r", isDarkMode ? "border-white/5" : "border-gray-100")}>
            <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.22em] leading-none mb-1">DATA SOURCES</span>
            <div className="flex items-center gap-1.5">
              <span className={cn("text-[10px] font-black leading-none", isDarkMode ? "text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" : "text-green-600")}>12</span>
              <span className={cn("text-[9px] font-black uppercase tracking-[0.15em] leading-none", isDarkMode ? "text-gray-300" : "text-gray-600")}>Online</span>
            </div>
          </div>

          <div className={cn("flex flex-col px-6 border-r", isDarkMode ? "border-white/5" : "border-gray-100")}>
            <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.22em] leading-none mb-1">AI MODELS</span>
            <div className="flex items-center gap-1.5">
              <span className={cn("text-[10px] font-black leading-none", isDarkMode ? "text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.5)]" : "text-purple-600")}>3</span>
              <span className={cn("text-[9px] font-black uppercase tracking-[0.15em] leading-none", isDarkMode ? "text-gray-300" : "text-gray-600")}>Active</span>
            </div>
          </div>

          <div className={cn("flex flex-col px-6 border-r hidden md:flex", isDarkMode ? "border-white/5" : "border-gray-100")}>
            <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.22em] leading-none mb-1">EVENT RATE</span>
            <div className="flex items-center gap-1.5">
              <span className={cn("text-[10px] font-black leading-none", isDarkMode ? "text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" : "text-cyan-600")}>2.48K</span>
              <span className={cn("text-[9px] font-black uppercase tracking-[0.15em] leading-none", isDarkMode ? "text-gray-300" : "text-gray-600")}>/s</span>
            </div>
          </div>

          <div className={cn("flex flex-col px-6 border-r hidden lg:flex", isDarkMode ? "border-white/5" : "border-gray-100")}>
            <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.22em] leading-none mb-1">LAST UPDATED</span>
            <span className={cn("text-[9px] font-black uppercase tracking-[0.1em] font-mono leading-none", isDarkMode ? "text-white" : "text-gray-900")}>{formatTime(time)} / {dataMode}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-end items-center gap-4 lg:gap-8 px-4 lg:px-8">
        {/* WIDE SEARCH BAR */}
        <div className={cn(
          "relative group flex items-center border rounded px-4 py-2 gap-3 transition-all max-w-[500px] w-full hidden sm:flex",
          isDarkMode 
            ? "bg-white/[0.04] border-white/5 focus-within:border-blue-500/30 focus-within:bg-white/[0.07]" 
            : "bg-gray-50 border-gray-200 focus-within:border-blue-400 focus-within:bg-white"
        )}>
          <Search className={cn("w-4 h-4 transition-colors", isDarkMode ? "text-gray-500 group-focus-within:text-blue-400" : "text-gray-400 group-focus-within:text-blue-500")} />
          <div className="flex-1 flex items-center relative">
            <input 
              type="text" 
              placeholder="SEARCH EVENTS, IPS, PAYLOADS, INCIDENTS..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn(
                "bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-[0.15em] w-full placeholder:text-gray-600 mb-0",
                isDarkMode ? "text-white" : "text-gray-900"
              )}
            />
            {!searchQuery && isDarkMode && (
              <div className="absolute left-[265px] w-0.5 h-3 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)] animate-[pulse_1s_infinite]" />
            )}
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-4 lg:gap-6">
          {socketError && (
            <span className="hidden xl:inline text-[8px] font-black text-red-500 uppercase tracking-widest max-w-[220px] truncate">
              {socketError}
            </span>
          )}
          <div className="relative">
            <Bell className={cn("w-4 h-4 cursor-pointer transition-colors", isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900")} />
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[7px] font-black px-1.5 rounded-full border border-current shadow-[0_0_10px_rgba(239,68,68,0.3)]">
              12
            </span>
          </div>

          <Settings 
            className={cn(
              "w-4 h-4 cursor-pointer transition-colors", 
              currentView === 'settings' ? "text-blue-500" : isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
            )} 
            onClick={() => onViewChange('settings')}
          />
          
          <button 
            onClick={onThemeToggle}
            className={cn(
              "p-1.5 rounded-lg transition-all transform hover:scale-110",
              isDarkMode 
                ? "text-yellow-400 hover:bg-yellow-400/10" 
                : "text-indigo-600 hover:bg-indigo-600/10"
            )}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <div className="relative group cursor-pointer" onClick={() => onViewChange('settings')}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-black transition-all",
              isDarkMode 
                ? "bg-blue-600/10 border border-cyan-500/30 text-white hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]" 
                : "bg-blue-50 border border-blue-200 text-blue-600 hover:border-blue-400"
            )}>
              SO
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)] transition-colors" style={{ borderColor: isDarkMode ? '#030408' : '#ffffff' }} />
          </div>
        </div>
      </div>
    </header>
  );
}
