import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface InstalledAddon {
  isEnabled: boolean;
  config: Record<string, string>;
  installedAt: number;
}

interface AddonState {
  installed: Record<string, InstalledAddon>;
  install: (addonId: string, config?: Record<string, string>) => void;
  uninstall: (addonId: string) => void;
  toggle: (addonId: string) => void;
  setConfig: (addonId: string, config: Record<string, string>) => void;
  isInstalled: (addonId: string) => boolean;
  isEnabled: (addonId: string) => boolean;
  getConfig: (addonId: string) => Record<string, string>;
}

export const useAddonStore = create<AddonState>()(
  persist(
    (set, get) => ({
      installed: {
        'aether.audius': { isEnabled: true, config: {}, installedAt: Date.now() },
        'aether.radio': { isEnabled: true, config: {}, installedAt: Date.now() },
        'aether.archive': { isEnabled: true, config: {}, installedAt: Date.now() },
        'aether.itunes': { isEnabled: true, config: {}, installedAt: Date.now() },
        'aether.jiosaavn': { isEnabled: true, config: {}, installedAt: Date.now() },
      },

      install: (addonId, config = {}) =>
        set((state) => ({
          installed: {
            ...state.installed,
            [addonId]: {
              isEnabled: true,
              config,
              installedAt: Date.now(),
            },
          },
        })),

      uninstall: (addonId) =>
        set((state) => {
          const next = { ...state.installed };
          delete next[addonId];
          return { installed: next };
        }),

      toggle: (addonId) =>
        set((state) => {
          const addon = state.installed[addonId];
          if (!addon) return state;
          return {
            installed: {
              ...state.installed,
              [addonId]: { ...addon, isEnabled: !addon.isEnabled },
            },
          };
        }),

      setConfig: (addonId, config) =>
        set((state) => {
          const addon = state.installed[addonId];
          if (!addon) return state;
          return {
            installed: {
              ...state.installed,
              [addonId]: {
                ...addon,
                config: { ...addon.config, ...config },
              },
            },
          };
        }),

      isInstalled: (addonId) => !!get().installed[addonId],

      isEnabled: (addonId) => !!get().installed[addonId]?.isEnabled,

      getConfig: (addonId) => get().installed[addonId]?.config ?? {},
    }),
    { name: 'aether-addons' },
  ),
);
