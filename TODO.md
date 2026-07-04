# Backend Contract & Frontend Parity — Tracking

Source: recipely-backend commits `3c9106b` (lean list DTO, #162) and `dd78b76`
(public recipe detail, #164), plus local bug screenshots in `~/Desktop/Hatalar/`.

Verified against the backend repo before starting — see notes per item.

## Phase 1 — Data Model Realignment & Contract Breakdown

- [ ] **Lean list DTO parity.** Backend's `RecipeListItemDto`/`PagedRecipeListDto`
      (verified: recipely-backend `3c9106b`) exposes only `id, name, image,
      cuisine, category, difficulty, totalTimeMinutes, rating,
      moderationStatus, likeCount, likedByMe, commentCount, viewCount` for
      list/my-recipes/trending. Detail (`GET /recipes/:id`) is unchanged
      (full `RecipeDto`).
      Approach (confirmed with user): new lightweight `RecipeSummary` domain
      entity for list contexts; `Recipe` stays the full detail entity,
      untouched.
  - [ ] `infrastructure/recipes/recipe-list-item-dto.ts` — new DTO
  - [ ] `infrastructure/recipes/recipes-list-dto.ts` — `items` → `RecipeListItemDto[]`
  - [ ] `domain/recipes/recipe-summary.ts` — new entity
  - [ ] `infrastructure/recipes/recipe-mapper.ts` — add `toRecipeSummary`
  - [ ] `domain/recipes/i-recipe-repository.ts` — list methods return `RecipeSummary[]`
  - [ ] `infrastructure/recipes/recipe-repository.ts` — wire lean mapping for list methods
  - [ ] `application/__fixtures__/fake-recipe-repository.ts` — update fixture types
  - [ ] `application/recipes/list-recipes-use-case.ts`, `list-my-recipes-use-case.ts`,
        `list-trending-recipes-use-case.ts` — return `RecipeSummary[]`
  - [ ] `presentation/screens/recipes/web-recipe-card.tsx`,
        `web-hero-mini-card.tsx`, `web-hero-featured-card.tsx` — consume
        `RecipeSummary`, use `totalTimeMinutes` directly (drop
        `prepTimeMinutes + cookTimeMinutes` derivation)
  - [ ] any other screen/hook consuming the three list use cases — update types
- [ ] **Multi-field validation parsing.** Backend now reports every failing
      Zod field, joined into one string in `error.message`
      (`"name: too short; category: invalid"`), `error.field` = first
      offender only (verified in recipely-backend `error-handler.ts` /
      `failure-to-http.ts` — not a JSON array as originally assumed).
      Scope for Phase 1 (confirmed with user): parse into structured data
      now; inline UI binding is Phase 4's "Form Fields Validation Mapping"
      item.
  - [ ] `core/failure/validation-failure.ts` — expose parsed per-field entries
  - [ ] confirm `application/recipes/created-recipes-store.ts` (create/update
        state) surfaces the `ValidationFailure` object for Phase 4 to consume
- [x] **Base API URL / DummyJSON cleanup** — already resolved in this repo.
      `infrastructure/constants/api.ts` already separates prod
      (`api.recipely.net`) / dev (`dev-api.recipely.net`) via build variant;
      DummyJSON only remains in one test fixture's image URLs. No code change.

## Phase 2 — Guest View Authorization Flows & Deep Linking

- [ ] Public shared recipe preview for guests (backend verified:
      recipely-backend `dd78b76` — `GET /recipes/:id` now public,
      unpublished filtered by owner). Update route guards so a deep link to
      a published recipe doesn't bounce guests to login.
- [ ] Conditional auth-interception CTAs for guest mutation attempts (like,
      bookmark, comment, "See More").

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
