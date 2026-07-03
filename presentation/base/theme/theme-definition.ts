import type { ThemeColors } from '@presentation/base/theme/theme-colors';
import type { ThemeVariant } from '@presentation/base/theme/theme-variant';

export interface ThemeDefinition {
  name: string;
  nameTr: string;
  description: string;
  preferredVariant: ThemeVariant;
  light: ThemeColors;
  dark: ThemeColors;
}
