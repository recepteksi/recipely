import { t } from '@presentation/i18n';

/**
 * Formats a past date as a short relative "time ago" string in the active
 * locale (e.g. "just now", "5m ago", "2h ago", "3d ago"). Future dates and
 * clock skew are clamped to zero so they never render a negative duration.
 */
export const formatTimeAgo = (date: Date): string => {
  const r = t().relativeTime;
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return r.justNow;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return r.minutesAgo.replace('{n}', String(minutes));
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return r.hoursAgo.replace('{n}', String(hours));
  const days = Math.floor(hours / 24);
  return r.daysAgo.replace('{n}', String(days));
};
