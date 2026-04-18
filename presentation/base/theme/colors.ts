export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  danger: string;
  border: string;
  chipBackground: string;
  chipText: string;
}

export const lightColors: ThemeColors = {
  background: '#ffffff',
  surface: '#f5f5f7',
  text: '#111111',
  textMuted: '#6b6b70',
  primary: '#1a73e8',
  primaryText: '#ffffff',
  danger: '#d93025',
  border: '#e0e0e4',
  chipBackground: '#e8f0fe',
  chipText: '#1a73e8',
};

export const darkColors: ThemeColors = {
  background: '#0b0b0d',
  surface: '#16171a',
  text: '#f2f2f4',
  textMuted: '#a0a0a6',
  primary: '#8ab4f8',
  primaryText: '#0b0b0d',
  danger: '#f28b82',
  border: '#2a2b31',
  chipBackground: '#1f2733',
  chipText: '#8ab4f8',
};

export const pickColors = (scheme: 'light' | 'dark' | null | undefined): ThemeColors => {
  return scheme === 'dark' ? darkColors : lightColors;
};
