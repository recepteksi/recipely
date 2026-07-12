#!/usr/bin/env node
/**
 * Structural gate for the Recipely codebase. Enforces:
 *   A. One declaration per file (architecture.md §1) and one hook per file (§8).
 *   B. Layer dependency direction (DDD layered architecture):
 *      core → nothing, domain → core, application → domain/core,
 *      presentation → application/domain/core. Infrastructure is reachable only
 *      from the composition root, `infrastructure/constants/*`, or via DI.
 *   C. Alias-only imports (`@layer/...`); `./` allowed only in barrel index.ts.
 *   D. No loose files at the base/widgets root (category folders only).
 *
 * KNOWN_DEBT entries are pre-existing violations tolerated until burned down.
 * Adding a NEW entry to KNOWN_DEBT requires explicit user approval in review.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
// Layer folders live under src/; all paths below (files, KNOWN_DEBT keys,
// reported violations) are relative to SRC so the layer logic stays src-free.
const SRC = path.join(ROOT, 'src');
const LAYERS = ['core', 'domain', 'application', 'infrastructure', 'presentation'];
const errors = [];

/** Pre-existing layer-rule violations. Burn down; never grow. */
const KNOWN_DEBT = new Set([]);

const ALLOWED_IMPORTS = {
  core: ['@core'],
  domain: ['@core', '@domain'],
  application: ['@core', '@domain', '@application'],
  infrastructure: ['@core', '@domain', '@infrastructure'],
  presentation: ['@core', '@domain', '@application', '@presentation'],
};

const files = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(e.name) && !e.name.endsWith('.d.ts')) files.push(path.relative(SRC, p));
  }
};
for (const l of LAYERS) if (fs.existsSync(path.join(SRC, l))) walk(path.join(SRC, l));

const isTest = (f) => /__tests__|\.test\.tsx?$/.test(f);
const isBarrel = (f) => path.basename(f) === 'index.ts';

for (const file of files) {
  const src = fs.readFileSync(path.join(SRC, file), 'utf8');
  const layer = file.split(path.sep)[0];

  // --- B + C: import rules -------------------------------------------------
  const importRe = /from\s+['"]([^'"]+)['"]/g;
  for (const m of src.matchAll(importRe)) {
    const spec = m[1];
    if (spec.startsWith('../')) {
      errors.push(`${file}: relative parent import '${spec}' — use the @layer alias`);
    } else if (spec.startsWith('./') && !isBarrel(file)) {
      errors.push(`${file}: relative import '${spec}' — use the @layer alias`);
    }
    const target = LAYERS.map((l) => `@${l}`).find((a) => spec === a || spec.startsWith(a + '/'));
    if (!target) continue;
    const allowed = ALLOWED_IMPORTS[layer] ?? [];
    if (allowed.includes(target)) continue;
    // Composition-root exception: DI wiring modules assemble across layers.
    if (/^(application|infrastructure)\/di\//.test(file)) continue;
    // Sanctioned exceptions to the layer line:
    if (target === '@infrastructure') {
      if (spec.startsWith('@infrastructure/constants/')) continue; // CLAUDE.md rule 5
      if (file.startsWith('presentation/bootstrap/')) continue; // composition root
      if (isTest(file)) continue; // tests may mock infrastructure modules
      if (KNOWN_DEBT.has(`${file} -> ${spec}`)) continue;
    }
    errors.push(`${file}: layer violation — ${layer} may not import '${spec}'`);
  }

  // --- A: one declaration per file ------------------------------------------
  if (isTest(file) || isBarrel(file)) continue;
  const declRe = /^export\s+(?:default\s+)?(interface|type|class|enum|abstract class|const|function)\s+([A-Za-z0-9_]+)/gm;
  const decls = [...src.matchAll(declRe)].map((m) => ({ kind: m[1].replace('abstract ', ''), name: m[2] }));
  const names = new Set(decls.map((d) => d.name));
  const classes = decls.filter((d) => d.kind === 'class');
  const comps = file.endsWith('.tsx')
    ? decls.filter(
        (d) =>
          (d.kind === 'const' || d.kind === 'function') &&
          /^[A-Z]/.test(d.name) &&
          !/^[A-Z0-9_]+$/.test(d.name) &&
          // React context objects (`const XContext = createContext(...)`) are not components.
          !new RegExp(`const\\s+${d.name}\\s*(:[^=]+)?=\\s*createContext`).test(src),
      )
    : [];
  const hooks = decls.filter((d) => (d.kind === 'const' || d.kind === 'function') && /^use[A-Z]/.test(d.name));

  let typeLike = decls.filter((d) => d.kind === 'interface' || d.kind === 'type' || d.kind === 'enum');
  // Exception: ComponentNameProps alongside exactly one component.
  if (comps.length === 1) typeLike = typeLike.filter((d) => d.name !== `${comps[0].name}Props`);
  // Exception: helper types alongside a class (architecture.md §1, exception 3).
  if (classes.length >= 1) typeLike = [];
  // Exception: same-name const+type merge, and unions derived via `typeof <local const>`.
  typeLike = typeLike.filter((d) => {
    if (d.kind !== 'type') return true;
    const body = new RegExp(`^export\\s+type\\s+${d.name}\\b[^=]*=([\\s\\S]*?)(;|$)`, 'm').exec(src)?.[1] ?? '';
    const derived = [...body.matchAll(/typeof\s+([A-Za-z0-9_]+)/g)].some((t) => names.has(t[1]));
    const merged = decls.some((o) => o !== d && o.kind === 'const' && o.name === d.name);
    return !derived && !merged;
  });

  const primaryCount = typeLike.length + classes.length + Math.max(comps.length, 0);
  if (primaryCount > 1) {
    errors.push(`${file}: one-declaration-per-file violation — ${[...typeLike, ...classes, ...comps].map((d) => `${d.kind} ${d.name}`).join(', ')}`);
  }
  if (hooks.length > 1) {
    errors.push(`${file}: one-hook-per-file violation — ${hooks.map((h) => h.name).join(', ')}`);
  }
  if (hooks.length >= 1 && comps.length >= 1) {
    errors.push(`${file}: hook and component share a file — extract ${hooks.map((h) => h.name).join(', ')}`);
  }
  if (typeLike.length >= 1 && (hooks.length >= 1 || (classes.length === 0 && decls.some((d) => (d.kind === 'const' || d.kind === 'function') && !typeLike.includes(d) && !comps.includes(d) && !/^[A-Z0-9_]+$/.test(d.name))))) {
    errors.push(`${file}: type/interface shares a file with runtime code — move ${typeLike.map((d) => `${d.kind} ${d.name}`).join(', ')} to its own file`);
  }

  // --- D: widgets root must stay categorized --------------------------------
  if (/^presentation\/base\/widgets\/[^/]+\.(ts|tsx)$/.test(file)) {
    errors.push(`${file}: loose file at base/widgets root — place it in a category folder`);
  }

  // --- E: app/ co-location convention ----------------------------------------
  // The custom route context (presentation/navigation/route-context.js) only
  // registers index/_layout/+special/[param] files, so a flat app/<page>.tsx
  // would silently NOT become a route. Co-located page code must live in the
  // convention subfolders so tooling (web-export prune) can recognize it.
  if (file.startsWith('presentation/app/')) {
    const rel = file.slice('presentation/app/'.length);
    const base = path.basename(rel).replace(/\.(ts|tsx)$/, '');
    const isRouteFile = /^(index|_layout|\+[\w-]+|\[[^/\]]+\])(\.(android|ios|native|web))?$/.test(base) && rel.endsWith('.tsx');
    const inConventionFolder = /(^|\/)(body|items|sheets|hooks|model|shared|__tests__)\//.test(rel);
    // An index/_layout file INSIDE a convention folder would still match the
    // route-context regex and silently register as a route — never allow it.
    if (inConventionFolder && /^(index|_layout|\+|\[)/.test(base)) {
      errors.push(`${file}: route-shaped filename inside a co-location folder would register as a route — rename it`);
    }
    if (!isRouteFile && !inConventionFolder) {
      errors.push(
        rel.includes('/')
          ? `${file}: co-located page code must live in body/, items/, sheets/, hooks/, model/, shared/, or __tests__/`
          : `${file}: flat file at the app root will not register as a route — use app/<segment>/index.tsx`,
      );
    }
  }
}

if (errors.length) {
  console.error(`check:structure — ${errors.length} violation(s):\n`);
  for (const e of [...new Set(errors)].sort()) console.error('  ' + e);
  process.exit(1);
}
console.log('check:structure — OK');
