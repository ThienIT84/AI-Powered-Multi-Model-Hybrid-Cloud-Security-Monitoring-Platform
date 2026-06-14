import React from "react";
import { ChevronRight, Search, Download, Share2 } from "lucide-react";

interface SettingsHeaderProps {
  activeCategoryLabel: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onDownload: () => void;
  onShare: () => void;
}

export function SettingsHeader({
  activeCategoryLabel,
  searchQuery,
  onSearchChange,
  onDownload,
  onShare
}: SettingsHeaderProps) {
  return (
    <header className="p-3 px-5 border-b border-border flex items-center justify-between bg-card/80 dark:bg-zinc-950/65 backdrop-blur-md z-10 select-none">
      <div className="flex items-center gap-3">
         <div className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            CORE <ChevronRight size={10} className="text-muted-foreground/65" /> 
            SETTINGS <ChevronRight size={10} className="text-muted-foreground/65" /> 
            <span className="text-cyan-500 font-bold">{activeCategoryLabel}</span>
         </div>
      </div>

      <div className="flex items-center gap-4">
         {/* Simple visual search setting input */}
         <div className="relative group w-64 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/70" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="FILTER CONFIGURATIONS..."
              className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-2 text-[10px] font-mono uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-cyan-500/20 focus:border-cyan-500/40 transition-all placeholder:text-muted-foreground/50"
            />
         </div>
         
         {/* General trigger utility anchors */}
         <button 
           onClick={onDownload}
           className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer border border-transparent hover:border-border"
           title="Export Schema Layout"
         >
            <Download size={15} />
         </button>
         <button 
           onClick={onShare}
           className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer border border-transparent hover:border-border"
           title="Share configs"
         >
            <Share2 size={15} />
         </button>
      </div>
    </header>
  );
}
