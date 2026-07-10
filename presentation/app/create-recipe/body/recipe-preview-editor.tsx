import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { RecipeImage } from '@presentation/base/widgets/media/recipe-image';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import { Difficulty } from '@domain/recipes/difficulty';
import type { EditableRecipe } from '@presentation/app/create-recipe/model/editable-recipe';
import { SpecRow } from '@presentation/app/create-recipe/items/spec-row';
import { Stepper } from '@presentation/app/create-recipe/body/stepper';
import { DifficultyToggle } from '@presentation/app/create-recipe/items/difficulty-toggle';
import { IngredientRow } from '@presentation/app/create-recipe/items/ingredient-row';
import { StepRow } from '@presentation/app/create-recipe/items/step-row';
import { SelectTile } from '@presentation/app/create-recipe/items/select-tile';
import { TaxonomyPickerSheet } from '@presentation/app/create-recipe/sheets/taxonomy-picker-sheet';
import { TAXONOMY_PLACEHOLDER_EMOJI } from '@presentation/app/create-recipe/model/taxonomy-placeholder';
import { useTaxonomyLabel } from '@presentation/app/recipes/shared/hooks/use-taxonomy-label';
import { FieldErrorText } from '@presentation/app/create-recipe/items/field-error-text';
import { NO_CREATE_RECIPE_FIELD_ERRORS } from '@presentation/app/create-recipe/model/map-field-errors-to-inputs';
import type { CreateRecipeFieldErrors } from '@presentation/app/create-recipe/model/create-recipe-field-errors';

export interface RecipePreviewEditorProps {
  recipe: EditableRecipe;
  missingMessage: string | null;
  /** Per-field backend validation messages, keyed by input — highlights the offending fields. */
  fieldErrors?: CreateRecipeFieldErrors['fields'];
  onChangeName: (value: string) => void;
  onChangeCuisine: (value: string) => void;
  onChangeCategory: (value: string) => void;
  onChangeServings: (value: number) => void;
  onChangeDifficulty: (value: Difficulty) => void;
  onChangePrep: (value: number) => void;
  onChangeCook: (value: number) => void;
  onChangeIngredient: (index: number, value: string) => void;
  onRemoveIngredient: (index: number) => void;
  onAddIngredient: () => void;
  onChangeStep: (index: number, value: string) => void;
  onRemoveStep: (index: number) => void;
  onAddStep: () => void;
  onOpenPhotos: () => void;
}

const SERVINGS_MIN = 1;
const SERVINGS_MAX = 50;
const TIME_STEP = 5;
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  [Difficulty.Easy]: 'Easy',
  [Difficulty.Medium]: 'Medium',
  [Difficulty.Hard]: 'Hard',
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/** Inline live editor of every recipe field shown in the preview phase. */
export const RecipePreviewEditor = ({
  recipe,
  missingMessage,
  fieldErrors = NO_CREATE_RECIPE_FIELD_ERRORS.fields,
  onChangeName,
  onChangeCuisine,
  onChangeCategory,
  onChangeServings,
  onChangeDifficulty,
  onChangePrep,
  onChangeCook,
  onChangeIngredient,
  onRemoveIngredient,
  onAddIngredient,
  onChangeStep,
  onRemoveStep,
  onAddStep,
  onOpenPhotos,
}: RecipePreviewEditorProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const { cuisineLabel, categoryLabel } = useTaxonomyLabel();
  const [picker, setPicker] = useState<'cuisine' | 'category' | null>(null);
  const cuisine = recipe.cuisine !== null ? cuisineLabel(recipe.cuisine) : null;
  const category = categoryLabel(recipe.category);
  const cover = recipe.media.find((m) => m.type === 'image');
  const ingredientCount = recipe.ingredients.filter((s) => s.trim().length > 0).length;
  const stepCount = recipe.instructions.filter((s) => s.trim().length > 0).length;

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
      <View style={[styles.cover, { backgroundColor: colors.skeleton }]}>
        <RecipeImage uri={cover?.url} style={styles.coverImage} placeholderLabel={t().recipes.noPhoto} />
        <Pressable
          onPress={onOpenPhotos}
          style={[styles.photoBtn, { backgroundColor: colors.overlay }]}
          accessibilityRole="button"
          accessibilityLabel={cover !== undefined ? t().createRecipe.changePhoto : t().createRecipe.addPhoto}
        >
          <Ionicons name="camera" size={sizes.iconSm} color={colors.onOverlay} />
          <ThemedText variant="caption" style={[styles.photoLabel, { color: colors.onOverlay }]}>
            {cover !== undefined ? t().createRecipe.changePhoto : t().createRecipe.addPhoto}
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View>
          <TextInput
            value={recipe.name}
            onChangeText={onChangeName}
            placeholder={t().createRecipe.namePlaceholder}
            placeholderTextColor={colors.textMuted}
            style={[
              styles.nameInput,
              { color: colors.text },
              fieldErrors.name !== undefined
                ? { borderWidth: 1.5, borderColor: colors.danger, borderRadius: radii.md, padding: spacing.sm }
                : null,
            ]}
          />
          {fieldErrors.name !== undefined ? <FieldErrorText message={fieldErrors.name} /> : null}
          <View style={styles.taxonomyRow}>
            <SelectTile
              label={t().createRecipe.cuisineLabel}
              emoji={cuisine?.emoji ?? TAXONOMY_PLACEHOLDER_EMOJI}
              value={cuisine?.name ?? null}
              placeholder={t().createRecipe.selectCuisine}
              onPress={() => setPicker('cuisine')}
              error={fieldErrors.cuisine}
            />
            <SelectTile
              label={t().createRecipe.categoryLabel}
              emoji={category.emoji}
              value={category.name}
              placeholder={t().createRecipe.selectCategory}
              onPress={() => setPicker('category')}
              error={fieldErrors.category}
            />
          </View>
        </View>

        <View style={[styles.specCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <SpecRow icon="people" label={t().createRecipe.servings} error={fieldErrors.servings}>
            <Stepper
              value={recipe.servings}
              decreaseLabel={t().createRecipe.servings}
              increaseLabel={t().createRecipe.servings}
              onDecrement={() => onChangeServings(clamp(recipe.servings - 1, SERVINGS_MIN, SERVINGS_MAX))}
              onIncrement={() => onChangeServings(clamp(recipe.servings + 1, SERVINGS_MIN, SERVINGS_MAX))}
            />
          </SpecRow>
          <SpecRow icon="speedometer" label={t().createRecipe.difficulty} error={fieldErrors.difficulty}>
            <DifficultyToggle
              value={recipe.difficulty}
              label={(d) => DIFFICULTY_LABELS[d]}
              onChange={onChangeDifficulty}
            />
          </SpecRow>
          <SpecRow icon="time-outline" label={t().createRecipe.prep} error={fieldErrors.prepTimeMinutes}>
            <Stepper
              value={recipe.prepTimeMinutes}
              suffix={t().createRecipe.minShort}
              decreaseLabel={t().createRecipe.prep}
              increaseLabel={t().createRecipe.prep}
              onDecrement={() => onChangePrep(Math.max(0, recipe.prepTimeMinutes - TIME_STEP))}
              onIncrement={() => onChangePrep(recipe.prepTimeMinutes + TIME_STEP)}
            />
          </SpecRow>
          <SpecRow icon="flame" label={t().createRecipe.cook} error={fieldErrors.cookTimeMinutes} last>
            <Stepper
              value={recipe.cookTimeMinutes}
              suffix={t().createRecipe.minShort}
              decreaseLabel={t().createRecipe.cook}
              increaseLabel={t().createRecipe.cook}
              onDecrement={() => onChangeCook(Math.max(0, recipe.cookTimeMinutes - TIME_STEP))}
              onIncrement={() => onChangeCook(recipe.cookTimeMinutes + TIME_STEP)}
            />
          </SpecRow>
        </View>

        <View>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitle}>
              <Ionicons name="restaurant-outline" size={sizes.iconXxs} color={colors.primary} />
              <ThemedText variant="subtitle">{t().recipes.ingredients}</ThemedText>
            </View>
            <ThemedText variant="caption" muted>{ingredientCount}</ThemedText>
          </View>
          {fieldErrors.ingredients !== undefined ? (
            <FieldErrorText message={fieldErrors.ingredients} />
          ) : null}
          <View
            style={[
              styles.ingredientList,
              fieldErrors.ingredients !== undefined
                ? { borderWidth: 1, borderColor: colors.danger, borderRadius: radii.lg, padding: spacing.xs }
                : null,
            ]}
          >
            {recipe.ingredients.map((value, i) => (
              <IngredientRow
                key={`ing-${i}`}
                value={value}
                onChange={(v) => onChangeIngredient(i, v)}
                onRemove={() => onRemoveIngredient(i)}
                removeLabel={t().mediaPicker.remove}
              />
            ))}
          </View>
          <Pressable
            onPress={onAddIngredient}
            style={[styles.addBtn, { borderColor: colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel={t().createRecipe.addIngredient}
          >
            <Ionicons name="add" size={sizes.iconSm} color={colors.primary} />
            <ThemedText variant="body" style={[styles.addLabel, { color: colors.primary }]}>
              {t().createRecipe.addIngredient}
            </ThemedText>
          </Pressable>
        </View>

        <View>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitle}>
              <Ionicons name="flame" size={sizes.iconXxs} color={colors.primary} />
              <ThemedText variant="subtitle">{t().recipes.instructions}</ThemedText>
            </View>
            <ThemedText variant="caption" muted>{stepCount}</ThemedText>
          </View>
          {fieldErrors.instructions !== undefined ? (
            <FieldErrorText message={fieldErrors.instructions} />
          ) : null}
          <View
            style={[
              styles.stepList,
              fieldErrors.instructions !== undefined
                ? { borderWidth: 1, borderColor: colors.danger, borderRadius: radii.lg, padding: spacing.xs }
                : null,
            ]}
          >
            {recipe.instructions.map((value, i) => (
              <StepRow
                key={`step-${i}`}
                index={i}
                value={value}
                onChange={(v) => onChangeStep(i, v)}
                onRemove={() => onRemoveStep(i)}
                removeLabel={t().mediaPicker.remove}
              />
            ))}
          </View>
          <Pressable
            onPress={onAddStep}
            style={[styles.addBtn, { borderColor: colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel={t().createRecipe.addStep}
          >
            <Ionicons name="add" size={sizes.iconSm} color={colors.primary} />
            <ThemedText variant="body" style={[styles.addLabel, { color: colors.primary }]}>
              {t().createRecipe.addStep}
            </ThemedText>
          </Pressable>
        </View>

        {missingMessage !== null ? (
          <ThemedText variant="caption" style={[styles.missing, { color: colors.danger }]}>
            {missingMessage}
          </ThemedText>
        ) : null}
      </View>

      <TaxonomyPickerSheet
        visible={picker === 'cuisine'}
        kind="cuisine"
        selected={recipe.cuisine}
        onSelect={onChangeCuisine}
        onClose={() => setPicker(null)}
      />
      <TaxonomyPickerSheet
        visible={picker === 'category'}
        kind="category"
        selected={recipe.category}
        onSelect={onChangeCategory}
        onClose={() => setPicker(null)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.lg,
  },
  cover: {
    height: sizes.heroImageHeight,
    maxHeight: 200,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoBtn: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs2,
    height: sizes.iconBtn,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
  },
  photoLabel: {
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  nameInput: {
    fontSize: fontSizes.title,
    fontWeight: '800',
    letterSpacing: -0.4,
    padding: 0,
  },
  taxonomyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  specCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ingredientList: {
    gap: spacing.xxs,
  },
  stepList: {
    gap: spacing.sm,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs2,
    height: sizes.searchBarHeight,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: spacing.sm,
  },
  addLabel: {
    fontWeight: '600',
    fontSize: fontSizes.medium,
  },
  missing: {
    textAlign: 'center',
  },
});
