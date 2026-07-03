import React, { useState, useEffect } from "react";
import { Activity, Wifi, WifiOff, Database, Cloud, Clock, RefreshCw } from "lucide-react";
import { PlatformStatus, SocketStatus } from "../../types/platform";

interface DashboardHeaderProps {
  isConnected: boolean;
  onRefresh: () => void;
  isSyncing?: boolean;
  platformStatus: PlatformStatus;
  socketStatus: SocketStatus;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = React.memo(({
  isConnected,
  onRefresh,
  isSyncing = false,
  platformStatus,
  socketStatus
}) => {
  const [utcTime, setUtcTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="bg-card border border-border rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none"
      id="dashboard-header"
    >
      {/* Title & Description */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-red-500/15 text-red-500 rounded-lg shrink-0 animate-pulse">
          <Activity size={20} />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight leading-none mb-1 font-mono">
            Hybrid SOC Command Center
          </h1>
          <p className="text-[10px] text-muted-foreground font-mono font-bold tracking-wider uppercase">
            Unified Security Information & Neural Incident Overview Layer
          </p>
        </div>
      </div>

      {/* Connectivity & Ticking UTC and Refresh Actions */}
      <div className="flex flex-wrap items-center gap-2 font-mono">
        {/* WebSocket Status */}
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-black uppercase border transition-colors ${
            isConnected
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
              : "bg-red-500/10 text-red-500 border-red-500/25"
          }`}
        >
          {isConnected ? (
            <>
              <Wifi size={11} className="text-emerald-500 animate-pulse" />
              WS: {socketStatus}
            </>
          ) : (
            <>
              <WifiOff size={11} className="text-red-500 animate-bounce" />
              WS: {socketStatus}
            </>
          )}
        </span>

        {/* Database Status */}
        <span className="bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 px-2.5 py-1 rounded-md text-[9px] font-black uppercase flex items-center gap-1.5">
          <Database size={11} />
          DB: {platformStatus.dataSourcesOnline === null ? "Unknown" : "Available"}
        </span>

        {/* AWS Status */}
        <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-md text-[9px] font-black uppercase flex items-center gap-1.5">
          <Cloud size={11} />
          AWS: {platformStatus.lastIngestAt ? "Telemetry Received" : "Waiting"}
        </span>

        {/* Env Tag */}
        <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-md text-[9px] font-black uppercase">
          {platformStatus.dataMode.toUpperCase()}
        </span>

        {/* Clock */}
        <div className="bg-secondary/40 border border-border px-3 py-1 rounded-md text-[9.5px] text-zinc-300 flex items-center gap-1.5 tracking-tight font-extrabold">
          <Clock size={11} className="text-zinc-400" />
          <span>{utcTime || "SYNCING UTC..."}</span>
        </div>

        {/* Refresh Action */}
        <button
          onClick={onRefresh}
          disabled={isSyncing}
          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/25 hover:border-red-500/40 rounded-md transition-all cursor-pointer disabled:opacity-40"
          title="Force WebSocket telemetry handshake"
        >
          <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );
});
