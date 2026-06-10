import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createTheme } from '../../src/theme';

const THEME_KEY = 'theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored) setPreference(stored);
      setLoaded(true);
    });
  }, []);

  const isDark = preference === 'dark' || (preference === null && systemScheme === 'dark');

  const theme = useMemo(() => createTheme(isDark), [isDark]);

  const toggleTheme = useCallback(() => {
    const next = isDark ? 'light' : 'dark';
    setPreference(next);
    AsyncStorage.setItem(THEME_KEY, next);
  }, [isDark]);

  const setTheme = useCallback((mode) => {
    setPreference(mode);
    AsyncStorage.setItem(THEME_KEY, mode);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
