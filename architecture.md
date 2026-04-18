# Architecture

Recipely follows **Domain-Driven Design (DDD)** with a **Layered Architecture** inspired by Eric Evans' _Domain-Driven Design: Tackling Complexity in the Heart of Software_ (2003).

## Layer Overview

```
presentation/
  app/                Thin re-exports only (expo-router file-based routing)
  screens/            Screen components
  navigation/         Root layout
  i18n/               Internationalization
  base/               Widgets, theme, utils
  bootstrap/          DI init, stores context
  |
application/          Use cases, state stores, DI registration
  |
domain/               Entities, value objects, repository interfaces
  |
infrastructure/       Repository implementations, DTOs, mappers, network, storage
  |
core/                 Framework-agnostic building blocks (Result, Failure, Entity, DI)
```

### Dependency Rule

Each layer may only depend on layers **below** it. Never import upward:

- `domain/` never imports from `application/`, `infrastructure/`, or `presentation/`.
- `application/` never imports from `infrastructure/` or `presentation/`.
- `infrastructure/` never imports from `presentation/`.
- `core/` imports from nothing else in the project.

The `presentation/app/` directory exists solely for expo-router's file-based routing (configured via `"root": "presentation/app"` in `app.json`). Every file in `presentation/app/` must be a **single-line re-export** from `presentation/screens/` or `presentation/navigation/`. No logic, no styling, no imports beyond the re-export.

---

## Layer Details

### `core/`

Framework-agnostic building blocks shared across all layers.

| Module | Purpose |
|--------|---------|
| `core/result/result.ts` | `Result<T, F>` monad (`ok` / `fail`) for typed error handling |
| `core/failure/` | `Failure` base class + individual subclasses (one per file) with barrel `index.ts` |
| `core/entity/entity.ts` | Base `Entity<Props>` with identity equality |
| `core/value-object/value-object.ts` | Base `ValueObject<Props>` with structural equality |
| `core/di/container.ts` | `Container` class (register/resolve with lazy singletons) |
| `core/di/container-instance.ts` | Singleton `container` instance |
| `core/di/tokens.ts` | DI token symbols |

### `domain/`

The heart of the application. Pure TypeScript, no framework dependencies.

- **Entities**: `Recipe`, `Task`, `AuthSession`, `User` — extend `Entity<Props>` with factory `create()` methods returning `Result`.
- **Value Objects**: `Email` — extends `ValueObject<Props>` with validation.
- **Enums / Literals**: `RecipeState`, `TaskState`, `WorkType` — typed string unions in their own files.
- **Repository Interfaces**: `IRecipeRepository`, `ITaskRepository`, `IAuthRepository` — define contracts; implementations live in `infrastructure/`.

### `application/`

Orchestrates domain logic through use cases and manages UI state.

- **Use Cases**: Single-responsibility classes with an `execute(...)` method returning `Promise<Result<T, Failure>>`.
  - `SignInUseCase`, `SignOutUseCase`, `GetSessionUseCase`
  - `ListRecipesUseCase`, `GetRecipeUseCase`
  - `ListTasksUseCase`, `GetTaskUseCase`
- **Stores**: Zustand stores that call use cases and expose state to the presentation layer.
  - `authStore`, `recipeListStore`, `recipeDetailStore`, `taskListStore`, `taskDetailStore`
- **DI Registration**: `application/di/register.ts` wires use cases and stores into the container.
- **Test Fixtures**: `application/__fixtures__/` contains fakes (e.g., `FakeAuthRepository`) for unit tests.

### `infrastructure/`

Implements domain interfaces with concrete I/O.

- **Repositories**: `AuthRepository`, `RecipeRepository`, `TaskRepository` — implement domain interfaces using `HttpClient`.
- **DTOs**: One interface per file (`RecipeDto`, `TodoDto`, `RecipesListDto`, `TodosListDto`, `DummyJsonLoginDto`).
- **Mappers**: Pure functions (`toRecipe`, `toTask`, `toUser`) that convert DTOs to domain entities, returning `Result`.
- **Network**: `HttpClient` wraps Axios with typed error mapping to `Failure` subclasses.
- **Storage**: `SecureTokenStorage` for session persistence; platform-specific `kv-store.ts` / `kv-store.web.ts` (React Native file extension resolution).
- **Constants**: `infrastructure/constants/api.ts` (URLs, limits) and `storage.ts` (storage keys).
- **DI Registration**: `infrastructure/di/register.ts` wires repositories and HTTP client into the container.

### `presentation/`

All UI and user-facing logic.

- **Screens**: One component per file in `presentation/screens/{feature}/`.
- **Navigation**: `presentation/navigation/root-layout.tsx` — the real root layout with Stack navigator and i18n-driven titles.
- **Bootstrap**: `AppBootstrap` (DI init + hydration), `StoresProvider` (React context for stores).
- **Widgets**: Reusable UI components in `presentation/base/widgets/` (`ThemedText`, `ThemedView`, `ScreenContainer`, `PrimaryButton`, `StateView`).
- **Theme**: `presentation/base/theme/colors.ts` (light/dark palettes), `spacing.ts` (spacing, radii, fontSizes).
- **i18n**: `presentation/i18n/` — `en.ts` (English), `tr.ts` (Turkish), `i18n.ts` (locale detection via `expo-localization`), barrel `index.ts`.
- **Utils**: `presentation/base/utils/format-date.ts`.

---

## Coding Rules

### One declaration per file

Each file contains exactly **one** class, interface, type alias, or component. The only exceptions are barrel `index.ts` files that re-export.

### Static values in constants files

Hardcoded values (URLs, storage keys, limits, magic numbers) must live in dedicated constants files:

- `infrastructure/constants/api.ts` — API endpoints, pagination limits
- `infrastructure/constants/storage.ts` — storage keys
- `presentation/base/theme/spacing.ts` — spacing, border radii, font sizes
- `presentation/base/theme/colors.ts` — color palettes

### Internationalization (i18n)

- Minimum two languages: **English (en)** and **Turkish (tr)**.
- All user-visible strings in `presentation/` must come from `t()` (never hardcoded).
- Translation files: `presentation/i18n/en.ts`, `presentation/i18n/tr.ts`.
- Locale detection via `expo-localization` at app startup (`initLocale()`).

### Colors and sizes in theme files

- Colors: `presentation/base/theme/colors.ts` with light/dark schemes.
- Spacing, radii, font sizes: `presentation/base/theme/spacing.ts`.
- Screens reference these constants instead of inline numbers.

### Error handling

- Use `Result<T, Failure>` everywhere instead of throwing exceptions.
- Domain validation returns `Result` from `create()` factory methods.
- Infrastructure maps HTTP errors to typed `Failure` subclasses (`NetworkFailure`, `UnauthorizedFailure`, `NotFoundFailure`, `UnknownFailure`).

### Testing

- Tests live next to the code in `__tests__/` directories.
- Domain and core tests are pure unit tests with no mocks.
- Application tests use fakes (`FakeAuthRepository`) for repository dependencies.
- Infrastructure mapper tests validate DTO-to-entity mapping.
- Test runner: Jest via `jest-expo`.

---

## External Dependencies

| Package | Purpose |
|---------|---------|
| `expo` (SDK 54) | Framework |
| `expo-router` | File-based routing |
| `expo-localization` | Device locale detection |
| `expo-secure-store` | Secure key-value storage (native) |
| `expo-web-browser` | In-app browser for external links |
| `axios` | HTTP client |
| `zustand` | State management |

## API

DummyJSON (`https://dummyjson.com`) — free, public, zero configuration.

- Auth: `POST /auth/login`
- Recipes: `GET /recipes`, `GET /recipes/:id`
- Todos: `GET /todos`, `GET /todos/:id`
