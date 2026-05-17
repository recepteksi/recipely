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

### Key rules

- **Dependency rule**: layers only import downward, never upward.
- **One declaration per file** (class, interface, component). Barrel `index.ts` for re-exports.
- **Static values** in constants files (`infrastructure/constants/`, `presentation/base/theme/`).
- **i18n**: all user-visible strings via `t()` from `presentation/i18n/`.
- **Error handling**: `Result<T, Failure>` everywhere, no thrown exceptions.
- **Platform files**: `*.web.ts` / `*.ts` pairs use RN platform-extension resolution (e.g., `kv-store`).

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
