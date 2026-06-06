import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeId = 'theme-oled' | 'theme-cosmic' | 'theme-obsidian' | 'theme-ascii';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  isCustom?: boolean;
}

export const THEMES: Theme[] = [
  {
    id: 'theme-oled',
    name: 'OLED',
    description: 'Pure black. Easy on battery.',
  },
  {
    id: 'theme-cosmic',
    name: 'Cosmic',
    description: 'Deep purple. Space vibes.',
  },
  {
    id: 'theme-obsidian',
    name: 'Obsidian',
    description: 'Dark green. Eyes in the dark.',
  },
  {
    id: 'theme-ascii',
    name: 'ASCII',
    description: 'Terminal green. Old school.',
    isCustom: true,
  },
];

interface ThemeState {
  activeTheme: ThemeId;
  setTheme: (id: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      activeTheme: 'theme-oled',
      setTheme: (id) => {
        document.documentElement.className = id;
        set({ activeTheme: id });
      },
    }),
    {
      name: 'aether-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.className = state.activeTheme;
        }
      },
    }
  )
);