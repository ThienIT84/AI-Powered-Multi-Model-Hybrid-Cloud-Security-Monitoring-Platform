import React from "react";
import { 
  ShieldAlert, 
  Activity, 
  Globe, 
  Settings, 
  FileText, 
  Database, 
  Cloud, 
  Home,
  Zap,
  Target,
  Cpu,
  Server,
  Bell,
  Network,
  ShieldCheck,
  Brain,
  ChevronRight,
  Monitor,
  Radar,
  Grid3X3,
  Folder,
  Layers,
  BarChart3,
  Puzzle,
  BookOpen,
  Shield,
  LayoutDashboard
} from "lucide-react";
import { cn } from "../../lib/utils";

const menuItems = [
  { group: "MONITORING", items: [
    { icon: Bell, label: "Alerts", count: 12 },
    { icon: Globe, label: "Network" },
    { icon: Monitor, label: "Endpoints" },
    { icon: Cloud, label: "Cloud" },
    { icon: Shield, label: "Threat Intel" },
  ]},
  { group: "DETECTION & ANALYSIS", items: [
    { icon: Target, label: "AI Threat Detection" },
    { icon: Radar, label: "Attack Surface" },
    { icon: Grid3X3, label: "MITRE ATT&CK" },
    { icon: Folder, label: "Case Management" },
  ]},
  { group: "DATA SOURCES", items: [
    { icon: Zap, label: "Zeek Logs" },
    { icon: ShieldCheck, label: "Suricata Alerts" },
    { icon: Cloud, label: "AWS VPC Flow Logs" },
    { icon: Activity, label: "CloudTrail" },
    { icon: Server, label: "DNS Logs" },
  ]},
  { group: "AI & MODELS", items: [
    { icon: Brain, label: "AI Models" },
    { icon: Layers, label: "Fusion Layer" },
    { icon: BarChart3, label: "SHAP Explainability" },
  ]},
  { group: "CONFIGURATION", items: [
    { icon: Puzzle, label: "Integrations" },
    { icon: BookOpen, label: "Playbooks" },
    { icon: FileText, label: "Reports" },
    { icon: Settings, label: "Settings" },
  ]}
];

export function Sidebar({ 
  currentView, 
  onViewChange 
}: { 
  currentView: "dashboard" | "alerts" | "network" | "integrations" | "playbooks" | "reports" | "settings"; 
  onViewChange: (view: "dashboard" | "alerts" | "network" | "integrations" | "playbooks" | "reports" | "settings") => void;
}) {
  return (
    <aside className="w-55 h-full bg-card border-r border-border flex flex-col overflow-y-auto custom-scrollbar select-none transition-colors duration-300">
      {/* GLOWING LOGO */}
      <div className="p-6 flex items-center gap-4">
        <div className="relative group shrink-0">
          {/* Animated glow layers */}
          <div className="absolute inset-0 bg-cyan-500/10 blur-2xl rounded-full animate-pulse" />
          <div className="absolute inset-0 bg-cyan-400/5 blur-md rounded-full" />
          
          <div className="relative w-12 h-12 bg-background border border-cyan-500/20 rounded-xl flex items-center justify-center shadow-sm overflow-hidden group-hover:border-cyan-500/50 transition-colors">
            {/* Circuit-like background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="circuit" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#circuit)" />
              </svg>
            </div>
            
            <ShieldAlert className="w-6 h-6 text-cyan-500 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
          </div>
        </div>
        
        <div className="flex flex-col">
          <h1 className="text-foreground font-black text-xl tracking-tight leading-none">
            NEXUS
          </h1>
          <p className="text-[9px] text-cyan-500 font-black tracking-[0.3em] mt-1 uppercase">SECURITY</p>
        </div>
      </div>

      {/* DASHBOARD Highlighted Bar */}
      <div className="px-3 pb-2">
        <button 
          onClick={() => onViewChange('dashboard')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border group transition-all",
            currentView === 'dashboard' 
              ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 shadow-sm" 
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Home className={cn("w-4 h-4", currentView === 'dashboard' ? "text-cyan-500" : "")} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] flex-1 text-left">DASHBOARD</span>
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-7">
        {menuItems.map((group, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em] px-3 mb-3">
              {group.group}
            </h3>
            {group.items.map((item, idy) => {
              const isAlerts = item.label === "Alerts";
              const isNetwork = item.label === "Network";
              const isIntegrations = item.label === "Integrations";
              const isPlaybooks = item.label === "Playbooks";
              const isReports = item.label === "Reports";
              const isSettings = item.label === "Settings";
              const isActive = (isAlerts && currentView === 'alerts') ||
                               (isNetwork && currentView === 'network') ||
                               (isIntegrations && currentView === 'integrations') ||
                               (isPlaybooks && currentView === 'playbooks') ||
                               (isReports && currentView === 'reports') ||
                               (isSettings && currentView === 'settings');
              
              return (
                <button
                  key={idy}
                  onClick={() => {
                    if (isAlerts) onViewChange('alerts');
                    else if (isNetwork) onViewChange('network');
                    else if (isIntegrations) onViewChange('integrations');
                    else if (isPlaybooks) onViewChange('playbooks');
                    else if (isReports) onViewChange('reports');
                    else if (isSettings) onViewChange('settings');
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all duration-200 group",
                    isActive 
                      ? "text-cyan-500 bg-cyan-500/5 border border-cyan-500/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                  )}
                >
                  <item.icon className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-cyan-500" : "text-muted-foreground group-hover:text-cyan-500"
                  )} />
                  <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground/30 opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white uppercase border border-white/10 shadow-sm">
            Ad
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-foreground leading-none">Admin</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">SOC Analyst</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
