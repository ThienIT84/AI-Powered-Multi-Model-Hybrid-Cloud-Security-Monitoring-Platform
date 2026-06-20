import React, { useMemo } from "react";
import { Link2, ShieldCheck, AlertTriangle, AlertOctagon, Clock } from "lucide-react";
import { Integration } from "./types";

interface IntegrationKPIsProps {
  integrations: Integration[];
  lastSyncText: string;
}

export function IntegrationKPIs({ integrations, lastSyncText }: IntegrationKPIsProps) {
  const stats = useMemo(() => {
    let connected = 0;
    let healthy = 0;
    let warning = 0;
    let disconnected = 0;

    integrations.forEach((item) => {
      // stats
      if (item.status === "Connected") connected++;
      else if (item.status === "Disconnected") disconnected++;

      if (item.health === "Healthy") healthy++;
      else if (item.health === "Warning") warning++;
      else if (item.health === "Critical") disconnected++; // count critical as disconnected or warning? Actually, let's look at health:
    });

    // Make sure Warning is matching accurately
    warning = integrations.filter(i => i.health === "Warning" || i.status === "Warning").length;
    disconnected = integrations.filter(i => i.status === "Disconnected" || i.health === "Critical").length;

    return {
      connected,
      healthy,
      warning,
      disconnected,
    };
  }, [integrations]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 select-none w-full">
      {/* Connected Integrations */}
      <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm space-y-1 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest">
            Connected
          </p>
          <Link2 size={11} className="text-cyan-500" />
        </div>
        <p className="text-2xl font-mono font-black text-indigo-600 dark:text-indigo-400 leading-none">
          {stats.connected}
        </p>
        <p className="text-[8px] font-mono text-muted-foreground/60 uppercase">
          Active connected feeds
        </p>
      </div>

      {/* Healthy Integrations */}
      <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm space-y-1 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest">
            Healthy
          </p>
          <ShieldCheck size={11} className="text-emerald-500" />
        </div>
        <p className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400 leading-none">
          {stats.healthy}
        </p>
        <p className="text-[8px] font-mono text-muted-foreground/60 uppercase">
          Zero active anomalies
        </p>
      </div>

      {/* Warning Integrations */}
      <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm space-y-1 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest">
            Warning
          </p>
          <AlertTriangle size={11} className="text-amber-500" />
        </div>
        <p className="text-2xl font-mono font-black text-amber-600 dark:text-amber-450 leading-none">
          {stats.warning}
        </p>
        <p className="text-[8px] font-mono text-muted-foreground/60 uppercase">
          Requires verification
        </p>
      </div>

      {/* Disconnected Integrations */}
      <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm space-y-1 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest">
            Disconnected
          </p>
          <AlertOctagon size={11} className="text-red-500" />
        </div>
        <p className="text-2xl font-mono font-black text-red-600 dark:text-red-450 leading-none">
          {stats.disconnected}
        </p>
        <p className="text-[8px] font-mono text-muted-foreground/60 uppercase">
          Inactive connections
        </p>
      </div>

      {/* Last Synchronization Time */}
      <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm space-y-1 col-span-2 md:col-span-1 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest">
            Last Sync
          </p>
          <Clock size={11} className="text-blue-500" />
        </div>
        <p className="text-[15px] sm:text-[18px] font-mono font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider h-6 flex items-center leading-none">
          {lastSyncText}
        </p>
        <p className="text-[8px] font-mono text-muted-foreground/60 uppercase">
          Dynamic check interval
        </p>
      </div>
    </div>
  );
}
