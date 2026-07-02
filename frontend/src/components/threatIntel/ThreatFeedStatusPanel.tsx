import React, { useMemo } from "react";
import { ThreatFeed } from "./types";
import { Server, Database, Activity, RefreshCw } from "lucide-react";

interface ThreatFeedStatusPanelProps {
  feeds: ThreatFeed[];
}

export const ThreatFeedStatusPanel = React.memo(function ThreatFeedStatusPanel({ feeds }: ThreatFeedStatusPanelProps) {
  // Memoized aggregator metrics
  const feedStats = useMemo(() => {
    const totalCount = feeds.reduce((sum, feed) => sum + feed.iocCount, 0);
    const averageHealth = feeds.length > 0 ? feeds.reduce((sum, feed) => sum + feed.health, 0) / feeds.length : 100;
    const errorCount = feeds.reduce((sum, feed) => sum + feed.syncErrors, 0);

    return {
      totalCount,
      averageHealth: parseFloat(averageHealth.toFixed(1)),
      errorCount
    };
  }, [feeds]);

  const getStatusIndicator = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return {
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
          text: "Active"
        };
      case "syncing":
        return {
          bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
          text: "Syncing"
        };
      default:
        return {
          bg: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
          text: "Offline"
        };
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col h-full" id="threat-feeds-management-panel">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-3 select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Server size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-foreground tracking-wider font-mono">
              Threat Feed Management
            </h3>
            <p className="text-[10px] text-muted-foreground">
              External TAXII and community intelligence sync logs
            </p>
          </div>
        </div>
      </div>

      {/* Feed Status Grid */}
      <div className="space-y-2 max-h-47.5 overflow-y-auto pr-1">
        {feeds.map((feed) => {
          const statusConfig = getStatusIndicator(feed.status);
          return (
            <div
              key={feed.id}
              className="bg-muted/15 border border-border/50 rounded-lg p-2.5 flex items-center justify-between gap-3 font-mono text-[9px] hover:border-border transition-all"
            >
              <div className="space-y-1">
                <div className="font-extrabold text-foreground leading-tight uppercase tracking-tight text-[9px]">
                  {feed.name}
                </div>
                <div className="text-[8px] text-muted-foreground flex gap-2 font-semibold">
                  <span>Count: <strong className="text-purple-600 dark:text-purple-400">{feed.iocCount.toLocaleString()}</strong></span>
                  <span>-</span>
                  <span>Sync: {feed.lastSync}</span>
                </div>
              </div>

              <div className="text-right shrink-0 flex items-center gap-2.5">
                <div>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-black font-mono inline-block ${statusConfig.bg}`}>
                    {statusConfig.text}
                  </span>
                  <div className="text-[7.5px] text-slate-400 font-medium mt-1">
                    Health: {feed.health}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Aggregated Metadata Row */}
      <div className="border-t border-border/40 pt-3 mt-auto font-mono text-[9px] grid grid-cols-3 gap-2 text-center select-none">
        <div className="bg-muted/20 border border-border/50 rounded-lg p-1.5">
          <div className="text-muted-foreground text-[7.5px] uppercase font-bold">Aggregate IOCs</div>
          <div className="font-extrabold text-purple-600 dark:text-purple-400 mt-0.5 text-[10px]">
            {feedStats.totalCount.toLocaleString()}
          </div>
        </div>

        <div className="bg-muted/20 border border-border/50 rounded-lg p-1.5">
          <div className="text-muted-foreground text-[7.5px] uppercase font-bold">Avg Feed Health</div>
          <div className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 text-[10px]">
            {feedStats.averageHealth}%
          </div>
        </div>

        <div className="bg-muted/20 border border-border/50 rounded-lg p-1.5">
          <div className="text-muted-foreground text-[7.5px] uppercase font-bold">Sync Errors</div>
          <div className={`font-extrabold mt-0.5 text-[10px] ${feedStats.errorCount > 0 ? "text-amber-500" : "text-slate-400"}`}>
            {feedStats.errorCount}
          </div>
        </div>
      </div>
    </div>
  );
});
