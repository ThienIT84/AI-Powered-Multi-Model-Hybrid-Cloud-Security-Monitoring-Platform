import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type ThemeType = "Light" | "Dark" | "System";

interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "soc_theme_preference";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Read initial theme preference from localStorage or default to "System" (since SOC style defaults to System/Dark)
  const [theme, setThemeState] = useState<ThemeType>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "Light" || stored === "Dark" || stored === "System") {
        return stored as ThemeType;
      }
    }
    return "Dark"; // Default to dark theme for SOC feel
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Compute resolved dark mode setting
  const resolveDarkMode = useCallback((selectedTheme: ThemeType): boolean => {
    if (selectedTheme === "Dark") return true;
    if (selectedTheme === "Light") return false;
    
    // System theme detection
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true; // Default fallback
  }, []);

  // Update document.documentElement classList when theme or system pref changes
  useEffect(() => {
    const resolved = resolveDarkMode(theme);
    setIsDarkMode(resolved);

    if (resolved) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Media query listener for real-time OS system changes if theme is "System"
    if (theme === "System" && typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme, resolveDarkMode]);

  const setTheme = useCallback((newTheme: ThemeType) => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
