/**
 * Behavior tests for `useRecipeSave` — the save-feedback rework.
 *
 * The bugs being pinned: (1) a rejected submission used to render as a caption
 * at the BOTTOM of the scrollable editor, invisible when scrolled up — it now
 * flows through the form-level banner (`missingMessage`) plus inline field
 * errors; (2) validation failures used to split across two toasts — toasts are
 * gone from this path entirely; (3) a successful save used to navigate away
 * silently — it now surfaces a `saveSuccess` state that drives the SuccessSheet
 * dialog, and navigation only happens from the dialog's actions.
 *
 * Harness: same as use-recipe-generation.test.tsx — the hook is driven through
 * a probe component with the REAL Zustand stores wired to `FakeRecipeRepository`,
 * exercising hook -> store -> use case -> repository end to end. `show-toast` is
 * module-mocked purely to assert it is never called from this flow again.
 */

import { useState } from 'react';
import { act } from 'react-test-renderer';
import { UnknownFailure, ValidationFailure } from '@core/failure';
import { fail, ok } from '@core/result/result-helpers';
import { Recipe } from '@domain/recipes/recipe';
import { CuisineKey } from '@domain/recipes/cuisine-key';
import { RecipeCategory } from '@domain/recipes/recipe-category';
import { Difficulty } from '@domain/recipes/difficulty';
import { FakeRecipeRepository } from '@application/__fixtures__/fake-recipe-repository';
import type { FakeRecipeRepositoryConfig } from '@application/__fixtures__/fake-recipe-repository-config';
import { CreateRecipeUseCase } from '@application/recipes/create-recipe-use-case';
import { UpdateRecipeUseCase } from '@application/recipes/update-recipe-use-case';
import { configureCreatedRecipesStore } from '@application/recipes/configure-created-recipes-store';
import { configureDraftsStore } from '@application/drafts/configure-drafts-store';
import type { GenerateRecipeUseCase } from '@application/recipes/generate-recipe-use-case';
import type { RefineRecipeUseCase } from '@application/recipes/refine-recipe-use-case';
import type { ImportInstagramRecipeUseCase } from '@application/recipes/import-instagram-recipe-use-case';
import type { ListMyRecipesUseCase } from '@application/recipes/list-my-recipes-use-case';
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
import { useRecipeSave } from '@presentation/app/create-recipe/hooks/use-recipe-save';
import { emptyEditable } from '@presentation/app/create-recipe/model/recipe-mapping';
import { NO_CREATE_RECIPE_FIELD_ERRORS } from '@presentation/app/create-recipe/model/map-field-errors-to-inputs';
import type { CreateRecipeFieldErrors } from '@presentation/app/create-recipe/model/create-recipe-field-errors';
import type { EditableRecipe } from '@presentation/app/create-recipe/model/editable-recipe';
import { en } from '@presentation/i18n/en';

// ─── module mocks ────────────────────────────────────────────────────────────

jest.mock('@presentation/base/feedback/show-toast', () => ({
  showDangerToast: jest.fn(),
  showErrorToast: jest.fn(),
}));

const mockReplace = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ replace: mockReplace, back: mockBack })),
}));

// ─── fixtures ────────────────────────────────────────────────────────────────

const CREATED_ID = 'r-created';
const COVER = { type: 'image', url: 'https://cdn.example.com/cover.webp' } as const;

const makeRecipe = (id: string): Recipe => {
  const result = Recipe.create({
    id,
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
    image: COVER.url,
    media: [COVER],
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

/** An editable model that passes every pre-submit guard. */
const publishable = (): EditableRecipe => ({
  ...emptyEditable(),
  name: 'Garlic Pasta',
  ingredients: ['pasta', 'garlic'],
  instructions: ['boil', 'toss'],
  media: [COVER],
});

const unusedUseCase = <T,>(): T =>
  ({ execute: () => Promise.resolve(fail(new UnknownFailure('not used'))) }) as unknown as T;

const noopCacheStore = <T,>(): T =>
  ({ getState: () => ({ replace: () => undefined, remove: () => undefined }) }) as unknown as T;

/**
 * Real createdRecipesStore + draftsStore, with create/update wired through the
 * real use cases down to a `FakeRecipeRepository` reading `config`.
 */
const makeStores = (config: FakeRecipeRepositoryConfig): Stores => {
  const repo = new FakeRecipeRepository(config);
  const createdRecipesStore = configureCreatedRecipesStore({
    createRecipeUseCase: new CreateRecipeUseCase(repo),
    listMyRecipesUseCase: unusedUseCase<ListMyRecipesUseCase>(),
    generateRecipeUseCase: unusedUseCase<GenerateRecipeUseCase>(),
    refineRecipeUseCase: unusedUseCase<RefineRecipeUseCase>(),
    importInstagramRecipeUseCase: unusedUseCase<ImportInstagramRecipeUseCase>(),
    updateRecipeUseCase: new UpdateRecipeUseCase(repo),
    deleteRecipeUseCase: unusedUseCase<DeleteRecipeUseCase>(),
    recipeListStore: noopCacheStore<RecipeListStore>(),
    recipeDetailStore: noopCacheStore<RecipeDetailStore>(),
  });

  const draftsStore = configureDraftsStore({
    listDraftsUseCase: unusedUseCase<ListDraftsUseCase>(),
    getLatestDraftUseCase: { execute: () => Promise.resolve(ok(null)) } as unknown as GetLatestDraftUseCase,
    getDraftUseCase: unusedUseCase<GetDraftUseCase>(),
    upsertDraftUseCase: unusedUseCase<UpsertDraftUseCase>(),
    // Publish success deletes the working draft as best-effort cleanup.
    deleteDraftUseCase: { execute: () => Promise.resolve(ok(undefined)) } as unknown as DeleteDraftUseCase,
  });

  return { createdRecipesStore, draftsStore } as unknown as Stores;
};

type Save = ReturnType<typeof useRecipeSave>;

interface HookDriver {
  latest: () => Save;
  fieldErrors: () => CreateRecipeFieldErrors;
  missingMessage: () => string | null;
  save: () => Promise<void>;
}

/**
 * Mounts the hook behind a probe that owns the banner + field-error state (the
 * job `useEditableRecipe` does on the real screen), so assertions can read what
 * the hook pushed into them.
 */
const driveHook = (
  config: FakeRecipeRepositoryConfig,
  recipe: EditableRecipe,
  edit?: { recipeId: string },
): HookDriver => {
  let latest!: Save;
  let fieldErrors: CreateRecipeFieldErrors = NO_CREATE_RECIPE_FIELD_ERRORS;
  let missingMessage: string | null = null;

  const Probe = (): null => {
    const [errors, setErrors] = useState<CreateRecipeFieldErrors>(NO_CREATE_RECIPE_FIELD_ERRORS);
    const [missing, setMissing] = useState<string | null>(null);
    fieldErrors = errors;
    missingMessage = missing;
    latest = useRecipeSave({
      recipe,
      recipeId: edit?.recipeId,
      isEditMode: edit !== undefined,
      activeDraftId: 'draft-1',
      setFieldErrors: setErrors,
      setMissingMessage: setMissing,
    });
    return null;
  };

  renderComponent(
    <StoresProvider value={makeStores(config)}>
      <Probe />
    </StoresProvider>,
  );

  return {
    latest: () => latest,
    fieldErrors: () => fieldErrors,
    missingMessage: () => missingMessage,
    save: async () => {
      await act(async () => {
        latest.onSave();
      });
    },
  };
};

// ─── tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useRecipeSave — pre-submit guards', () => {
  it('sets the form banner and inline field errors when name and ingredients are missing', async () => {
    const driver = driveHook({}, emptyEditable());

    await driver.save();

    expect(driver.missingMessage()).toBe(en.createRecipe.missing);
    expect(driver.fieldErrors().fields.name).toBe(en.createRecipe.nameRequired);
    expect(driver.fieldErrors().fields.ingredients).toBe(en.createRecipe.ingredientsRequired);
    expect(driver.latest().saveSuccess).toBeNull();
  });

  it('sets the no-image banner when text is complete but no photo was added', async () => {
    const driver = driveHook({}, { ...publishable(), media: [] });

    await driver.save();

    expect(driver.missingMessage()).toBe(en.createRecipe.noImage);
    expect(driver.latest().saveSuccess).toBeNull();
  });
});

describe('useRecipeSave — publish', () => {
  it('surfaces success as a dialog state instead of navigating away silently', async () => {
    const driver = driveHook({ createRecipeResult: ok(makeRecipe(CREATED_ID)) }, publishable());

    await driver.save();

    expect(driver.latest().saveSuccess).toEqual({ mode: 'publish', recipeId: CREATED_ID });
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('deep-links to the new recipe from the success dialog primary action', async () => {
    const driver = driveHook({ createRecipeResult: ok(makeRecipe(CREATED_ID)) }, publishable());

    await driver.save();
    act(() => driver.latest().onSuccessPrimary());

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/recipes/[recipeId]',
      params: { recipeId: CREATED_ID },
    });
    expect(driver.latest().saveSuccess).toBeNull();
  });

  it('goes to My Recipes when the success dialog is dismissed', async () => {
    const driver = driveHook({ createRecipeResult: ok(makeRecipe(CREATED_ID)) }, publishable());

    await driver.save();
    act(() => driver.latest().onCloseSuccess());

    expect(mockReplace).toHaveBeenCalledWith('/my-recipes');
    expect(driver.latest().saveSuccess).toBeNull();
  });

  it('routes a validation failure to the banner + inline fields with no toasts', async () => {
    const failure = new ValidationFailure(
      'name: Name is too short; image: Cover image is required',
    );
    const driver = driveHook({ createRecipeResult: fail(failure) }, publishable());

    await driver.save();

    expect(driver.fieldErrors().fields.name).toBe('Name is too short');
    expect(driver.missingMessage()).toBe(
      `${en.errors.validation.short} image: Cover image is required`,
    );
    expect(showErrorToast).not.toHaveBeenCalled();
    expect(showDangerToast).not.toHaveBeenCalled();
    expect(driver.latest().saveSuccess).toBeNull();
  });
});

describe('useRecipeSave — update', () => {
  it('surfaces update success as a dialog state and navigates back on dismiss', async () => {
    const driver = driveHook(
      { updateRecipeResult: ok(makeRecipe('r-1')) },
      publishable(),
      { recipeId: 'r-1' },
    );

    await driver.save();

    expect(driver.latest().saveSuccess).toEqual({ mode: 'update' });
    expect(mockBack).not.toHaveBeenCalled();

    act(() => driver.latest().onCloseSuccess());

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(driver.latest().saveSuccess).toBeNull();
  });
});
