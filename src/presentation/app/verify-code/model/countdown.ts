export const SECOND_MS = 1000;
const SECONDS_PER_MINUTE = 60;

/** Whole seconds until `iso`, floored at 0. Empty/invalid → 0. */
export const computeRemaining = (iso: string): number => {
  if (iso.length === 0) return 0;
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return 0;
  return Math.max(0, Math.round((ms - Date.now()) / SECOND_MS));
};

/** Formats a second count as `M:SS`. */
export const formatCountdown = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
