import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, fontSizes, sizes } from '@presentation/base/theme';
import { CUISINE_KEY_VALUES, type CuisineKey } from '@domain/recipes/cuisine-key';
import { t } from '@presentation/i18n';
import { useTaxonomyLabel } from '@presentation/screens/recipes/use-taxonomy-label';

export interface CuisineStripProps {
  selectedCuisines: CuisineKey[];
  onToggle: (cuisine: CuisineKey) => void;
}

/**
 * Horizontal quick-filter strip. The option set stays the curated local enum
 * (`CUISINE_KEY_VALUES`, 15 entries) so the strip stays scannable — the full
 * backend catalog (44 cuisines) is offered in the filter sheet instead. Each
 * chip's name + emoji is resolved through {@link useTaxonomyLabel}, so the
 * display comes from the backend taxonomy (localized) with a local fallback.
 */
export const CuisineStrip = ({ selectedCuisines, onToggle }: CuisineStripProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const { cuisineLabel } = useTaxonomyLabel();
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
        {CUISINE_KEY_VALUES.map((cuisine) => {
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
