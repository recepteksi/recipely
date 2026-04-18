import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { kvStore } from '@infrastructure/storage/kv-store';
import { getThemeColors, type ThemeId, type ThemeColors } from './themes';

export type ThemePreference = 'system' | 'light' | 'dark';
export type EffectiveScheme = 'light' | 'dark';

interface ThemeContextValue {
  themeId: ThemeId;
  preference: ThemePreference;
  scheme: EffectiveScheme;
  colors: ThemeColors;
  setThemeId: (id: ThemeId) => void;
  setPreference: (pref: ThemePreference) => void;
}

const STORAGE_KEY = 'theme_id';

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
  const systemScheme = useSystemColorScheme();
  const [themeId, setThemeIdState] = useState<ThemeId>('pearl-white');
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    void kvStore.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        setThemeIdState(stored as ThemeId);
      }
    });
  }, []);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    void kvStore.setItem(STORAGE_KEY, id);
  }, []);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
  }, []);

  const scheme: EffectiveScheme =
    preference === 'system'
      ? (systemScheme ?? 'light')
      : preference;

  const colors = useMemo(() => getThemeColors(themeId, scheme), [themeId, scheme]);

  return (
    <ThemeContext.Provider value={{ themeId, preference, scheme, colors, setThemeId, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => useContext(ThemeContext);