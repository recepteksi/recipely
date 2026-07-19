import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { RecipeImage } from '@presentation/base/widgets/media/recipe-image';
import { useTheme } from '@presentation/base/theme/use-theme';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { formatTimeAgo } from '@presentation/base/utils/format-time-ago';
import { t } from '@presentation/i18n';
import type { RecipeDraft } from '@domain/drafts/recipe-draft';
import { ValueConstants } from '@core/constants';

export interface DraftCardProps {
  draft: RecipeDraft;
  onOpen: () => void;
  onDelete: () => void;
}

const THUMB = 72;

/** Row in the Drafts tab: cover thumb, title, item count + relative time, delete. */
export const DraftCard = ({ draft, onOpen, onDelete }: DraftCardProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const name = draft.snapshot.name?.trim();
  const cover = draft.snapshot.media?.find((m) => m.type === 'image');
  const ingredientCount = (draft.snapshot.ingredients ?? []).filter((x) => x.trim().length > ValueConstants.zero).length;

  return (
    <Pressable
      onPress={onOpen}
      style={[styles.root, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }, shadows.sm]}
      accessibilityRole="button"
      accessibilityLabel={name !== undefined && name.length > ValueConstants.zero ? name : t().drafts.untitled}
    >
      <View style={[styles.thumb, { backgroundColor: colors.skeleton }]}>
        <RecipeImage uri={cover?.url} style={styles.thumbImage} placeholderCompact />
      </View>
      <View style={styles.body}>
        <View style={[styles.badge, { backgroundColor: colors.chipBackground }]}>
          <Ionicons name="pencil" size={fontSizes.small} color={colors.primary} />
          <ThemedText variant="caption" style={[styles.badgeLabel, { color: colors.primary }]}>
            {t().drafts.title}
          </ThemedText>
        </View>
        <ThemedText variant="body" style={styles.name} numberOfLines={1}>
          {name !== undefined && name.length > ValueConstants.zero ? name : t().drafts.untitled}
        </ThemedText>
        <ThemedText variant="caption" muted>
          {ingredientCount} {t().drafts.items} · {formatTimeAgo(draft.updatedAt)}
        </ThemedText>
      </View>
      <Pressable
        onPress={onDelete}
        hitSlop={8}
        style={styles.deleteBtn}
        accessibilityRole="button"
        accessibilityLabel={t().drafts.delete}
      >
        <Ionicons name="trash-outline" size={sizes.iconSm} color={colors.textMuted} />
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm2,
    borderRadius: radii.xl,
    borderWidth: 1,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  body: {
    flex: 1,
    gap: spacing.xxs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.round,
  },
  badgeLabel: {
    fontWeight: '700',
    fontSize: fontSizes.nano,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  name: {
    fontWeight: '700',
  },
  deleteBtn: {
    width: sizes.iconBtn,
    height: sizes.iconBtn,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
