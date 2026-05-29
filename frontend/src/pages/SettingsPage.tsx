import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Save, 
  RotateCcw, 
  ChevronRight, 
  Search, 
  Share2, 
  Download,
  AlertCircle
} from "lucide-react";
import { useSettingsStore } from "../store/useSettingsStore";
import { SettingsSidebar } from "../components/settings/SettingsSidebar";
import { GeneralSettings } from "../components/settings/GeneralSettings";
import { AppearanceSettings } from "../components/settings/AppearanceSettings";
import { AiConfigSettings } from "../components/settings/AiConfigSettings";
import { SecuritySettings } from "../components/settings/SecuritySettings";
import { CloudIntegrationSettings } from "../components/settings/CloudIntegrationSettings";
import { NotificationSettings } from "../components/settings/NotificationSettings";
import { UserManagementSettings } from "../components/settings/UserManagementSettings";
import { cn } from "../lib/utils";

const MODULE_NAMES: Record<string, string> = {
  rules: "ALERT RULES",
  api: "API & WEBHOOKS",
  data: "DATA & STORAGE",
  monitoring: "MONITORING",
  performance: "PERFORMANCE",
  backup: "BACKUP & RECOVERY",
  audit: "AUDIT LOGS",
  advanced: "ADVANCED",
};

export function SettingsPage() {
  const { 
    activeCategory, 
    isDirty, 
    saveChanges, 
    resetDraft 
  } = useSettingsStore();

  const isCategoryEmpty = !!MODULE_NAMES[activeCategory];

  const renderContent = () => {
    switch (activeCategory) {
      case "general": return <GeneralSettings />;
      case "appearance": return <AppearanceSettings />;
      case "notifications": return <NotificationSettings />;
      case "ai": return <AiConfigSettings />;
      case "security": return <SecuritySettings />;
      case "cloud": return <CloudIntegrationSettings />;
      case "users": return <UserManagementSettings />;
      default: {
        const moduleName = MODULE_NAMES[activeCategory] || activeCategory.toUpperCase();
        return (
          <div className="flex flex-col items-center justify-center min-h-115 text-center p-8 bg-zinc-950/45 dark:bg-zinc-950/70 border border-border/80 rounded-2xl relative overflow-hidden select-none shadow-sm h-full w-full">
            {/* Visual background grids */}
            <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-cyan-500/10 to-transparent blur-3xl pointer-events-none" />
            
            {/* Center icon ! in circle */}
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute w-21 h-21 rounded-full border border-cyan-500/10 animate-ping duration-3000" />
              <div className="w-16 h-16 rounded-full bg-cyan-950/30 dark:bg-cyan-950/20 border border-cyan-500/25 flex items-center justify-center text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <span className="text-2xl font-mono font-black select-none">!</span>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-3.5 z-10 max-w-sm">
              <h3 className="text-xs font-mono font-black text-foreground uppercase tracking-[0.25em] leading-none">
                CATEGORY: {moduleName}
              </h3>
              <p className="text-[9.5px] font-mono text-muted-foreground uppercase tracking-[0.2em] leading-normal">
                MODULE LOGIC IS BEING INITIALIZED...
              </p>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="flex bg-background h-screen overflow-hidden select-none">
      {/* Settings Side Nav */}
      <SettingsSidebar />

      {/* Main Settings Portal */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
        {/* Sticky Header / Breadcrumbs */}
        <header className="p-6 border-b border-border flex items-center justify-between bg-background/85 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
             <div className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                CORE <ChevronRight size={10} className="text-muted-foreground/65" /> 
                SETTINGS <ChevronRight size={10} className="text-muted-foreground/65" /> 
                <span className="text-cyan-500 font-bold">{activeCategory.toUpperCase()}</span>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative group w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="SEARCH SETTINGS..."
                  className="w-full bg-muted/60 border border-border rounded-lg pl-9 pr-4 py-2 text-[10px] font-mono font-black uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                />
             </div>
             <button 
               onClick={() => alert("Settings configuration downloaded!")}
               className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
             >
                <Download size={17} />
             </button>
             <button 
               onClick={() => alert("Config shared successfully!")}
               className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
             >
                <Share2 size={17} />
             </button>
          </div>
        </header>

        {/* Dynamic Content Surface */}
        <div className={cn(
          "flex-1 overflow-y-auto custom-scrollbar p-10 pb-32",
          isCategoryEmpty && "overflow-hidden flex flex-col justify-center items-center"
        )}>
           <div className={cn("mx-auto w-full", isCategoryEmpty ? "max-w-2xl h-auto" : "max-w-5xl")}>
              <AnimatePresence mode="wait">
                 <motion.div
                   key={activeCategory}
                   initial={{ opacity: 0, y: 8 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -8 }}
                   transition={{ duration: 0.2 }}
                   className={cn(isCategoryEmpty ? "w-full" : "")}
                 >
                    {renderContent()}
                 </motion.div>
              </AnimatePresence>
           </div>
        </div>

        {/* Global Save Bar (Unsaved Changes Detection) */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 py-4 bg-card border border-border rounded-2xl shadow-2xl z-50 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 animate-pulse border border-orange-500/20">
                    <span className="text-lg font-black font-mono">!</span>
                 </div>
                 <div>
                    <h4 className="text-[11px] font-mono font-black text-foreground uppercase tracking-widest leading-none">Unsaved Configuration Changes</h4>
                    <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mt-2">System state will only persist after commit</p>
                 </div>
              </div>
              
              <div className="flex items-center gap-3">
                 <button 
                   onClick={resetDraft}
                   className="px-5 py-2.5 bg-muted text-muted-foreground text-[10px] font-mono font-black uppercase tracking-widest rounded-xl hover:text-foreground hover:bg-muted/80 transition-all flex items-center gap-2 cursor-pointer border border-border"
                 >
                    <RotateCcw size={14} /> Discard
                 </button>
                 <button 
                   onClick={saveChanges}
                   className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-mono font-black uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all flex items-center gap-2 cursor-pointer"
                 >
                    <Save size={14} /> Commit Changes
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
