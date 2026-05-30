import { useEffect, useState } from 'react';

/**
 * Returns `false` during the server prerender and the first client render, then
 * flips to `true` after mount. Gate any value that differs between the static
 * export (no viewport, no `prefers-color-scheme`) and the live browser — e.g.
 * `useWindowDimensions()` or `useColorScheme()` — behind this so the first
 * client render reproduces the server HTML exactly and React can hydrate without
 * a text/markup mismatch (React error #418).
 */
export const useIsHydrated = (): boolean => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
};
