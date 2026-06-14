import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import { CUISINE_KEY_VALUES, type CuisineKey } from '@domain/recipes/cuisine-key';
import { RECIPE_CATEGORY_VALUES, type RecipeCategory } from '@domain/recipes/recipe-category';
import { CUISINE_EMOJI } from '@presentation/screens/create-recipe/cuisine-emoji';
import { CATEGORY_EMOJI } from '@presentation/screens/create-recipe/category-emoji';

type TaxonomyValue = CuisineKey | RecipeCategory;

/**
 * Discriminated on `kind` so the call site is fully type-safe: a `'cuisine'`
 * sheet only accepts/emits `CuisineKey`, a `'category'` sheet only
 * `RecipeCategory`. No casts are needed at the call site.
 */
export type TaxonomyPickerSheetProps = {
  visible: boolean;
  onClose: () => void;
} & (
  | { kind: 'cuisine'; selected: CuisineKey | null; onSelect: (value: CuisineKey) => void }
  | { kind: 'category'; selected: RecipeCategory | null; onSelect: (value: RecipeCategory) => void }
);

const GRID_COLUMNS = 3;

interface Catalog {
  values: readonly TaxonomyValue[];
  emoji: Record<string, string>;
  names: Record<string, string>;
  title: string;
}

const useCatalog = (kind: 'cuisine' | 'category'): Catalog => {
  const tr = t();
  if (kind === 'cuisine') {
    return {
      values: CUISINE_KEY_VALUES,
      emoji: CUISINE_EMOJI,
      names: tr.cuisineNames,
      title: tr.createRecipe.pickCuisineTitle,
    };
  }
  return {
    values: RECIPE_CATEGORY_VALUES,
    emoji: CATEGORY_EMOJI,
    names: tr.categoryNames,
    title: tr.createRecipe.pickCategoryTitle,
  };
};

/**
 * Bottom-sheet picker rendering a 3-column emoji grid for either the cuisine
 * or category catalog. The currently-selected option is highlighted; tapping
 * an option reports it back and closes the sheet.
 */
export const TaxonomyPickerSheet = (props: TaxonomyPickerSheetProps): React.JSX.Element => {
  const { visible, kind, selected, onClose } = props;
  const colors = useTheme().colors;
  const insets = useSafeAreaInsets();
  const catalog = useCatalog(kind);

  // `value` always comes from the catalog matching `kind`, so dispatching on
  // `props.kind` is sound; TS can't prove it through the generic catalog list.
  const handleSelect = (value: TaxonomyValue): void => {
    if (props.kind === 'cuisine') props.onSelect(value as CuisineKey);
    else props.onSelect(value as RecipeCategory);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          { backgroundColor: colors.background, paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        <View style={styles.header}>
          <ThemedText variant="title">{catalog.title}</ThemedText>
          <Pressable
            onPress={onClose}
            hitSlop={spacing.sm}
            style={[styles.closeBtn, { backgroundColor: colors.surface }]}
            accessibilityRole="button"
            accessibilityLabel={t().common.cancel}
          >
            <Ionicons name="close" size={sizes.iconSm} color={colors.text} />
          </Pressable>
        </View>
        <FlatList
          data={catalog.values}
          numColumns={GRID_COLUMNS}
          keyExtractor={(value) => value}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const active = item === selected;
            return (
              <Pressable
                onPress={() => handleSelect(item)}
                accessibilityRole="button"
                accessibilityLabel={catalog.names[item]}
                style={[
                  styles.option,
                  {
                    backgroundColor: active ? colors.chipBackground : colors.surface,
                    borderColor: active ? colors.primary : colors.cardBorder,
                  },
                ]}
              >
                <ThemedText style={styles.optionEmoji}>{catalog.emoji[item]}</ThemedText>
                <ThemedText
                  variant="caption"
                  numberOfLines={1}
                  style={[styles.optionLabel, { color: active ? colors.primary : colors.text }]}
                >
                  {catalog.names[item]}
                </ThemedText>
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    maxHeight: '78%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  closeBtn: {
    width: sizes.iconBtn,
    height: sizes.iconBtn,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  row: {
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1.5,
  },
  optionEmoji: {
    fontSize: fontSizes.title,
  },
  optionLabel: {
    fontSize: fontSizes.micro,
    fontWeight: '600',
    textAlign: 'center',
  },
});
