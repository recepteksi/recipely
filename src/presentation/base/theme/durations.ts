/**
 * Shared animation durations in milliseconds. Named per animation (not per
 * abstract "speed") so each value can be tuned against the platform transition
 * it must stay in sync with.
 */
export const durations = {
  // Root TabBar collapse/expand when navigating between tab and tab-less
  // routes — aligned with the native stack push/pop transition (~250ms) so
  // the bar finishes folding as the incoming screen lands.
  tabBarToggleMs: 250,
} as const;
