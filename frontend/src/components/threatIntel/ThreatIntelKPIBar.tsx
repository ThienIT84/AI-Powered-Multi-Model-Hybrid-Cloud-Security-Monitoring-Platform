import React from "react";
import { User, Server, Database, Activity, RefreshCw, Heart } from "lucide-react";

interface ThreatIntelKPIBarProps {
  actorCount: number;
  feedCount: number;
  iocCount: number;
  match24hCount: number;
  avgHealth: number;
  lastSyncTime: string;
}

export function ThreatIntelKPIBar({
  actorCount,
  feedCount,
  iocCount,
  match24hCount,
  avgHealth,
  lastSyncTime,
}: ThreatIntelKPIBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" id="threat-intel-kpi-bar">
      
      {/* 1. Tracked Threat Actors */}
      <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col justify-between hover:scale-101 hover:border-purple-500/20 select-none transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[8.5px] font-black uppercase text-muted-foreground tracking-wider font-mono">
            Tracked Actors
          </span>
          <div className="p-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <User size={12} />
          </div>
        </div>
        <div className="mt-2.5">
          <span className="text-lg font-black tracking-tight font-mono text-foreground leading-none">
            {actorCount}
          </span>
          <span className="text-[8px] text-slate-400 block mt-0.5 font-bold font-mono">
            APT Profiles Active
          </span>
        </div>
      </div>

      {/* 2. Active Intelligence Feeds */}
      <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col justify-between hover:scale-101 hover:border-purple-500/20 select-none transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[8.5px] font-black uppercase text-muted-foreground tracking-wider font-mono">
            Active Feeds
          </span>
          <div className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Server size={12} />
          </div>
        </div>
        <div className="mt-2.5">
          <span className="text-lg font-black tracking-tight font-mono text-foreground leading-none">
            {feedCount}
          </span>
          <span className="text-[8px] text-slate-400 block mt-0.5 font-bold font-mono">
            TAXII Conduits Synced
          </span>
        </div>
      </div>

      {/* 3. Known IOC Records */}
      <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col justify-between hover:scale-101 hover:border-purple-500/20 select-none transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[8.5px] font-black uppercase text-muted-foreground tracking-wider font-mono">
            Tracked IOCs
          </span>
          <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Database size={12} />
          </div>
        </div>
        <div className="mt-2.5">
          <span className="text-lg font-black tracking-tight font-mono text-foreground leading-none">
            {iocCount.toLocaleString()}
          </span>
          <span className="text-[8px] text-slate-400 block mt-0.5 font-bold font-mono">
            Vetted DB Indicators
          </span>
        </div>
      </div>

      {/* 4. IOC Matches (24h) */}
      <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col justify-between hover:scale-101 hover:border-purple-500/20 select-none transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[8.5px] font-black uppercase text-muted-foreground tracking-wider font-mono">
            IOC Matches (24h)
          </span>
          <div className="p-1 rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400">
            <Activity size={12} />
          </div>
        </div>
        <div className="mt-2.5">
          <span className="text-lg font-black tracking-tight font-mono text-foreground leading-none">
            {match24hCount}
          </span>
          <span className="text-[8px] text-slate-400 block mt-0.5 font-bold font-mono">
            External Correlated Hits
          </span>
        </div>
      </div>

      {/* 5. Feed Health % */}
      <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col justify-between hover:scale-101 hover:border-purple-500/20 select-none transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[8.5px] font-black uppercase text-muted-foreground tracking-wider font-mono">
            Feed Health %
          </span>
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Heart size={12} />
          </div>
        </div>
        <div className="mt-2.5">
          <span className="text-lg font-black tracking-tight font-mono text-foreground leading-none">
            {avgHealth}%
          </span>
          <span className="text-[8px] text-slate-400 block mt-0.5 font-bold font-mono">
            TAXII Parsing Accuracy
          </span>
        </div>
      </div>

      {/* 6. Last Sync Time */}
      <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col justify-between hover:scale-101 hover:border-purple-500/20 select-none transition-all col-span-2 md:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[8.5px] font-black uppercase text-muted-foreground tracking-wider font-mono">
            SYS Sync Latency
          </span>
          <div className="p-1 rounded-md bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
            <RefreshCw size={12} />
          </div>
        </div>
        <div className="mt-2.5">
          <span className="text-[11px] font-black tracking-tight font-mono text-foreground leading-tight uppercase block">
            {lastSyncTime}
          </span>
          <span className="text-[8px] text-slate-400 block mt-0.5 font-bold font-mono">
            Last TAXII Refresh Call
          </span>
        </div>
      </div>

    </div>
  );
}
