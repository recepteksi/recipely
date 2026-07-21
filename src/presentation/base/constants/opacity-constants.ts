/**
 * Named opacity levels for interactive and disabled states, so components never
 * hard-code a bare alpha like `0.5`. Measurements live in `theme/spacing`,
 * colors in `theme`; this file is only for opacity. Grows as new semantic
 * levels are needed — reuse the closest existing name before adding one.
 *
 * Values carry `as number` on purpose so call sites that feed them into
 * animated/interpolated styles are not narrowed to a literal type.
 */
export const OpacityConstants = {
  /** Fully opaque — the default enabled / unpressed state. */
  full: 1 as number,
  /** An inactive control (e.g. an unreached step, a not-yet-active check). */
  inactive: 0.4 as number,
  /** A faintly disabled control, softer than {@link disabled}. */
  disabledSoft: 0.45 as number,
  /** A control dimmed to signal it is disabled. */
  disabled: 0.5 as number,
  /** A more strongly dimmed disabled / checked-off control. */
  disabledStrong: 0.6 as number,
  /** A strongly darkened pressed state. */
  pressedStrong: 0.7 as number,
  /** The standard pressed-feedback dimming for a tappable surface. */
  pressed: 0.75 as number,
  /** A gently dimmed pressed state, lighter than {@link pressed}. */
  pressedGentle: 0.8 as number,
  /** Hero subtitle / muted text sitting over an image or gradient. */
  subtitle: 0.82 as number,
  /** A subtle pressed state, only slightly dimmed. */
  pressedSubtle: 0.85 as number,
  /** A barely-there pressed / muted state. */
  pressedFaint: 0.88 as number,
  /** Nearly opaque — a whisper of transparency. */
  nearOpaque: 0.9 as number,
  /** Nearly opaque, a touch more solid than {@link nearOpaque}. */
  nearOpaqueStrong: 0.92 as number,
  /** The faintest decorative scrim / overlay tint. */
  scrimFaint: 0.12 as number,
  /** A light decorative scrim / overlay tint. */
  scrimLight: 0.16 as number,
  /** A standard decorative scrim / overlay tint. */
  scrim: 0.18 as number,
} as const;
