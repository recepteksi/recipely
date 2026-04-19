import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { kvStore } from '@infrastructure/storage/kv-store';
import { getThemeColors, type ThemeId, type ThemeColors } from './themes';

export type ThemePreference = 'system' | 'light' | 'dark';
export type EffectiveScheme = 'light' | 'dark';

export interface ThemeContextValue {
  themeId: ThemeId;
  preference: ThemePreference;
  scheme: EffectiveScheme;
  colors: ThemeColors;
  setThemeId: (id: ThemeId) => void;
  setPreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: 'pearl-white',
  preference: 'system',
  scheme: 'light',
  colors: {} as ThemeColors,
  setThemeId: () => {},
  setPreference: () => {},
});

export interface AppThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider = ({ children }: AppThemeProviderProps): React.JSX.Element => {
  const systemScheme = useColorScheme();
  const [themeId, setThemeIdState] = useState<ThemeId>('pearl-white');
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  // Load persisted theme on mount
  useEffect(() => {
    void kvStore.getItem('theme_id').then((stored) => {
      if (stored) {
        setThemeIdState(stored as ThemeId);
      }
    });
  }, []);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    void kvStore.setItem('theme_id', id);
  }, []);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
  }, []);

  const scheme: EffectiveScheme =
    preference === 'system'
      ? (systemScheme ?? 'light')
      : preference;

  // Memoize to ensure stable reference when themeId/scheme unchanged
  const colors = useMemo(() => getThemeColors(themeId, scheme), [themeId, scheme]);

  const value = useMemo(
    () => ({ themeId, preference, scheme, colors, setThemeId, setPreference }),
    [themeId, preference, scheme, colors, setThemeId, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => useContext(ThemeContext);