import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: string;
  setTheme: (theme: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'ember', // default theme
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'metaverse-theme-storage',
    }
  )
);
