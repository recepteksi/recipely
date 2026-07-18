#!/usr/bin/env node
/**
 * Keeps the dev web deploy out of search engines.
 *
 * public/robots.txt is the production policy (allow all + sitemap) and is
 * copied verbatim into every export. The dev site (dev.recipely.net) must not
 * be indexed, so when the export was built with APP_VARIANT=development this
 * rewrites dist/robots.txt to disallow everything and drops the sitemap
 * (its URLs point at the production origin anyway). Complemented by the
 * X-Robots-Tag: noindex header on the app-recipely-dev hosting target in
 * firebase.json — robots.txt alone doesn't de-index already-discovered URLs.
 *
 * Usage: node scripts/apply-variant-robots.mjs [dist]
 */
import fs from 'node:fs';
import path from 'node:path';

const dist = process.argv[2] ?? 'dist';
if (!fs.existsSync(dist)) {
  console.error(`apply-variant-robots: '${dist}' does not exist`);
  process.exit(1);
}

if (process.env.APP_VARIANT !== 'development') {
  console.log('apply-variant-robots: production variant — robots.txt untouched');
  process.exit(0);
}

fs.writeFileSync(path.join(dist, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
fs.rmSync(path.join(dist, 'sitemap.xml'), { force: true });
console.log('apply-variant-robots: dev variant — robots.txt set to disallow-all, sitemap dropped');
