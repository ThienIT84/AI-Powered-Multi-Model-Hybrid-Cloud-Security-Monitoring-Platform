import React from "react";
import { Terminal, Shield, BookOpen, AlertTriangle, FileText, Sparkles } from "lucide-react";
import { AppView } from "../../types/views";

interface SOCQuickActionsProps {
  onNavigate: (view: AppView) => void;
}

export const SOCQuickActions: React.FC<SOCQuickActionsProps> = React.memo(({ onNavigate }) => {

  const actions = [
    {
      label: "View Alerts",
      icon: <AlertTriangle size={13} className="text-red-500" />,
      onClick: () => onNavigate("alerts" as AppView)
    },
    {
      label: "Open Cases",
      icon: <Terminal size={13} className="text-cyan-500" />,
      onClick: () => onNavigate("case-management" as AppView)
    },
    {
      label: "Threat Intel",
      icon: <Shield size={13} className="text-purple-500" />,
      onClick: () => onNavigate("threat-intel" as AppView)
    },
    {
      label: "Playbooks",
      icon: <BookOpen size={13} className="text-teal-500" />,
      onClick: () => onNavigate("playbooks" as AppView)
    }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5" id="soc-quick-actions">
      <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-4 select-none">
        <Sparkles size={14} className="text-purple-500" />
        <h3 className="text-[10px] font-black uppercase text-foreground tracking-widest font-mono">
          SOC Executive Quick Actions
        </h3>
      </div>

      <div className="flex flex-col gap-3 font-mono">
        {/* Navigation buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className="bg-secondary/15 hover:bg-secondary/35 border border-border/30 hover:border-cyan-500/25 py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-[9px] font-bold text-foreground hover:text-cyan-400 capitalize transition-all select-none"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>

        <div className="border-t border-border/10 pt-3 mt-1">
          <button
            onClick={() => onNavigate("reports")}
            className="w-full bg-cyan-600/15 hover:bg-cyan-600/25 font-extrabold border border-cyan-500/20 py-2 rounded-lg text-[9px] uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all text-cyan-400"
          >
            <FileText size={13} />
            Open backend-derived reports
          </button>
        </div>
      </div>
    </div>
  );
});
