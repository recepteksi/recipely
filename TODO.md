# Backend Contract & Frontend Parity — Tracking

Source: recipely-backend commits `3c9106b` (lean list DTO, #162) and `dd78b76`
(public recipe detail, #164), plus local bug screenshots in `~/Desktop/Hatalar/`.

Verified against the backend repo before starting — see notes per item.

## Phase 1 — Data Model Realignment & Contract Breakdown

- [x] **Lean list DTO parity.** Backend's `RecipeListItemDto`/`PagedRecipeListDto`
      (verified: recipely-backend `3c9106b`) exposes only `id, name, image,
      cuisine, category, difficulty, totalTimeMinutes, rating,
      moderationStatus, likeCount, likedByMe, commentCount, viewCount` for
      list/my-recipes/trending. Detail (`GET /recipes/:id`) is unchanged
      (full `RecipeDto`).
      Approach (confirmed with user): new lightweight `RecipeSummary` domain
      entity for list contexts; `Recipe` stays the full detail entity,
      untouched.
  - [x] `infrastructure/recipes/recipe-list-item-dto.ts` — new DTO
  - [x] `infrastructure/recipes/recipes-list-dto.ts` — `items` → `RecipeListItemDto[]`
  - [x] `domain/recipes/recipe-summary.ts` — new entity
  - [x] `infrastructure/recipes/recipe-mapper.ts` — add `toRecipeSummary`
  - [x] `domain/recipes/i-recipe-repository.ts` — list methods return `RecipeSummary[]`
  - [x] `infrastructure/recipes/recipe-repository.ts` — wire lean mapping for list methods
  - [x] `application/__fixtures__/fake-recipe-repository.ts` — update fixture types
  - [x] `application/recipes/list-recipes-use-case.ts`, `list-my-recipes-use-case.ts`,
        `list-trending-recipes-use-case.ts` — return `RecipeSummary[]`
  - [x] `domain/recipes/recipe.ts` — added `moderationStatus`/`commentCount`
        getters (already on `RecipeDto`, previously dropped by `toRecipe`)
  - [x] `domain/recipes/recipe-to-summary.ts` — new `Recipe` → `RecipeSummary`
        converter (used to keep `created-recipes-store`'s lean list in sync
        after create/update)
  - [x] `application/recipes/created-recipes-store.ts` — split `recipes`
        (lean, My Recipes grid) from `localRecipes` (full-detail cache
        backing `findById`); public method signatures unchanged
  - [x] `core/failure/validation-failure.ts` — `fieldErrors` getter (see
        validation item below)
  - [x] Quality gate on domain/application/infrastructure: lint clean,
        `tsc --noEmit` clean for these layers, full jest suite green
        (80 suites / 928 tests). Committed on `feat/lean-recipe-list-dto`
        (`9310d86`), not pushed.
  - [x] **Presentation layer** (rn-developer, commit `264f111`):
    - [x] `web-recipe-card.tsx`, `web-hero-mini-card.tsx` — `RecipeSummary`,
          `totalTimeMinutes` directly
    - [x] `my-recipes-screen.tsx`, `recipe-list-screen.tsx`,
          `trending-strip.tsx`, `web-recipe-grid.tsx`, `recipe-list-item.tsx`
          — retyped to `RecipeSummary`
    - [x] **Product decision (confirmed with user):** lean payload has no
          `tags`/`ownerId`, so mobile cards drop the tags-chip row
          (`recipe-card.tsx`'s `tags` now optional) and
          `web-hero-featured-card.tsx` drops its author row (consistent with
          the existing "no author row, avoids N+1" rule already in
          `web-recipe-card.tsx`). Both remain visible on the full recipe
          detail screen, unaffected.
  - [x] Full quality gate, project-wide: lint clean, `tsc --noEmit` clean
        (0 errors), jest 82 suites / 932 tests passing. Two commits on
        `feat/lean-recipe-list-dto`: `9310d86` (domain/application/
        infrastructure) + `264f111` (presentation). Not pushed/PR'd yet.
- [ ] **Multi-field validation parsing.** Backend now reports every failing
      Zod field, joined into one string in `error.message`
      (`"name: too short; category: invalid"`), `error.field` = first
      offender only (verified in recipely-backend `error-handler.ts` /
      `failure-to-http.ts` — not a JSON array as originally assumed).
      Scope for Phase 1 (confirmed with user): parse into structured data
      now; inline UI binding is Phase 4's "Form Fields Validation Mapping"
      item.
  - [x] `core/failure/validation-failure.ts` — added `fieldErrors` getter,
        splits `message` on `'; '` then each segment's first `': '`. Purely
        additive — existing `message`/`field` readers unaffected.
  - [x] Confirmed `application/recipes/created-recipes-store.ts` already
        surfaces the raw `ValidationFailure` via `createState`/`updateState`
        — no store change needed for this part. UI binding is Phase 4.
- [x] **Base API URL / DummyJSON cleanup** — already resolved in this repo.
      `infrastructure/constants/api.ts` already separates prod
      (`api.recipely.net`) / dev (`dev-api.recipely.net`) via build variant;
      DummyJSON only remains in one test fixture's image URLs. No code change.

## Phase 2 — Guest View Authorization Flows & Deep Linking

- [x] Public shared recipe preview for guests (backend verified:
      recipely-backend `dd78b76` — `GET /recipes/:id` now public,
      unpublished filtered by owner; re-verified directly against
      `recipes.routes.ts` that list/trending/mutations still require auth).
      `presentation/navigation/use-auth-guard.ts` now exempts only the
      single-recipe detail path (`RECIPE_DETAIL_PATH` regex), not the list.
- [x] Conditional auth-interception CTAs for guest mutation attempts (like,
      bookmark, comment, comment-like). New `useGuestGate` hook +
      `SignInPromptSheet` widget, wired into native (`recipe-detail-screen.tsx`)
      and web (`web-recipe-detail*.tsx`). **"See More" skipped as N/A** — no
      such gated-expansion UI exists anywhere in the codebase to retrofit.
  - Branch `feat/guest-recipe-access`, 3 commits, code-reviewer approved
    (no blocking findings; 2 minor test gaps it flagged were closed).
    Quality gate: lint clean, `tsc --noEmit` clean, jest 88 suites / 971
    tests passing. Not yet merged.

## Phase 3 — State Lifecycle & Navigational Performance

- [ ] Cuisine/category filter change → partial state update instead of full
      root remount (leverage lean list DTO from Phase 1).
- [ ] Profile bio edit → cache/store invalidation so the profile screen
      reflects the save immediately.

## Phase 4 — Core Presentation Layout & Responsive UX (screenshots in `~/Desktop/Hatalar/`)

- [ ] Status bar overlapping "Recipes" header/branding on native
- [ ] Filter bottom sheet: drag handle vs redundant close (X) control
- [ ] Search results overlay positioned under keyboard, decoupled from
      scrolling card stack
- [ ] Prep-time badge wrapping inside recipe instruction rich text
- [ ] Form field validation — bind parsed per-field errors (Phase 1) to
      inputs with red border/warning icon
- [ ] AI assistant viewport height during keyboard show/hide
- [ ] TR localization — remove fixed heights on theme/option selectors so
      longer labels wrap without shifting layout
- [ ] Micro UI cleanup: center filter-count badge, rename "Clear" →
      "Clear Filters", dedupe author cards, "Fiber: 11g" row formatting,
      trim palette picker to 3–4 colors
