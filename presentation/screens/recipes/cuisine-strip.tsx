import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, fontSizes, sizes } from '@presentation/base/theme';
import { CUISINE_KEY_VALUES, type CuisineKey } from '@domain/recipes/cuisine-key';
import { t } from '@presentation/i18n';

const CUISINE_EMOJI: Record<CuisineKey, string> = {
  TURKISH: '🥙',
  ITALIAN: '🍕',
  MEXICAN: '🌮',
  CHINESE: '🥟',
  JAPANESE: '🍣',
  INDIAN: '🍛',
  FRENCH: '🥐',
  GREEK: '🫒',
  AMERICAN: '🍔',
  MEDITERRANEAN: '🍋',
  THAI: '🍜',
  SPANISH: '🥘',
  KOREAN: '🍱',
  MIDDLE_EASTERN: '🧆',
  OTHER: '🍽️',
};

const CUISINE_LABEL: Record<CuisineKey, string> = {
  TURKISH: 'Turkish',
  ITALIAN: 'Italian',
  MEXICAN: 'Mexican',
  CHINESE: 'Chinese',
  JAPANESE: 'Japanese',
  INDIAN: 'Indian',
  FRENCH: 'French',
  GREEK: 'Greek',
  AMERICAN: 'American',
  MEDITERRANEAN: 'Mediter.',
  THAI: 'Thai',
  SPANISH: 'Spanish',
  KOREAN: 'Korean',
  MIDDLE_EASTERN: 'Mid East',
  OTHER: 'Other',
};

export interface CuisineStripProps {
  selectedCuisines: CuisineKey[];
  onToggle: (cuisine: CuisineKey) => void;
}

export const CuisineStrip = ({ selectedCuisines, onToggle }: CuisineStripProps): React.JSX.Element => {
  const colors = useTheme().colors;
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
          return (
            <Pressable
              key={cuisine}
              onPress={() => onToggle(cuisine)}
              accessibilityRole="button"
              accessibilityLabel={CUISINE_LABEL[cuisine]}
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
                <ThemedText style={styles.emoji}>{CUISINE_EMOJI[cuisine]}</ThemedText>
              </View>
              <ThemedText
                variant="caption"
                style={[styles.label, { color: active ? colors.primary : colors.textMuted }]}
                numberOfLines={1}
              >
                {CUISINE_LABEL[cuisine]}
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
