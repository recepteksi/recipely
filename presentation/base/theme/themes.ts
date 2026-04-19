export type ThemeId =
  | 'midnight-slate'
  | 'pearl-white'
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
  /**
   * Text/icon color for content sitting on `colors.overlay` (semi-transparent dark
   * backdrop on hero images, recipe-card chips). ALWAYS white in both variants —
   * overlays are darken-by-design regardless of theme variant.
   */
  onOverlay: string;
  /**
   * Text/icon color for content sitting on `colors.success` (checkmarks in checkbox/
   * task widgets, success-state badge fill). ALWAYS dark in both variants — `success`
   * is always a green tinted toward 0.4-0.5 luminance and requires dark text.
   */
  onSuccess: string;
}

export type ThemeVariant = 'light' | 'dark';

interface ThemeDefinition {
  name: string;
  nameTr: string;
  description: string;
  preferredVariant: ThemeVariant;
  light: ThemeColors;
  dark: ThemeColors;
}

interface VariantSemantics {
  danger: string;
  success: string;
  warning: string;
  starFilled: string;
  overlay: string;
  shadow: string;
  onOverlay: string;
  onSuccess: string;
}

interface Palette {
  primary: string;
  primaryText: string;
  primaryLight: string;
  gradientStart: string;
  gradientEnd: string;
  background: string;
  text: string;
  textMuted: string;
  secondary: string;
  secondaryText: string;
}

const HEX6 = /^#[0-9a-fA-F]{6}$/;

const parseRgb = (hex: string): [number, number, number] => {
  if (!HEX6.test(hex)) {
    throw new Error(`themes.ts mixHex requires #RRGGBB, got: ${hex}`);
  }
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
};

const toHex2 = (n: number): string => {
  const clamped = Math.max(0, Math.min(255, Math.round(n)));
  return clamped.toString(16).padStart(2, '0');
};

const mixHex = (a: string, b: string, t: number): string => {
  const [ar, ag, ab] = parseRgb(a);
  const [br, bg, bb] = parseRgb(b);
  return `#${toHex2(ar + (br - ar) * t)}${toHex2(ag + (bg - ag) * t)}${toHex2(ab + (bb - ab) * t)}`;
};

const DARK_NEUTRAL_BG = '#0B0B0D';
const DARK_SURFACE_TARGET = '#52535A';
const DARK_TEXT = '#F1F5F9';
const DARK_TEXT_MUTED = '#64748B';
const LIGHT_TEXT = '#0F172A';
const LIGHT_TEXT_MUTED = '#64748B';

const darkSemantics: VariantSemantics = {
  danger: '#F28B82',
  success: '#81C995',
  warning: '#FDD663',
  starFilled: '#FFD54F',
  overlay: 'rgba(0,0,0,0.6)',
  shadow: '#000000',
  onOverlay: '#FFFFFF',
  onSuccess: '#0F1B0F',
};

const lightSemantics: VariantSemantics = {
  danger: '#D93025',
  success: '#34A853',
  warning: '#FBBC04',
  starFilled: '#FFB800',
  overlay: 'rgba(0,0,0,0.55)',
  shadow: '#0F172A',
  onOverlay: '#FFFFFF',
  onSuccess: '#0F1B0F',
};

const makeColors = (palette: Palette, semantics: VariantSemantics, surface: string): ThemeColors => ({
  background: palette.background,
  surface,
  text: palette.text,
  textMuted: palette.textMuted,
  primary: palette.primary,
  primaryText: palette.primaryText,
  primaryLight: palette.primaryLight,
  primaryGradientStart: palette.gradientStart,
  primaryGradientEnd: palette.gradientEnd,
  secondary: palette.secondary,
  secondaryText: palette.secondaryText,
  danger: semantics.danger,
  success: semantics.success,
  successLight: palette.primaryLight,
  warning: semantics.warning,
  warningLight: palette.primaryLight,
  border: palette.textMuted + '40',
  chipBackground: palette.primaryLight,
  chipText: palette.primary,
  cardBackground: surface,
  cardBorder: palette.textMuted + '20',
  inputBackground: surface,
  inputBorder: palette.textMuted + '40',
  inputBorderFocused: palette.primary,
  skeleton: palette.textMuted + '30',
  skeletonHighlight: palette.textMuted + '10',
  shadow: semantics.shadow,
  overlay: semantics.overlay,
  starFilled: semantics.starFilled,
  starEmpty: palette.textMuted,
  tabBarBackground: surface,
  tabBarBorder: palette.textMuted + '30',
  tabBarActive: palette.primary,
  tabBarInactive: palette.textMuted,
  avatarBackground: palette.primaryLight,
  sectionBackground: surface,
  onOverlay: semantics.onOverlay,
  onSuccess: semantics.onSuccess,
});

interface DarkArgs {
  primary: string;
  primaryText: string;
  primaryLight: string;
  gradientStart: string;
  gradientEnd: string;
  background: string;
  secondary: string;
  secondaryText: string;
  text?: string;
  textMuted?: string;
}

const makeDark = (a: DarkArgs): ThemeColors => {
  const palette: Palette = {
    primary: a.primary,
    primaryText: a.primaryText,
    primaryLight: a.primaryLight,
    gradientStart: a.gradientStart,
    gradientEnd: a.gradientEnd,
    background: a.background,
    text: a.text ?? DARK_TEXT,
    textMuted: a.textMuted ?? DARK_TEXT_MUTED,
    secondary: a.secondary,
    secondaryText: a.secondaryText,
  };
  const surface = mixHex(a.background, DARK_SURFACE_TARGET, 0.5);
  return makeColors(palette, darkSemantics, surface);
};

interface LightArgs {
  primary: string;
  primaryText: string;
  primaryLight: string;
  gradientStart: string;
  gradientEnd: string;
  background: string;
  secondary: string;
  secondaryText: string;
  text?: string;
  textMuted?: string;
}

const makeLight = (a: LightArgs): ThemeColors => {
  const palette: Palette = {
    primary: a.primary,
    primaryText: a.primaryText,
    primaryLight: a.primaryLight,
    gradientStart: a.gradientStart,
    gradientEnd: a.gradientEnd,
    background: a.background,
    text: a.text ?? LIGHT_TEXT,
    textMuted: a.textMuted ?? LIGHT_TEXT_MUTED,
    secondary: a.secondary,
    secondaryText: a.secondaryText,
  };
  const surface = mixHex(a.background, '#FFFFFF', 0.55);
  return makeColors(palette, lightSemantics, surface);
};

const themes: Record<ThemeId, ThemeDefinition> = {
  'midnight-slate': {
    name: 'Midnight Slate',
    nameTr: 'Gece Mavisi',
    description: 'Sophisticated dark mode with cool slate tones',
    preferredVariant: 'dark',
    light: makeLight({
      primary: '#475569', primaryText: '#FFFFFF', primaryLight: '#E2E8F0',
      gradientStart: '#94A3B8', gradientEnd: '#CBD5E1',
      background: '#F2F4F7', secondary: '#94A3B8', secondaryText: '#0F172A',
    }),
    dark: makeDark({
      primary: '#94A3B8', primaryText: DARK_NEUTRAL_BG, primaryLight: '#1E293B',
      gradientStart: '#94A3B8', gradientEnd: '#CBD5E1',
      background: '#0B0F1A', secondary: '#CBD5E1', secondaryText: DARK_NEUTRAL_BG,
    }),
  },
  'pearl-white': {
    name: 'Pearl White',
    nameTr: 'İnci Beyazı',
    description: 'Clean, airy light mode with blue accents',
    preferredVariant: 'light',
    light: makeLight({
      primary: '#1D4ED8', primaryText: '#FFFFFF', primaryLight: '#DBEAFE',
      gradientStart: '#3B82F6', gradientEnd: '#60A5FA',
      background: '#E8EFFB', secondary: '#60A5FA', secondaryText: '#0F172A',
    }),
    dark: makeDark({
      primary: '#60A5FA', primaryText: DARK_NEUTRAL_BG, primaryLight: '#1E3A5F',
      gradientStart: '#3B82F6', gradientEnd: '#93C5FD',
      background: '#0A1A33', secondary: '#93C5FD', secondaryText: DARK_NEUTRAL_BG,
    }),
  },
  'crimson-ember': {
    name: 'Crimson Ember',
    nameTr: 'Kırmızı Kor',
    description: 'Bold, passionate red for energy and urgency',
    preferredVariant: 'light',
    light: makeLight({
      primary: '#B91C1C', primaryText: '#FFFFFF', primaryLight: '#FEE2E2',
      gradientStart: '#DC2626', gradientEnd: '#F87171',
      background: '#FBE7E7', secondary: '#DC2626', secondaryText: '#FFFFFF',
      text: '#1F1F1F', textMuted: '#6B7280',
    }),
    dark: makeDark({
      primary: '#F87171', primaryText: '#1F1F1F', primaryLight: '#450A0A',
      gradientStart: '#EF4444', gradientEnd: '#FCA5A5',
      background: '#1A0309', secondary: '#F87171', secondaryText: '#1F1F1F',
      text: '#FEF2F2', textMuted: '#A78B8B',
    }),
  },
  'amber-sunset': {
    name: 'Amber Sunset',
    nameTr: 'Amber Gün Batımı',
    description: 'Warm orange radiating energy and optimism',
    preferredVariant: 'light',
    light: makeLight({
      primary: '#4E2407', primaryText: '#FFFFFF', primaryLight: '#FFEDD5',
      gradientStart: '#EA580C', gradientEnd: '#FB923C',
      background: '#FFEFD9', secondary: '#9A3412', secondaryText: '#FFFFFF',
      text: '#1C1917', textMuted: '#6B7280',
    }),
    dark: makeDark({
      primary: '#FB923C', primaryText: '#1C1917', primaryLight: '#431407',
      gradientStart: '#F97316', gradientEnd: '#FDBA74',
      background: '#190A00', secondary: '#FB923C', secondaryText: '#1C1917',
      text: '#FFF7ED', textMuted: '#A89080',
    }),
  },
  'golden-hour': {
    name: 'Golden Hour',
    nameTr: 'Altın Saat',
    description: 'Rich golden yellow evoking sunshine and prosperity',
    preferredVariant: 'light',
    light: makeLight({
      primary: '#4A3803', primaryText: '#FFFFFF', primaryLight: '#FEF9C3',
      gradientStart: '#CA8A04', gradientEnd: '#FDE047',
      background: '#FCF3BF', secondary: '#854D0E', secondaryText: '#FFFFFF',
      text: '#1C1917', textMuted: '#6B7280',
    }),
    dark: makeDark({
      primary: '#FDE047', primaryText: '#1C1917', primaryLight: '#422006',
      gradientStart: '#EAB308', gradientEnd: '#FEF08A',
      background: '#1A1300', secondary: '#FDE047', secondaryText: '#1C1917',
      text: '#FEFCE8', textMuted: '#A89C70',
    }),
  },
  'lime-zest': {
    name: 'Lime Zest',
    nameTr: 'Limon Yeşili',
    description: 'Fresh lime green bursting with vitality',
    preferredVariant: 'light',
    light: makeLight({
      primary: '#2A4007', primaryText: '#FFFFFF', primaryLight: '#ECFCCB',
      gradientStart: '#65A30D', gradientEnd: '#A3E635',
      background: '#EAF7C8', secondary: '#3F6212', secondaryText: '#FFFFFF',
      text: '#1A2E05', textMuted: '#6B7280',
    }),
    dark: makeDark({
      primary: '#A3E635', primaryText: '#1A2E05', primaryLight: '#1A3B00',
      gradientStart: '#84CC16', gradientEnd: '#BEF264',
      background: '#0A1700', secondary: '#A3E635', secondaryText: '#1A2E05',
      text: '#F7FEE7', textMuted: '#88A070',
    }),
  },
  'emerald-garden': {
    name: 'Emerald Garden',
    nameTr: 'Zümrüt Bahçe',
    description: 'Deep emerald green suggesting growth and balance',
    preferredVariant: 'light',
    light: makeLight({
      primary: '#053A29', primaryText: '#FFFFFF', primaryLight: '#D1FAE5',
      gradientStart: '#059669', gradientEnd: '#34D399',
      background: '#D6F2E2', secondary: '#047857', secondaryText: '#FFFFFF',
      text: '#1A2E1A', textMuted: '#6B7280',
    }),
    dark: makeDark({
      primary: '#34D399', primaryText: '#1A2E1A', primaryLight: '#022C22',
      gradientStart: '#10B981', gradientEnd: '#6EE7B7',
      background: '#04382B', secondary: '#34D399', secondaryText: '#1A2E1A',
      text: '#ECFDF5', textMuted: '#70A090',
    }),
  },
  'teal-lagoon': {
    name: 'Teal Lagoon',
    nameTr: 'Turkuaz Lagün',
    description: 'Cool teal with tropical vibes',
    preferredVariant: 'light',
    light: makeLight({
      primary: '#063A34', primaryText: '#FFFFFF', primaryLight: '#CCFBF1',
      gradientStart: '#0D9488', gradientEnd: '#5EEAD4',
      background: '#D2F1EC', secondary: '#0F766E', secondaryText: '#FFFFFF',
      text: '#134E4A', textMuted: '#6B7280',
    }),
    dark: makeDark({
      primary: '#5EEAD4', primaryText: '#134E4A', primaryLight: '#042F2E',
      gradientStart: '#14B8A6', gradientEnd: '#99F6E4',
      background: '#021A1D', secondary: '#5EEAD4', secondaryText: '#134E4A',
      text: '#F0FDFA', textMuted: '#70A09A',
    }),
  },
  'cyan-frost': {
    name: 'Cyan Frost',
    nameTr: 'Cyan Buğu',
    description: 'Icy cyan on dark surfaces for a futuristic feel',
    preferredVariant: 'dark',
    light: makeLight({
      primary: '#023943', primaryText: '#FFFFFF', primaryLight: '#CFFAFE',
      gradientStart: '#0891B2', gradientEnd: '#67E8F9',
      background: '#D5F1F8', secondary: '#0E7490', secondaryText: '#FFFFFF',
      text: '#082F49', textMuted: '#6B7280',
    }),
    dark: makeDark({
      primary: '#67E8F9', primaryText: '#082F49', primaryLight: '#083344',
      gradientStart: '#06B6D4', gradientEnd: '#A5F3FC',
      background: '#03334A', secondary: '#67E8F9', secondaryText: '#082F49',
      text: '#ECFEFF', textMuted: '#7090A0',
    }),
  },
  'ocean-deep': {
    name: 'Ocean Deep',
    nameTr: 'Okyanus Mavisi',
    description: 'Classic sky blue with ocean depth',
    preferredVariant: 'light',
    light: makeLight({
      primary: '#043449', primaryText: '#FFFFFF', primaryLight: '#E0F2FE',
      gradientStart: '#0284C7', gradientEnd: '#7DD3FC',
      background: '#D9ECFC', secondary: '#0369A1', secondaryText: '#FFFFFF',
      text: '#0C4A6E', textMuted: '#6B7280',
    }),
    dark: makeDark({
      primary: '#7DD3FC', primaryText: '#0C4A6E', primaryLight: '#0C4A6E',
      gradientStart: '#0EA5E9', gradientEnd: '#BAE6FD',
      background: '#021024', secondary: '#7DD3FC', secondaryText: '#0C4A6E',
      text: '#F0F9FF', textMuted: '#7090A8',
    }),
  },
  'indigo-night': {
    name: 'Indigo Night',
    nameTr: 'Indigo Gecesi',
    description: 'Deep indigo on dark surfaces for a mysterious mood',
    preferredVariant: 'dark',
    light: makeLight({
      primary: '#4338CA', primaryText: '#FFFFFF', primaryLight: '#E0E7FF',
      gradientStart: '#4338CA', gradientEnd: '#818CF8',
      background: '#DCDFFB', secondary: '#4338CA', secondaryText: '#FFFFFF',
      text: '#1E1B4B', textMuted: '#6B7280',
    }),
    dark: makeDark({
      primary: '#818CF8', primaryText: '#1E1B4B', primaryLight: '#1E1B4B',
      gradientStart: '#6366F1', gradientEnd: '#A5B4FC',
      background: '#0B0824', secondary: '#818CF8', secondaryText: '#1E1B4B',
      text: '#EEF2FF', textMuted: '#7878A0',
    }),
  },
  'violet-bloom': {
    name: 'Violet Bloom',
    nameTr: 'Menekşe Çiçeği',
    description: 'Soft violet radiating creativity and intuition',
    preferredVariant: 'light',
    light: makeLight({
      primary: '#6D28D9', primaryText: '#FFFFFF', primaryLight: '#EDE9FE',
      gradientStart: '#7C3AED', gradientEnd: '#A78BFA',
      background: '#E8DEFB', secondary: '#7C3AED', secondaryText: '#FFFFFF',
      text: '#2E1065', textMuted: '#6B7280',
    }),
    dark: makeDark({
      primary: '#A78BFA', primaryText: '#2E1065', primaryLight: '#2E1065',
      gradientStart: '#8B5CF6', gradientEnd: '#C4B5FD',
      background: '#1B0838', secondary: '#A78BFA', secondaryText: '#2E1065',
      text: '#F5F3FF', textMuted: '#8878A0',
    }),
  },
  'royal-purple': {
    name: 'Royal Purple',
    nameTr: 'Kraliyet Moru',
    description: 'Bold purple on dark surfaces for a regal mood',
    preferredVariant: 'dark',
    light: makeLight({
      primary: '#7E22CE', primaryText: '#FFFFFF', primaryLight: '#F3E8FF',
      gradientStart: '#9333EA', gradientEnd: '#C084FC',
      background: '#EDDDFB', secondary: '#9333EA', secondaryText: '#FFFFFF',
      text: '#3B0764', textMuted: '#6B7280',
    }),
    dark: makeDark({
      primary: '#C084FC', primaryText: '#3B0764', primaryLight: '#3B0764',
      gradientStart: '#A855F7', gradientEnd: '#E9D5FF',
      background: '#2A075F', secondary: '#C084FC', secondaryText: '#3B0764',
      text: '#FAF5FF', textMuted: '#9878A8',
    }),
  },
  'fuchsia-flash': {
    name: 'Fuchsia Flash',
    nameTr: 'Fuchsia Parlak',
    description: 'Vibrant fuchsia with electric energy',
    preferredVariant: 'light',
    light: makeLight({
      primary: '#A21CAF', primaryText: '#FFFFFF', primaryLight: '#FAE8FF',
      gradientStart: '#C026D3', gradientEnd: '#F0ABFC',
      background: '#F8DDF7', secondary: '#C026D3', secondaryText: '#FFFFFF',
      text: '#500724', textMuted: '#6B7280',
    }),
    dark: makeDark({
      primary: '#F0ABFC', primaryText: '#500724', primaryLight: '#500724',
      gradientStart: '#D946EF', gradientEnd: '#F5D0FE',
      background: '#4A0640', secondary: '#F0ABFC', secondaryText: '#500724',
      text: '#FDF4FF', textMuted: '#A07088',
    }),
  },
  'rose-quartz': {
    name: 'Rose Quartz',
    nameTr: 'Pembe Kuvars',
    description: 'Soft rose with romantic warmth',
    preferredVariant: 'light',
    light: makeLight({
      primary: '#BE123C', primaryText: '#FFFFFF', primaryLight: '#FFE4E6',
      gradientStart: '#E11D48', gradientEnd: '#FB7185',
      background: '#FCDDE3', secondary: '#E11D48', secondaryText: '#FFFFFF',
      text: '#4A051C', textMuted: '#6B7280',
    }),
    dark: makeDark({
      primary: '#FB7185', primaryText: '#4A051C', primaryLight: '#4A051C',
      gradientStart: '#F43F5E', gradientEnd: '#FECDD3',
      background: '#380620', secondary: '#FB7185', secondaryText: '#4A051C',
      text: '#FFF1F2', textMuted: '#A07880',
    }),
  },
  'coral-reef': {
    name: 'Coral Reef',
    nameTr: 'Mercan Resifi',
    description: 'Coral pink on dark surfaces for a bold yet warm look',
    preferredVariant: 'dark',
    light: makeLight({
      primary: '#4F242A', primaryText: '#FFFFFF', primaryLight: '#FFE4E6',
      gradientStart: '#F43F5E', gradientEnd: '#FDA4AF',
      background: '#FFE0D8', secondary: '#BE123C', secondaryText: '#FFFFFF',
      text: '#4A051C', textMuted: '#6B7280',
    }),
    dark: makeDark({
      primary: '#FDA4AF', primaryText: '#4A051C', primaryLight: '#4A051C',
      gradientStart: '#FB7185', gradientEnd: '#FED7D9',
      background: '#2C0A14', secondary: '#FDA4AF', secondaryText: '#4A051C',
      text: '#FFF5F5', textMuted: '#A07880',
    }),
  },
  'mint-breeze': {
    name: 'Mint Breeze',
    nameTr: 'Nane Serinliği',
    description: 'Cool mint green with a fresh spa-like feel',
    preferredVariant: 'light',
    light: makeLight({
      primary: '#0E433C', primaryText: '#FFFFFF', primaryLight: '#CCFBF1',
      gradientStart: '#14B8A6', gradientEnd: '#5EEAD4',
      background: '#DAF3EC', secondary: '#0F766E', secondaryText: '#FFFFFF',
      text: '#134E4A', textMuted: '#6B7280',
    }),
    dark: makeDark({
      primary: '#5EEAD4', primaryText: '#134E4A', primaryLight: '#042F2E',
      gradientStart: '#2DD4BF', gradientEnd: '#99F6E4',
      background: '#072B26', secondary: '#5EEAD4', secondaryText: '#134E4A',
      text: '#F0FDFA', textMuted: '#70A09A',
    }),
  },
  'tangerine-dream': {
    name: 'Tangerine Dream',
    nameTr: 'Turuncu Rüya',
    description: 'Bright tangerine on dark surfaces for a bold citrus pop',
    preferredVariant: 'dark',
    light: makeLight({
      primary: '#4F2E13', primaryText: '#FFFFFF', primaryLight: '#FFEDD5',
      gradientStart: '#F97316', gradientEnd: '#FDBA74',
      background: '#FFE0C2', secondary: '#C2410C', secondaryText: '#FFFFFF',
      text: '#431407', textMuted: '#6B7280',
    }),
    dark: makeDark({
      primary: '#FDBA74', primaryText: '#431407', primaryLight: '#431407',
      gradientStart: '#FB923C', gradientEnd: '#FED7AA',
      background: '#2A1208', secondary: '#FDBA74', secondaryText: '#431407',
      text: '#FFF7ED', textMuted: '#A89080',
    }),
  },
  'lavender-mist': {
    name: 'Lavender Mist',
    nameTr: 'Lavanta Sisliği',
    description: 'Soft lavender with a dreamy, ethereal quality',
    preferredVariant: 'light',
    light: makeLight({
      primary: '#352C4F', primaryText: '#FFFFFF', primaryLight: '#EDE9FE',
      gradientStart: '#8B5CF6', gradientEnd: '#C4B5FD',
      background: '#EBE2FB', secondary: '#7C3AED', secondaryText: '#FFFFFF',
      text: '#2E1065', textMuted: '#6B7280',
    }),
    dark: makeDark({
      primary: '#C4B5FD', primaryText: '#2E1065', primaryLight: '#2E1065',
      gradientStart: '#A78BFA', gradientEnd: '#DDD6FE',
      background: '#1F1733', secondary: '#C4B5FD', secondaryText: '#2E1065',
      text: '#F5F3FF', textMuted: '#8878A0',
    }),
  },
  'chartreuse-zap': {
    name: 'Chartreuse Zap',
    nameTr: 'Şartruz Parlak',
    description: 'Electric chartreuse on dark surfaces for a high-energy futuristic look',
    preferredVariant: 'dark',
    light: makeLight({
      primary: '#2A4007', primaryText: '#FFFFFF', primaryLight: '#ECFCCB',
      gradientStart: '#65A30D', gradientEnd: '#A3E635',
      background: '#E0F5B5', secondary: '#3F6212', secondaryText: '#FFFFFF',
      text: '#1A2E05', textMuted: '#6B7280',
    }),
    dark: makeDark({
      primary: '#D9F99D', primaryText: '#1A2E05', primaryLight: '#1A3B00',
      gradientStart: '#84CC16', gradientEnd: '#BEF264',
      background: '#234500', secondary: '#D9F99D', secondaryText: '#1A2E05',
      text: '#F7FEE7', textMuted: '#88A070',
    }),
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
