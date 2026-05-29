import { Pressable, StyleSheet, View } from 'react-native';
import { RecipelyLogo } from '@presentation/base/widgets/recipely-logo';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii, fontSizes } from '@presentation/base/theme';

export interface WebHeaderLogoProps {
  onPress: () => void;
}

const LOGO_TILE_SIZE = 38;
const LOGO_SIZE = 30;

/** White brand tile + Recipely wordmark. Anchors the WebHeader left edge. */
export const WebHeaderLogo = ({ onPress }: WebHeaderLogoProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel="Recipely"
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.tile,
          shadows.sm,
          { backgroundColor: '#FFFFFF', borderColor: colors.cardBorder },
        ]}
      >
        <RecipelyLogo size={LOGO_SIZE} />
      </View>
      <View>
        <ThemedText style={[styles.wordmark, { color: colors.text }]}>Recipely</ThemedText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  tile: {
    width: LOGO_TILE_SIZE,
    height: LOGO_TILE_SIZE,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontSize: fontSizes.subtitle,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});
