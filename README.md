# Recipely

A cross-platform mobile app built with **React Native** and **Expo**, following **Domain-Driven Design (DDD)** and **Clean Architecture** principles.

Browse recipes, view ingredients and cooking instructions, and manage tasks -- all powered by the free [DummyJSON](https://dummyjson.com) API.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 54, React Native 0.81, React 19 |
| Language | TypeScript (strict mode) |
| Navigation | expo-router (file-based routing) |
| State Management | Zustand |
| HTTP | Axios |
| Architecture | DDD / Clean Architecture |
| i18n | expo-localization (EN, TR) |
| Testing | Jest + jest-expo |

## Architecture

```
presentation/
  app/              Thin route re-exports (expo-router)
  screens/          Screen components
  navigation/       Root layout
  i18n/             Internationalization (EN + TR)
  base/             Shared widgets, theme, utils
  bootstrap/        DI initialization, stores context

application/        Use cases, Zustand stores, DI registration

domain/             Entities, value objects, repository interfaces

infrastructure/     Repository implementations, DTOs, mappers, HTTP client, storage

core/               Result monad, Failure hierarchy, Entity/ValueObject base, DI container
```

**Dependency rule**: each layer only imports from layers below it, never upward.

See [architecture.md](architecture.md) for full details and coding rules.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run

```bash
# Start Expo dev server
npm start

# Or target a specific platform
npm run web
npm run ios
npm run android
```

### Test Credentials

The app uses DummyJSON's auth API. Use these credentials to log in:

```
Username: emilys
Password: emilyspass
```

### Verify

```bash
# Type-check
npx tsc --noEmit

# Run tests
npx jest

# Lint
npm run lint
```

## Project Rules

- One class/interface/component per file
- All user-visible strings via `t()` (i18n)
- Static values in dedicated constants files
- `Result<T, Failure>` for error handling (no thrown exceptions)
- Platform-specific files use `.web.ts` / `.ts` extension resolution

## License

MIT
