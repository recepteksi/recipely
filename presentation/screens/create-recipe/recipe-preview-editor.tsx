import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { RecipeImage } from '@presentation/base/widgets/recipe-image';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import { Difficulty } from '@domain/recipes/difficulty';
import type { EditableRecipe } from '@presentation/screens/create-recipe/editable-recipe';
import { SpecRow } from '@presentation/screens/create-recipe/spec-row';
import { Stepper } from '@presentation/screens/create-recipe/stepper';
import { DifficultyToggle } from '@presentation/screens/create-recipe/difficulty-toggle';
import { IngredientRow } from '@presentation/screens/create-recipe/ingredient-row';
import { StepRow } from '@presentation/screens/create-recipe/step-row';

export interface RecipePreviewEditorProps {
  recipe: EditableRecipe;
  onChangeName: (value: string) => void;
  onChangeCuisine: (value: string) => void;
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
  onChangeName,
  onChangeCuisine,
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
            style={[styles.nameInput, { color: colors.text }]}
          />
          <TextInput
            value={recipe.cuisine}
            onChangeText={onChangeCuisine}
            placeholder={t().createRecipe.cuisinePlaceholder}
            placeholderTextColor={colors.textMuted}
            style={[styles.cuisineInput, { color: colors.primary }]}
          />
        </View>

        <View style={[styles.specCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <SpecRow icon="people" label={t().createRecipe.servings}>
            <Stepper
              value={recipe.servings}
              decreaseLabel={t().createRecipe.servings}
              increaseLabel={t().createRecipe.servings}
              onDecrement={() => onChangeServings(clamp(recipe.servings - 1, SERVINGS_MIN, SERVINGS_MAX))}
              onIncrement={() => onChangeServings(clamp(recipe.servings + 1, SERVINGS_MIN, SERVINGS_MAX))}
            />
          </SpecRow>
          <SpecRow icon="speedometer" label={t().createRecipe.difficulty}>
            <DifficultyToggle
              value={recipe.difficulty}
              label={(d) => DIFFICULTY_LABELS[d]}
              onChange={onChangeDifficulty}
            />
          </SpecRow>
          <SpecRow icon="time-outline" label={t().createRecipe.prep}>
            <Stepper
              value={recipe.prepTimeMinutes}
              suffix={t().createRecipe.minShort}
              decreaseLabel={t().createRecipe.prep}
              increaseLabel={t().createRecipe.prep}
              onDecrement={() => onChangePrep(Math.max(0, recipe.prepTimeMinutes - TIME_STEP))}
              onIncrement={() => onChangePrep(recipe.prepTimeMinutes + TIME_STEP)}
            />
          </SpecRow>
          <SpecRow icon="flame" label={t().createRecipe.cook} last>
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
          <View style={styles.ingredientList}>
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
          <View style={styles.stepList}>
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
      </View>
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
  cuisineInput: {
    fontSize: fontSizes.medium,
    fontWeight: '600',
    paddingTop: spacing.xs,
    paddingBottom: 0,
    paddingHorizontal: 0,
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
});
