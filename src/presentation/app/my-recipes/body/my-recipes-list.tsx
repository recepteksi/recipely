import { FlatList, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { RecipeCard } from '@presentation/base/widgets/cards/recipe-card';
import { PrimaryButton } from '@presentation/base/widgets/buttons/primary-button';
import { DraftCard } from '@presentation/app/my-recipes/items/draft-card';
import { WebRecipeCard } from '@presentation/app/recipes/items/web-recipe-card';
import type { Tab } from '@presentation/app/my-recipes/model/tab';
import { GRID_GAP } from '@presentation/app/my-recipes/model/grid-metrics';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import type { RecipeSummary } from '@domain/recipes/recipe-summary';

type DraftItem = React.ComponentProps<typeof DraftCard>['draft'];

export interface MyRecipesListProps {
  tab: Tab;
  drafts: readonly DraftItem[];
  items: readonly RecipeSummary[];
  gridColumns: number;
  isWebShell: boolean;
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
  onOpenRecipe: (id: string) => void;
  onOpenDraft: (id: string) => void;
  onDeleteDraft: (id: string) => void;
  onCreate: () => void;
}

/**
 * Renders the active My-Recipes tab body: the drafts list, an empty state, or
 * the saved/created recipe grid (single column on mobile, multi-column on web).
 */
export const MyRecipesList = ({
  tab,
  drafts,
  items,
  gridColumns,
  isWebShell,
  isSaved,
  onToggleSave,
  onOpenRecipe,
  onOpenDraft,
  onDeleteDraft,
  onCreate,
}: MyRecipesListProps): React.JSX.Element => {
  const colors = useTheme().colors;

  if (tab === 'drafts') {
    if (drafts.length === 0) {
      return (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="file-document-edit-outline" size={56} color={colors.textMuted} />
          <ThemedText variant="body" muted style={styles.emptyText}>
            {t().drafts.empty}
          </ThemedText>
        </View>
      );
    }
    return (
      <FlatList
        data={drafts}
        keyExtractor={(d) => d.id}
        renderItem={({ item }) => (
          <DraftCard
            draft={item}
            onOpen={() => onOpenDraft(item.id)}
            onDelete={() => onDeleteDraft(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        style={styles.list}
      />
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons
          name={tab === 'saved' ? 'bookmark-outline' : 'silverware-fork-knife'}
          size={56}
          color={colors.textMuted}
        />
        <ThemedText variant="body" muted style={styles.emptyText}>
          {tab === 'saved' ? t().myRecipes.emptySaved : t().myRecipes.emptyCreated}
        </ThemedText>
        {tab === 'created' ? (
          <View style={styles.emptyAction}>
            <PrimaryButton label={t().myRecipes.createNew} onPress={onCreate} />
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <FlatList
      key={`grid-${gridColumns}`}
      data={items as RecipeSummary[]}
      keyExtractor={(r) => r.id}
      numColumns={gridColumns}
      renderItem={({ item }) => (
        <View style={gridColumns > 1 ? styles.gridCell : null}>
          {isWebShell ? (
            <WebRecipeCard
              recipe={item}
              saved={isSaved(item.id)}
              onOpen={onOpenRecipe}
              onToggleSave={onToggleSave}
              ownedByMe={tab === 'created'}
            />
          ) : (
            <RecipeCard
              name={item.name}
              image={item.image}
              cuisine={item.cuisine}
              difficulty={item.difficulty}
              rating={item.rating}
              onPress={() => onOpenRecipe(item.id)}
            />
          )}
        </View>
      )}
      columnWrapperStyle={gridColumns > 1 ? styles.gridRow : undefined}
      ItemSeparatorComponent={gridColumns === 1 ? () => <View style={styles.separator} /> : undefined}
      contentContainerStyle={[styles.listContent, gridColumns > 1 ? styles.gridContent : null]}
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  list: {
    flex: 1,
  },
  separator: {
    height: spacing.md,
  },
  gridRow: {
    gap: GRID_GAP,
    paddingHorizontal: spacing.lg,
  },
  gridContent: {
    paddingHorizontal: 0,
    paddingTop: spacing.md,
    gap: GRID_GAP,
  },
  gridCell: {
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  emptyText: {
    textAlign: 'center',
  },
  emptyAction: {
    marginTop: spacing.sm,
    width: '100%',
    maxWidth: 240,
  },
});
