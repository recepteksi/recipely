// 20 themes — each has light + dark variant color sets
// Theme IDs are string literal types for type safety

export type ThemeId =
  | 'midnight-slate'  // default dark
  | 'pearl-white'     // default light
  | 'crimson-ember'
  | 'amber-sunset'
  | 'golden-hour'
  | 'lime-zest'
  | 'emerald-garden'
  | 'teal-lagoon'
  | 'cyan-frost'
  | 'ocean-deep'
  | 'indigo-night'
  | 'violet-bloom'
  | 'royal-purple'
  | 'fuchsia-flash'
  | 'rose-quartz'
  | 'coral-reef'
  | 'mint-breeze'
  | 'tangerine-dream'
  | 'lavender-mist'
  | 'chartreuse-zap';

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

export type ThemeVariant = 'light' | 'dark';

interface ThemeDefinition {
  name: string;
  nameTr: string;
  description: string;
  // Which variant this theme is primarily designed for
  preferredVariant: ThemeVariant;
  light: ThemeColors;
  dark: ThemeColors;
}

const makeColors = (
  primary: string,
  primaryText: string,
  primaryLight: string,
  gradientStart: string,
  gradientEnd: string,
  background: string,
  surface: string,
  text: string,
  textMuted: string,
  secondary: string,
  secondaryText: string,
): ThemeColors => ({
  background,
  surface,
  text,
  textMuted,
  primary,
  primaryText,
  primaryLight,
  primaryGradientStart: gradientStart,
  primaryGradientEnd: gradientEnd,
  secondary,
  secondaryText,
  danger: '#d93025',
  success: '#34A853',
  successLight: primaryLight,
  warning: '#FBBC04',
  warningLight: primaryLight,
  border: textMuted + '40',
  chipBackground: primaryLight,
  chipText: primary,
  cardBackground: surface,
  cardBorder: textMuted + '20',
  inputBackground: surface,
  inputBorder: textMuted + '40',
  inputBorderFocused: primary,
  skeleton: textMuted + '30',
  skeletonHighlight: textMuted + '10',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.35)',
  starFilled: '#FFB800',
  starEmpty: textMuted,
  tabBarBackground: surface,
  tabBarBorder: textMuted + '30',
  tabBarActive: primary,
  tabBarInactive: textMuted,
  avatarBackground: primaryLight,
  sectionBackground: surface,
});

// Dark variants use '#0B0B0D' as base, light variants use white-ish
const DARK_BG = '#0B0B0D';
const DARK_SURFACE = '#16171A';
const DARK_TEXT = '#F1F5F9';
const DARK_TEXT_MUTED = '#64748B';
const LIGHT_BG = '#FFFFFF';
const LIGHT_SURFACE = '#F8FAFC';
const LIGHT_TEXT = '#0F172A';
const LIGHT_TEXT_MUTED = '#64748B';

const themes: Record<ThemeId, ThemeDefinition> = {
  'midnight-slate': {
    name: 'Midnight Slate',
    nameTr: 'Gece Mavisi',
    description: 'Sophisticated dark mode with cool slate tones',
    preferredVariant: 'dark',
    light: makeColors(
      '#475569', '#FFFFFF', '#E2E8F0', '#94A3B8', '#CBD5E1',
      LIGHT_BG, LIGHT_SURFACE, LIGHT_TEXT, LIGHT_TEXT_MUTED, '#94A3B8', '#FFFFFF',
    ),
    dark: makeColors(
      '#94A3B8', DARK_BG, '#1E293B', '#94A3B8', '#CBD5E1',
      DARK_BG, DARK_SURFACE, DARK_TEXT, DARK_TEXT_MUTED, '#CBD5E1', DARK_BG,
    ),
  },
  'pearl-white': {
    name: 'Pearl White',
    nameTr: 'İnci Beyazı',
    description: 'Clean, airy light mode with blue accents',
    preferredVariant: 'light',
    light: makeColors(
      '#3B82F6', '#FFFFFF', '#DBEAFE', '#3B82F6', '#60A5FA',
      LIGHT_BG, LIGHT_SURFACE, LIGHT_TEXT, LIGHT_TEXT_MUTED, '#60A5FA', '#FFFFFF',
    ),
    dark: makeColors(
      '#60A5FA', DARK_BG, '#1E3A5F', '#3B82F6', '#93C5FD',
      DARK_BG, DARK_SURFACE, DARK_TEXT, DARK_TEXT_MUTED, '#93C5FD', DARK_BG,
    ),
  },
  'crimson-ember': {
    name: 'Crimson Ember',
    nameTr: 'Kırmızı Kor',
    description: 'Bold, passionate red for energy and urgency',
    preferredVariant: 'light',
    light: makeColors(
      '#EF4444', '#FFFFFF', '#FEE2E2', '#DC2626', '#F87171',
      LIGHT_BG, '#FEF2F2', '#1F1F1F', '#6B7280', '#DC2626', '#FFFFFF',
    ),
    dark: makeColors(
      '#F87171', '#1F1F1F', '#450A0A', '#EF4444', '#FCA5A5',
      DARK_BG, '#1A0505', '#FEF2F2', '#6B7280', '#F87171', '#1F1F1F',
    ),
  },
  'amber-sunset': {
    name: 'Amber Sunset',
    nameTr: 'Amber Gün Batımı',
    description: 'Warm orange radiating energy and optimism',
    preferredVariant: 'light',
    light: makeColors(
      '#F97316', '#FFFFFF', '#FFEDD5', '#EA580C', '#FB923C',
      LIGHT_BG, '#FFF7ED', '#1C1917', '#6B7280', '#EA580C', '#FFFFFF',
    ),
    dark: makeColors(
      '#FB923C', '#1C1917', '#431407', '#F97316', '#FDBA74',
      DARK_BG, '#1A0D00', '#FFF7ED', '#6B7280', '#FB923C', '#1C1917',
    ),
  },
  'golden-hour': {
    name: 'Golden Hour',
    nameTr: 'Altın Saat',
    description: 'Rich golden yellow evoking sunshine and prosperity',
    preferredVariant: 'light',
    light: makeColors(
      '#EAB308', '#1C1917', '#FEF9C3', '#CA8A04', '#FDE047',
      LIGHT_BG, '#FEFCE8', '#1C1917', '#6B7280', '#CA8A04', '#1C1917',
    ),
    dark: makeColors(
      '#FDE047', '#1C1917', '#422006', '#EAB308', '#FEF08A',
      DARK_BG, '#1A1500', '#FEFCE8', '#6B7280', '#FDE047', '#1C1917',
    ),
  },
  'lime-zest': {
    name: 'Lime Zest',
    nameTr: 'Limon Yeşili',
    description: 'Fresh lime green bursting with vitality',
    preferredVariant: 'light',
    light: makeColors(
      '#84CC16', '#FFFFFF', '#ECFCCB', '#65A30D', '#A3E635',
      LIGHT_BG, '#F7FEE7', '#1A2E05', '#6B7280', '#65A30D', '#FFFFFF',
    ),
    dark: makeColors(
      '#A3E635', '#1A2E05', '#1A3B00', '#84CC16', '#BEF264',
      DARK_BG, '#0A1400', '#F7FEE7', '#6B7280', '#A3E635', '#1A2E05',
    ),
  },
  'emerald-garden': {
    name: 'Emerald Garden',
    nameTr: 'Zümrüt Bahçe',
    description: 'Deep emerald green suggesting growth and balance',
    preferredVariant: 'light',
    light: makeColors(
      '#10B981', '#FFFFFF', '#D1FAE5', '#059669', '#34D399',
      LIGHT_BG, '#ECFDF5', '#1A2E1A', '#6B7280', '#059669', '#FFFFFF',
    ),
    dark: makeColors(
      '#34D399', '#1A2E1A', '#022C22', '#10B981', '#6EE7B7',
      DARK_BG, '#001A12', '#ECFDF5', '#6B7280', '#34D399', '#1A2E1A',
    ),
  },
  'teal-lagoon': {
    name: 'Teal Lagoon',
    nameTr: 'Turkuaz Lagün',
    description: 'Cool teal with tropical vibes',
    preferredVariant: 'light',
    light: makeColors(
      '#14B8A6', '#FFFFFF', '#CCFBF1', '#0D9488', '#5EEAD4',
      LIGHT_BG, '#F0FDFA', '#134E4A', '#6B7280', '#0D9488', '#FFFFFF',
    ),
    dark: makeColors(
      '#5EEAD4', '#134E4A', '#042F2E', '#14B8A6', '#99F6E4',
      DARK_BG, '#001715', '#F0FDFA', '#6B7280', '#5EEAD4', '#134E4A',
    ),
  },
  'cyan-frost': {
    name: 'Cyan Frost',
    nameTr: 'Cyan Buğu',
    description: 'Icy cyan on dark surfaces for a futuristic feel',
    preferredVariant: 'dark',
    light: makeColors(
      '#06B6D4', '#FFFFFF', '#CFFAFE', '#0891B2', '#67E8F9',
      LIGHT_BG, '#ECFEFF', '#082F49', '#6B7280', '#0891B2', '#FFFFFF',
    ),
    dark: makeColors(
      '#67E8F9', '#082F49', '#083344', '#06B6D4', '#A5F3FC',
      DARK_BG, '#00121C', '#ECFEFF', '#6B7280', '#67E8F9', '#082F49',
    ),
  },
  'ocean-deep': {
    name: 'Ocean Deep',
    nameTr: 'Okyanus Mavisi',
    description: 'Classic sky blue with ocean depth',
    preferredVariant: 'light',
    light: makeColors(
      '#0EA5E9', '#FFFFFF', '#E0F2FE', '#0284C7', '#7DD3FC',
      LIGHT_BG, '#F0F9FF', '#0C4A6E', '#6B7280', '#0284C7', '#FFFFFF',
    ),
    dark: makeColors(
      '#7DD3FC', '#0C4A6E', '#0C4A6E', '#0EA5E9', '#BAE6FD',
      DARK_BG, '#001929', '#F0F9FF', '#6B7280', '#7DD3FC', '#0C4A6E',
    ),
  },
  'indigo-night': {
    name: 'Indigo Night',
    nameTr: 'Indigo Gecesi',
    description: 'Deep indigo on dark surfaces for a mysterious mood',
    preferredVariant: 'dark',
    light: makeColors(
      '#6366F1', '#FFFFFF', '#E0E7FF', '#4338CA', '#818CF8',
      LIGHT_BG, '#EEF2FF', '#1E1B4B', '#6B7280', '#4338CA', '#FFFFFF',
    ),
    dark: makeColors(
      '#818CF8', '#1E1B4B', '#1E1B4B', '#6366F1', '#A5B4FC',
      DARK_BG, '#0A0A1E', '#EEF2FF', '#6B7280', '#818CF8', '#1E1B4B',
    ),
  },
  'violet-bloom': {
    name: 'Violet Bloom',
    nameTr: 'Menekşe Çiçeği',
    description: 'Soft violet radiating creativity and intuition',
    preferredVariant: 'light',
    light: makeColors(
      '#8B5CF6', '#FFFFFF', '#EDE9FE', '#7C3AED', '#A78BFA',
      LIGHT_BG, '#F5F3FF', '#2E1065', '#6B7280', '#7C3AED', '#FFFFFF',
    ),
    dark: makeColors(
      '#A78BFA', '#2E1065', '#2E1065', '#8B5CF6', '#C4B5FD',
      DARK_BG, '#0D0A1E', '#F5F3FF', '#6B7280', '#A78BFA', '#2E1065',
    ),
  },
  'royal-purple': {
    name: 'Royal Purple',
    nameTr: 'Kraliyet Moru',
    description: 'Bold purple on dark surfaces for a regal mood',
    preferredVariant: 'dark',
    light: makeColors(
      '#A855F7', '#FFFFFF', '#F3E8FF', '#9333EA', '#C084FC',
      LIGHT_BG, '#FAF5FF', '#3B0764', '#6B7280', '#9333EA', '#FFFFFF',
    ),
    dark: makeColors(
      '#C084FC', '#3B0764', '#3B0764', '#A855F7', '#E9D5FF',
      DARK_BG, '#0D0619', '#FAF5FF', '#6B7280', '#C084FC', '#3B0764',
    ),
  },
  'fuchsia-flash': {
    name: 'Fuchsia Flash',
    nameTr: 'Fuchsia Parlak',
    description: 'Vibrant fuchsia with electric energy',
    preferredVariant: 'light',
    light: makeColors(
      '#D946EF', '#FFFFFF', '#FAE8FF', '#C026D3', '#F0ABFC',
      LIGHT_BG, '#FDF4FF', '#500724', '#6B7280', '#C026D3', '#FFFFFF',
    ),
    dark: makeColors(
      '#F0ABFC', '#500724', '#500724', '#D946EF', '#F5D0FE',
      DARK_BG, '#1A0010', '#FDF4FF', '#6B7280', '#F0ABFC', '#500724',
    ),
  },
  'rose-quartz': {
    name: 'Rose Quartz',
    nameTr: 'Pembe Kuvars',
    description: 'Soft rose with romantic warmth',
    preferredVariant: 'light',
    light: makeColors(
      '#F43F5E', '#FFFFFF', '#FFE4E6', '#E11D48', '#FB7185',
      LIGHT_BG, '#FFF1F2', '#4A051C', '#6B7280', '#E11D48', '#FFFFFF',
    ),
    dark: makeColors(
      '#FB7185', '#4A051C', '#4A051C', '#F43F5E', '#FECDD3',
      DARK_BG, '#1A0008', '#FFF1F2', '#6B7280', '#FB7185', '#4A051C',
    ),
  },
  'coral-reef': {
    name: 'Coral Reef',
    nameTr: 'Mercan Resifi',
    description: 'Coral pink on dark surfaces for a bold yet warm look',
    preferredVariant: 'dark',
    light: makeColors(
      '#FB7185', '#FFFFFF', '#FFE4E6', '#F43F5E', '#FDA4AF',
      LIGHT_BG, '#FFF5F5', '#4A051C', '#6B7280', '#F43F5E', '#FFFFFF',
    ),
    dark: makeColors(
      '#FDA4AF', '#4A051C', '#4A051C', '#FB7185', '#FED7D9',
      DARK_BG, '#1A0008', '#FFF5F5', '#6B7280', '#FDA4AF', '#4A051C',
    ),
  },
  'mint-breeze': {
    name: 'Mint Breeze',
    nameTr: 'Nane Serinliği',
    description: 'Cool mint green with a fresh spa-like feel',
    preferredVariant: 'light',
    light: makeColors(
      '#2DD4BF', '#FFFFFF', '#CCFBF1', '#14B8A6', '#5EEAD4',
      LIGHT_BG, '#F0FDFA', '#134E4A', '#6B7280', '#14B8A6', '#FFFFFF',
    ),
    dark: makeColors(
      '#5EEAD4', '#134E4A', '#042F2E', '#2DD4BF', '#99F6E4',
      DARK_BG, '#001715', '#F0FDFA', '#6B7280', '#5EEAD4', '#134E4A',
    ),
  },
  'tangerine-dream': {
    name: 'Tangerine Dream',
    nameTr: 'Turuncu Rüya',
    description: 'Bright tangerine on dark surfaces for a bold citrus pop',
    preferredVariant: 'dark',
    light: makeColors(
      '#FB923C', '#FFFFFF', '#FFEDD5', '#F97316', '#FDBA74',
      LIGHT_BG, '#FFF7ED', '#431407', '#6B7280', '#F97316', '#FFFFFF',
    ),
    dark: makeColors(
      '#FDBA74', '#431407', '#431407', '#FB923C', '#FED7AA',
      DARK_BG, '#1A0D00', '#FFF7ED', '#6B7280', '#FDBA74', '#431407',
    ),
  },
  'lavender-mist': {
    name: 'Lavender Mist',
    nameTr: 'Lavanta Sisliği',
    description: 'Soft lavender with a dreamy, ethereal quality',
    preferredVariant: 'light',
    light: makeColors(
      '#A78BFA', '#FFFFFF', '#EDE9FE', '#8B5CF6', '#C4B5FD',
      LIGHT_BG, '#F5F3FF', '#2E1065', '#6B7280', '#8B5CF6', '#FFFFFF',
    ),
    dark: makeColors(
      '#C4B5FD', '#2E1065', '#2E1065', '#A78BFA', '#DDD6FE',
      DARK_BG, '#0D0A1E', '#F5F3FF', '#6B7280', '#C4B5FD', '#2E1065',
    ),
  },
  'chartreuse-zap': {
    name: 'Chartreuse Zap',
    nameTr: 'Şartruz Parlak',
    description: 'Electric chartreuse on dark surfaces for a high-energy futuristic look',
    preferredVariant: 'dark',
    light: makeColors(
      '#84CC16', '#FFFFFF', '#ECFCCB', '#65A30D', '#A3E635',
      LIGHT_BG, '#F7FEE7', '#1A2E05', '#6B7280', '#65A30D', '#FFFFFF',
    ),
    dark: makeColors(
      '#D9F99D', '#1A2E05', '#1A3B00', '#84CC16', '#BEF264',
      DARK_BG, '#0A1400', '#F7FEE7', '#6B7280', '#D9F99D', '#1A2E05',
    ),
  },
};

export const ALL_THEMES: ThemeId[] = [
  'midnight-slate', 'pearl-white', 'crimson-ember', 'amber-sunset',
  'golden-hour', 'lime-zest', 'emerald-garden', 'teal-lagoon',
  'cyan-frost', 'ocean-deep', 'indigo-night', 'violet-bloom',
  'royal-purple', 'fuchsia-flash', 'rose-quartz', 'coral-reef',
  'mint-breeze', 'tangerine-dream', 'lavender-mist', 'chartreuse-zap',
];

export const getThemeDefinition = (id: ThemeId): ThemeDefinition => themes[id];

export const getThemeColors = (id: ThemeId, scheme: 'light' | 'dark'): ThemeColors =>
  scheme === 'dark' ? themes[id].dark : themes[id].light;

export const getPreferredVariant = (id: ThemeId): ThemeVariant =>
  themes[id].preferredVariant;