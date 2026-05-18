# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` / `npx expo start` — start the Expo dev server (Metro).
- `npm run ios` / `npm run android` / `npm run web` — launch on a specific target.
- `npm run lint` — run `expo lint` (ESLint via `eslint-config-expo`).
- `npx tsc --noEmit` — type-check the project.
- `npx jest` — run all tests (Jest via `jest-expo`).

## Architecture

Recipely is an Expo SDK 54 + React Native 0.81 + React 19 app using **DDD / Clean Architecture** with **expo-router** file-based routing. See `architecture.md` for the full structure and coding rules.

TypeScript is strict; the `@/*` path alias maps to the repo root.

### Layers (top to bottom)

- `presentation/` — All UI code lives here:
  - `presentation/app/` — **Thin re-exports only** for expo-router file-based routing (configured via `root: "presentation/app"` in `app.json`).
  - `presentation/screens/` — Screen components, `presentation/navigation/` — root layout, `presentation/i18n/` — i18n, `presentation/base/` — widgets, theme, utils, `presentation/bootstrap/` — DI init.
- `application/` — Use cases, Zustand stores, DI registration, test fixtures.
- `domain/` — Entities, value objects, repository interfaces. Pure TypeScript, no framework deps.
- `infrastructure/` — Repository implementations, DTOs, mappers, HTTP client, storage, constants.
- `core/` — `Result<T,F>`, `Failure` hierarchy, `Entity`, `ValueObject`, DI container.

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
   - API endpoints / limits → `infrastructure/constants/api.ts`
   - Storage keys → `infrastructure/constants/storage.ts`
   - Spacing / radii / font sizes / icon sizes → `presentation/base/theme/spacing.ts`
   - Colours → `presentation/base/theme/colors.ts` / `themes.ts`

6. **StyleSheet.create() for static styles** — inline style objects are forbidden for static values.
   Dynamic portions may be inline; combine with `[styles.base, { color: dynamic }]`.

7. **Component props interface** — every component's props typed as `ComponentNameProps`, exported,
   placed above the component in the same file.

8. **Custom hooks** — prefix `use`, one hook per file, no store state passed as props.

9. **FlatList keyExtractor** — always stable, never the array index for mutable lists.

10. **Accessibility** — every `Pressable` / `TouchableOpacity` must have `accessibilityRole` and
    `accessibilityLabel` (when the visual label is not plain text).

11. **i18n** — all user-visible strings via `t()` from `presentation/i18n/`. Minimum en + tr in sync.

12. **Error handling** — `Result<T, Failure>` everywhere; no thrown exceptions in domain / application code.

13. **Platform files** — `*.web.ts` / `*.ts` pairs use RN platform-extension resolution (e.g., `kv-store`).

### Pre-commit quality gate

Husky runs on every `git commit`:

- **lint-staged** → `eslint --fix` on staged `.ts` / `.tsx` files (blocks on unfixed ESLint errors).
- **tsc --noEmit** → full project type check (blocks on type errors).

Emergency bypass: `git commit --no-verify` (document the reason in the commit message).

### External API

DummyJSON (`https://dummyjson.com`) — free, public, zero configuration.

Entry point is `expo-router/entry` (set in `package.json` `main`). App config lives in `app.json`.

## Team & Workflow

This project has a persistent agent team configured at `~/.claude/teams/recipely-team/config.json`.

**Default workflow for every non-trivial task:**

1. Start from `dev` and pull latest: `git checkout dev && git pull`.
2. Create a feature branch off `dev`: `git checkout -b feat/<short-name>` (or `fix/`, `refactor/`, `chore/`).
3. Do all work on the feature branch.
4. When done, run `npm run lint` and `npx tsc --noEmit` and `npx jest` for the touched layer.
5. Merge back to `dev` (or open a PR targeting `dev`, never `main`).
6. Never commit directly to `dev` or `main`.

**Preferred agents for the team `recipely-team`:**

- `ts-developer` — domain / application / infrastructure / core (entities, use cases, repositories, DTOs, mappers, DI, types).
- `rn-developer` — `presentation/` UI (screens, widgets, expo-router, themed components).
- `test-developer` — Jest + jest-expo tests for every new use case, repository, mapper, store, value object.
- `ui-designer` — research + `presentation/design-spec.md` updates (no production code).
- `code-reviewer` — independent DDD / Clean Architecture / TypeScript-strictness review after a batch of changes.

When a task starts, spawn (or message) the relevant team members via the Agent / SendMessage tool with `team_name: "recipely-team"`. Match the agent's tool capabilities to the work: read-only agents for research, full-capability agents for implementation.
