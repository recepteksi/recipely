# Architecture

Recipely follows **Domain-Driven Design (DDD)** with a **Layered Architecture** inspired by Eric Evans'
_Domain-Driven Design: Tackling Complexity in the Heart of Software_ (2003).

---

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

- `domain/` — never imports from `application/`, `infrastructure/`, or `presentation/`.
- `application/` — never imports from `infrastructure/` or `presentation/`.
- `infrastructure/` — never imports from `presentation/`.
- `core/` — imports nothing else from the project.

`presentation/app/` exists solely for expo-router's file-based routing (`"root": "presentation/app"` in
`app.json`). Every file inside must be a **single-line re-export** from `presentation/screens/` or
`presentation/navigation/`. No logic, no styling, no extra imports.

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

- **Entities** — `Recipe`, `AuthSession`, `User`, `Comment` extend `Entity<Props>` with factory `create()`
  methods returning `Result`.
- **Value Objects** — `Email` extends `ValueObject<Props>` with validation.
- **Enums / Literals** — typed string unions in their own files.
- **Repository Interfaces** — `IRecipeRepository`, `IAuthRepository`, `ICommentRepository` define contracts;
  implementations live in `infrastructure/`.

### `application/`

Orchestrates domain logic through use cases and manages UI state.

- **Use Cases** — Single-responsibility classes with an `execute(...)` method returning
  `Promise<Result<T, Failure>>`.
- **Stores** — Zustand stores that call use cases and expose state to the presentation layer.
- **DI Registration** — `application/di/register.ts` wires use cases and stores into the container.
- **Test Fixtures** — `application/__fixtures__/` contains fakes (e.g., `FakeAuthRepository`) for unit tests.

### `infrastructure/`

Implements domain interfaces with concrete I/O.

- **Repositories** — `AuthRepository`, `RecipeRepository` implement domain interfaces using `HttpClient`.
- **DTOs** — One interface per file (`RecipeDto`, `RecipesListDto`, …).
- **Mappers** — Pure functions (`toRecipe`, `toUser`) that convert DTOs to domain entities, returning
  `Result`. Mappers are stateless and have no dependencies, so plain exported functions are idiomatic.
- **Network** — `HttpClient` wraps Axios with typed error mapping to `Failure` subclasses.
- **Storage** — `SecureTokenStorage`; platform-specific `kv-store.ts` / `kv-store.web.ts`.
- **Constants** — `infrastructure/constants/api.ts` (URLs, limits) and `storage.ts` (storage keys).
- **DI Registration** — `infrastructure/di/register.ts` wires repositories and HTTP client.

### `presentation/`

All UI and user-facing logic.

- **Screens** — One routed page per folder in `presentation/screens/{page}/`, matching the routes in
  `presentation/app/`. The page component (`{page}-screen.tsx`) sits at the folder root, and its parts are
  split into a fixed set of subfolders:
  - `body/` — large view sections or phase views of the screen.
  - `items/` — row / tile / chip / card components rendered in lists or grids.
  - `sheets/` — bottom sheets, modals, and overlays.
  - `hooks/` — the page's `use-*` hooks (one hook per file).
  - `model/` — pure TypeScript: types, mappers, constants, and label helpers.
  - `__tests__/` — inside the subfolder that owns the file under test.

  A multi-page feature keeps one folder per routed page plus a `shared/` folder for parts used by both
  pages — e.g. `screens/recipes/` holds `list/`, `detail/`, and `shared/`. Small pages (settings, alarm,
  index, register, verify-code, login) stay flat.
- **Navigation** — `presentation/navigation/root-layout.tsx` — root layout with Stack navigator.
- **Bootstrap** — `AppBootstrap` (DI init + hydration), `StoresProvider` (React context for stores).
- **Widgets** — Shared UI components in `presentation/base/widgets/`, grouped by category folder: `text/`,
  `buttons/`, `cards/`, `sheets/`, `layout/`, `media/`, `feedback/`, `loading/`, `settings/`, `navigation/`,
  `timers/`, `brand/`, and `web-header/`. A widget used by only one page lives in that page's folder, not here.
- **Theme** — `presentation/base/theme/colors.ts` (palettes), `spacing.ts` (sizes), `shadows.ts`, `themes.ts`.
- **i18n** — `presentation/i18n/en.ts`, `presentation/i18n/tr.ts`, `presentation/i18n/i18n.ts`.
- **Utils** — `presentation/base/utils/`.

---

## Coding Standards

These rules are **mandatory**. Every agent and every human contributor must follow them. The `code-reviewer`
agent must flag any violation as a blocking issue.

---

### 1. One Declaration Per File

Each file contains exactly **one** top-level declaration: one class, one interface, one type alias, one
React component, or one enum. The only exceptions are:

- Barrel `index.ts` files that only re-export.
- A `ComponentNameProps` interface that lives in the same file as its component.
- A simple helper type that is only meaningful alongside the class in the same file.

```ts
// ✅ recipe.ts — one entity class
export class Recipe extends Entity<RecipeProps> { ... }

// ❌ recipe.ts — two unrelated declarations
export class Recipe extends Entity<RecipeProps> { ... }
export class RecipeMapper { ... }   // move to recipe-mapper.ts
```

---

### 2. Class vs. Function — When to Use Each

Use **classes** for any construct that has constructor dependencies, manages state, or represents a
long-lived object: use cases, repositories, HTTP clients, storage adapters, domain entities.

Use **pure functions** for stateless, dependency-free data transformers (mappers, formatters, validators)
where a class would add no value.

| Construct | Form |
|-----------|------|
| Use case | `class GetRecipeUseCase { execute(...) }` |
| Repository | `class RecipeRepository implements IRecipeRepository { ... }` |
| HTTP / Storage | `class HttpClient { ... }` / `class SecureTokenStorage { ... }` |
| Domain entity | `class Recipe extends Entity<RecipeProps> { ... }` |
| DTO mapper | `export const toRecipe = (dto: RecipeDto): Result<Recipe, ...> => { ... }` |
| Date formatter | `export const formatDate = (d: Date): string => { ... }` |

Never create a class whose only method is a static or standalone transform — use a plain function instead.

---

### 3. JSDoc on Classes and Non-Obvious Public Methods

Every **class** must have a JSDoc summary. Public methods and exported functions get a JSDoc when the
signature alone does not fully communicate intent, edge cases, or failure modes.

Rules:

- Use `/** ... */` style.
- First line is imperative: "Returns …", "Fetches …", "Validates …".
- Add `@param` / `@returns` only when the type names alone are not enough.
- Do **not** document the trivially obvious (a `constructor`, a one-line getter, a pass-through `execute`).

```ts
/**
 * Retrieves a single recipe by its identifier.
 * Fails with NotFoundFailure when the recipe does not exist on the server.
 */
export class GetRecipeUseCase {
  constructor(private readonly repo: IRecipeRepository) {}

  // No JSDoc needed — signature is self-explanatory.
  execute(id: string): Promise<Result<Recipe, Failure>> {
    return this.repo.getRecipe(id);
  }
}

/**
 * Maps a raw API DTO to a domain Recipe entity.
 * Promotes the single `image` field into a one-item media gallery so the
 * MediaGallery widget always has data to render.
 */
export const toRecipe = (dto: RecipeDto): Result<Recipe, ValidationFailure> => { ... };
```

---

### 4. Files Must Stay Simple and Focused

A file is too complex when a reader cannot understand its purpose at a glance.

- **Domain entity / value object** — ~80 lines max.
- **Use case / mapper** — ~120 lines max.
- **Screen component** — extract sub-components into the same feature folder when the file grows unwieldy.
  There is no hard line limit for screens because form-heavy screens are inherently large, but each
  logical section (form section, list item, modal) must live in its own sub-component file.
- No nested class definitions anywhere.
- No more than 2 levels of callback nesting inside a method — extract a private helper instead.

---

### 5. Constants — No Magic Values in Business Logic

Hardcoded numbers, strings, colours, and sizes are forbidden outside dedicated constants files.

#### Where constants live

| Constant type | File |
|---------------|------|
| API endpoints, page sizes, timeouts | `infrastructure/constants/api.ts` |
| Storage keys | `infrastructure/constants/storage.ts` |
| Spacing, radii, font sizes, icon/avatar sizes | `presentation/base/theme/spacing.ts` |
| Colour palettes (light & dark) | `presentation/base/theme/colors.ts` / `themes.ts` |
| Shadow definitions | `presentation/base/theme/shadows.ts` |

```ts
// ✅ correct
import { spacing, fontSizes } from '@presentation/base/theme/spacing';
import { colors } from '@presentation/base/theme/themes';

const styles = StyleSheet.create({
  title: { fontSize: fontSizes.title, marginBottom: spacing.md },
  card:  { backgroundColor: colors.card },
});

// ❌ wrong — magic numbers and hex codes inline
const styles = StyleSheet.create({
  title: { fontSize: 24, marginBottom: 12 },
  card:  { backgroundColor: '#F5F5F5' },
});
```

---

### 6. React Native — Styles

- **Always use `StyleSheet.create()`** for static style objects. Inline style objects (`style={{ margin: 8 }}`) are forbidden for static values because they create a new object on every render.
- **Dynamic styles** (values that depend on runtime state or theme) may use inline objects only for the
  dynamic portion. Static portions must still live in `StyleSheet.create()`.
- Combine static and dynamic styles with an array: `style={[styles.base, { backgroundColor: color }]}`.

```tsx
// ✅
const styles = StyleSheet.create({ container: { flex: 1, padding: spacing.md } });
<View style={[styles.container, { backgroundColor: theme.colors.background }]} />

// ❌
<View style={{ flex: 1, padding: 16, backgroundColor: theme.colors.background }} />
```

---

### 7. React Native — Component Props Interface

- Every React component's props must be typed with an interface named `ComponentNameProps`.
- Export the `Props` interface so callers can reference it.
- Place the interface directly above the component function in the same file.

```tsx
// ✅
export interface RecipeCardProps {
  recipe: Recipe;
  onPress: (id: string) => void;
}

export const RecipeCard = ({ recipe, onPress }: RecipeCardProps): React.JSX.Element => { ... };
```

---

### 8. React Native — Custom Hooks

- Custom hooks must be named with the `use` prefix (`useRecipeList`, `useTheme`).
- A custom hook file must export exactly one hook function.
- Hooks that depend on a store must accept no arguments and read the store internally; they must not
  accept store state as props.

---

### 9. React Native — Lists

- `FlatList` and `SectionList` must always declare a `keyExtractor` prop that returns a stable, unique key.
- Never use the array index as a key for mutable lists.

```tsx
// ✅
<FlatList keyExtractor={(item) => item.id} ... />

// ❌
<FlatList keyExtractor={(_, index) => String(index)} ... />
```

---

### 10. React Native — Accessibility

Every interactive element (`Pressable`, `TouchableOpacity`, button widget) must declare at minimum:

- `accessibilityRole` — describes the element type (`"button"`, `"link"`, `"checkbox"`, …).
- `accessibilityLabel` — human-readable description when the visual label is not text.

---

### 11. Internationalization (i18n)

- All user-visible strings in `presentation/` must come from `t()` (never hardcoded).
- Translation files: `presentation/i18n/en.ts` (English), `presentation/i18n/tr.ts` (Turkish).
- Locale detection via `expo-localization` at app startup (`initLocale()`).
- Both languages must remain in sync at all times — adding a key to `en.ts` requires the same key in
  `tr.ts` in the same commit.

---

### 12. Error Handling — `Result<T, Failure>`

- Use `Result<T, Failure>` everywhere; never throw exceptions in domain or application code.
- Domain `create()` factory methods return `Result<Entity, ValidationFailure>`.
- Infrastructure maps HTTP errors to typed `Failure` subclasses (`NetworkFailure`,
  `UnauthorizedFailure`, `NotFoundFailure`, `UnknownFailure`).
- `presentation/` may `throw` only inside error boundaries.

---

### 13. Testing

- Tests live next to the code they test in `__tests__/` directories.
- Domain and core tests are pure unit tests — no mocks, no external I/O.
- Application tests use fakes (`FakeAuthRepository`) for repository dependencies.
- Infrastructure mapper tests validate DTO-to-entity mapping with known fixture data.
- Test runner: Jest via `jest-expo`.

---

## Pre-Commit Quality Gate

A pre-commit hook (Husky + lint-staged) runs automatically on every `git commit`:

1. **lint-staged** — runs `eslint --fix` on every staged `.ts` / `.tsx` file. Commit is blocked if any
   ESLint error remains after auto-fix.
2. **TypeScript** — runs `tsc --noEmit` against the full project. Commit is blocked on any type error.

To bypass in an emergency: `git commit --no-verify` (use sparingly; document why in the commit message).

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
| `husky` | Git hooks management |
| `lint-staged` | Run linters only on staged files |

---

## External API

DummyJSON (`https://dummyjson.com`) — free, public, zero configuration.

- Auth: `POST /auth/login`
- Recipes: `GET /recipes`, `GET /recipes/:id`
- Todos: `GET /todos`, `GET /todos/:id`
