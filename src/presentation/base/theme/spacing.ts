
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
  tiny: 10,
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
  // Tiny glyph inside a checkbox / badge (smaller than iconSm).
  iconXs: 14,
  // Sub-caption glyph (e.g. inline dot / micro-icon).
  iconNano: 12,
  // Decorative micro-glyph.
  iconPico: 10,
  // Oversized feature / illustration glyph.
  iconHuge: 40,
  iconMassive: 48,
  // Empty-state glyph.
  iconJumbo: 56,
  // Large empty-state / feedback glyph.
  iconGiant: 64,
  // Full-bleed illustration glyph (empty states, splash marks).
  iconIllustration: 140,
  iconXxs: 18,
  iconSm: 16,
  // Caption-row inline icons (cuisine globe, rating star) on recipe detail.
  iconCaption: 15,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
  iconBtn: 36,
  iconBtnSm: 32,
  // Small circular overlay button on a media tile (remove/close).
  mediaRemoveBtn: 22,
  floatingBtn: 40,
  avatarXs: 36,
  avatarSm: 40,
  avatarMd: 56,
  avatarLg: 80,
  // Profile avatar outer ring frame + its inner avatar.
  avatarFrame: 112,
  avatarInner: 106,
  // Edit-profile avatar frame + inner avatar (slightly smaller ring).
  editAvatarFrame: 110,
  editAvatarInner: 104,
  // Min width of the edit-profile "Save" button.
  saveBtnMinWidth: 72,
  // "Edit profile" action button height.
  editBtnHeight: 42,
  // Brand logo mark on the auth hero (landscape/large shells).
  heroLogo: 88,
  // Max width of the centered auth card (register/login split layout).
  authCardMaxWidth: 520,
  badgeSm: 28,
  // Circular severity disc behind the icon in the FeedbackDialog.
  feedbackDisc: 64,
  // Width cap of the centered FeedbackDialog card (phone-sized on tablets/web).
  dialogMaxWidth: 400,
  // Text line-height steps (ascending) for body / caption paragraphs.
  lineHeightXs: 18,
  lineHeightSm: 19,
  lineHeightMd: 20,
  lineHeightLg: 21,
  lineHeightXl: 22,
  notifBadge: 18,
  // Line height that keeps the unread count vertically centered inside the
  // 18px notifBadge circle (14px inner box after the 2px border).
  notifBadgeLineHeight: 12,
  chipHeight: 30,
  // Round icon chip in a share-channel tile.
  channelChip: 44,
  buttonHeight: 52,
  buttonSmHeight: 48,
  inputHeight: 52,
  cardImageHeight: 180,
  // Max height of the recipe-editor cover image.
  coverMaxHeight: 200,
  heroImageHeight: 280,
  heroImageHeightWeb: 440,
  heroSquare: 96,
  // Draft-card cover thumbnail (square).
  draftThumb: 72,
  // Circular success/error status disc on the reset-password views.
  statusCircle: 72,
  selectorHeight: 34,
  tabBarHeight: 56,
  settingsRowHeight: 52,
  // Recipe preview thumbnail in the share sheet.
  shareThumbnail: 52,
  searchBarHeight: 44,
  // Compact single-line form input (Help & Feedback form fields).
  inputHeightSm: 46,
  // Border width for Help & Feedback form inputs.
  inputBorderWidth: 1.5,
  // Thick accent border (spinner rings, selected tiles).
  borderThick: 3,
  // Centered text-block max widths (ascending).
  maxContentXs: 300,
  maxContentSm: 320,
  maxContentMd: 340,
  maxContentLg: 420,
  maxContentXl: 460,
  // Max height of a scrollable dropdown / option list popover.
  dropdownMaxHeight: 200,
  // Min height of the multiline message field in the Help & Feedback form.
  feedbackMessageMinHeight: 112,
  progressBarHeight: 6,
  // Thin indeterminate refine-progress bar.
  progressBarThin: 3,
  dotActiveWidth: 18,
  checkboxSize: 24,
  // Compact checkbox (terms-agreement consent box).
  checkboxSm: 22,
  reviewImageHeight: 160,
  textAreaMin: 60,
  promptInputMin: 110,
  gradientHeight: 260,
  cardOverlap: 40,
  heroPaddingTop: 76,
  // Mobile collapsing home header + Filter/Sort FAB (June 2026 redesign).
  homeHeaderMax: 132,
  homeHeaderMin: 0,
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
  // Icon inside the circular badge on auth hero headers (verify/reset/forgot).
  heroBadgeIcon: 26,
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
