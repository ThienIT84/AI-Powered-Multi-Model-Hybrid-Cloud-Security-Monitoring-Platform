import React from "react";
import { Search, RefreshCw, Layers } from "lucide-react";

interface IntegrationPageHeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  systemTime: string;
}

const CATEGORIES = ["ALL", "Security Sensors", "Cloud Services", "Storage", "Messaging", "Database"];

export function IntegrationPageHeader({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onRefresh,
  isRefreshing,
  systemTime
}: IntegrationPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/20 pb-4 select-none">
      <div>
        <h2 className="text-xl font-black text-foreground uppercase tracking-widest flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-cyan-500 rounded-xs shrink-0 animate-pulse" />
          INTEGRATIONS
        </h2>
        <p className="text-[10px] sm:text-xs text-muted-foreground font-mono mt-1 uppercase tracking-wider">
          Security Telemetry Sources and Platform Connectivity
        </p>
      </div>

      {/* Controller Area */}
      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
        {/* Search */}
        <div className="relative flex-1 md:flex-initial">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="SEARCH INTEGRATIONS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-55 pl-8 pr-2.5 py-1.5 bg-background border border-border rounded-lg text-[9px] font-mono uppercase tracking-wider text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>

        {/* Filter Category */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none bg-background border border-border rounded-lg py-1.5 pl-3 pr-8 text-[9px] font-mono uppercase tracking-wider text-foreground focus:outline-none focus:border-cyan-500/50 transition-colors h-8"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "ALL" ? "ALL CATEGORIES" : cat}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
            <Layers size={9} />
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 h-8 bg-muted hover:bg-muted/80 text-foreground border border-border hover:border-muted-foreground/30 px-3 py-1.5 rounded-lg text-[9px] font-mono tracking-widest uppercase font-black transition-colors disabled:opacity-50"
        >
          <RefreshCw size={10} className={isRefreshing ? "animate-spin" : ""} />
          <span>{isRefreshing ? "SYNCING..." : "REFRESH STATUS"}</span>
        </button>

        {/* UTC Clock / Engine state */}
        <div className="hidden sm:flex items-center gap-2 h-8 font-mono text-[9px] bg-background border border-border px-3 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 inline-block animate-ping" />
          <span className="text-muted-foreground uppercase">SYNC ENGINE:</span>
          <span className="text-foreground tracking-widest font-black uppercase">
            {systemTime || "ONLINE"}
          </span>
        </div>
      </div>
    </div>
  );
}
