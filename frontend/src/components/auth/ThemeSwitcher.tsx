import React, { useState } from "react";
import { useTheme, ThemeType } from "../../context/ThemeContext";
import { Sun, Moon, Laptop, Check } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeOptions: Array<{ value: ThemeType; label: string; icon: typeof Sun }> = [
    { value: "Light", label: "Solar Light", icon: Sun },
    { value: "Dark", label: "Lunar Dark", icon: Moon },
    { value: "System", label: "System OS", icon: Laptop },
  ];

  const ActiveIcon = theme === "Light" ? Sun : theme === "Dark" ? Moon : Laptop;

  return (
    <div className="relative font-mono text-left" id="theme-switcher-parent">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black uppercase text-slate-700 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-900 rounded-lg shadow-sm hover:text-cyan-550 dark:hover:text-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        id="theme-switcher-btn"
      >
        <ActiveIcon size={11} className="shrink-0 text-cyan-500 dark:text-cyan-400" />
        <span>{theme}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)} />
          <ul
            className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl py-1.5 z-50 text-[10px] space-y-0.5 animate-in fade-in-50 slide-in-from-top-1 duration-200"
            role="listbox"
            aria-labelledby="theme-switcher-btn"
          >
            {themeOptions.map((opt) => {
              const IconComp = opt.icon;
              const isSelected = theme === opt.value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      setTheme(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors uppercase font-bold cursor-pointer ${
                      isSelected ? "text-cyan-550 dark:text-cyan-400 font-black" : "text-slate-600 dark:text-zinc-400"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <IconComp size={10} className={isSelected ? "text-cyan-550 dark:text-cyan-400" : "text-slate-400"} />
                      <span>{opt.label}</span>
                    </div>
                    {isSelected && <Check size={10} className="stroke-3" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
