# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Agent workflow (use by default)

For any non-trivial task in this repo, use the subagent team in `.claude/agents/`
**without being asked** — the user should never have to say "use the agents." Each
`*.md` file there is a Claude Code subagent (YAML frontmatter, auto-discovered); delegate
with the matching `subagent_type` via the Agent tool. These agents also belong to the
persistent team `recipely-team` (`~/.claude/teams/recipely-team/config.json`) — pass
`team_name: "recipely-team"` when spawning or messaging so context persists across calls.
Skip the team only for genuinely trivial one-liners (a typo, a version bump, a single-line
config edit, a copy tweak). When in doubt, delegate.

### Token economy (mandatory — maximum work per token)

Every agent spawn starts cold and re-derives context; that is the expensive path. Rules:

1. **Explore once, brief completely.** The lead does (or delegates ONE) exploration pass,
   then hands each implementer a self-contained brief: exact file paths, verified APIs,
   the precise changes wanted. An agent prompt that forces re-discovery is a bug.
2. **Minimum spawns.** One implementer agent per task, and only when the change is large
   or genuinely parallel. Small/medium edits, i18n additions, test updates, and gate runs
   are done inline by the lead — no spawn.
3. **`test-developer` only for new harnesses or large suites.** Routine specs are written
   inline by whoever holds the context (lead or the same implementer, in the same spawn).
4. **`code-reviewer`: one pass, diff-scoped.** Point it at `git diff dev...HEAD` at the
   end; still blocking, but never multiple review rounds for style nits the gates catch.
5. **`ui-designer` only for a genuinely new visual surface**, not for reusing existing
   widgets/specs.
6. **No polling, no repetition.** Background agents notify on completion; don't re-ask,
   re-list, or re-read what is already in context.

### Roster

| Agent | Owns |
|-------|------|
| **ts-developer** | `domain` / `application` / `infrastructure` / `core` — entities, value objects, use cases, repositories, DTOs, mappers, DI, types. |
| **rn-developer** | `src/presentation/` UI — screens, widgets, expo-router routes, themed components, hooks. |
| **test-developer** | Jest + jest-expo tests for every new use case, repository, mapper, store, value object. |
| **ui-designer** | Research + `src/presentation/design-spec.md` (no production code). |
| **code-reviewer** | Read-only DDD / Clean Architecture / TS-strictness audit before merge. Blocks on any violation. |

### Pipelines

- **Feature** → (`ui-designer` first if it has a visual surface) → `ts-developer` and/or `rn-developer` → `test-developer` → `code-reviewer`
- **Bug fix** → `ts-developer` or `rn-developer` (reproduce → minimal fix → regression test) → `code-reviewer`

Both pipelines are subject to **Token economy** above: stages collapse into the lead or
into a single implementer whenever the context is already in hand.

Match each agent's tool capabilities to the work: read-only agents for research/review,
full-capability agents for implementation. Run agents in parallel when their files don't overlap.

### End-to-end git flow (run the whole thing without asking)

The user has authorized the full flow below **in this file**. Do not ask before branching,
committing, pushing, opening a PR, or merging **to `dev`** — just execute and report. The
only stops are explicit failures (lint / tsc / jest / check:structure red, `code-reviewer` requests
changes, a merge conflict you can't safely resolve) and the Exceptions below.

1. **Branch from `dev`**: `git checkout dev && git pull && git checkout -b <feat|fix|refactor|chore>/<name>`. Never edit `dev` or `main` directly.
2. **Implement** via the agent pipeline above. Clear, atomic, conventional-commit messages (`feat(scope):`, `fix(scope):`, …).
3. **Quality gate** — all must pass: `npm run lint`, `npx tsc --noEmit`, `npx jest` (at minimum the touched layer), `npm run check:structure`. Work is never "done" with a red gate.
4. **`code-reviewer` must approve** before merge. If it requests changes, loop back to the developer agent; never merge over a blocked review.
5. **Push and open a PR → `dev`**: `git push -u origin <branch>` then `gh pr create --base dev …`.
6. **Merge to `dev`**: `gh pr merge <pr> --squash --delete-branch`, then `git checkout dev && git pull`.
7. **Report** the PR # and the merged commit. Stop.

### Dev mobile builds are opt-in

A merge to `dev` does **not** ship an Android/iOS build. Lint, typecheck, tests and the
dev web deploy (dev.recipely.net) still run on every dev push; the Gradle APK and the
macOS IPA only run when explicitly asked for — the user gives the order, you never add
the flag on your own initiative:

- **Flag the merge commit**: `[dist]` (both platforms), `[dist:android]`, or `[dist:ios]`
  anywhere in the squash-merge message. CI reads the merge commit's message, so put it in
  the PR title or the `--squash` body.
- **Or trigger by hand**: `gh workflow run ci.yml --ref dev -f android=true -f ios=true`.

`IOS_CI_ENABLED` (repo variable) remains the iOS kill switch — `0` pauses iOS builds even
when one is requested. Production (`main`) distribution is unchanged: every push to `main`
tags a version and ships to Play internal + TestFlight.

### Exceptions (stop and ask)

- Promoting `dev → main` or any production web deploy (Firebase Hosting) — `main` is release-only.
- Dependency major-version bumps, Expo SDK upgrades, or native (`ios/`, `android/`) changes.
- Force-push, `git reset --hard` on shared branches, history rewrites, deleting work you didn't author.

## Commands

- `npm start` / `npx expo start` — start the Expo dev server (Metro).
- `npm run ios` / `npm run android` / `npm run web` — launch on a specific target.
- `npm run lint` — run `expo lint` (ESLint via `eslint-config-expo`).
- `npx tsc --noEmit` — type-check the project.
- `npx jest` — run all tests (Jest via `jest-expo`).

## Architecture

Recipely is an Expo SDK 54 + React Native 0.81 + React 19 app using **DDD / Clean Architecture** with **expo-router** file-based routing. See `architecture.md` for the full structure and coding rules.

TypeScript is strict. All five layers live under `src/`; the `@layer/*` aliases point at
`src/<layer>/`, `@/*` maps to the repo root, and `@assets/*` maps to the root `assets/`
folder (asset requires are centralised in `src/infrastructure/constants/assets.ts`).

### Layers (top to bottom)

- `src/presentation/` — All UI code lives here:
  - `src/presentation/app/` — **Pages live here** (expo-router root via `root: "src/presentation/app"` in `app.json`).
    Every routed page is a folder: `app/<segment>/index.tsx` is the route component (named export + `export default`),
    with its parts co-located in `body/`, `items/`, `sheets/`, `hooks/`, `model/`, `__tests__/` subfolders
    (multi-page features add `shared/`, e.g. `app/recipes/`). Only `index.tsx`, `_layout.tsx`, `+special` and
    `[param]` files register as routes — a custom route context (`src/presentation/navigation/route-context.js`,
    wired in `metro.config.js`) hides co-located files from the router, and `scripts/prune-web-export.mjs`
    strips their stray pages from static web exports (wired into `npm run build:web`).
  - `src/presentation/navigation/` — shell: route context, auth guard and share-import hooks, alarm overlay; `src/presentation/i18n/` — i18n, `src/presentation/base/` — widgets, theme, utils, `src/presentation/bootstrap/` — DI init.
- `src/application/` — Use cases, Zustand stores, DI registration, test fixtures.
- `src/domain/` — Entities, value objects, repository interfaces. Pure TypeScript, no framework deps.
- `src/infrastructure/` — Repository implementations, DTOs, mappers, HTTP client, storage, constants.
- `src/core/` — `Result<T,F>`, `Failure` hierarchy, `Entity`, DI container.

### Mandatory coding standards (see `architecture.md` §Coding Standards for full detail)

These rules apply to every agent and every contributor. A `code-reviewer` agent must flag any violation as
blocking.

1. **One declaration per file** — one class, interface, type alias, or component per `.ts`/`.tsx` file.
   Barrel `index.ts` files and a component's `Props` interface are the only exceptions.

2. **Class vs. function** — classes for use cases, repositories, HTTP clients, storage, domain entities.
   Pure stateless data transformers (mappers, formatters) are plain exported functions.

3. **JSDoc on classes and non-obvious public methods** — `/** ... */` when the signature alone doesn't
   communicate intent, edge cases, or failure modes. Trivial pass-throughs don't need a comment.

4. **Files must stay focused** — ~80 lines for entities, ~120 for use cases / mappers. Complex screens
   are split into sub-components in the same feature folder. No nested classes, no deep nesting (> 2 levels).

5. **No magic values** — hex codes, pixel numbers, and string keys are forbidden outside constants files:
   - API endpoints / limits → `src/infrastructure/constants/api.ts`
   - Storage keys → `src/infrastructure/constants/storage.ts`
   - Spacing / radii / font sizes / icon sizes → `src/presentation/base/theme/spacing.ts`
   - Colours → `src/presentation/base/theme/colors.ts` / `themes.ts`

6. **StyleSheet.create() for static styles** — inline style objects are forbidden for static values.
   Dynamic portions may be inline; combine with `[styles.base, { color: dynamic }]`.

7. **Component props interface** — every component's props typed as `ComponentNameProps`, exported,
   placed above the component in the same file.

8. **Custom hooks** — prefix `use`, one hook per file, no store state passed as props.

9. **FlatList keyExtractor** — always stable, never the array index for mutable lists.

10. **Accessibility** — every `Pressable` / `TouchableOpacity` must have `accessibilityRole` and
    `accessibilityLabel` (when the visual label is not plain text).

11. **i18n** — all user-visible strings via `t()` from `src/presentation/i18n/`. Minimum en + tr in sync.

12. **Error handling** — `Result<T, Failure>` everywhere; no thrown exceptions in domain / application code.

13. **Platform files** — `*.web.ts` / `*.ts` pairs use RN platform-extension resolution (e.g., `kv-store`).
    Shared types between the pair live in one separate file — never declared twice.

14. **File placement** — each routed page owns `src/presentation/app/<segment>/` with its route component in
    `index.tsx` and parts in `body/` / `items/` / `sheets/` / `hooks/` / `model/` / `__tests__/` subfolders
    (co-located files MUST sit in one of those folders — `check:structure` enforces it); shared widgets live
    in a `src/presentation/base/widgets/<category>/` folder (never loose at the widgets root); a widget used by
    only one page lives in that page's folder. Types extracted from a page file go to that page's `model/`;
    in `base/*` they become a sibling file. New routes are always `app/<segment>/index.tsx` — a flat
    `app/<segment>.tsx` will NOT register.

15. **Imports** — always the `@layer/...` alias (`@presentation/...`, `@domain/...`, …). Relative `./`
    imports are allowed only inside barrel `index.ts` files. Layer line: presentation → application/domain/core,
    never infrastructure (exceptions: `src/infrastructure/constants/*`, `src/presentation/bootstrap/`, `*/di/` wiring).

16. **Structure gate** — `npm run check:structure` enforces rules 1, 8, 14, 15 mechanically and must be
    green before any commit/PR. Its `KNOWN_DEBT` list only shrinks; never add to it without user approval.

17. **Ports over direct infrastructure** — presentation/application consume infrastructure capabilities
    (storage, notifications, audio, …) ONLY through port interfaces resolved via DI, following the
    repository-interface pattern (Evans 2003 p.55: infrastructure serves upper layers as SERVICES behind
    interfaces). A new direct `@infrastructure` import is always blocking — never "temporarily" via
    `KNOWN_DEBT`; that list only shrinks and its target is zero.

18. **Smart-UI guard (screen size)** — a routed `index.tsx` is composition/orchestration only: target
    ≤ ~200 lines, zero business rules. Any `.tsx` over 300 lines is a blocking review finding (i18n
    dictionaries exempt). A business rule discovered while editing UI moves down to application/domain
    in the same PR — it never stays in the component (Evans 2003 p.57, Smart UI anti-pattern).

19. **OOP & rich domain** — behavior lives with the data it belongs to: invariants and derivations are
    entity / value-object methods (the `Recipe.create()` pattern), not helper functions scattered in
    stores or components. Encapsulation is mandatory: `private` constructor + static `create(): Result`,
    `private readonly` fields, no public setters. Entities carry only identity-intrinsic state —
    viewer-dependent flags belong in read models, not new entity props (Evans 2003 p.67). A primitive
    that forms a "conceptual whole" and carries rules is promoted to a Value Object instead of being
    re-validated in two places (Evans 2003 p.71).

20. **Aggregate boundaries** — every domain entity is declared root-or-member in the Aggregates table in
    `architecture.md`; a PR adding an entity must update that table. Cross-aggregate references are by
    id only, never object references (Evans 2003 p.89-93).

### Pre-commit quality gate

Husky runs on every `git commit`:

- **lint-staged** → `eslint --fix` on staged `.ts` / `.tsx` files (blocks on unfixed ESLint errors).
- **tsc --noEmit** → full project type check (blocks on type errors).
- **check:structure** → `scripts/check-structure.mjs` (blocks on declaration-per-file, layer, import-style,
  and widget-placement violations — see `architecture.md` §Pre-Commit Quality Gate).

Emergency bypass: `git commit --no-verify` (document the reason in the commit message).

### External API

DummyJSON (`https://dummyjson.com`) — free, public, zero configuration.

Entry point is `expo-router/entry` (set in `package.json` `main`). App config lives in `app.json`.

## Team & Workflow

The agent team and the end-to-end git flow are defined once, at the top of this file —
see **[Agent workflow (use by default)](#agent-workflow-use-by-default)**. That section is
authoritative: use the agents by default without being asked, run the branch → implement →
gate → review → PR-to-`dev` → merge flow without asking, and stop only on the listed
Exceptions. The agent roster and per-agent rules also live in `.claude/agents/` (see
`.claude/agents/INDEX.md`) and `WORKFLOW.md` elaborates the step-by-step.
