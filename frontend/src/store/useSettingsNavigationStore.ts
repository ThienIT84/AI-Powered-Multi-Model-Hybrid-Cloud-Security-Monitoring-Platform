import { create } from "zustand";

interface SettingsNavigationState {
  activeCategory: string;
  setCategory: (category: string) => void;
}

export const useSettingsNavigationStore = create<SettingsNavigationState>((set) => ({
  activeCategory: "general",
  setCategory: (activeCategory) => set({ activeCategory }),
}));
