import { Image, Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { pickColors } from '@presentation/base/theme/colors';
import { spacing, radii, sizes } from '@presentation/base/theme';
import { shadows } from '@presentation/base/theme/shadows';
import { ThemedText } from './themed-text';

export interface RecipeCardProps {
  name: string;
  image: string;
  cuisine: string;
  difficulty: string;
  rating: number;
  tags: string[];
  onPress: () => void;
}

export const RecipeCard = ({
  name, image, cuisine, difficulty, rating, tags, onPress,
}: RecipeCardProps): React.JSX.Element => {
  const colors = pickColors(useColorScheme());

  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        shadows.md,
        { backgroundColor: colors.cardBackground, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} />
        <View style={[styles.cuisineBadge, { backgroundColor: colors.primary }]}>
          <ThemedText variant="caption" style={{ color: colors.primaryText, fontWeight: '600' }}>
            {cuisine}
          </ThemedText>
        </View>
        <View style={styles.difficultyChip}>
          <ThemedText variant="caption" style={{ color: '#FFFFFF', fontWeight: '600' }}>
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
        </View>
      </View>
    </Pressable>
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
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  difficultyChip: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radii.round,
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
  },
});
