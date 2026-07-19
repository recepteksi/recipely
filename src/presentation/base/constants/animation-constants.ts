/**
 * Shared animation driver values.
 *
 * Scalars carry `as number` on purpose — see the widening note in
 * `@core/constants` `value-constants.ts`; literal types here would narrow
 * `useSharedValue` / `Animated.Value` call sites.
 */
export const AnimationConstants = {
  /**
   * Normalised driver range for `interpolate()` / `interpolateColor()`.
   * A shared value of 0 means "at rest", 1 means "fully applied".
   */
  progressRange: [0, 1] as readonly number[],
  /** Resting value of a normalised animation driver. */
  progressMin: 0 as number,
  /** Fully-applied value of a normalised animation driver. */
  progressMax: 1 as number,
} as const;
