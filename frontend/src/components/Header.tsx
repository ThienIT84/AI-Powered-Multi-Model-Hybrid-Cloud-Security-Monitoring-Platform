import React from "react";
import { 
  Bell, 
  Settings, 
  Search, 
  Shield,
  Moon,
  Clock
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
}

export function Header({ isConnected, searchQuery, onSearchChange }: HeaderProps) {
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
    <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#030408] sticky top-0 z-50 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
      <div className="flex items-center">
        {/* Metrics Section - Starts directly from left */}
        <div className="flex items-center">
          <div className="flex flex-col pr-6 border-r border-white/5">
            <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.22em] leading-none mb-1">SYSTEM STATUS</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)] animate-pulse" />
              <span className="text-[9px] font-black text-green-500 uppercase tracking-[0.15em]">OPERATIONAL</span>
            </div>
          </div>

          <div className="flex flex-col px-6 border-r border-white/5">
            <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.22em] leading-none mb-1">DATA SOURCES</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)] leading-none">12</span>
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.15em] leading-none">Online</span>
            </div>
          </div>

          <div className="flex flex-col px-6 border-r border-white/5">
            <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.22em] leading-none mb-1">AI MODELS</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.5)] leading-none">3</span>
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.15em] leading-none">Active</span>
            </div>
          </div>

          <div className="flex flex-col px-6 border-r border-white/5">
            <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.22em] leading-none mb-1">EVENT RATE</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)] leading-none">2.48K</span>
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.15em] leading-none">/s</span>
            </div>
          </div>

          <div className="flex flex-col px-6 border-r border-white/5">
            <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.22em] leading-none mb-1">LAST UPDATED</span>
            <span className="text-[9px] font-black text-white uppercase tracking-widest font-mono leading-none">{formatTime(time)}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-end items-center gap-8 px-8">
        {/* WIDE SEARCH BAR */}
        <div className="relative group flex items-center bg-white/4 border border-white/5 rounded px-4 py-2 gap-3 focus-within:border-blue-500/30 focus-within:bg-white/7 transition-all max-w-125">
          <Search className="w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
          <div className="flex-1 flex items-center relative">
            <input 
              type="text" 
              placeholder="SEARCH EVENTS, IPS, PAYLOADS, INCIDENTS..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-[0.15em] text-white w-full placeholder:text-gray-600 mb-0"
            />
            {!searchQuery && (
              <div className="absolute left-66.25 w-0.5 h-3 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)] animate-[pulse_1s_infinite]" />
            )}
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Bell className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[7px] font-black px-1.5 rounded-full border border-[#030408] shadow-[0_0_10px_rgba(239,68,68,0.3)]">
              12
            </span>
          </div>

          <Settings className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer transition-colors" />
          <Moon className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer transition-colors" />
          
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-cyan-500/30 flex items-center justify-center text-[9px] font-black text-white hover:border-cyan-400 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              SO
            </div>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-[#030408] rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          </div>
        </div>
      </div>
    </header>
  );
}
