import { create } from 'zustand';
import { lightTheme, darkTheme, Theme } from '../constants/theme';

interface ThemeState {
  isDarkMode: boolean;
  theme: Theme;
}

interface ThemeActions {
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

type ThemeStore = ThemeState & ThemeActions;

export const useThemeStore = create<ThemeStore>((set) => ({
  // State
  isDarkMode: false,
  theme: lightTheme,

  // Actions
  toggleTheme: () => set((state) => ({
    isDarkMode: !state.isDarkMode,
    theme: !state.isDarkMode ? darkTheme : lightTheme,
  })),

  setTheme: (isDark) => set({
    isDarkMode: isDark,
    theme: isDark ? darkTheme : lightTheme,
  }),
}));
