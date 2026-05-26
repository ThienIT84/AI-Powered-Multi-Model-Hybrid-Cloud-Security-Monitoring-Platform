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

export function SettingsPage() {
  const { 
    activeCategory, 
    isDirty, 
    saveChanges, 
    resetDraft 
  } = useSettingsStore();

  const renderContent = () => {
    switch (activeCategory) {
      case "general": return <GeneralSettings />;
      case "appearance": return <AppearanceSettings />;
      case "notifications": return <NotificationSettings />;
      case "ai": return <AiConfigSettings />;
      case "security": return <SecuritySettings />;
      case "cloud": return <CloudIntegrationSettings />;
      case "users": return <UserManagementSettings />;
      default: return (
        <div className="flex flex-col items-center justify-center h-100px text-center space-y-4">
           <AlertCircle size={40} className="text-muted-foreground opacity-20" />
           <div>
              <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest leading-none">Category: {activeCategory}</h3>
              <p className="text-[9px] text-muted-foreground/50 uppercase tracking-[0.2em] mt-2">Module logic is being initialized...</p>
           </div>
        </div>
      );
    }
  };

  return (
    <div className="flex bg-background h-screen overflow-hidden">
      {/* Settings Side Nav */}
      <SettingsSidebar />

      {/* Main Settings Portal */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
        {/* Sticky Header / Breadcrumbs */}
        <header className="p-6 border-b border-border flex items-center justify-between bg-background/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
             <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                CORE <ChevronRight size={10} /> 
                SETTINGS <ChevronRight size={10} /> 
                <span className="text-foreground">{activeCategory.toUpperCase()}</span>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative group w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="SEARCH SETTINGS..."
                  className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-cyan-500/50"
                />
             </div>
             <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-all">
                <Download size={18} />
             </button>
             <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-all">
                <Share2 size={18} />
             </button>
          </div>
        </header>

        {/* Dynamic Content Surface */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pb-32">
           <div className="max-w-5xl mx-auto">
              <AnimatePresence mode="wait">
                 <motion.div
                   key={activeCategory}
                   initial={{ opacity: 0, x: 10 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -10 }}
                   transition={{ duration: 0.2 }}
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
                 <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 animate-pulse">
                    <span className="text-lg font-black">!</span>
                 </div>
                 <div>
                    <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest leading-none">Unsaved Configuration Changes</h4>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-2">System state will only persist after commit</p>
                 </div>
              </div>
              
              <div className="flex items-center gap-3">
                 <button 
                   onClick={resetDraft}
                   className="px-5 py-2.5 bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-foreground transition-all flex items-center gap-2"
                 >
                    <RotateCcw size={14} /> Discard
                 </button>
                 <button 
                   onClick={saveChanges}
                   className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
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
