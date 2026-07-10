import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';
import { RecipelyLogo } from '@presentation/base/widgets/brand/recipely-logo';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { fontSizes, spacing } from '@presentation/base/theme';

const WASH_OPACITY = 0.16;
const TEXTURE_OPACITY = 0.6;
const MOTIF_OPACITY = 0.92;
const LABEL_OPACITY = 0.85;
const LABEL_TRACKING = 0.2;
const TEXTURE_GAP = 12;
const FULL_LOGO_SIZE = 52;
const COMPACT_LOGO_SIZE = 30;

export interface RecipePlaceholderProps {
  /** Caption under the motif (e.g. "No photo yet"). Hidden when `compact`. */
  label?: string;
  /** Smaller motif and no caption — for dense thumbnails / grids. */
  compact?: boolean;
  /** Overrides the motif logo size. */
  logoSize?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Brand-tinted fallback shown when a recipe has no photo. Layers a soft brand
 * gradient wash and a diagonal hairline texture under the monochrome Recipely
 * chef-hat motif so empty media reads as intentional rather than broken.
 * Fills its parent — drop it into any relatively-positioned image container.
 */
export const RecipePlaceholder = ({
  label,
  compact = false,
  logoSize,
  style,
}: RecipePlaceholderProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const size = logoSize ?? (compact ? COMPACT_LOGO_SIZE : FULL_LOGO_SIZE);

  return (
    <View style={[styles.root, { backgroundColor: colors.skeleton }, style]}>
      <LinearGradient
        colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, styles.wash]}
      />
      <Svg style={[StyleSheet.absoluteFill, styles.texture]} width="100%" height="100%">
        <Defs>
          <Pattern
            id="rcpDiag"
            width={TEXTURE_GAP}
            height={TEXTURE_GAP}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <Line x1={0} y1={0} x2={0} y2={TEXTURE_GAP} stroke={colors.cardBorder} strokeWidth={1} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#rcpDiag)" />
      </Svg>
      <View style={[styles.motif, { gap: compact ? 0 : spacing.xs }]}>
        <RecipelyLogo size={size} monochrome mono={colors.primary} />
        {!compact && label ? (
          <ThemedText variant="caption" style={[styles.label, { color: colors.primary }]}>
            {label}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wash: {
    opacity: WASH_OPACITY,
  },
  texture: {
    opacity: TEXTURE_OPACITY,
  },
  motif: {
    alignItems: 'center',
    opacity: MOTIF_OPACITY,
  },
  label: {
    fontSize: fontSizes.small,
    fontWeight: '600',
    letterSpacing: LABEL_TRACKING,
    opacity: LABEL_OPACITY,
  },
});
