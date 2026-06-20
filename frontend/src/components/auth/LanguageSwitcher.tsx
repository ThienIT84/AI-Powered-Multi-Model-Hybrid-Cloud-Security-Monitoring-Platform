import React, { useState, useEffect } from "react";
import { Globe, Check } from "lucide-react";

export function LanguageSwitcher() {
  const [lang, setLang] = useState<"en" | "vi">(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("soc_language_preference");
      if (stored === "vi" || stored === "en") return stored as "en" | "vi";
    }
    return "en";
  });
  
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("soc_language_preference", lang);
      // Optional: dispatch a custom event if this is parsed dynamically globally
      window.dispatchEvent(new CustomEvent("soc_language_changed", { detail: lang }));
    }
  }, [lang]);

  return (
    <div className="relative font-mono text-left" id="language-switcher-parent">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black uppercase text-slate-700 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-900 rounded-lg shadow-sm hover:text-cyan-550 dark:hover:text-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        id="language-switcher-btn"
      >
        <Globe size={11} className="shrink-0" />
        <span>{lang === "en" ? "EN" : "VI"}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)} />
          <ul
            className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl py-1.5 z-50 text-[10px] animate-in fade-in-50 slide-in-from-top-1 duraction-200"
            role="listbox"
            aria-labelledby="language-switcher-btn"
          >
            <li>
              <button
                type="button"
                onClick={() => {
                  setLang("en");
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors uppercase font-bold cursor-pointer ${
                  lang === "en" ? "text-cyan-550 dark:text-cyan-400 font-black" : "text-slate-600 dark:text-zinc-400"
                }`}
              >
                <span>English (US)</span>
                {lang === "en" && <Check size={10} className="stroke-3" />}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setLang("vi");
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors uppercase font-bold cursor-pointer ${
                  lang === "vi" ? "text-cyan-550 dark:text-cyan-400 font-black" : "text-slate-600 dark:text-zinc-400"
                }`}
              >
                <span>Vietnamese</span>
                {lang === "vi" && <Check size={10} className="stroke-3" />}
              </button>
            </li>
          </ul>
        </>
      )}
    </div>
  );
}
