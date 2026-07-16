import React from "react";
import { 
  Settings, 
  Palette, 
  Brain, 
  BellRing, 
  Boxes, 
  Users2, 
  FileSpreadsheet, 
  FolderSync,
  FileCheck
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useSettingsNavigationStore } from "../../store/useSettingsNavigationStore";

// The 9 groups requested by the user, in exact order
const SETTINGS_CATEGORIES = [
  { id: 'general', label: 'General System', icon: Settings, group: 'SYSTEM' },
  { id: 'appearance', label: 'Appearance Preferences', icon: Palette, group: 'SYSTEM' },
  { id: 'detection', label: 'Detection Policies', icon: Brain, group: 'DETECTION & ALERTS' },
  { id: 'alerts', label: 'Alert Management', icon: BellRing, group: 'DETECTION & ALERTS' },
  { id: 'integrations', label: 'Runtime Integrations', icon: Boxes, group: 'INTEGRATIONS' },
  { id: 'access', label: 'Users & Access Control', icon: Users2, group: 'ADMINISTRATIVE CONTROL' },
  { id: 'reporting', label: 'Reporting Config', icon: FileSpreadsheet, group: 'ADMINISTRATIVE CONTROL' },
  { id: 'backup', label: 'Backup & Recovery', icon: FolderSync, group: 'ADMINISTRATIVE CONTROL' },
  { id: 'compliance', label: 'Audit & Compliance', icon: FileCheck, group: 'ADMINISTRATIVE CONTROL' },
];

export function SettingsSidebar() {
  const { activeCategory, setCategory } = useSettingsNavigationStore();

  const renderCategoryButton = (cat: typeof SETTINGS_CATEGORIES[0]) => {
    const isActive = activeCategory === cat.id;
    return (
      <button
        key={cat.id}
        onClick={() => setCategory(cat.id)}
        className={cn(
          "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer border select-none group focus:outline-none",
          isActive 
            ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/25 shadow-[0_0_15px_rgba(6,182,212,0.12)] font-bold" 
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border-transparent"
        )}
      >
        <div className="flex items-center gap-3">
          <cat.icon size={13} className={cn("shrink-0 transition-transform group-hover:scale-110", isActive ? "text-cyan-500 animate-pulse" : "text-muted-foreground group-hover:text-cyan-400")} />
          <span className="truncate">{cat.label}</span>
        </div>
        {isActive && (
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping shadow-[0_0_8px_#06b6d4]" />
        )}
      </button>
    );
  };

  const groups = ['SYSTEM', 'DETECTION & ALERTS', 'INTEGRATIONS', 'ADMINISTRATIVE CONTROL'];

  return (
    <div className="w-68 h-full border-r border-border bg-card/45 dark:bg-zinc-950/40 flex flex-col shrink-0 overflow-y-auto custom-scrollbar select-none">
      <div className="p-3 py-4 space-y-4">
        
        <div className="px-3 pb-1.5 border-b border-border/30">
          <h1 className="text-xs font-mono font-black text-foreground tracking-[0.2em] leading-none uppercase">
            SOC CONTROL
          </h1>
          <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest mt-1 flex items-center gap-1.5">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
            BACKEND-SYNCED SETTINGS
          </p>
        </div>

        {groups.map((groupName) => {
          const groupCats = SETTINGS_CATEGORIES.filter(c => c.group === groupName);
          return (
            <div key={groupName} className="space-y-1">
              <h2 className="text-[8px] font-mono font-bold text-muted-foreground/60 uppercase tracking-[0.3em] mb-1 px-3">
                {groupName}
              </h2>
              <div className="space-y-0.5">
                {groupCats.map(renderCategoryButton)}
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
