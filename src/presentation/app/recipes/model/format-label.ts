/** Formats a SCREAMING_SNAKE_CASE enum value to Title Case for display. */
export const formatLabel = (key: string): string =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
