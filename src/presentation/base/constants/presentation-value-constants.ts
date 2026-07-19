/**
 * Presentation-layer counts and limits that are not design measurements.
 *
 * Measurements (spacing, radii, font/icon sizes) belong to
 * `@presentation/base/theme/spacing`; structural literals (`0`, `''`) belong to
 * `@core/constants`. This file is for UI quantities that are neither — how many
 * of a thing a component renders.
 *
 * Values carry `as number` on purpose: literal types would narrow call sites
 * that feed them into state or arithmetic (see `@core/constants`
 * `value-constants.ts`).
 */
export const PresentationValueConstants = {
  /** Tags shown on a recipe card before the rest are dropped. */
  recipeCardTagLimit: 2 as number,
  /** Segments in the password-strength meter (weak → strong). */
  passwordStrengthSegments: 4 as number,
  /** Total-time filter chip options, in minutes; `0` means "any". */
  filterTimeOptionsMinutes: [0, 15, 30, 45, 60, 90] as readonly number[],
} as const;
