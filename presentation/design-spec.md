# Recipely Design Specification

> This document is the authoritative design reference for the Recipely mobile app visual upgrade.
> Every section contains exact values (hex colors, pixel sizes, prop interfaces) so that
> developer agents can implement without ambiguity.

---

## A. Design System Updates

### A.1 Color Palette

Keep the existing `ThemeColors` interface and extend it with new tokens.
File: `presentation/base/theme/colors.ts`

```ts
export interface ThemeColors {
  // --- existing (keep as-is) ---
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

  // --- NEW tokens ---
  primaryLight: string;        // tinted background for primary-flavored surfaces
  primaryGradientStart: string;
  primaryGradientEnd: string;
  secondary: string;           // warm accent for badges, stars
  secondaryText: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  cardBackground: string;
  cardBorder: string;
  inputBackground: string;
  inputBorder: string;
  inputBorderFocused: string;
  skeleton: string;            // shimmer base color
  skeletonHighlight: string;   // shimmer highlight
  shadow: string;              // for shadow color (with opacity in style)
  overlay: string;             // semi-transparent overlay on hero images
  starFilled: string;
  starEmpty: string;
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
  avatarBackground: string;
  sectionBackground: string;   // for grouped settings rows
}
```

#### Light palette values

| Token                  | Hex         |
|------------------------|-------------|
| primaryLight           | `#E8F0FE`   |
| primaryGradientStart   | `#1A73E8`   |
| primaryGradientEnd     | `#6C63FF`   |
| secondary              | `#FF6B35`   |
| secondaryText          | `#FFFFFF`   |
| success                | `#34A853`   |
| successLight           | `#E6F4EA`   |
| warning                | `#FBBC04`   |
| warningLight           | `#FEF7E0`   |
| cardBackground         | `#FFFFFF`   |
| cardBorder             | `#F0F0F3`   |
| inputBackground        | `#F5F5F7`   |
| inputBorder            | `#E0E0E4`   |
| inputBorderFocused     | `#1A73E8`   |
| skeleton               | `#E8E8ED`   |
| skeletonHighlight      | `#F5F5F7`   |
| shadow                 | `#000000`   |
| overlay                | `rgba(0,0,0,0.35)` |
| starFilled             | `#FFB800`   |
| starEmpty              | `#D4D4D8`   |
| tabBarBackground       | `#FFFFFF`   |
| tabBarBorder           | `#F0F0F3`   |
| tabBarActive           | `#1A73E8`   |
| tabBarInactive         | `#9E9EA6`   |
| avatarBackground       | `#E8F0FE`   |
| sectionBackground      | `#F5F5F7`   |

#### Dark palette values

| Token                  | Hex         |
|------------------------|-------------|
| primaryLight           | `#1F2733`   |
| primaryGradientStart   | `#8AB4F8`   |
| primaryGradientEnd     | `#A78BFA`   |
| secondary              | `#FF8A5C`   |
| secondaryText          | `#0B0B0D`   |
| success                | `#81C995`   |
| successLight           | `#1B3326`   |
| warning                | `#FDD663`   |
| warningLight           | `#332D1A`   |
| cardBackground         | `#1C1D21`   |
| cardBorder             | `#2A2B31`   |
| inputBackground        | `#1C1D21`   |
| inputBorder            | `#2A2B31`   |
| inputBorderFocused     | `#8AB4F8`   |
| skeleton               | `#2A2B31`   |
| skeletonHighlight      | `#3A3B41`   |
| shadow                 | `#000000`   |
| overlay                | `rgba(0,0,0,0.55)` |
| starFilled             | `#FFD54F`   |
| starEmpty              | `#3A3B41`   |
| tabBarBackground       | `#0B0B0D`   |
| tabBarBorder           | `#1C1D21`   |
| tabBarActive           | `#8AB4F8`   |
| tabBarInactive         | `#6B6B70`   |
| avatarBackground       | `#1F2733`   |
| sectionBackground      | `#16171A`   |

### A.2 Typography Scale

Update `ThemedText` variants. Add new variants `headline` and `label`.

File: `presentation/base/widgets/themed-text.tsx`

```ts
export type ThemedTextVariant =
  | 'headline'   // NEW - large hero text
  | 'title'
  | 'subtitle'
  | 'body'
  | 'label'      // NEW - form labels, section headers
  | 'caption';

// Updated style values:
const styles = StyleSheet.create<Record<ThemedTextVariant, TextStyle>>({
  headline: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
});
```

### A.3 Spacing & Sizing Tokens

Add new tokens to `presentation/base/theme/spacing.ts`:

```ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,   // NEW - hero section padding
} as const;

export const radii = {
  xs: 4,      // NEW - small chips
  sm: 6,
  md: 8,
  lg: 12,     // CHANGED from 10 to 12
  xl: 16,
  xxl: 24,    // NEW - card corners
  round: 9999,
} as const;

export const fontSizes = {
  caption: 13,     // CHANGED from 12 to 13 for better readability
  label: 13,       // NEW
  body: 15,        // CHANGED from 16 to 15
  subtitle: 18,
  title: 24,       // CHANGED from 28
  headline: 32,    // NEW
} as const;

// NEW - Standard sizing for common elements
export const sizes = {
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
  avatarSm: 40,
  avatarMd: 56,
  avatarLg: 80,
  buttonHeight: 52,
  inputHeight: 52,
  cardImageHeight: 180,
  heroImageHeight: 280,
  tabBarHeight: 56,
  settingsRowHeight: 52,
  searchBarHeight: 44,
  progressBarHeight: 6,
  checkboxSize: 24,
} as const;
```

### A.4 Card Styles

Create a new file: `presentation/base/theme/shadows.ts`

```ts
import { Platform, type ViewStyle } from 'react-native';

export const shadows = {
  sm: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
  }) ?? {},

  md: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
    android: {
      elevation: 4,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
  }) ?? {},

  lg: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
    },
    android: {
      elevation: 8,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
    },
  }) ?? {},
} as const;
```

Export from `presentation/base/theme/index.ts`:
```ts
export { shadows } from './shadows';
```

### A.5 Animation & Transition Guidelines

| Interaction         | Animation                                           | Duration | Library                    |
|---------------------|-----------------------------------------------------|----------|----------------------------|
| Card press          | Scale down to 0.97 + opacity 0.9                    | 100ms    | `react-native-reanimated`  |
| Card release        | Scale back to 1.0 + opacity 1.0                     | 150ms    | `react-native-reanimated`  |
| Screen enter        | Fade in from opacity 0 to 1                         | 250ms    | `react-native-reanimated`  |
| Skeleton shimmer    | Translate highlight band left-to-right, infinite     | 1200ms   | `react-native-reanimated`  |
| Checkbox toggle     | Scale bounce 1.0 -> 1.15 -> 1.0 + checkmark draw    | 300ms    | `react-native-reanimated`  |
| Pull-to-refresh     | Use default `RefreshControl` (already in place)      | native   | React Native built-in      |
| Button press        | Opacity 0.85 (already in PrimaryButton)              | native   | Pressable built-in         |
| List item appear    | FadeInDown stagger, 50ms between items               | 300ms    | `react-native-reanimated`  |

Implementation note: Wrap animated cards in `Animated.View` from `react-native-reanimated` (already a dependency). Use `useAnimatedStyle`, `withTiming`, `withSpring` hooks. Do NOT add `react-native-animatable` or `lottie` -- keep the dependency tree minimal.

---

## B. Screen-by-Screen Redesign Specs

### B.1 Login Screen

**File:** `presentation/screens/login/login-screen.tsx`

**Layout (top to bottom):**

1. **Gradient background area** (top 40% of screen)
   - Use `expo-linear-gradient` (`expo install expo-linear-gradient`)
   - Colors: `primaryGradientStart` -> `primaryGradientEnd` (diagonal, start={x:0,y:0} end={x:1,y:1})
   - Position: absolute, top 0, left 0, right 0, height 40% of screen
   - borderBottomLeftRadius: 32, borderBottomRightRadius: 32

2. **App logo / icon area** (centered in gradient area)
   - Large app name text: "Recipely" using `headline` variant, color `#FFFFFF`
   - Below it: fork-and-knife icon from `@expo/vector-icons/MaterialCommunityIcons` name="silverware-fork-knife", size 48, color `#FFFFFF`
   - Below icon: subtitle text using `body` variant, color `rgba(255,255,255,0.8)`

3. **Card form** (overlapping the gradient bottom edge)
   - `cardBackground` with `borderRadius: radii.xxl (24)`
   - shadow: `shadows.lg`
   - padding: `spacing.xl (24)` all sides
   - marginHorizontal: `spacing.lg (16)`
   - marginTop: -40 (negative to overlap gradient)

4. **Input fields** (inside card)
   - Height: `sizes.inputHeight (52)`
   - backgroundColor: `inputBackground`
   - borderWidth: 1.5
   - borderColor: `inputBorder`, on focus: `inputBorderFocused`
   - borderRadius: `radii.lg (12)`
   - paddingLeft: 48 (to accommodate icon)
   - Icon (inside input, position absolute left 16):
     - Username: `MaterialCommunityIcons` name="account-outline" size=20 color=`textMuted`
     - Password: `MaterialCommunityIcons` name="lock-outline" size=20 color=`textMuted`
   - fontSize: 15
   - gap between inputs: `spacing.md (12)`

5. **Error message** (below inputs if present)
   - color: `danger`
   - fontSize: caption
   - marginTop: `spacing.sm (8)`

6. **Sign in button**
   - Full width inside the card
   - Height: `sizes.buttonHeight (52)`
   - borderRadius: `radii.lg (12)`
   - backgroundColor: `primary`
   - When loading: show `ActivityIndicator` centered, white
   - When disabled (fields empty): opacity 0.5
   - marginTop: `spacing.lg (16)`

7. **Hint text** (below card)
   - variant: `caption`, muted
   - marginTop: `spacing.lg (16)`
   - textAlign: center

**Behavioral notes:**
- Use `KeyboardAvoidingView` with `behavior="padding"` on iOS
- Wrap in `ScrollView` with `keyboardShouldPersistTaps="handled"`
- Track input focus state with `useState<'username' | 'password' | null>(null)` for border color changes

### B.2 Recipe List Screen

**File:** `presentation/screens/recipes/recipe-list-screen.tsx`

**Layout:**

1. **Search bar** (sticky at top)
   - Component: `<SearchBar>` (new widget, see section C)
   - height: `sizes.searchBarHeight (44)`
   - marginHorizontal: `spacing.lg (16)`
   - marginTop: `spacing.sm (8)`
   - marginBottom: `spacing.md (12)`
   - backgroundColor: `inputBackground`
   - borderRadius: `radii.round (9999)`
   - Left icon: `Ionicons` name="search" size=18 color=`textMuted`
   - Right icon (when text present): `Ionicons` name="close-circle" size=18, clearable
   - placeholder: "Search recipes..." (new i18n key)
   - Filter locally on `state.recipes` by `item.name` (case-insensitive includes)
   - Place as `ListHeaderComponent` in `FlatList`

2. **Recipe cards** (vertical list, card layout)
   - Component: `<RecipeCard>` (new widget, see section C)
   - FlatList with `contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}`
   - `ItemSeparatorComponent`: `View` with `height: spacing.md (12)`
   - Each card layout:
     - Container: `cardBackground`, `borderRadius: radii.xl (16)`, `shadows.md`, overflow hidden
     - **Image area**: height `sizes.cardImageHeight (180)`, width 100%, `resizeMode="cover"`
       - Use `expo-image` `Image` component (already a dependency) for better caching
       - Bottom gradient overlay: 60px tall, from transparent to `rgba(0,0,0,0.5)`, position absolute bottom
       - **Cuisine badge**: position absolute top-right (top: 12, right: 12)
         - backgroundColor: `primary`, borderRadius: `radii.round`
         - paddingHorizontal: 10, paddingVertical: 4
         - text: `caption` variant, color: `primaryText`, fontWeight 600
       - **Difficulty chip**: position absolute top-left (top: 12, left: 12)
         - backgroundColor: `rgba(0,0,0,0.55)`, borderRadius: `radii.round`
         - paddingHorizontal: 10, paddingVertical: 4
         - text: `caption` variant, color: `#FFFFFF`
     - **Info area**: padding `spacing.md (12)` horizontal, `spacing.md (12)` vertical
       - **Recipe name**: `subtitle` variant, numberOfLines=1
       - **Bottom row** (flexDirection: row, justifyContent: space-between, alignItems: center, marginTop: spacing.xs):
         - Left: tags (first 2 only), each as small pill:
           - backgroundColor: `chipBackground`, borderRadius: `radii.round`
           - paddingHorizontal: 8, paddingVertical: 2
           - text: `caption` variant, color: `chipText`
         - Right: star rating row
           - 5 star icons, `MaterialCommunityIcons` name="star" / "star-half-full" / "star-outline"
           - size: 14, filled color: `starFilled`, empty color: `starEmpty`
           - Text: `caption` variant, muted, `(item.rating.toFixed(1))`

3. **Loading state** (skeleton placeholders instead of spinner)
   - Component: `<SkeletonLoader>` (new widget, see section C)
   - Show 3 skeleton cards in a `ScrollView`
   - Each skeleton card matches the RecipeCard dimensions:
     - Image area: `sizes.cardImageHeight (180)` tall rectangle, `skeleton` color
     - Title line: 60% width, 18px height, `skeleton` color
     - Bottom row: two small rectangles (tags) + one rectangle (rating)
   - Shimmer animation on each skeleton block

4. **Empty state**
   - Centered message using existing `StateView`
   - Add an icon above text: `MaterialCommunityIcons` name="food-off" size=64 color=`textMuted`

5. **Pull-to-refresh**: keep existing `RefreshControl`

6. **Press interaction on card**:
   - Animated scale: `withTiming(0.97, { duration: 100 })` on press in
   - Animated scale: `withTiming(1.0, { duration: 150 })` on press out

### B.3 Recipe Detail Screen

**File:** `presentation/screens/recipes/recipe-detail-screen.tsx`

**Layout:**

1. **Hero image** (full-width, no horizontal padding)
   - height: `sizes.heroImageHeight (280)`
   - width: 100%
   - resizeMode: cover
   - Use `expo-image` `Image`
   - Gradient overlay at bottom: 100px, from transparent to `background` color
   - Gradient overlay at top: 80px, from `rgba(0,0,0,0.4)` to transparent (for back button legibility)

2. **Floating back button** (position absolute, top: safeAreaInsets.top + 8, left: 16)
   - width: 40, height: 40, borderRadius: 20 (circle)
   - backgroundColor: `rgba(0,0,0,0.4)`
   - Icon: `Ionicons` name="chevron-back" size=24 color="#FFFFFF"
   - onPress: `router.back()`
   - Use `useSafeAreaInsets()` from `react-native-safe-area-context` for top offset
   - Set `headerShown: false` for this screen in the Stack.Screen options

3. **Content area** (below hero, paddingHorizontal: spacing.lg, marginTop: -spacing.xxl to overlap image)
   - **Recipe name**: `title` variant
   - **Info chips row** (flexDirection: row, flexWrap: wrap, gap: spacing.sm, marginTop: spacing.md)
     - Component: `<InfoChip>` (inline, not a separate file)
     - Each chip: backgroundColor `chipBackground`, borderRadius `radii.round`, paddingHorizontal 12, paddingVertical 6
     - Icon + text in each chip:
       - Cuisine: `MaterialCommunityIcons` name="earth" size=14 + cuisine text
       - Difficulty: `MaterialCommunityIcons` name="signal-cellular-outline" (or "speedometer") size=14 + difficulty text
       - Prep time: `MaterialCommunityIcons` name="clock-outline" size=14 + `{prepTimeMinutes} min`
       - Cook time: `MaterialCommunityIcons` name="fire" size=14 + `{cookTimeMinutes} min`
       - Rating: `MaterialCommunityIcons` name="star" size=14 color=`starFilled` + `{rating.toFixed(1)}`
     - Chip text: `caption` variant, color `chipText`

4. **Tags row** (if tags.length > 0, marginTop: spacing.md)
   - Same style as current but use `chipBackground` and `chipText` colors properly

5. **Ingredients section** (marginTop: spacing.xl)
   - Section header: `<SectionHeader>` component (new widget)
     - `label` variant text, uppercase, color `textMuted`
     - Horizontal line after text (flex: 1, height: 1, backgroundColor: border, marginLeft: spacing.md)
   - Each ingredient as `<CheckboxItem>` (new widget, see section C)
     - Visual-only checkbox (no state persistence needed, local `useState` array)
     - Unchecked: 24x24 rounded square, borderWidth: 2, borderColor: `border`, borderRadius: radii.sm
     - Checked: backgroundColor: `success`, checkmark icon `Ionicons` name="checkmark" size=16 color="#FFFFFF"
     - Text: `body` variant, marginLeft: spacing.md
     - When checked: text gets `textDecorationLine: 'line-through'`, color `textMuted`
     - Row: flexDirection: row, alignItems: center, paddingVertical: spacing.sm

6. **Instructions section** (marginTop: spacing.xl)
   - Section header: same `<SectionHeader>`
   - Each step as a numbered card:
     - flexDirection: row, alignItems: flex-start, marginTop: spacing.md
     - **Step number circle**: width 28, height 28, borderRadius 14, backgroundColor `primary`, centered text `primaryText` fontWeight 700 fontSize 13
     - **Step text**: `body` variant, flex 1, marginLeft: spacing.md, lineHeight 22

7. **View Tasks button** (marginTop: spacing.xxl, marginBottom: spacing.xxl)
   - Use existing `<PrimaryButton>`

8. **Loading state**: Use `<SkeletonLoader>` with layout matching hero + text blocks

### B.4 Task List Screen

**File:** `presentation/screens/tasks/task-list-screen.tsx`

**Layout:**

1. **Progress header** (sticky, above list)
   - Component: `<ProgressBar>` (new widget, see section C)
   - Container: paddingHorizontal: spacing.lg, paddingVertical: spacing.md
   - Text: `body` variant, e.g., "3 of 5 completed" / "3 / 5 tamamlandi" (new i18n key)
   - Progress bar below text:
     - height: `sizes.progressBarHeight (6)`
     - backgroundColor: `border`
     - borderRadius: `radii.round`
     - Inner fill: backgroundColor: `success`, borderRadius: `radii.round`
     - Width: animated to `(completedCount / totalCount) * 100%`
   - Place as `ListHeaderComponent`

2. **Task cards** (FlatList items)
   - Container: marginHorizontal: spacing.lg, backgroundColor: `cardBackground`, borderRadius: radii.lg (12), shadows.sm
   - padding: spacing.lg
   - flexDirection: row, alignItems: center
   - **Checkbox visual** (left side):
     - Component: reuse `<CheckboxItem>` or inline
     - size: `sizes.checkboxSize (24)`
     - Completed: backgroundColor `success`, borderRadius radii.sm, checkmark icon
     - Pending: borderWidth 2, borderColor `border`, borderRadius radii.sm, empty
   - **Title** (flex: 1, marginLeft: spacing.md):
     - `body` variant
     - If completed: `textDecorationLine: 'line-through'`, color `textMuted`
   - **Status badge** (right side):
     - backgroundColor: completed ? `successLight` : `warningLight`
     - text color: completed ? `success` : `warning`
     - borderRadius: `radii.round`
     - paddingHorizontal: 10, paddingVertical: 4
     - text: `caption` variant, fontWeight 600
   - `ItemSeparatorComponent`: `View` with height: spacing.sm (8)
   - Press: navigate to task detail

3. **Empty state**
   - Icon: `MaterialCommunityIcons` name="clipboard-check-outline" size=64 color=`textMuted`
   - Text: existing empty message

4. **Loading**: SkeletonLoader with 5 rows matching card height

### B.5 Task Detail Screen

**File:** `presentation/screens/tasks/task-detail-screen.tsx`

**Layout:**

1. **Task title** (top, padded)
   - `title` variant
   - marginBottom: spacing.lg

2. **Large checkbox toggle** (centered, visual)
   - Container: alignItems: center, marginTop: spacing.xl
   - Circle: width: 80, height: 80, borderRadius: 40
   - Completed: backgroundColor: `success`, icon `Ionicons` name="checkmark" size=40 color="#FFFFFF"
   - Pending: borderWidth: 3, borderColor: `border`, backgroundColor transparent
   - Animated bounce on render: `withSpring` scale 0 -> 1

3. **Status badge** (centered below checkbox)
   - marginTop: spacing.lg
   - Same styling as task list badge but larger:
     - paddingHorizontal: 20, paddingVertical: 10
     - text: `subtitle` variant
     - backgroundColor: completed ? `successLight` : `warningLight`
     - text color: completed ? `success` : `warning`
     - borderRadius: `radii.round`

4. **Loading**: centered ActivityIndicator (keep simple, single item screen)

### B.6 Settings/Profile Screen (NEW)

**New files needed:**
- `presentation/screens/settings/settings-screen.tsx`
- `presentation/app/settings.tsx` (route file)

**Data source:** `authStore` state -- when `status === 'authenticated'`, read `session.user` for displayName, email, photoUrl.

**Layout:**

1. **User info section** (top)
   - Container: alignItems: center, paddingVertical: spacing.xxl
   - **Avatar**: `<AvatarImage>` component (new widget)
     - size: `sizes.avatarLg (80)`
     - borderRadius: 40 (circular)
     - If `photoUrl` exists: show Image with source `{ uri: photoUrl }`
     - If no photoUrl: show initials (first letter of displayName) on `avatarBackground`, text color `primary`, fontSize 28, fontWeight 700
   - **Display name**: `title` variant, marginTop: spacing.md
   - **Email**: `body` variant, muted, marginTop: spacing.xs

2. **Settings sections** (grouped rows)
   - **Appearance section**
     - Section header: `<SectionHeader>` with label text "Appearance" / "Gorunum" (i18n)
     - `<ThemeToggle>` row (new widget):
       - `<SettingsRow>` with icon `Ionicons` name="color-palette-outline"
       - Label: "Theme" / "Tema"
       - Right side: segmented control or cycling button with values: System / Light / Dark
       - Values stored in a new Zustand store: `presentation/stores/preferences-store.ts`
       - This store wraps `useColorScheme` override (using `expo-system-ui` `setBackgroundColorAsync` and React context)
     - `<LanguageSelector>` row (new widget):
       - `<SettingsRow>` with icon `Ionicons` name="language-outline"
       - Label: "Language" / "Dil"
       - Right side: "English" / "Turkce" cycling button or modal picker

   - **Account section**
     - Section header: "Account" / "Hesap"
     - Sign out row:
       - `<SettingsRow>` with icon `Ionicons` name="log-out-outline"
       - Label: "Sign out" / "Cikis yap"
       - Text color: `danger`
       - onPress: call `authStore.signOut()`, then `router.replace('/login')`

   - **About section**
     - Section header: "About" / "Hakkinda"
     - Version row:
       - `<SettingsRow>` with icon `Ionicons` name="information-circle-outline"
       - Label: "Version" / "Surum"
       - Right text: "1.0.0" (read from `expo-constants` `Constants.expoConfig?.version`)
     - Non-pressable, no chevron

3. **`<SettingsRow>` layout** (reusable, see section C)
   - height: `sizes.settingsRowHeight (52)`
   - flexDirection: row, alignItems: center
   - paddingHorizontal: spacing.lg
   - backgroundColor: `cardBackground`
   - Left icon: size 22, color `primary` (or `danger` for destructive)
   - Label: `body` variant, flex: 1, marginLeft: spacing.md
   - Right content: custom (text, chevron icon, toggle)
   - Pressable rows show chevron: `Ionicons` name="chevron-forward" size=18 color=`textMuted`
   - Group rows in a container with borderRadius: radii.lg, overflow: hidden, marginHorizontal: spacing.lg
   - Separator between rows: height: StyleSheet.hairlineWidth, backgroundColor: `border`, marginLeft: 54

### B.7 Navigation Updates

**Recommendation: Keep stack navigation + add a settings icon in the header.**

Rationale: The app has a focused, linear flow (Recipes -> Recipe Detail -> Tasks). Bottom tabs would create a flat structure that does not match the hierarchical data model. The only new top-level destination is Settings. A header icon is lighter weight and more appropriate for apps with fewer than 3 primary destinations.

**Implementation:**

In `presentation/navigation/root-layout.tsx`, update the `recipes/index` screen options:

```tsx
<Stack.Screen
  name="recipes/index"
  options={{
    title: t().navigation.recipes,
    headerRight: () => (
      <Pressable onPress={() => router.push('/settings')} style={{ marginRight: 8 }}>
        <Ionicons name="settings-outline" size={22} color={colors.text} />
      </Pressable>
    ),
  }}
/>
```

Add the settings route:
```tsx
<Stack.Screen
  name="settings"
  options={{ title: t().navigation.settings }}
/>
```

For the recipe detail screen, hide the default header to allow the floating back button over the hero image:
```tsx
<Stack.Screen
  name="recipes/[recipeId]/index"
  options={{ headerShown: false }}
/>
```

---

## C. New Components Needed

All new components live in `presentation/base/widgets/`.

### C.1 RecipeCard

**File:** `presentation/base/widgets/recipe-card.tsx`

```ts
export interface RecipeCardProps {
  name: string;
  image: string;
  cuisine: string;
  difficulty: string;
  rating: number;
  tags: string[];
  onPress: () => void;
}
```

- Max 120 lines.
- Uses `expo-image` `Image` for the recipe image.
- Uses `Animated.View` from `react-native-reanimated` for press scale animation.
- Uses `@expo/vector-icons/MaterialCommunityIcons` for star icons.
- Layout described in B.2 above.

### C.2 SearchBar

**File:** `presentation/base/widgets/search-bar.tsx`

```ts
export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}
```

- Height: `sizes.searchBarHeight (44)`
- backgroundColor: `inputBackground`
- borderRadius: `radii.round`
- Left search icon, right clear button (when value.length > 0)
- TextInput with no border, transparent background

### C.3 SkeletonLoader

**File:** `presentation/base/widgets/skeleton-loader.tsx`

```ts
export interface SkeletonLoaderProps {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}
```

- Uses `react-native-reanimated` for shimmer animation.
- Base color: `skeleton`, highlight color: `skeletonHighlight`.
- Animated translateX of a highlight overlay, looping every 1200ms.

### C.4 CheckboxItem

**File:** `presentation/base/widgets/checkbox-item.tsx`

```ts
export interface CheckboxItemProps {
  label: string;
  checked: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}
```

- Pressable row with checkbox visual + text.
- Checkbox size: `sizes.checkboxSize (24)`.
- Animated scale bounce on toggle via `react-native-reanimated`.

### C.5 ProgressBar

**File:** `presentation/base/widgets/progress-bar.tsx`

```ts
export interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;  // e.g., "3 of 5 completed"
}
```

- Track: full width, height `sizes.progressBarHeight (6)`, backgroundColor `border`, borderRadius round.
- Fill: animated width transition, backgroundColor `success`.

### C.6 SettingsRow

**File:** `presentation/base/widgets/settings-row.tsx`

```ts
export interface SettingsRowProps {
  icon: string;             // Ionicons icon name
  label: string;
  rightElement?: ReactNode; // custom right-side content
  onPress?: () => void;
  destructive?: boolean;    // makes icon + text use danger color
  showChevron?: boolean;    // default true when onPress is provided
}
```

- Height: `sizes.settingsRowHeight (52)`.
- Pressable wrapper with opacity press feedback.

### C.7 AvatarImage

**File:** `presentation/base/widgets/avatar-image.tsx`

```ts
export interface AvatarImageProps {
  uri?: string;
  name: string;        // fallback: show initials
  size: number;
}
```

- Circular image or initials fallback.
- backgroundColor for fallback: `avatarBackground`.

### C.8 SectionHeader

**File:** `presentation/base/widgets/section-header.tsx`

```ts
export interface SectionHeaderProps {
  title: string;
}
```

- Uses `label` variant text (uppercase, muted).
- Horizontal line to the right of the text.
- marginTop: `spacing.xl`, marginBottom: `spacing.md`.
- paddingHorizontal: `spacing.lg`.

### C.9 ThemeToggle

**File:** `presentation/base/widgets/theme-toggle.tsx`

```ts
export interface ThemeToggleProps {
  value: 'system' | 'light' | 'dark';
  onChange: (value: 'system' | 'light' | 'dark') => void;
}
```

- Three-segment button row.
- Active segment: backgroundColor `primary`, text `primaryText`.
- Inactive segments: backgroundColor `inputBackground`, text `textMuted`.
- borderRadius: `radii.round`.
- Height: 34.

### C.10 LanguageSelector

**File:** `presentation/base/widgets/language-selector.tsx`

```ts
export interface LanguageSelectorProps {
  value: 'en' | 'tr';
  onChange: (value: 'en' | 'tr') => void;
}
```

- Two-segment button: "EN" / "TR".
- Same visual style as ThemeToggle segments.

---

## D. i18n Keys to Add

### English (`presentation/i18n/en.ts`)

```ts
export const en = {
  common: {
    retry: 'Retry',
    loading: 'Loading...',
    error: 'Something went wrong',
    empty: 'Nothing here yet.',
    search: 'Search',               // NEW
    cancel: 'Cancel',               // NEW
    of: 'of',                       // NEW (for "3 of 5")
  },
  login: {
    // ... existing keys unchanged ...
  },
  recipes: {
    // ... existing keys unchanged ...
    searchPlaceholder: 'Search recipes...',         // NEW
    noResults: 'No recipes match your search.',     // NEW
    servings: 'Servings',                           // NEW
    totalTime: 'Total time',                        // NEW
  },
  tasks: {
    // ... existing keys unchanged ...
    progress: '{current} of {total} completed',     // NEW (use string interpolation)
    allCompleted: 'All tasks completed!',           // NEW
  },
  settings: {                                       // NEW section
    title: 'Settings',
    appearance: 'Appearance',
    theme: 'Theme',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    language: 'Language',
    account: 'Account',
    signOut: 'Sign out',
    signOutConfirm: 'Are you sure you want to sign out?',
    about: 'About',
    version: 'Version',
  },
  navigation: {
    recipes: 'Recipes',
    recipe: 'Recipe',
    tasks: 'Tasks',
    task: 'Task',
    settings: 'Settings',           // NEW
  },
};
```

### Turkish (`presentation/i18n/tr.ts`)

```ts
export const tr: Translations = {
  common: {
    retry: 'Tekrar dene',
    loading: 'Yukleniyor...',
    error: 'Bir seyler ters gitti',
    empty: 'Henuz bir sey yok.',
    search: 'Ara',                              // NEW
    cancel: 'Iptal',                            // NEW
    of: '/',                                    // NEW
  },
  login: {
    // ... existing keys unchanged ...
  },
  recipes: {
    // ... existing keys unchanged ...
    searchPlaceholder: 'Tarif ara...',           // NEW
    noResults: 'Aramanizla eslesen tarif yok.',  // NEW
    servings: 'Porsiyon',                        // NEW
    totalTime: 'Toplam sure',                    // NEW
  },
  tasks: {
    // ... existing keys unchanged ...
    progress: '{current} / {total} tamamlandi',  // NEW
    allCompleted: 'Tum gorevler tamamlandi!',    // NEW
  },
  settings: {                                    // NEW section
    title: 'Ayarlar',
    appearance: 'Gorunum',
    theme: 'Tema',
    themeSystem: 'Sistem',
    themeLight: 'Acik',
    themeDark: 'Koyu',
    language: 'Dil',
    account: 'Hesap',
    signOut: 'Cikis yap',
    signOutConfirm: 'Cikis yapmak istediginize emin misiniz?',
    about: 'Hakkinda',
    version: 'Surum',
  },
  navigation: {
    recipes: 'Tarifler',
    recipe: 'Tarif',
    tasks: 'Gorevler',
    task: 'Gorev',
    settings: 'Ayarlar',                         // NEW
  },
};
```

---

## E. Theme Additions

### E.1 New Color Tokens

See section A.1 for the complete list and exact hex values for both light and dark palettes. Summary of new tokens:

- `primaryLight`, `primaryGradientStart`, `primaryGradientEnd`
- `secondary`, `secondaryText`
- `success`, `successLight`, `warning`, `warningLight`
- `cardBackground`, `cardBorder`
- `inputBackground`, `inputBorder`, `inputBorderFocused`
- `skeleton`, `skeletonHighlight`
- `shadow`, `overlay`
- `starFilled`, `starEmpty`
- `tabBarBackground`, `tabBarBorder`, `tabBarActive`, `tabBarInactive`
- `avatarBackground`, `sectionBackground`

### E.2 Shadow Styles

New file: `presentation/base/theme/shadows.ts` (see section A.4 for full implementation).

Three levels: `shadows.sm`, `shadows.md`, `shadows.lg`.

### E.3 Card Elevation Presets

Add to `presentation/base/theme/index.ts`:

```ts
export { shadows } from './shadows';
export { sizes } from './spacing';
```

Card styles are composed in each component from:
- `cardBackground` + `cardBorder` colors
- `shadows.md` (default) or `shadows.sm` (settings rows)
- `borderRadius: radii.xl (16)` for recipe cards, `radii.lg (12)` for settings groups

---

## F. Implementation Priority

Order of work with rationale:

### Phase 1: Foundation (do first, everything depends on this)
1. **Theme system enhancements**
   - Add all new color tokens to `colors.ts` (both light and dark)
   - Add new spacing/sizing tokens to `spacing.ts`
   - Create `shadows.ts`
   - Add `headline` and `label` variants to `themed-text.tsx`
   - Update `theme/index.ts` exports
   - Install `expo-linear-gradient`: `npx expo install expo-linear-gradient`

### Phase 2: Shared components (build the toolbox)
2. **New reusable widgets** (can be built in parallel)
   - `SkeletonLoader` (needed by recipe list, task list, recipe detail)
   - `SearchBar` (needed by recipe list)
   - `RecipeCard` (needed by recipe list)
   - `CheckboxItem` (needed by recipe detail, task list)
   - `SectionHeader` (needed by recipe detail, settings)
   - `ProgressBar` (needed by task list)
   - `SettingsRow` (needed by settings)
   - `AvatarImage` (needed by settings)
   - `ThemeToggle` (needed by settings)
   - `LanguageSelector` (needed by settings)

### Phase 3: New feature
3. **Settings/Profile screen**
   - Create `presentation/screens/settings/settings-screen.tsx`
   - Create route file `presentation/app/settings.tsx`
   - Add settings icon to recipe list header in root-layout
   - Add i18n keys for settings

### Phase 4: Highest visual impact screens
4. **Recipe list redesign**
   - Replace plain text rows with `RecipeCard`
   - Add `SearchBar` as ListHeaderComponent
   - Replace loading spinner with `SkeletonLoader`
   - Add local search/filter state
   - Add i18n keys for search

5. **Recipe detail redesign**
   - Full-width hero image with floating back button
   - Info chips row with icons
   - Ingredient checkboxes with `CheckboxItem`
   - Numbered instruction steps
   - Section headers

### Phase 5: Login and task screens
6. **Login screen redesign**
   - Gradient background with `expo-linear-gradient`
   - Card form overlay
   - Input fields with icons
   - KeyboardAvoidingView

7. **Task screens redesign**
   - Task list: progress bar, card layout, checkbox visuals
   - Task detail: large checkbox visual, status badge

### Phase 6: Polish
8. **Navigation updates**
   - Hide header on recipe detail (floating back button)
   - Settings header icon on recipe list
   - Verify all screen transitions look correct

---

## G. Dependencies to Install

Before starting implementation, run:

```bash
npx expo install expo-linear-gradient
```

All other needed libraries (`react-native-reanimated`, `expo-image`, `@expo/vector-icons`, `react-native-safe-area-context`) are already in the project.

---

## H. File Summary

### Files to modify:
- `presentation/base/theme/colors.ts` -- add 22 new color tokens
- `presentation/base/theme/spacing.ts` -- add `xxxl`, `radii.xs`, `radii.xxl`, `sizes` export
- `presentation/base/theme/index.ts` -- add exports for shadows, sizes
- `presentation/base/widgets/themed-text.tsx` -- add `headline` and `label` variants
- `presentation/i18n/en.ts` -- add ~20 new keys
- `presentation/i18n/tr.ts` -- add ~20 new keys
- `presentation/navigation/root-layout.tsx` -- add settings route, header icon, hide recipe detail header
- `presentation/screens/login/login-screen.tsx` -- full redesign
- `presentation/screens/recipes/recipe-list-screen.tsx` -- full redesign
- `presentation/screens/recipes/recipe-detail-screen.tsx` -- full redesign
- `presentation/screens/tasks/task-list-screen.tsx` -- redesign
- `presentation/screens/tasks/task-detail-screen.tsx` -- redesign

### Files to create:
- `presentation/base/theme/shadows.ts`
- `presentation/base/widgets/recipe-card.tsx`
- `presentation/base/widgets/search-bar.tsx`
- `presentation/base/widgets/skeleton-loader.tsx`
- `presentation/base/widgets/checkbox-item.tsx`
- `presentation/base/widgets/progress-bar.tsx`
- `presentation/base/widgets/settings-row.tsx`
- `presentation/base/widgets/avatar-image.tsx`
- `presentation/base/widgets/section-header.tsx`
- `presentation/base/widgets/theme-toggle.tsx`
- `presentation/base/widgets/language-selector.tsx`
- `presentation/screens/settings/settings-screen.tsx`
- `presentation/app/settings.tsx`
