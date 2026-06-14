import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import { useTaxonomyLabel } from '@presentation/screens/recipes/use-taxonomy-label';
import { useTaxonomyOptions } from '@presentation/screens/recipes/use-taxonomy-options';

export interface CuisineStripProps {
  selectedCuisines: string[];
  onToggle: (cuisine: string) => void;
}

/**
 * Horizontal quick-filter strip showing the full backend cuisine catalog (with
 * a local enum fallback before the taxonomy store is `ready`); it scrolls
 * horizontally so a long list stays usable. Each chip's name + emoji is
 * resolved through {@link useTaxonomyLabel}, so the display comes from the
 * backend taxonomy (localized) with a local fallback.
 */
export const CuisineStrip = ({ selectedCuisines, onToggle }: CuisineStripProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const { cuisineLabel } = useTaxonomyLabel();
  const { cuisineKeys } = useTaxonomyOptions();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText variant="body" style={styles.sectionTitle}>
          {t().recipes.browseCuisines}
        </ThemedText>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {cuisineKeys.map((cuisine) => {
          const active = selectedCuisines.includes(cuisine);
          const { name, emoji } = cuisineLabel(cuisine);
          return (
            <Pressable
              key={cuisine}
              onPress={() => onToggle(cuisine)}
              accessibilityRole="button"
              accessibilityLabel={name}
              style={styles.item}
            >
              <View
                style={[
                  styles.circle,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <ThemedText style={styles.emoji}>{emoji}</ThemedText>
              </View>
              <ThemedText
                variant="caption"
                style={[styles.label, { color: active ? colors.primary : colors.textMuted }]}
                numberOfLines={1}
              >
                {name}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  item: {
    alignItems: 'center',
    gap: spacing.xs,
    width: sizes.avatarMd,
  },
  circle: {
    width: sizes.avatarMd,
    height: sizes.avatarMd,
    borderRadius: sizes.avatarMd / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  emoji: {
    fontSize: fontSizes.subheading,
  },
  label: {
    fontSize: fontSizes.micro,
    textAlign: 'center',
    fontWeight: '500',
  },
});
