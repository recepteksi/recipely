import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, sizes, fontSizes } from '@presentation/base/theme';
import { shadows } from '@presentation/base/theme/shadows';
import { t } from '@presentation/i18n';
import { ThemedText } from './themed-text';
import { RecipeImage } from './recipe-image';

export interface RecipeCardProps {
  name: string;
  image: string;
  cuisine: string;
  difficulty: string;
  rating: number;
  tags: string[];
  likeCount?: number;
  likedByMe?: boolean;
  onPress: () => void;
  onLike?: () => void;
}

/** Animated pressable card showing recipe image, cuisine badge, rating stars, tags, and like count. */
export const RecipeCard = ({
  name, image, cuisine, difficulty, rating, tags,
  likeCount = 0, likedByMe = false,
  onPress, onLike,
}: RecipeCardProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const heartScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  const handleLike = () => {
    heartScale.value = withSpring(1.4, { damping: 4 }, () => {
      heartScale.value = withSpring(1);
    });
    onLike?.();
  };

  return (
    <Animated.View style={animatedStyle}>
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 100 });
        opacity.value = withTiming(0.9, { duration: 100 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 150 });
        opacity.value = withTiming(1, { duration: 150 });
      }}
      style={[
        styles.card,
        shadows.md,
        { backgroundColor: colors.cardBackground },
      ]}
    >
      <View style={styles.imageContainer}>
        <RecipeImage
          uri={image}
          style={styles.image}
          accessibilityLabel={name}
          placeholderLabel={t().recipes.noPhoto}
        />
        <View style={[styles.cuisineBadge, { backgroundColor: colors.primary }]}>
          <ThemedText variant="caption" style={{ color: colors.primaryText, fontWeight: '600' }}>
            {cuisine}
          </ThemedText>
        </View>
        <View style={[styles.difficultyChip, { backgroundColor: colors.overlay }]}>
          <ThemedText variant="caption" style={{ color: colors.onOverlay, fontWeight: '600' }}>
            {difficulty}
          </ThemedText>
        </View>
      </View>
      <View style={styles.info}>
        <ThemedText variant="subtitle" numberOfLines={1}>{name}</ThemedText>
        <View style={styles.bottomRow}>
          <View style={styles.tagsRow}>
            {tags.slice(0, 2).map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: colors.chipBackground }]}>
                <ThemedText variant="caption" style={{ color: colors.chipText }}>{tag}</ThemedText>
              </View>
            ))}
          </View>
          <View style={styles.metaRow}>
            <View style={styles.ratingRow}>
              {Array.from({ length: 5 }, (_, i) => {
                const iconName = i < fullStars ? 'star' : i === fullStars && hasHalf ? 'star-half-full' : 'star-outline';
                return (
                  <MaterialCommunityIcons
                    key={i}
                    name={iconName}
                    size={14}
                    color={i < fullStars || (i === fullStars && hasHalf) ? colors.starFilled : colors.starEmpty}
                  />
                );
              })}
              <ThemedText variant="caption" muted style={styles.ratingText}>
                {rating.toFixed(1)}
              </ThemedText>
            </View>
            {onLike !== undefined ? (
              <Pressable
                onPress={handleLike}
                accessibilityRole="button"
                accessibilityLabel={likedByMe ? t().recipes.unlike : t().recipes.like}
                hitSlop={8}
                style={styles.likeBtn}
              >
                <Animated.View style={[styles.likeInner, heartStyle]}>
                  <MaterialCommunityIcons
                    name={likedByMe ? 'heart' : 'heart-outline'}
                    size={16}
                    color={likedByMe ? colors.likeActive : colors.textMuted}
                  />
                  {likeCount > 0 ? (
                    <ThemedText variant="caption" muted style={styles.likeCount}>
                      {likeCount}
                    </ThemedText>
                  ) : null}
                </Animated.View>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  imageContainer: {
    height: sizes.cardImageHeight,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cuisineBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm2,
    paddingVertical: spacing.xs,
  },
  difficultyChip: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm2,
    paddingVertical: spacing.xs,
  },
  info: {
    padding: spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flex: 1,
  },
  tag: {
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: spacing.xs,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  likeCount: {
    fontSize: fontSizes.small,
  },
});
