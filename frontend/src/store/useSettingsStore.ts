import { create } from 'zustand';

export interface SystemSettings {
  general: {
    platformName: string;
    organization: string;
    timezone: string;
    language: string;
    refreshInterval: number;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    accentColor: string;
    compactMode: boolean;
    animations: boolean;
    glassmorphism: number;
  };
  ai: {
    enabled: boolean;
    provider: string;
    model: string;
    confidenceThreshold: number;
    autoInvestigate: boolean;
  };
  cloud: {
    aws: boolean;
    azure: boolean;
    gcp: boolean;
    syncInterval: number;
  };
  security: {
    mfaEnabled: boolean;
    sessionTimeout: number;
    ipAllowlist: string[];
  };
}

const DEFAULT_SETTINGS: SystemSettings = {
  general: {
    platformName: "ANTIGRAVITY SOC",
    organization: "Global Defense Corp",
    timezone: "UTC+7",
    language: "en",
    refreshInterval: 30,
  },
  appearance: {
    theme: 'dark',
    accentColor: '#06b6d4',
    compactMode: false,
    animations: true,
    glassmorphism: 80,
  },
  ai: {
    enabled: true,
    provider: "Google Gemini",
    model: "gemini-2.0-pro-exp",
    confidenceThreshold: 0.85,
    autoInvestigate: true,
  },
  cloud: {
    aws: true,
    azure: false,
    gcp: true,
    syncInterval: 15,
  },
  security: {
    mfaEnabled: true,
    sessionTimeout: 60,
    ipAllowlist: ["10.0.0.0/8", "192.168.1.0/24"],
  },
};

interface SettingsState {
  settings: SystemSettings;
  draftSettings: SystemSettings;
  isDirty: boolean;
  activeCategory: string;
  setCategory: (category: string) => void;
  updateDraft: (path: string, value: any) => void;
  saveChanges: () => void;
  resetDraft: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  draftSettings: DEFAULT_SETTINGS,
  isDirty: false,
  activeCategory: 'general',
  
  setCategory: (category) => set({ activeCategory: category }),
  
  updateDraft: (path, value) => {
    const freshDraft = { ...get().draftSettings };
    const parts = path.split('.');
    let current: any = freshDraft;
    for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    
    set({ 
      draftSettings: freshDraft,
      isDirty: JSON.stringify(freshDraft) !== JSON.stringify(get().settings)
    });
  },
  
  saveChanges: () => {
    set((state) => ({ 
      settings: state.draftSettings, 
      isDirty: false 
    }));
  },
  
  resetDraft: () => {
    set((state) => ({ 
      draftSettings: state.settings, 
      isDirty: false 
    }));
  }
}));
