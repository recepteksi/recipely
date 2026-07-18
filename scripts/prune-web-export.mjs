#!/usr/bin/env node
/**
 * Removes co-located page-code HTML from a static web export.
 *
 * Page co-location (architecture.md §Presentation structure): the Metro-level
 * route context hides body/, items/, sheets/, hooks/, model/, shared/ and
 * __tests__/ files from the app's router, but `expo export` derives its HTML
 * page list from a raw file-system scan of `src/presentation/app/` and therefore
 * still emits a stray .html page per co-located file. Real pages are always
 * exported as `<segment>/index.html` (plus root `index.html`, `+special.html`,
 * and dynamic `[param].html`); everything else is pruned here.
 *
 * Usage: node scripts/prune-web-export.mjs [dist]
 */
import fs from 'node:fs';
import path from 'node:path';

const dist = process.argv[2] ?? 'dist';
if (!fs.existsSync(dist)) {
  console.error(`prune-web-export: '${dist}' does not exist`);
  process.exit(1);
}

// Static assets copied verbatim from public/ (legal/*.html, about/, …) are
// never co-located page strays — a file whose relative path also exists in
// public/ must survive the prune (Firebase rewrites point at them).
const publicDir = 'public';
const isPublicAsset = (p) =>
  fs.existsSync(path.join(publicDir, path.relative(dist, p)));

const keep = (base) => base === 'index.html' || base.startsWith('+') || base.startsWith('[');
let pruned = 0;
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (
      e.name.endsWith('.html') &&
      !keep(e.name) &&
      !(dir === dist && e.name === '_sitemap.html') &&
      !isPublicAsset(p)
    ) {
      fs.rmSync(p);
      pruned += 1;
    }
  }
};
walk(dist);

// Drop directories emptied by the prune.
const dropEmpty = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) dropEmpty(path.join(dir, e.name));
  }
  if (dir !== dist && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
};
dropEmpty(dist);

console.log(`prune-web-export: removed ${pruned} co-located page file(s) from ${dist}`);
