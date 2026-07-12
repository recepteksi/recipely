/**
 * Custom expo-router route context enabling page co-location (architecture.md
 * §Presentation structure). metro.config.js aliases `expo-router/_ctx` to this
 * file, so ONLY the following files become routes:
 *
 *   - `index.tsx` at any depth        → the page component of its folder
 *   - `_layout.tsx` at any depth      → layouts
 *   - `+special.tsx` (e.g. +not-found), `[param].tsx`
 *
 * Everything else under `presentation/app/` (body/, items/, sheets/, hooks/,
 * model/, __tests__/, shared/, …) is co-located page code and is ignored by
 * the router. A new page is therefore always `app/<segment>/index.tsx`; a flat
 * `app/<segment>.tsx` file will NOT register (scripts/check-structure.mjs
 * flags loose files at the app root for this reason).
 *
 * The regex mirrors the stock `expo-router/_ctx` exclusions for `+api`,
 * `+middleware`, root `+html` / `+native-intent`, and platform suffixes.
 *
 * The app-dir argument MUST stay a hard-coded relative path, NOT
 * `process.env.EXPO_ROUTER_APP_ROOT`: @expo/cli resets the `routerRoot`
 * transform option to its default `'app'` for every file outside
 * `expo-router/_ctx*` / `expo-router/build/` (pruneCustomTransformOptions in
 * instantiateMetro.js, a cache-key optimisation), so in THIS file babel would
 * inline a path to the non-existent `<project>/app` folder — the context then
 * matches zero files and the router throws "No routes found" at runtime.
 */
export const ctx = require.context(
  '../app',
  true,
  /^\.\/(?!(?:.*\+api|\+middleware|\+(?:html|native-intent))\.[tj]sx?$)(?:.*\/)?(?:index|_layout|\+[\w-]+|\[[^/\]]+\])(?:\.(?:android|ios|native|web))?\.[tj]sx?$/,
  process.env.EXPO_ROUTER_IMPORT_MODE
);
