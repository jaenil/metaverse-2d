import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: string;
  customBaseColor: string;
  customSurfaceColor: string;
  customBorderColor: string;
  customAccentColor: string;
  backgroundStyle: 'none' | 'aurora' | 'network' | 'combined';
  setTheme: (theme: string) => void;
  setCustomColors: (base: string, surface: string, border: string, accent: string) => void;
  setBackgroundStyle: (style: 'none' | 'aurora' | 'network' | 'combined') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'midnight', // default theme
      customBaseColor: '#0f172a',
      customSurfaceColor: '#1e293b',
      customBorderColor: '#334155',
      customAccentColor: '#f97316',
      backgroundStyle: 'none', // default no heavy background
      setTheme: (theme) => set({ theme }),
      setCustomColors: (base, surface, border, accent) => set({ customBaseColor: base, customSurfaceColor: surface, customBorderColor: border, customAccentColor: accent }),
      setBackgroundStyle: (style) => set({ backgroundStyle: style }),
    }),
    {
      name: 'metaverse-theme-storage',
    }
  )
);
