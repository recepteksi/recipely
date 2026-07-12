/**
 * A single, localized taxonomy entry served by the backend catalog — used for
 * both cuisines and categories. `key` is the stable enum string persisted on a
 * recipe (e.g. `TURKISH`, `BREAKFAST`); `name` is localized via the request's
 * `Accept-Language`; `emoji` is the display glyph.
 */
export interface TaxonomyItem {
  key: string;
  name: string;
  emoji: string;
}
