import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { RecipeImage } from '@presentation/base/widgets/recipe-image';
import { useTheme } from '@presentation/base/theme/theme-context';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import type { RecipeDraft } from '@domain/drafts/recipe-draft';

export interface DraftCardProps {
  draft: RecipeDraft;
  onOpen: () => void;
  onDelete: () => void;
}

const THUMB = 72;

/** Relative "time ago" for a draft's last update, via the active locale's strings. */
const timeAgo = (date: Date): string => {
  const d = t().drafts;
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return d.justNow;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return d.minutesAgo.replace('{n}', String(minutes));
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return d.hoursAgo.replace('{n}', String(hours));
  const days = Math.floor(hours / 24);
  return d.daysAgo.replace('{n}', String(days));
};

/** Row in the Drafts tab: cover thumb, title, item count + relative time, delete. */
export const DraftCard = ({ draft, onOpen, onDelete }: DraftCardProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const name = draft.snapshot.name?.trim();
  const cover = draft.snapshot.media?.find((m) => m.type === 'image');
  const ingredientCount = (draft.snapshot.ingredients ?? []).filter((x) => x.trim().length > 0).length;

  return (
    <Pressable
      onPress={onOpen}
      style={[styles.root, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }, shadows.sm]}
      accessibilityRole="button"
      accessibilityLabel={name !== undefined && name.length > 0 ? name : t().drafts.untitled}
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
          {name !== undefined && name.length > 0 ? name : t().drafts.untitled}
        </ThemedText>
        <ThemedText variant="caption" muted>
          {ingredientCount} {t().drafts.items} · {timeAgo(draft.updatedAt)}
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
