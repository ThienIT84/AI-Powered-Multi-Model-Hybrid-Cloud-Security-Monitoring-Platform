import React from "react";
import { 
  Settings, 
  Palette, 
  Bell, 
  Shield, 
  BrainCircuit, 
  Cloud, 
  Zap, 
  Users, 
  Webhook, 
  Database, 
  Activity, 
  Cpu, 
  History, 
  FileText, 
  Sliders 
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useSettingsStore } from "../../store/useSettingsStore";

const GENERAL_CATEGORIES = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'ai', label: 'AI Configuration', icon: BrainCircuit },
  { id: 'cloud', label: 'Cloud Integration', icon: Cloud },
  { id: 'rules', label: 'Alert Rules', icon: Zap },
  { id: 'users', label: 'User Management', icon: Users },
];

const ADVANCED_CATEGORIES = [
  { id: 'api', label: 'API & Webhooks', icon: Webhook },
  { id: 'data', label: 'Data & Storage', icon: Database },
  { id: 'monitoring', label: 'Monitoring', icon: Activity },
  { id: 'performance', label: 'Performance', icon: Cpu },
  { id: 'backup', label: 'Backup & Recovery', icon: History },
  { id: 'audit', label: 'Audit Logs', icon: FileText },
  { id: 'advanced', label: 'Advanced', icon: Sliders },
];

export function SettingsSidebar() {
  const { activeCategory, setCategory } = useSettingsStore();

  const renderCategoryButton = (cat: { id: string; label: string; icon: any }) => {
    const isActive = activeCategory === cat.id;
    return (
      <button
        key={cat.id}
        onClick={() => setCategory(cat.id)}
        className={cn(
          "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[9.5px] font-mono font-black uppercase tracking-widest transition-all cursor-pointer border select-none",
          isActive 
            ? "bg-cyan-500/10 text-cyan-500 border-cyan-505/20 border-cyan-500/35 dark:border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-bold" 
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground border-transparent"
        )}
      >
        <cat.icon size={13} className={cn("shrink-0", isActive ? "text-cyan-500 animate-pulse" : "text-muted-foreground")} />
        <span className="truncate">{cat.label}</span>
      </button>
    );
  };

  return (
    <div className="w-64 h-full border-r border-border bg-card/65 dark:bg-card/40 flex flex-col shrink-0 overflow-y-auto custom-scrollbar select-none">
      <div className="p-6 space-y-6">
        
        {/* General section */}
        <div>
          <h2 className="text-[9.5px] font-mono font-black text-muted-foreground uppercase tracking-[0.25em] mb-3 px-1">
            GENERAL CORE
          </h2>
          <div className="space-y-1">
            {GENERAL_CATEGORIES.map(renderCategoryButton)}
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-border/60 mx-1" />

        {/* Advanced modules */}
        <div>
          <h2 className="text-[9.5px] font-mono font-black text-muted-foreground uppercase tracking-[0.25em] mb-3 px-1">
            ADVANCED MODULES
          </h2>
          <div className="space-y-1">
            {ADVANCED_CATEGORIES.map(renderCategoryButton)}
          </div>
        </div>
      </div>
    </div>
  );
}
