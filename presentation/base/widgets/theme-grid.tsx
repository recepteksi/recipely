import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import {
  ALL_THEMES,
  getThemeDefinition,
  type ThemeId,
} from '@presentation/base/theme/themes';
import { spacing } from '@presentation/base/theme';
import { getLocale } from '@presentation/i18n';

export interface ThemeGridProps {
  selectedThemeId: ThemeId;
  onSelect: (themeId: ThemeId) => void;
}

const CHIP_WIDTH = 76;
const SWATCH_SIZE = 56;

export const ThemeGrid = ({
  selectedThemeId,
  onSelect,
}: ThemeGridProps): React.JSX.Element => {
  const { scheme, colors } = useTheme();
  const lang = getLocale() === 'tr' ? 'tr' : 'en';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {ALL_THEMES.map((id) => {
        const def = getThemeDefinition(id);
        const variant = scheme === 'dark' ? def.dark : def.light;
        const isActive = id === selectedThemeId;
        const label = lang === 'tr' ? def.nameTr : def.name;

        return (
          <Pressable
            key={id}
            onPress={() => onSelect(id)}
            style={({ pressed }) => [styles.chip, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View>
              <LinearGradient
                colors={[variant.primaryGradientStart, variant.primaryGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.swatch,
                  {
                    borderColor: isActive ? colors.primary : variant.cardBorder,
                    borderWidth: isActive ? 2.5 : 1,
                  },
                ]}
              />
              {isActive ? (
                <View
                  style={[
                    styles.checkBadge,
                    {
                      backgroundColor: colors.primary,
                      borderColor: colors.background,
                    },
                  ]}
                >
                  <Ionicons name="checkmark" size={12} color={colors.primaryText} />
                </View>
              ) : null}
            </View>
            <ThemedText
              variant="caption"
              numberOfLines={2}
              style={[
                styles.label,
                { color: isActive ? colors.primary : colors.textMuted },
                isActive ? styles.labelActive : null,
              ]}
            >
              {label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  chip: {
    width: CHIP_WIDTH,
    alignItems: 'center',
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_SIZE / 2,
    overflow: 'hidden',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 8,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 13,
  },
  labelActive: {
    fontWeight: '700',
  },
});
