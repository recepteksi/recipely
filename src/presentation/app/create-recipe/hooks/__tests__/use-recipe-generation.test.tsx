/**
 * Regression tests for the failure path of `useRecipeGeneration.runGenerate`.
 *
 * The bug: when `/recipes/generate` failed, the hook dropped back to the prompt
 * phase silently — the failure only ever landed in `chatHistory`, which the
 * prompt phase does not render. The user tapped "Generate", watched the
 * checklist, and was returned to an unchanged screen with no explanation. A
 * prompt refused by the backend (422 -> ValidationFailure) was the worst case:
 * nothing told the user that rephrasing was the fix.
 *
 * Note on the copy: the client CANNOT tell WHY a 4xx came back — the error
 * envelope is `{ code, message, field? }` with no machine-readable reason, and
 * `ValidationFailure` is also the catch-all for any unhandled 4xx. So every 4xx
 * gets the same non-accusatory "rephrase and try again" copy; the tests below
 * pin that down for both a moderation 422 and a plain 400.
 *
 * Harness: the repo has no @testing-library/react-native — presentation hooks are
 * driven through a probe component rendered with `renderComponent` (react-test-
 * renderer + theme/safe-area providers), exactly as use-save-recipe.test.tsx does.
 * The stores are the REAL Zustand stores wired to the `FakeRecipeRepository`
 * fixture, so these tests exercise hook -> store -> use case -> repository end to
 * end. Only `show-toast` is module-mocked, since it is the observable effect
 * under test.
 */

import { useState } from 'react';
import { act } from 'react-test-renderer';
import { NetworkFailure, UnknownFailure, ValidationFailure } from '@core/failure';
import { fail, ok } from '@core/result/result-helpers';
import { Recipe } from '@domain/recipes/recipe';
import { CuisineKey } from '@domain/recipes/cuisine-key';
import { RecipeCategory } from '@domain/recipes/recipe-category';
import { Difficulty } from '@domain/recipes/difficulty';
import { FakeRecipeRepository } from '@application/__fixtures__/fake-recipe-repository';
import type { FakeRecipeRepositoryConfig } from '@application/__fixtures__/fake-recipe-repository-config';
import { GenerateRecipeUseCase } from '@application/recipes/generate-recipe-use-case';
import { configureCreatedRecipesStore } from '@application/recipes/configure-created-recipes-store';
import { configureDraftsStore } from '@application/drafts/configure-drafts-store';
import type { CreateRecipeUseCase } from '@application/recipes/create-recipe-use-case';
import type { ListMyRecipesUseCase } from '@application/recipes/list-my-recipes-use-case';
import type { RefineRecipeUseCase } from '@application/recipes/refine-recipe-use-case';
import type { ImportInstagramRecipeUseCase } from '@application/recipes/import-instagram-recipe-use-case';
import type { UpdateRecipeUseCase } from '@application/recipes/update-recipe-use-case';
import type { DeleteRecipeUseCase } from '@application/recipes/delete-recipe-use-case';
import type { RecipeListStore } from '@application/recipes/recipe-list-store';
import type { RecipeDetailStore } from '@application/recipes/recipe-detail-store';
import type { ListDraftsUseCase } from '@application/drafts/list-drafts-use-case';
import type { GetLatestDraftUseCase } from '@application/drafts/get-latest-draft-use-case';
import type { GetDraftUseCase } from '@application/drafts/get-draft-use-case';
import type { UpsertDraftUseCase } from '@application/drafts/upsert-draft-use-case';
import type { DeleteDraftUseCase } from '@application/drafts/delete-draft-use-case';
import { StoresProvider } from '@presentation/bootstrap/stores-context';
import type { Stores } from '@presentation/bootstrap/stores';
import { renderComponent } from '@presentation/base/test-support/render-component';
import { showDangerToast, showErrorToast } from '@presentation/base/feedback/show-toast';
import { useRecipeGeneration } from '@presentation/app/create-recipe/hooks/use-recipe-generation';
import { emptyEditable } from '@presentation/app/create-recipe/model/recipe-mapping';
import type { EditableRecipe } from '@presentation/app/create-recipe/model/editable-recipe';
import { en } from '@presentation/i18n/en';

// ─── module mocks ────────────────────────────────────────────────────────────

jest.mock('@presentation/base/feedback/show-toast', () => ({
  showDangerToast: jest.fn(),
  showErrorToast: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ replace: jest.fn(), back: jest.fn() })),
}));

// ─── fixtures ────────────────────────────────────────────────────────────────

const PROMPT = 'a quick garlic pasta';

const makeRecipe = (): Recipe => {
  const result = Recipe.create({
    id: 'r-generated',
    name: 'Garlic Pasta',
    cuisine: CuisineKey.Italian,
    category: RecipeCategory.Dinner,
    difficulty: Difficulty.Easy,
    ingredients: ['pasta', 'garlic'],
    instructions: ['boil', 'toss'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 2,
    caloriesPerServing: 0,
    image: 'https://cdn.example.com/r1.webp',
    media: [{ type: 'image', url: 'https://cdn.example.com/r1.webp' }],
    rating: 4.5,
    tags: [],
    mealType: [],
    ownerId: 'owner-1',
    likeCount: 0,
    likedByMe: false,
    viewCount: 0,
    moderationStatus: 'approved',
    commentCount: 0,
  });
  if (!result.ok) throw new Error('failed to build Recipe fixture');
  return result.value;
};

const rejectedPrompt = (): FakeRecipeRepositoryConfig => ({
  // What the backend prompt moderator returns as a 422.
  generateRecipeResult: fail(new ValidationFailure('errors.ai.prompt_rejected')),
});

// Any other 4xx on this endpoint also arrives as a ValidationFailure (it is the
// client's catch-all for unhandled 4xx) — e.g. a plain 400 with a backend
// sentence the user must never be shown.
const genericBadRequest = (): FakeRecipeRepositoryConfig => ({
  generateRecipeResult: fail(new ValidationFailure('HTTP 400')),
});

const offline = (): FakeRecipeRepositoryConfig => ({
  generateRecipeResult: fail(new NetworkFailure('axios ECONNREFUSED')),
});

const generated = (): FakeRecipeRepositoryConfig => ({
  generateRecipeResult: ok(makeRecipe()),
});

// The generate flow never touches these — stubs that satisfy the stores'
// construction-time dependency lists without exercising the sibling flows.
const unusedUseCase = <T,>(): T =>
  ({ execute: () => Promise.resolve(fail(new UnknownFailure('not used'))) }) as unknown as T;

const noopCacheStore = <T,>(): T =>
  ({ getState: () => ({ replace: () => undefined, remove: () => undefined }) }) as unknown as T;

/**
 * Real createdRecipesStore + draftsStore, with the generate path wired through
 * the real `GenerateRecipeUseCase` down to a `FakeRecipeRepository` reading
 * `config` on every call.
 */
const makeStores = (config: FakeRecipeRepositoryConfig): Stores => {
  const createdRecipesStore = configureCreatedRecipesStore({
    createRecipeUseCase: unusedUseCase<CreateRecipeUseCase>(),
    listMyRecipesUseCase: unusedUseCase<ListMyRecipesUseCase>(),
    generateRecipeUseCase: new GenerateRecipeUseCase(new FakeRecipeRepository(config)),
    refineRecipeUseCase: unusedUseCase<RefineRecipeUseCase>(),
    importInstagramRecipeUseCase: unusedUseCase<ImportInstagramRecipeUseCase>(),
    updateRecipeUseCase: unusedUseCase<UpdateRecipeUseCase>(),
    deleteRecipeUseCase: unusedUseCase<DeleteRecipeUseCase>(),
    recipeListStore: noopCacheStore<RecipeListStore>(),
    recipeDetailStore: noopCacheStore<RecipeDetailStore>(),
  });

  const draftsStore = configureDraftsStore({
    listDraftsUseCase: unusedUseCase<ListDraftsUseCase>(),
    // The prompt phase asks for a "resume your draft" card on mount; there is none.
    getLatestDraftUseCase: {
      execute: () => Promise.resolve(ok(null)),
    } as unknown as GetLatestDraftUseCase,
    getDraftUseCase: unusedUseCase<GetDraftUseCase>(),
    upsertDraftUseCase: unusedUseCase<UpsertDraftUseCase>(),
    deleteDraftUseCase: unusedUseCase<DeleteDraftUseCase>(),
  });

  return { createdRecipesStore, draftsStore } as unknown as Stores;
};

type Generation = ReturnType<typeof useRecipeGeneration>;

interface HookDriver {
  /** The hook's latest return value (re-read after every act). */
  latest: () => Generation;
  /** Types a prompt into the input and taps Generate. */
  generate: (text?: string) => Promise<void>;
}

/**
 * Mounts the hook behind a probe that owns the editable-recipe state (the job
 * `useEditableRecipe` does on the real screen).
 */
const driveHook = (config: FakeRecipeRepositoryConfig): HookDriver => {
  let latest!: Generation;

  const Probe = (): null => {
    const [recipe, setRecipe] = useState<EditableRecipe>(emptyEditable());
    latest = useRecipeGeneration({
      recipe,
      setRecipe,
      isEditMode: false,
      activeDraftId: 'draft-1',
      draftId: undefined,
      importUrl: undefined,
    });
    return null;
  };

  renderComponent(
    <StoresProvider value={makeStores(config)}>
      <Probe />
    </StoresProvider>,
  );

  const generate = async (text: string = PROMPT): Promise<void> => {
    await act(async () => {
      latest.onChangePrompt(text);
    });
    await act(async () => {
      latest.onGenerate();
    });
  };

  return { latest: () => latest, generate };
};

afterEach(() => {
  jest.clearAllMocks();
});

// ─── the regression: a failed generate must reach the user ────────────────────

describe('useRecipeGeneration.runGenerate — the backend refuses the prompt (4xx)', () => {
  it('sets generateError to the aiPromptFailed copy when the generate fails with a ValidationFailure', async () => {
    const { latest, generate } = driveHook(rejectedPrompt());

    await generate();

    expect(latest().generateError).toBe(en.createRecipe.aiPromptFailed);
  });

  it('shows a danger toast carrying the aiPromptFailed copy', async () => {
    const { generate } = driveHook(rejectedPrompt());

    await generate();

    expect(showDangerToast).toHaveBeenCalledTimes(1);
    expect(showDangerToast).toHaveBeenCalledWith(en.createRecipe.aiPromptFailed);
  });

  it('does not fall back to the generic failure toast for a refused prompt', async () => {
    const { generate } = driveHook(rejectedPrompt());

    await generate();

    expect(showErrorToast).not.toHaveBeenCalled();
  });

  it('returns to the prompt phase so the user can rephrase', async () => {
    const { latest, generate } = driveHook(rejectedPrompt());

    await generate();

    expect(latest().phase).toBe('prompt');
  });

  // The wire format carries no machine-readable reason, so the client cannot know
  // a 4xx was the moderator. The copy must therefore hold for EVERY 4xx: a plain
  // 400 gets the same "rephrase and retry" advice, never an accusation of
  // inappropriate content.
  it('gives a plain 400 the same non-accusatory copy as a moderation 422', async () => {
    const { latest, generate } = driveHook(genericBadRequest());

    await generate();

    expect(latest().generateError).toBe(en.createRecipe.aiPromptFailed);
    expect(showDangerToast).toHaveBeenCalledWith(en.createRecipe.aiPromptFailed);
  });

  it('never surfaces the backend’s raw message for a 4xx', async () => {
    const { latest, generate } = driveHook(genericBadRequest());

    await generate();

    expect(latest().generateError).not.toContain('HTTP 400');
  });
});

describe('useRecipeGeneration.runGenerate — infrastructure failure', () => {
  it('passes the failure itself to showErrorToast so the copy is selected from its class', async () => {
    const failure = new NetworkFailure('axios ECONNREFUSED');
    const { generate } = driveHook({ generateRecipeResult: fail(failure) });

    await generate();

    expect(showErrorToast).toHaveBeenCalledTimes(1);
    expect(showErrorToast).toHaveBeenCalledWith(failure);
  });

  it('keeps a non-null inline generateError on the prompt phase after a NetworkFailure', async () => {
    const { latest, generate } = driveHook(offline());

    await generate();

    expect(latest().generateError).toBe(en.errors.network.short);
    expect(latest().phase).toBe('prompt');
  });

  it('does not raise the prompt-refused toast for a non-validation failure', async () => {
    const { generate } = driveHook(offline());

    await generate();

    expect(showDangerToast).not.toHaveBeenCalled();
  });
});

// ─── the happy path must stay quiet ──────────────────────────────────────────

describe('useRecipeGeneration.runGenerate — success', () => {
  it('moves to the preview phase and leaves generateError null', async () => {
    const { latest, generate } = driveHook(generated());

    await generate();

    expect(latest().phase).toBe('preview');
    expect(latest().generateError).toBeNull();
  });

  it('shows no toast at all when the recipe is generated', async () => {
    const { generate } = driveHook(generated());

    await generate();

    expect(showDangerToast).not.toHaveBeenCalled();
    expect(showErrorToast).not.toHaveBeenCalled();
  });
});

// ─── a failed run must not corrupt the transcript ────────────────────────────

describe('useRecipeGeneration.runGenerate — chat transcript on failure', () => {
  it('leaves the existing transcript intact when a regenerate from preview fails', async () => {
    const config = generated();
    const { latest, generate } = driveHook(config);
    await generate();
    const transcript = latest().chatHistory;
    expect(transcript).toHaveLength(2);

    config.generateRecipeResult = fail(new ValidationFailure('errors.ai.prompt_rejected'));
    await act(async () => {
      latest().onRegenerate();
    });

    // The failure is surfaced by the toast + inline error, NOT by overwriting the
    // transcript the user built in preview.
    expect(latest().chatHistory).toEqual(transcript);
    expect(latest().generateError).toBe(en.createRecipe.aiPromptFailed);
  });
});

// ─── the error must not outlive the condition that caused it ─────────────────

describe('useRecipeGeneration — clearing a stale generateError', () => {
  it('drops the inline error as soon as the user edits the prompt', async () => {
    const { latest, generate } = driveHook(rejectedPrompt());
    await generate();
    expect(latest().generateError).toBe(en.createRecipe.aiPromptFailed);

    await act(async () => {
      latest().onChangePrompt('a wholesome family dinner');
    });

    expect(latest().generateError).toBeNull();
  });

  // Tapping an idea chip edits the prompt just as typing does, so it must clear
  // the error too — otherwise the red border outlives the text that caused it.
  it('drops the inline error when the user appends an idea chip', async () => {
    const { latest, generate } = driveHook(rejectedPrompt());
    await generate();
    expect(latest().generateError).toBe(en.createRecipe.aiPromptFailed);

    await act(async () => {
      latest().onAppendChip('Vegetarian');
    });

    expect(latest().generateError).toBeNull();
    expect(latest().prompt).toContain('vegetarian');
  });

  it('does not leave a stale error behind when a retry succeeds', async () => {
    // The fake reads `config` on every call, so re-pointing it mid-test is what
    // "the network came back" looks like to the hook.
    const config = offline();
    const { latest, generate } = driveHook(config);
    await generate();
    expect(latest().generateError).toBe(en.errors.network.short);

    config.generateRecipeResult = ok(makeRecipe());
    await act(async () => {
      latest().onRegenerate();
    });

    expect(latest().generateError).toBeNull();
    expect(latest().phase).toBe('preview');
  });
});
