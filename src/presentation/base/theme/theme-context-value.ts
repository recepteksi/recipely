import type { ThemeId } from '@presentation/base/theme/theme-id';
import type { ThemeColors } from '@presentation/base/theme/theme-colors';
import type { ThemePreference } from '@presentation/base/theme/theme-preference';
import type { EffectiveSchemeType } from '@presentation/base/theme/effective-scheme-type';

export interface ThemeContextValue {
  themeId: ThemeId;
  preference: ThemePreference;
  scheme: EffectiveSchemeType;
  colors: ThemeColors;
  setThemeId: (id: ThemeId) => void;
  setPreference: (pref: ThemePreference) => void;
}
