import React from "react";
import { 
  Settings, 
  Palette, 
  Brain, 
  Merge, 
  BellRing, 
  Cloud, 
  Boxes, 
  Database, 
  FileSpreadsheet, 
  Users2, 
  ActivitySquare, 
  FolderSync 
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useSettingsStore } from "../../store/useSettingsStore";

// The 12 groups requested by the user, in exact order
const SETTINGS_CATEGORIES = [
  { id: 'general', label: 'General', icon: Settings, group: 'SYSTEM' },
  { id: 'appearance', label: 'Appearance', icon: Palette, group: 'SYSTEM' },
  { id: 'ai-engine', label: 'AI Engine', icon: Brain, group: 'DEFENSE ENGINE' },
  { id: 'fusion', label: 'Fusion Layer', icon: Merge, group: 'DEFENSE ENGINE' },
  { id: 'alerts', label: 'Alerts', icon: BellRing, group: 'DEFENSE ENGINE' },
  { id: 'aws', label: 'AWS', icon: Cloud, group: 'INTEGRATIONS' },
  { id: 'integrations', label: 'Integrations', icon: Boxes, group: 'INTEGRATIONS' },
  { id: 'dataset', label: 'Dataset', icon: Database, group: 'DATA & SEC' },
  { id: 'reports', label: 'Reports', icon: FileSpreadsheet, group: 'DATA & SEC' },
  { id: 'users', label: 'Users', icon: Users2, group: 'ACCESS & HEALTH' },
  { id: 'monitoring', label: 'Monitoring', icon: ActivitySquare, group: 'ACCESS & HEALTH' },
  { id: 'backup', label: 'Backup', icon: FolderSync, group: 'ACCESS & HEALTH' },
];

export function SettingsSidebar() {
  const { activeCategory, setCategory } = useSettingsStore();

  const renderCategoryButton = (cat: typeof SETTINGS_CATEGORIES[0]) => {
    const isActive = activeCategory === cat.id;
    return (
      <button
        key={cat.id}
        onClick={() => setCategory(cat.id)}
        className={cn(
          "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer border select-none group",
          isActive 
            ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/25 shadow-[0_0_15px_rgba(6,182,212,0.12)] font-bold font-mono" 
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

  const groups = ['SYSTEM', 'DEFENSE ENGINE', 'INTEGRATIONS', 'DATA & SEC', 'ACCESS & HEALTH'];

  return (
    <div className="w-68 h-full border-r border-border bg-card/45 dark:bg-zinc-950/40 flex flex-col shrink-0 overflow-y-auto custom-scrollbar select-none">
      <div className="p-3 py-4 space-y-4">
        
        <div className="px-3 pb-1.5 border-b border-border/30">
          <h1 className="text-xs font-mono font-black text-foreground tracking-[0.2em] leading-none uppercase">
            SOC CONTROL
          </h1>
          <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest mt-1 flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            SYSTEM v3.0 ACTIVE
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
