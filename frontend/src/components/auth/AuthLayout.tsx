import React from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Shield } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthLayoutProps {
  children: React.ReactNode;
  heroContent: React.ReactNode;
}

export function AuthLayout({ children, heroContent }: AuthLayoutProps) {
  return (
    <div 
      className="min-h-screen w-full bg-[#f8fafc] dark:bg-[#04040a] text-slate-900 dark:text-zinc-100 flex flex-col transition-colors duration-500 font-sans"
      id="soc-compliance-auth-container"
    >
      {/* Top action rail */}
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-zinc-900/40 bg-white/40 dark:bg-zinc-950/20 backdrop-blur-md">
        {/* Brand logo */}
        <div className="flex items-center gap-2 font-mono">
          <div className="w-7 h-7 rounded-lg bg-cyan-600 dark:bg-cyan-500 flex items-center justify-center text-slate-950 shadow-sm shadow-cyan-500/20">
            <Shield size={14} className="stroke-[2.5]" />
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-white">
              ANTIGRAVITY
            </span>
            <span className="text-[8px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest mt-0.5">
              HYBRID SOC v3.0
            </span>
          </div>
        </div>

        {/* Action switchers */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </header>

      {/* Main Grid content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch min-h-130 md:min-h-145">
          
          {/* Hero panel (Left or Right depending on preference; let's put it on left for standard layout) */}
          {/* Collapses completely on pure mobile screens */}
          <div className="hidden sm:block lg:col-span-6 flex-col justify-center bg-white dark:bg-[#030307]/40 border border-slate-200/80 dark:border-zinc-900/60 rounded-2xl p-6 md:p-8 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={heroContent ? "content-present" : "content-empty"}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                className="h-full flex flex-col justify-between"
              >
                {heroContent}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Form area */}
          <div className="col-span-1 lg:col-span-6 flex flex-col justify-center">
            {children}
          </div>

        </div>
      </main>

      {/* Dynamic footer copyright metadata */}
      <footer className="w-full py-4 text-center border-t border-slate-250/40 dark:border-zinc-900/40 text-[9px] font-mono text-slate-400 dark:text-zinc-600 uppercase tracking-widest bg-white/10 dark:bg-zinc-950/10">
        <span>ANTIGRAVITY SYSTEMS &bull; SECURED COGENT FRAMEWORK &bull; ALL OPERATIONS ENFORCED</span>
      </footer>
    </div>
  );
}
