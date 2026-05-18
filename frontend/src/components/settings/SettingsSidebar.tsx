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

const CATEGORIES = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'ai', label: 'AI Configuration', icon: BrainCircuit },
  { id: 'cloud', label: 'Cloud Integration', icon: Cloud },
  { id: 'rules', label: 'Alert Rules', icon: Zap },
  { id: 'users', label: 'User Management', icon: Users },
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

  return (
    <div className="w-64 h-full border-r border-border bg-muted/20 flex flex-col overflow-y-auto custom-scrollbar">
      <div className="p-6">
        <h2 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Configuration</h2>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                activeCategory === cat.id 
                  ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/30" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
              )}
            >
              <cat.icon size={14} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
