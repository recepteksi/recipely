import { ValueConstants } from '@core/constants';

export const spacing = {
  xxs: 2,
  xs: 4,
  xs2: 6,
  sm: 8,
  sm2: 10,
  md: 12,
  lg: 16,
  lg2: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  xxl2: 28,
  xxxl: 32,
  round: 9999,
} as const;

export const fontSizes = {
  nano: 9,
  micro: 11,
  sectionLabel: 11.5,
  small: 12,
  medium: 14,
  caption: 13,
  captionLg: 13.5,
  label: 13,
  body: 15,
  heading: 16,
  subtitle: 18,
  subheading: 20,
  display: 22,
  title: 24,
  headline: 32,
  hero: 44,
  // Web recipe-detail h1 title (two-column SaaS layout).
  webDetailTitle: 40,
} as const;

export const sizes = {
  iconXxs: 18,
  iconSm: 16,
  // Caption-row inline icons (cuisine globe, rating star) on recipe detail.
  iconCaption: 15,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
  iconBtn: 36,
  iconBtnSm: 32,
  floatingBtn: 40,
  avatarSm: 40,
  avatarMd: 56,
  avatarLg: 80,
  badgeSm: 28,
  // Circular severity disc behind the icon in the FeedbackDialog.
  feedbackDisc: 64,
  // Width cap of the centered FeedbackDialog card (phone-sized on tablets/web).
  dialogMaxWidth: 400,
  notifBadge: 18,
  // Line height that keeps the unread count vertically centered inside the
  // 18px notifBadge circle (14px inner box after the 2px border).
  notifBadgeLineHeight: 12,
  chipHeight: 30,
  buttonHeight: 52,
  buttonSmHeight: 48,
  inputHeight: 52,
  cardImageHeight: 180,
  heroImageHeight: 280,
  heroImageHeightWeb: 440,
  heroSquare: 96,
  selectorHeight: 34,
  tabBarHeight: 56,
  settingsRowHeight: 52,
  searchBarHeight: 44,
  // Compact single-line form input (Help & Feedback form fields).
  inputHeightSm: 46,
  // Border width for Help & Feedback form inputs.
  inputBorderWidth: 1.5,
  // Min height of the multiline message field in the Help & Feedback form.
  feedbackMessageMinHeight: 112,
  progressBarHeight: 6,
  dotActiveWidth: 18,
  checkboxSize: 24,
  reviewImageHeight: 160,
  textAreaMin: 60,
  promptInputMin: 110,
  gradientHeight: 260,
  cardOverlap: 40,
  heroPaddingTop: 76,
  // Mobile collapsing home header + Filter/Sort FAB (June 2026 redesign).
  homeHeaderMax: 132,
  homeHeaderMin: ValueConstants.zero,
  homeTitleShrink: 96,
  // Android pull-to-refresh spinner offset for the home feed. Android's
  // SwipeRefreshLayout rests the circle at `offset + 64dp(target) - diameter`,
  // so passing homeHeaderMax directly parks it ~60dp below the band, floating
  // over the AI banner; this value tucks its resting spot just under the band.
  homeRefreshOffsetAndroid: 92,
  fab: 56,
  fabExtendedHeight: 48,
  // Web home (WebRecipesPage) redesign (Jun 2026).
  heroActionBtn: 50,
  heroMiniMinHeight: 205,
  rankBadge: 26,
  aiBannerIcon: 52,
  sparkleDecor: 80,
  cuisineTileMin: 110,
  cuisineTileMinSm: 90,
  webSortBtn: 42,
  // Min width of the web sort dropdown popover (anchored to its trigger).
  webSortMenuMinWidth: 200,
  webEmptyIcon: 56,
  webContentMax: 1200,
  // Web filter modal (centered dialog) — Jun 2026.
  webModalMaxWidth: 720,
  webModalCloseBtn: 38,
  // Web recipe-detail two-column layout (Jul 2026).
  // Below this viewport width the two columns collapse to a single column.
  webDetailTwoColMin: 1024,
  // Gap between the main content column and the sticky sidebar.
  webDetailColGap: 36,
  // Vertical gap between stacked sidebar cards.
  webDetailStackGap: 18,
  // Offset of the sticky sidebar from the top of the scroll container.
  webDetailStickyTop: 88,
  // Thumbnail strip cells under the hero image.
  webDetailThumbWidth: 88,
  webDetailThumbHeight: 64,
  // Author avatar in the header stats row.
  webDetailAuthorAvatar: 32,
} as const;
