import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useThemeStore } from '../stores/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const colorScheme = useColorScheme();
  const { setSystemTheme } = useThemeStore();

  useEffect(() => {
    // Update system theme when color scheme changes
    if (colorScheme) {
      setSystemTheme(colorScheme === 'dark');
    }
  }, [colorScheme, setSystemTheme]);

  return <>{children}</>;
};
