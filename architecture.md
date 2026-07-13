# Architecture

Recipely follows **Domain-Driven Design (DDD)** with a **Layered Architecture** inspired by Eric Evans'
_Domain-Driven Design: Tackling Complexity in the Heart of Software_ (2003).

---

## Layer Overview

All five layers live under `src/`; static binary assets live in `assets/` at the repo root
(exposed to code via the `@assets/*` alias, registered in `src/infrastructure/constants/assets.ts`).

```
src/
  presentation/
    app/              Pages (expo-router root): app/<segment>/index.tsx + co-located body/items/sheets/hooks/model
    navigation/       Shell: route-context.js, auth guard, share-import hook, alarm overlay
    i18n/             Internationalization
    base/             Widgets (categorized), theme, utils
    bootstrap/        DI init, stores context
    |
  application/        Use cases, state stores, DI registration
    |
  domain/             Entities, value objects, repository interfaces
    |
  infrastructure/     Repository implementations, DTOs, mappers, network, storage
    |
  core/               Framework-agnostic building blocks (Result, Failure, Entity, DI)
```

### Dependency Rule

Each layer may only depend on layers **below** it. Never import upward:

- `src/domain/` — never imports from `src/application/`, `src/infrastructure/`, or `src/presentation/`.
- `src/application/` — never imports from `src/infrastructure/` or `src/presentation/`.
- `src/infrastructure/` — never imports from `src/presentation/` or `src/application/`.
- `src/presentation/` — may import `src/application/`, `src/domain/` (types/entities as read models), and `src/core/`;
  never `src/infrastructure/`.
- `src/core/` — imports nothing else from the project.

**Sanctioned exceptions** (the only ones):

- `src/infrastructure/constants/*` may be imported from anywhere — Coding Standard 5 deliberately homes
  API URLs / limits / storage keys there.
- `src/presentation/bootstrap/` and the `*/di/` wiring modules are the **composition root**: they may
  import across layers to assemble the object graph. Nothing else may.
- Anything beyond that lives in the `KNOWN_DEBT` list inside `scripts/check-structure.mjs`. That list
  only shrinks — adding an entry requires explicit user approval in review.

The dependency rule and the exceptions above are enforced mechanically by `npm run check:structure`
(see Pre-Commit Quality Gate).

`src/presentation/app/` is the expo-router root (`"root": "src/presentation/app"` in `app.json`) **and** where
page implementations live. Only `index.tsx`, `_layout.tsx`, `+special` and `[param]` files register as
routes; everything else in a page folder is co-located page code, hidden from the router by the custom
route context (`src/presentation/navigation/route-context.js`, wired via `metro.config.js`) and stripped from
static web exports by `scripts/prune-web-export.mjs`.

---

## DDD Guardrails (Evans 2003)

Audited against Eric Evans, _Domain-Driven Design_ (2003 final manuscript). These rules exist so the
findings of that audit can never regress. Page numbers refer to the manuscript. Each rule maps to a
Mandatory Coding Standard in `CLAUDE.md` (17–20) and is BLOCKING in review.

### Ports, not direct infrastructure (Evans p.55 — CLAUDE.md §17)

Infrastructure serves upper layers as **SERVICES behind interfaces**. The repository-interface pattern
(`src/domain/**/i-*-repository.ts` + implementation in `src/infrastructure/`) is the template: any other
infrastructure capability a higher layer needs (key-value storage, notifications, audio, clipboard, …)
gets the same treatment — a **port interface** in `src/domain/` (or `src/application/` for purely
app-level services), an implementation in `src/infrastructure/`, wiring in the composition root, and
consumers resolve it via DI. Adding a direct `@infrastructure` import instead is blocking; parking it in
`KNOWN_DEBT` is not an alternative (the list only shrinks, target zero).

### Smart-UI guard (Evans p.57 — CLAUDE.md §18)

Screens that grow unbounded silently become the Smart UI anti-pattern: business rules accumulate in the
component and the domain model stops mattering. Hard limits:

- a routed `index.tsx` composes co-located parts — target ≤ ~200 lines, **zero business rules**;
- any `.tsx` over 300 lines is a blocking review finding (i18n dictionaries `en.ts` / `tr.ts` exempt);
- a business rule discovered while editing UI is moved down (component → hook → store/use case →
  entity/VO) **in the same PR**, never left in place;
- presentation computes nothing the application or domain layer could own: formatting for display is
  fine, validation / eligibility / totals are not.

### OOP & rich domain model (Evans p.65-74 — CLAUDE.md §19)

Object-oriented design is the active paradigm of this codebase, not a formality:

- **Behavior lives with the data.** An invariant or derivation about an entity's own props is a method
  on the entity (or a factory guard), not a helper in a store, component, or util file. Before writing
  `isRecipeX(recipe)` anywhere outside `src/domain/`, put `recipe.isX()` on the entity.
- **Encapsulation is mandatory.** `private` constructor + static `create(): Result<T, ValidationFailure>`,
  `private readonly` fields behind getters, no public setters, no mutation after construction except via
  intention-revealing methods that re-check invariants.
- **Entities stay identity-intrinsic (p.67).** Props describe what the thing *is*, not who is looking at
  it. Viewer-dependent flags (`likedByMe`-style) are tolerated where they already exist but must not be
  extended — new viewer/session-relative data goes into a read model / store state, not entity props.
- **Value Objects for conceptual wholes (p.71).** When a primitive carries rules (format, range, unit) or
  travels as a group (amount + unit, minutes prep + cook), promote it to an immutable VO with a validating
  factory (the `Email` pattern) instead of re-validating raw primitives at multiple call sites.
- **Services stay stateless and verb-named (p.75-76)**, and thin: an application use case coordinates —
  business decisions belong in entities/VOs.

### Aggregates (Evans p.89-93 — CLAUDE.md §20)

Consistency boundaries are documented, deliberate decisions. The server is the transactional authority;
this client still respects the boundaries for references and deletion semantics. Cross-aggregate
references are **by id only**.

| Aggregate root | Members / notes |
|---|---|
| `Recipe` | Root. `RecipeSummary` is a read model of it (not a separate aggregate). `MediaItem`, `RecipeNutrition` are VO-shaped members. `commentCount` / `likeCount` are server-maintained denormalizations. |
| `Comment` | Own root (own identity + lifecycle); references its recipe by `recipeId`. |
| `User` | Root (auth identity). |
| `UserProfile` | Own root (profile lifecycle independent of auth session); references `User` by id. |
| `AuthSession` | Root (token lifecycle). |
| `Notification` | Own root; references related entities by id. |

A PR that adds a domain entity MUST add a row here (root or member of which root) — the code-reviewer
blocks otherwise.

---

## Layer Details

### `src/core/`

Framework-agnostic building blocks shared across all layers.

| Module | Purpose |
|--------|---------|
| `src/core/result/result.ts` | `Result<T, F>` monad (`ok` / `fail`) for typed error handling |
| `src/core/failure/` | `Failure` base class + individual subclasses (one per file) with barrel `index.ts` |
| `src/core/entity/entity.ts` | Base `Entity<Props>` with identity equality |
| `src/core/di/container.ts` | `Container` class (register/resolve with lazy singletons) |
| `src/core/di/container-instance.ts` | Singleton `container` instance |
| `src/core/di/tokens.ts` | DI token symbols |

### `src/domain/`

The heart of the application. Pure TypeScript, no framework dependencies.

- **Entities** — `Recipe`, `AuthSession`, `User`, `Comment` extend `Entity<Props>` with factory `create()`
  methods returning `Result`.
- **Value Objects** — e.g. `Email` (self-validating class with a factory `create()` returning `Result`).
- **Enums / Literals** — typed string unions in their own files.
- **Repository Interfaces** — `IRecipeRepository`, `IAuthRepository`, `ICommentRepository` define contracts;
  implementations live in `src/infrastructure/`.

### `src/application/`

Orchestrates domain logic through use cases and manages UI state.

- **Use Cases** — Single-responsibility classes with an `execute(...)` method returning
  `Promise<Result<T, Failure>>`.
- **Stores** — Zustand stores that call use cases and expose state to the presentation layer.
- **DI Registration** — `src/application/di/register.ts` wires use cases and stores into the container.
- **Test Fixtures** — `src/application/__fixtures__/` contains fakes (e.g., `FakeAuthRepository`) for unit tests.

### `src/infrastructure/`

Implements domain interfaces with concrete I/O.

- **Repositories** — `AuthRepository`, `RecipeRepository` implement domain interfaces using `HttpClient`.
- **DTOs** — One interface per file (`RecipeDto`, `RecipesListDto`, …).
- **Mappers** — Pure functions (`toRecipe`, `toUser`) that convert DTOs to domain entities, returning
  `Result`. Mappers are stateless and have no dependencies, so plain exported functions are idiomatic.
- **Network** — `HttpClient` wraps Axios with typed error mapping to `Failure` subclasses.
- **Storage** — `SecureTokenStorage`; platform-specific `kv-store.ts` / `kv-store.web.ts`.
- **Constants** — `src/infrastructure/constants/api.ts` (URLs, limits) and `storage.ts` (storage keys).
- **DI Registration** — `src/infrastructure/di/register.ts` wires repositories and HTTP client.

### `src/presentation/`

All UI and user-facing logic.

- **Pages** — One routed page per folder in `src/presentation/app/{segment}/`. The route component lives in
  `index.tsx` (named export + `export default`), and its parts are co-located in a fixed set of subfolders:
  - `body/` — large view sections or phase views of the screen.
  - `items/` — row / tile / chip / card components rendered in lists or grids.
  - `sheets/` — bottom sheets, modals, and overlays.
  - `hooks/` — the page's `use-*` hooks (one hook per file).
  - `model/` — pure TypeScript: types, mappers, constants, and label helpers.
  - `__tests__/` — inside the subfolder that owns the file under test.

  Co-located files MUST live in one of those subfolders (`check:structure` rule E). A dynamic-route
  feature nests its detail page — e.g. `app/recipes/` holds the list page plus `[recipeId]/` (detail
  page) and `shared/` for parts used by both. Root shell files sit at the app root: `_layout.tsx`
  (root layout), `+html.tsx`, `index.tsx` (entry redirect).

  **Route registration** — only `index.tsx`, `_layout.tsx`, `+special` and `[param]` files become routes.
  `metro.config.js` swaps expo-router's catch-all route context for
  `src/presentation/navigation/route-context.js`, whose regex admits only those files; a new page is therefore
  always `app/<segment>/index.tsx` — a flat `app/<segment>.tsx` will NOT register. Static web exports
  still emit stray pages for co-located files (the CLI scans the file system directly), so
  `npm run build:web` runs `scripts/prune-web-export.mjs` afterwards; real pages always export as
  `<segment>/index.html`. Typed-routes generation sees co-located files too, which only loosens the
  generated `Href` union — harmless. Revisit `route-context.js` on every Expo SDK / expo-router upgrade.
- **Navigation (shell)** — `src/presentation/navigation/`: `route-context.js` (router file filter),
  `use-auth-guard.ts`, `use-instagram-share-import.ts`, `alarm-screen.tsx` (global overlay rendered by the
  root layout).
- **Bootstrap** — `AppBootstrap` (DI init + hydration), `StoresProvider` (React context for stores).
- **Widgets** — Shared UI components in `src/presentation/base/widgets/`, grouped by category folder: `text/`,
  `buttons/`, `cards/`, `sheets/`, `layout/`, `media/`, `feedback/`, `loading/`, `settings/`, `navigation/`,
  `timers/`, `brand/`, and `web-header/`. A widget used by only one page lives in that page's folder, not here.
- **Theme** — `src/presentation/base/theme/colors.ts` (palettes), `spacing.ts` (sizes), `shadows.ts`, `themes.ts`.
- **i18n** — `src/presentation/i18n/en.ts`, `src/presentation/i18n/tr.ts`, `src/presentation/i18n/i18n.ts`.
- **Utils** — `src/presentation/base/utils/`.

---

## Coding Standards

These rules are **mandatory**. Every agent and every human contributor must follow them. The `code-reviewer`
agent must flag any violation as a blocking issue.

---

### 1. One Declaration Per File

Each file contains exactly **one** top-level declaration: one class, one interface, one type alias, one
React component, or one enum. The only exceptions are:

- Barrel `index.ts` files that only re-export.
- A `ComponentNameProps` interface that lives in the same file as its component (it must be named
  exactly `<ComponentName>Props` — see Standard 7).
- A simple helper type that is only meaningful alongside the **class** in the same file (this exception
  is for classes only — it does not cover hooks, stores, or plain functions).
- The merged-enum idiom: a `const X` object plus a same-named `type X` union (and `X_VALUES` arrays),
  or a union type derived via `typeof` from a const in the same file. One concept = one file.
- Constants-only files (`src/infrastructure/constants/api.ts`, `theme/spacing.ts`, …) and pure-function
  collections with **no** type/interface in the file (mappers, `i18n.ts`, `timer-controls.ts`).

Frequent violations to watch for — all of these must be split:

- A hook's args/result `interface` in the same file as the hook
  (`use-x.ts` keeps the hook; the type moves to its own file — see Placement below).
- A Zustand store type next to its factory: `x-store.ts` holds only `type XStore`;
  the factory lives in `configure-x-store.ts`.
- A provider component and its `use*` hook in one `*-context.tsx` file — the hook gets its own
  `use-x.ts` file (Standard 8).
- Logic helpers embedded in a component file — move them to the page's `model/` folder.

**Placement of extracted declarations:** inside a page folder, pure types go to that page's `model/`;
inside `base/*`, the type becomes a sibling file in the same folder. File name = kebab-case of the
declaration it contains.

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
| API endpoints, page sizes, timeouts | `src/infrastructure/constants/api.ts` |
| Storage keys | `src/infrastructure/constants/storage.ts` |
| Spacing, radii, font sizes, icon/avatar sizes | `src/presentation/base/theme/spacing.ts` |
| Colour palettes (light & dark) | `src/presentation/base/theme/colors.ts` / `themes.ts` |
| Shadow definitions | `src/presentation/base/theme/shadows.ts` |

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
- A custom hook file must export exactly one hook function — and nothing else that is a component,
  class, interface, or type alias. In particular a context's provider component and its consumer hook
  live in **separate** files (`theme-context.tsx` + `use-theme.ts`).
- Hooks that depend on a store must accept no arguments and read the store internally; they must not
  accept store state as props.
- Hooks are thin adapters over application stores / use cases: view-facing glue only, no business
  rules (those belong in `src/domain/`, orchestration in `src/application/`).

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

- All user-visible strings in `src/presentation/` must come from `t()` (never hardcoded).
- Translation files: `src/presentation/i18n/en.ts` (English), `src/presentation/i18n/tr.ts` (Turkish).
- Locale detection via `expo-localization` at app startup (`initLocale()`).
- Both languages must remain in sync at all times — adding a key to `en.ts` requires the same key in
  `tr.ts` in the same commit.

---

### 12. Error Handling — `Result<T, Failure>`

- Use `Result<T, Failure>` everywhere; never throw exceptions in domain or application code.
- Domain `create()` factory methods return `Result<Entity, ValidationFailure>`.
- Infrastructure maps HTTP errors to typed `Failure` subclasses (`NetworkFailure`,
  `UnauthorizedFailure`, `NotFoundFailure`, `UnknownFailure`).
- `src/presentation/` may `throw` only inside error boundaries.

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
3. **Structure** — runs `npm run check:structure` (`scripts/check-structure.mjs`). Commit is blocked on:
   - one-declaration-per-file / one-hook-per-file violations (Standards 1 and 8),
   - layer-dependency violations (Dependency Rule) beyond the sanctioned exceptions and the shrinking
     `KNOWN_DEBT` list,
   - relative imports (`./`, `../`) outside barrel `index.ts` files — use the `@layer/...` alias,
   - loose files at the `src/presentation/base/widgets/` root (category folders only).

No task is "done" until `npm run lint`, `npx tsc --noEmit`, `npx jest`, **and** `npm run check:structure`
are all green.

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
