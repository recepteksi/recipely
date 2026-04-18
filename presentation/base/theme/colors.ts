export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  primaryLight: string;
  primaryGradientStart: string;
  primaryGradientEnd: string;
  secondary: string;
  secondaryText: string;
  danger: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  border: string;
  chipBackground: string;
  chipText: string;
  cardBackground: string;
  cardBorder: string;
  inputBackground: string;
  inputBorder: string;
  inputBorderFocused: string;
  skeleton: string;
  skeletonHighlight: string;
  shadow: string;
  overlay: string;
  starFilled: string;
  starEmpty: string;
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
  avatarBackground: string;
  sectionBackground: string;
}

export const lightColors: ThemeColors = {
  background: '#ffffff',
  surface: '#f5f5f7',
  text: '#111111',
  textMuted: '#6b6b70',
  primary: '#1a73e8',
  primaryText: '#ffffff',
  primaryLight: '#E8F0FE',
  primaryGradientStart: '#1A73E8',
  primaryGradientEnd: '#6C63FF',
  secondary: '#FF6B35',
  secondaryText: '#FFFFFF',
  danger: '#d93025',
  success: '#34A853',
  successLight: '#E6F4EA',
  warning: '#FBBC04',
  warningLight: '#FEF7E0',
  border: '#e0e0e4',
  chipBackground: '#e8f0fe',
  chipText: '#1a73e8',
  cardBackground: '#FFFFFF',
  cardBorder: '#F0F0F3',
  inputBackground: '#F5F5F7',
  inputBorder: '#E0E0E4',
  inputBorderFocused: '#1A73E8',
  skeleton: '#E8E8ED',
  skeletonHighlight: '#F5F5F7',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.35)',
  starFilled: '#FFB800',
  starEmpty: '#D4D4D8',
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#F0F0F3',
  tabBarActive: '#1A73E8',
  tabBarInactive: '#9E9EA6',
  avatarBackground: '#E8F0FE',
  sectionBackground: '#F5F5F7',
};

export const darkColors: ThemeColors = {
  background: '#0b0b0d',
  surface: '#16171a',
  text: '#f2f2f4',
  textMuted: '#a0a0a6',
  primary: '#8ab4f8',
  primaryText: '#0b0b0d',
  primaryLight: '#1F2733',
  primaryGradientStart: '#8AB4F8',
  primaryGradientEnd: '#A78BFA',
  secondary: '#FF8A5C',
  secondaryText: '#0B0B0D',
  danger: '#f28b82',
  success: '#81C995',
  successLight: '#1B3326',
  warning: '#FDD663',
  warningLight: '#332D1A',
  border: '#2a2b31',
  chipBackground: '#1f2733',
  chipText: '#8ab4f8',
  cardBackground: '#1C1D21',
  cardBorder: '#2A2B31',
  inputBackground: '#1C1D21',
  inputBorder: '#2A2B31',
  inputBorderFocused: '#8AB4F8',
  skeleton: '#2A2B31',
  skeletonHighlight: '#3A3B41',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.55)',
  starFilled: '#FFD54F',
  starEmpty: '#3A3B41',
  tabBarBackground: '#0B0B0D',
  tabBarBorder: '#1C1D21',
  tabBarActive: '#8AB4F8',
  tabBarInactive: '#6B6B70',
  avatarBackground: '#1F2733',
  sectionBackground: '#16171A',
};

export const pickColors = (scheme: 'light' | 'dark' | null | undefined): ThemeColors => {
  return scheme === 'dark' ? darkColors : lightColors;
};
