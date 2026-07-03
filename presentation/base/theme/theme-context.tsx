import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { kvStore } from '@infrastructure/storage/kv-store';
import { useIsHydrated } from '@presentation/base/responsive/use-is-hydrated';
import { getThemeColors } from './themes';
import type { ThemeId } from '@presentation/base/theme/theme-id';
import type { ThemeColors } from '@presentation/base/theme/theme-colors';
import type { ThemePreference } from '@presentation/base/theme/theme-preference';
import type { EffectiveScheme } from '@presentation/base/theme/effective-scheme';
import type { ThemeContextValue } from '@presentation/base/theme/theme-context-value';

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

const isThemePreference = (v: string): v is ThemePreference =>
  v === 'system' || v === 'light' || v === 'dark';

export const AppThemeProvider = ({ children }: AppThemeProviderProps): React.JSX.Element => {
  const systemScheme = useColorScheme();
  const hydrated = useIsHydrated();
  const [themeId, setThemeIdState] = useState<ThemeId>('pearl-white');
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  // Load persisted theme + preference on mount
  useEffect(() => {
    void kvStore.getItem('theme_id').then((stored) => {
      if (stored) {
        setThemeIdState(stored as ThemeId);
      }
    });
    void kvStore.getItem('theme_preference').then((stored) => {
      if (stored !== null && isThemePreference(stored)) {
        setPreferenceState(stored);
      }
    });
  }, []);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    void kvStore.setItem('theme_id', id);
  }, []);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    void kvStore.setItem('theme_preference', pref);
  }, []);

  // On web the static export prerenders without `prefers-color-scheme`, so the
  // server HTML is always light. Ignore the live system scheme until after
  // hydration so the first client render matches and React can hydrate cleanly
  // (React error #418). `preference` itself loads from storage in an effect, so
  // it is already at its SSR default ('system') on the first render.
  const effectiveSystemScheme =
    Platform.OS === 'web' && !hydrated ? 'light' : (systemScheme ?? 'light');

  const scheme: EffectiveScheme =
    preference === 'system' ? effectiveSystemScheme : preference;

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