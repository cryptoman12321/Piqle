import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, Theme } from '../constants/theme';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  theme: Theme;
  systemTheme: 'light' | 'dark';
}

interface ThemeActions {
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setSystemTheme: (isDark: boolean) => void;
  getCurrentTheme: () => Theme;
}

type ThemeStore = ThemeState & ThemeActions;

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // State
      themeMode: 'system',
      isDarkMode: false,
      theme: lightTheme,
      systemTheme: 'light',

      // Actions
      setThemeMode: (mode: ThemeMode) => {
        const { systemTheme } = get();
        const isDark = mode === 'dark' || (mode === 'system' && systemTheme === 'dark');
        
        set({
          themeMode: mode,
          isDarkMode: isDark,
          theme: isDark ? darkTheme : lightTheme,
        });
      },

      toggleTheme: () => {
        const { themeMode } = get();
        if (themeMode === 'system') {
          // If system mode, switch to manual light/dark
          const newMode: ThemeMode = get().isDarkMode ? 'light' : 'dark';
          get().setThemeMode(newMode);
        } else {
          // If manual mode, switch between light and dark
          const newMode: ThemeMode = get().isDarkMode ? 'light' : 'dark';
          get().setThemeMode(newMode);
        }
      },

      setSystemTheme: (isDark: boolean) => {
        const { themeMode } = get();
        const systemTheme = isDark ? 'dark' : 'light';
        
        set({ systemTheme });
        
        // Only update theme if we're in system mode
        if (themeMode === 'system') {
          set({
            isDarkMode: isDark,
            theme: isDark ? darkTheme : lightTheme,
          });
        }
      },

      getCurrentTheme: () => {
        const { themeMode, systemTheme } = get();
        if (themeMode === 'system') {
          return systemTheme === 'dark' ? darkTheme : lightTheme;
        }
        return get().theme;
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ themeMode: state.themeMode }),
    }
  )
);
