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
  /** A control dimmed to signal it is disabled. */
  disabled: 0.5 as number,
} as const;
