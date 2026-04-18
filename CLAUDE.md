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
