/** Formats a second count as zero-padded MM:SS (e.g. 90 → "01:30"). */
import { ValueConstants } from '@core/constants';

export const formatTimer = (totalSeconds: number): string => {
  const safe = Math.max(ValueConstants.zero, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};
