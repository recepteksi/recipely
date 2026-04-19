# Recipely Design Specification

> This document is the authoritative design reference for the Recipely mobile app visual upgrade.
> Every section contains exact values (hex colors, pixel sizes, prop interfaces) so that
> developer agents can implement without ambiguity.

---

## Theme Palette Strategy (Apr 2026 redesign)

### Why this section exists

Real-device QA (Android, OLED) revealed two production-blocking issues that the previous
"low-luminance tinted backgrounds" iteration did not catch:

1. **All dark themes read as the same near-black.** Hex values like `#1A0505`, `#1A0D00`,
   `#0A1400` are hex-distinct but visually identical on a phone screen — relative luminance
   in the 0.003-0.009 band, with chroma so muted it disappears under typical room lighting.
   The 20-theme picker is therefore visually meaningless in dark variants.

2. **`primaryText` is being misused as "text on overlay/badge".** In dark themes the project
   contracts `primaryText` to be a DARK hex (because `primary` is a bright pastel). When the
   recipe-card difficulty chip rendered `primaryText` over `colors.overlay`, it produced
   dark-on-dark invisible text. Same pattern in checkbox/task widgets that render checkmarks
   over `colors.success`.

This section is the source of truth that fixes both. Sections below (A-H) keep their previous
content, but **all `background` and `surface` values they reference are superseded by the
table in this section**, and all "text on overlay / on success" rules are superseded by the
new semantic tokens defined here.

### References (Apr 2026 design research)

- **[Material 3 — Color roles](https://m3.material.io/styles/color/roles)** — adopted the
  "tonal surface elevation" idea: surface is not a fixed gray, it inherits the primary hue
  family at a higher tonal step. Our dark surfaces mix the per-theme background toward a
  warm-neutral elevation target `#52535A` so cards lift visibly off the bg without losing
  the theme tint.
- **[Mobbin — Mobile Dark Mode patterns](https://mobbin.com/explore/mobile/screens/dark-mode)** —
  surveyed Yummly, Tasty, Linear, Finimize. Common pattern: dark backgrounds carry 3-8% of
  the brand hue's chroma even at L≈0.01, and cards sit ~30-45% lighter than bg via tonal
  elevation rather than a flat gray surface.
- **[Designing Dark Mode for Mobile (2026 guide)](https://appinventiv.com/blog/guide-on-designing-dark-mode-for-mobile-app/)** —
  reinforced WCAG bg/text floor of 7:1 for body in dark mode (we hit ≥10.1:1 on every
  surf/text pair; ≥11.2:1 on every bg/text pair).

### A. Background palette redesign — DARK variants

Target relative luminance band: **[0.003, 0.020]**. Sibling themes within the same hue
family are spread across this band by ≥0.0015 luminance OR shifted in hue (peach vs rose
vs wine for the warm reds). **Surface synthesis target moves from `#3A3B41` to `#52535A`**
so cards hit a 1.4-1.5:1 contrast against bg (previous 1.2:1 was visually flat).

| Theme ID            | Old bg       | New bg       | Luminance | Synthesized surface | bg/surf | surf/text |
|---------------------|--------------|--------------|-----------|---------------------|---------|-----------|
| midnight-slate      | `#0B0B0D`    | `#0B0F1A`    | 0.0049    | `#2F313A`           | 1.48    | 11.82     |
| pearl-white         | `#050A14`    | `#0A1A33`    | 0.0104    | `#2E3747`           | 1.45    | 10.93     |
| crimson-ember       | `#1A0505`    | `#1A0309`    | 0.0030    | `#362B32`           | 1.46    | 12.38     |
| amber-sunset        | `#1A0D00`    | `#190A00`    | 0.0042    | `#362F2D`           | 1.48    | 11.97     |
| golden-hour         | `#1A1500`    | `#1A1300`    | 0.0069    | `#36332D`           | 1.47    | 11.49     |
| lime-zest           | `#0A1400`    | `#0A1700`    | 0.0068    | `#2E352D`           | 1.46    | 11.52     |
| emerald-garden      | `#001A12`    | `#021A14`    | 0.0080    | `#2A3737`           | 1.47    | 11.28     |
| teal-lagoon         | `#001715`    | `#021A1D`    | 0.0084    | `#2A373C`           | 1.46    | 11.21     |
| cyan-frost          | `#00121C`    | `#02141C`    | 0.0060    | `#2A343B`           | 1.48    | 11.60     |
| ocean-deep          | `#001929`    | `#021024`    | 0.0051    | `#2A323F`           | 1.48    | 11.79     |
| indigo-night        | `#0A0A1E`    | `#0B0824`    | 0.0037    | `#2F2E3F`           | 1.47    | 12.11     |
| violet-bloom        | `#0D0A1E`    | `#100620`    | 0.0034    | `#312D3D`           | 1.47    | 12.18     |
| royal-purple        | `#0D0619`    | `#180628`    | 0.0048    | `#352D41`           | 1.46    | 11.96     |
| fuchsia-flash       | `#1A0010`    | `#22042A`    | 0.0059    | `#3A2C42`           | 1.45    | 11.84     |
| rose-quartz         | `#1A0008`    | `#22030E`    | 0.0044    | `#3A2B34`           | 1.45    | 12.17     |
| coral-reef          | `#1A0008`    | `#2C0A14`    | 0.0080    | `#3F2F37`           | 1.44    | 11.46     |
| mint-breeze         | `#001715`    | `#072B26`    | 0.0191    | `#2D3F40`           | 1.37    | 10.11     |
| tangerine-dream     | `#1A0D00`    | `#2A1208`    | 0.0094    | `#3E3331`           | 1.45    | 11.13     |
| lavender-mist       | `#0D0A1E`    | `#1F1733`    | 0.0114    | `#393547`           | 1.44    | 10.80     |
| chartreuse-zap      | `#0A1400`    | `#162A00`    | 0.0183    | `#343F2D`           | 1.39    | 10.12     |

Sibling-pair luminance separation (the old palette had pairs like `crimson/rose/coral` all
at `#1A0008`/`#1A0008`/`#1A0008` — literally identical):

| Sibling group                                              | Luminance values                                |
|------------------------------------------------------------|-------------------------------------------------|
| crimson-ember / rose-quartz / coral-reef                   | 0.0030 / 0.0044 / 0.0080 — coral lifts via L+hue |
| amber-sunset / tangerine-dream                             | 0.0042 / 0.0094 — tangerine 2× brighter         |
| lime-zest / chartreuse-zap                                 | 0.0068 / 0.0183 — chartreuse 2.7× brighter      |
| emerald-garden / mint-breeze / teal-lagoon                 | 0.0080 / 0.0191 / 0.0084 — mint lifts via L     |
| violet-bloom / lavender-mist / royal-purple / indigo-night | 0.0034 / 0.0114 / 0.0048 / 0.0037 — lavender lifts |

### A. Background palette redesign — LIGHT variants

Target band: **[0.74, 0.95]**. Light backgrounds in the previous palette were `#FFF*` near-
whites that all looked identical too. We tint backgrounds with stronger hue chroma
(luminance 0.78-0.90) and move the **surface synthesis to mix toward pure `#FFFFFF` at 0.55**
so cards "lift" toward white. Body text against any bg or any surface stays ≥14.7:1.

| Theme ID            | Old bg       | New bg       | Luminance | Synthesized surface | surf/bg | surf/text |
|---------------------|--------------|--------------|-----------|---------------------|---------|-----------|
| midnight-slate      | `#FFFFFF`    | `#F2F4F7`    | 0.9029    | `#F9FAFB`           | 1.05    | 17.08     |
| pearl-white         | `#FFFFFF`    | `#E8EFFB`    | 0.8585    | `#F5F8FD`           | 1.09    | 16.77     |
| crimson-ember       | `#FEF2F2`    | `#FBE7E7`    | 0.8343    | `#FDF4F4`           | 1.10    | 16.51     |
| amber-sunset        | `#FFF7ED`    | `#FFEFD9`    | 0.8800    | `#FFF8EE`           | 1.07    | 16.93     |
| golden-hour         | `#FEFCE8`    | `#FCF3BF`    | 0.8856    | `#FEFAE2`           | 1.07    | 16.99     |
| lime-zest           | `#F7FEE7`    | `#EAF7C8`    | 0.8818    | `#F6FBE6`           | 1.07    | 16.88     |
| emerald-garden      | `#ECFDF5`    | `#D6F2E2`    | 0.8329    | `#EDF9F2`           | 1.10    | 16.52     |
| teal-lagoon         | `#F0FDFA`    | `#D2F1EC`    | 0.8267    | `#EBF9F6`           | 1.11    | 16.50     |
| cyan-frost          | `#ECFEFF`    | `#D5F1F8`    | 0.8383    | `#ECF9FC`           | 1.10    | 16.60     |
| ocean-deep          | `#F0F9FF`    | `#D9ECFC`    | 0.8177    | `#EEF6FE`           | 1.11    | 16.36     |
| indigo-night        | `#EEF2FF`    | `#DCDFFB`    | 0.7496    | `#EFF1FD`           | 1.17    | 15.87     |
| violet-bloom        | `#F5F3FF`    | `#E8DEFB`    | 0.7636    | `#F5F0FD`           | 1.15    | 15.95     |
| royal-purple        | `#FAF5FF`    | `#EDDDFB`    | 0.7668    | `#F7F0FD`           | 1.15    | 16.01     |
| fuchsia-flash       | `#FDF4FF`    | `#F8DDF7`    | 0.7838    | `#FCF0FB`           | 1.14    | 16.15     |
| rose-quartz         | `#FFF1F2`    | `#FCDDE3`    | 0.7795    | `#FEF0F2`           | 1.14    | 16.12     |
| coral-reef          | `#FFF5F5`    | `#FFE0D8`    | 0.7953    | `#FFF1ED`           | 1.13    | 16.20     |
| mint-breeze         | `#F0FDFA`    | `#DAF3EC`    | 0.8506    | `#EEFAF6`           | 1.09    | 16.70     |
| tangerine-dream     | `#FFF7ED`    | `#FFE0C2`    | 0.7847    | `#FFF1E4`           | 1.14    | 16.11     |
| lavender-mist       | `#F5F3FF`    | `#EBE2FB`    | 0.7902    | `#F6F2FD`           | 1.13    | 16.18     |
| chartreuse-zap      | `#F7FEE7`    | `#E0F5B5`    | 0.8449    | `#F1FBDE`           | 1.09    | 16.66     |

Light siblings differentiate primarily by **hue family** (e.g., crimson rose-leaning vs
coral peach-leaning) — at high luminance, hue is more perceptually distinct than L itself.

### B. New semantic tokens (tight: only 2 added)

Add to `ThemeColors` interface in `themes.ts`:

```ts
export interface ThemeColors {
  // ... all existing fields unchanged ...

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
```

| Token       | Dark value | Light value | Rationale                                                              |
|-------------|-----------|-------------|------------------------------------------------------------------------|
| `onOverlay` | `#FFFFFF` | `#FFFFFF`   | Overlay is `rgba(0,0,0,0.6)` → effective backdrop ≤ #6B6B6B → cr ≥4.74 |
| `onSuccess` | `#0F1B0F` | `#0F1B0F`   | Success greens (`#81C995` / `#34A853`) → cr 9.12 / 5.84                |

`primaryText` keeps its current contract: "text on `colors.primary`". It is NOT a
generic "text on dark surface" token, so the recipe-card / checkbox / task widgets must
stop using it for non-primary backdrops.

### C. Overlay alpha bump (dark-image legibility)

The previous `lightSemantics.overlay = rgba(15,23,42,0.35)` is too transparent for
readable white text — over a white pixel under the overlay, white text computes 2.22:1
(fails AA). Standardize:

```ts
const darkSemantics: VariantSemantics = {
  // ... unchanged ...
  overlay: 'rgba(0,0,0,0.6)',     // was 0.55 — bumped for chip legibility
};
const lightSemantics: VariantSemantics = {
  // ... unchanged ...
  overlay: 'rgba(0,0,0,0.55)',    // was rgba(15,23,42,0.35) — black, alpha 0.55
};
```

Verified pairings (white text via `onOverlay` on `rgba(0,0,0,0.6)` over image pixels):

| Image pixel under overlay | Effective backdrop | cr (white) |
|---------------------------|--------------------|------------|
| `#FFFFFF` (worst case)    | `#666666`          | 5.74       |
| `#F2C04D` (pizza orange)  | `#614D1F`          | 8.11       |
| `#7F7F7F` (mid gray)      | `#333333`          | 12.63      |
| `#E0E0E0` (bright sky)    | `#5A5A5A`          | 6.90       |

All pass WCAG AA (≥4.5:1) for normal text.

### D. WCAG checks performed

For each of the 20 themes, verified:

- `bg / text` contrast ≥ 11.2:1 (every dark theme), ≥ 14.7:1 (every light theme).
- `surface / text` contrast ≥ 10.1:1 (every dark theme), ≥ 15.8:1 (every light theme).
- `bg / surface` contrast 1.37-1.48:1 (dark), 1.05-1.17:1 (light) — combined with the
  existing `cardBorder` hairline, cards are visibly distinct from bg in both variants.
- `onOverlay` on darken-applied image pixels (4 sample tones from white→black): all ≥4.74.
- `onSuccess` on `colors.success` in both variants: 9.12 (dark) / 5.84 (light).
- `primaryText` on `colors.primary` in all 20 themes: unchanged, all ≥7.0 (already
  validated in previous spec — primary themes already paired primaryText correctly).

Sibling-pair luminance deltas (dark variants): 5 of 5 sibling groups now separate by
≥0.0015 in L OR by hue family. No two dark backgrounds share both hue family and L band.

---

## Hand-off

### For ts-developer (Task #6) — exact `themes.ts` mutations

1. **Extend `ThemeColors` interface** at `presentation/base/theme/themes.ts:23`. Add at
   end of interface, before closing brace:

   ```ts
   onOverlay: string;
   onSuccess: string;
   ```

2. **Update `darkSemantics` and `lightSemantics`** at `presentation/base/theme/themes.ts:128-144`:

   ```ts
   const darkSemantics: VariantSemantics = {
     danger: '#F28B82',
     success: '#81C995',
     warning: '#FDD663',
     starFilled: '#FFD54F',
     overlay: 'rgba(0,0,0,0.6)',     // CHANGED from 0.55 → 0.6
     shadow: '#000000',
   };
   const lightSemantics: VariantSemantics = {
     danger: '#D93025',
     success: '#34A853',
     warning: '#FBBC04',
     starFilled: '#FFB800',
     overlay: 'rgba(0,0,0,0.55)',    // CHANGED — black, alpha 0.55 (was rgba(15,23,42,0.35))
     shadow: '#0F172A',
   };
   ```

3. **Update `makeColors`** at `presentation/base/theme/themes.ts:146` — add the two new
   constant tokens to the returned object:

   ```ts
   onOverlay: '#FFFFFF',
   onSuccess: '#0F1B0F',
   ```

4. **Bump dark-surface mix target** at `presentation/base/theme/themes.ts:120`:

   ```ts
   const DARK_SURFACE_TARGET = '#52535A';   // was '#3A3B41'
   ```

5. **Replace light-surface mix logic** at `presentation/base/theme/themes.ts:241`. Light
   surface should now lift TOWARD white, not pull TOWARD a gray:

   ```ts
   const surface = mixHex(a.background, '#FFFFFF', 0.55);   // was mixHex(a.background, LIGHT_SURFACE_TARGET, 0.4)
   ```

   The constant `LIGHT_SURFACE_TARGET = '#E8E8ED'` becomes unused — delete the
   declaration at line 124.

6. **Replace per-theme `background` hex values**, light AND dark, for all 20 themes per
   the tables in section A above. Concretely (search-and-replace pairs, light variants
   first then dark):

   | Theme           | LIGHT bg new   | DARK bg new    |
   |-----------------|----------------|----------------|
   | midnight-slate  | `#F2F4F7` (replaces `LIGHT_NEUTRAL_BG`) | `#0B0F1A` (replaces `DARK_NEUTRAL_BG`) |
   | pearl-white     | `#E8EFFB` (replaces `LIGHT_NEUTRAL_BG`) | `#0A1A33`     |
   | crimson-ember   | `#FBE7E7`     | `#1A0309`     |
   | amber-sunset    | `#FFEFD9`     | `#190A00`     |
   | golden-hour     | `#FCF3BF`     | `#1A1300`     |
   | lime-zest       | `#EAF7C8`     | `#0A1700`     |
   | emerald-garden  | `#D6F2E2`     | `#021A14`     |
   | teal-lagoon     | `#D2F1EC`     | `#021A1D`     |
   | cyan-frost      | `#D5F1F8`     | `#02141C`     |
   | ocean-deep      | `#D9ECFC`     | `#021024`     |
   | indigo-night    | `#DCDFFB`     | `#0B0824`     |
   | violet-bloom    | `#E8DEFB`     | `#100620`     |
   | royal-purple    | `#EDDDFB`     | `#180628`     |
   | fuchsia-flash   | `#F8DDF7`     | `#22042A`     |
   | rose-quartz     | `#FCDDE3`     | `#22030E`     |
   | coral-reef      | `#FFE0D8`     | `#2C0A14`     |
   | mint-breeze     | `#DAF3EC`     | `#072B26`     |
   | tangerine-dream | `#FFE0C2`     | `#2A1208`     |
   | lavender-mist   | `#EBE2FB`     | `#1F1733`     |
   | chartreuse-zap  | `#E0F5B5`     | `#162A00`     |

   Note: `midnight-slate` and `pearl-white` previously used the `LIGHT_NEUTRAL_BG` /
   `DARK_NEUTRAL_BG` constants — replace those references with the explicit hex listed.
   The `DARK_NEUTRAL_BG` constant is still referenced as a fallback `primaryText` value
   in midnight-slate dark (line 257) — leave that usage in place; only the `background:`
   field changes per-theme.

7. **Verify nothing else** consumed the old surface targets externally — `grep` for
   `DARK_SURFACE_TARGET` and `LIGHT_SURFACE_TARGET` and confirm they only live in
   `themes.ts`. (They do per current code.)

After ts-developer commits: re-run `npx tsc --noEmit` to confirm the new fields don't
break any consumer that destructures `ThemeColors`.

### For rn-developer (Task #7) — exact widget swaps

Three files use `colors.primaryText` for content that is NOT on `colors.primary`. Swap
to the new semantic tokens:

1. **`presentation/base/widgets/recipe-card.tsx:43`** — difficulty chip label.
   ```diff
   - <ThemedText variant="caption" style={{ color: colors.primaryText, fontWeight: '600' }}>
   + <ThemedText variant="caption" style={{ color: colors.onOverlay, fontWeight: '600' }}>
       {difficulty}
     </ThemedText>
   ```
   Leave the cuisine-badge label at line 38 unchanged — that one IS on `colors.primary`,
   so `colors.primaryText` is correct there.

2. **`presentation/base/widgets/checkbox-item.tsx:33`** — checkmark over `colors.success`.
   ```diff
   - {checked ? <Ionicons name="checkmark" size={16} color={colors.primaryText} /> : null}
   + {checked ? <Ionicons name="checkmark" size={16} color={colors.onSuccess} /> : null}
   ```

3. **`presentation/screens/tasks/task-list-screen.tsx:135`** — checkmark over `colors.success`.
   ```diff
   - <Ionicons name="checkmark" size={16} color={colors.primaryText} />
   + <Ionicons name="checkmark" size={16} color={colors.onSuccess} />
   ```

4. **`presentation/screens/tasks/task-detail-screen.tsx:73`** — large checkmark over `colors.success`.
   ```diff
   - <Ionicons name="checkmark" size={40} color={colors.primaryText} />
   + <Ionicons name="checkmark" size={40} color={colors.onSuccess} />
   ```

**Do NOT touch** `presentation/screens/recipes/recipe-detail-screen.tsx:152` (step-circle
number) — that text IS on `colors.primary`, so `colors.primaryText` is the correct
contracted token there. Verified ≥6.6:1 in every theme.

### For test-developer (Task #8) — contrast regression rules

Add a contrast-suite in `__tests__/` (or `application/__tests__/contrast.test.ts`) that
iterates `ALL_THEMES` × `['light', 'dark']` and asserts:

1. **Per-theme bg/text floor**:
   - dark: `contrastRatio(colors.background, colors.text) >= 11.0`
   - light: `contrastRatio(colors.background, colors.text) >= 14.0`

2. **Per-theme surf/text floor** (new — was untested):
   - dark: `contrastRatio(colors.surface, colors.text) >= 10.0`
   - light: `contrastRatio(colors.surface, colors.text) >= 15.0`

3. **Per-theme bg/surf separation** (new — guards card visibility regression):
   - dark: `contrastRatio(colors.background, colors.surface) >= 1.35`
   - light: `contrastRatio(colors.background, colors.surface) >= 1.04`

4. **Per-theme onSuccess pair** (new):
   - both variants: `contrastRatio(colors.success, colors.onSuccess) >= 4.5`

5. **Per-theme onOverlay pair simulated** (new — overlay sits on a worst-case white
   image pixel; assert white text passes against the resulting alpha-blended backdrop):
   - both variants: white-on-`#666666` ≥ 4.5 (effective backdrop after 0.6 alpha black
     overlay over `#FFFFFF`). Implement as a pure helper `simulateOverlayBackdrop(image,
     overlayHex, alpha)` that returns the blended hex, then assert
     `contrastRatio(colors.onOverlay, simulateOverlayBackdrop('#FFFFFF', '#000000', 0.6)) >= 4.5`.

6. **Sibling-distinctness regression** (new — the central bug we're fixing):
   - dark variants: for every sibling group below, assert that at least ONE of the
     following is true for each pair within the group:
     - `Math.abs(relativeLuminance(a.bg) - relativeLuminance(b.bg)) >= 0.0015`, OR
     - the per-theme `name` field declares them in different hue families (proxy:
       compare the dominant RGB channel — if argmax differs, hue family differs).
   - Sibling groups: `[crimson-ember, rose-quartz, coral-reef]`,
     `[amber-sunset, tangerine-dream]`, `[lime-zest, chartreuse-zap]`,
     `[emerald-garden, mint-breeze, teal-lagoon]`,
     `[violet-bloom, lavender-mist, royal-purple, indigo-night]`.

7. **`primaryText` sanity** (existing rule, keep): for every theme,
   `contrastRatio(colors.primary, colors.primaryText) >= 4.5`.

If any check fails, the test message must include the offending theme ID and the actual
ratio, so designers can correct without re-running the audit script.

---



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
