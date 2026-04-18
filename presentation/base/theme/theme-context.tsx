import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { kvStore } from '@infrastructure/storage/kv-store';

export type ThemePreference = 'system' | 'light' | 'dark';
export type EffectiveScheme = 'light' | 'dark';

interface ThemeContextValue {
  preference: ThemePreference;
  scheme: EffectiveScheme;
  setPreference: (pref: ThemePreference) => void;
}

const STORAGE_KEY = 'theme_preference';

const ThemeContext = createContext<ThemeContextValue>({
  preference: 'system',
  scheme: 'light',
  setPreference: () => {},
});

export interface AppThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider = ({ children }: AppThemeProviderProps): React.JSX.Element => {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    void kvStore.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setPreferenceState(stored);
      }
    });
  }, []);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    void kvStore.setItem(STORAGE_KEY, pref);
  }, []);

  const scheme: EffectiveScheme =
    preference === 'system'
      ? (systemScheme ?? 'light')
      : preference;

  return (
    <ThemeContext.Provider value={{ preference, scheme, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => useContext(ThemeContext);
