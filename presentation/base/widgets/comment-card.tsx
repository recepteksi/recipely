import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { AvatarImage } from '@presentation/base/widgets/avatar-image';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, sizes } from '@presentation/base/theme';
import { formatTimeAgo } from '@presentation/base/utils/format-time-ago';
import { t } from '@presentation/i18n';

export interface CommentCardProps {
  body: string;
  authorDisplayName: string;
  authorPhotoUrl: string | null;
  createdAt: Date;
  isOwn: boolean;
  likeCount: number;
  likedByMe: boolean;
  canLike: boolean;
  onToggleLike: () => void;
  onDelete?: () => void;
}

const DISABLED_OPACITY = 0.5;

const AVATAR_SIZE = 36;

/** Displays a single recipe comment: author avatar, name, relative time, body, and an owner-only delete button. */
export const CommentCard = ({
  body,
  authorDisplayName,
  authorPhotoUrl,
  createdAt,
  isOwn,
  likeCount,
  likedByMe,
  canLike,
  onToggleLike,
  onDelete,
}: CommentCardProps): React.JSX.Element => {
  const colors = useTheme().colors;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
      ]}
    >
      <View style={styles.headerRow}>
        <AvatarImage
          uri={authorPhotoUrl ?? undefined}
          name={authorDisplayName}
          size={AVATAR_SIZE}
        />
        <View style={styles.headerText}>
          <ThemedText variant="body" style={styles.author} numberOfLines={1}>
            {authorDisplayName}
          </ThemedText>
          <ThemedText variant="caption" muted>
            {formatTimeAgo(createdAt)}
          </ThemedText>
        </View>
        {isOwn ? (
          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel={t().comments.delete}
            hitSlop={8}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={sizes.iconSm} color={colors.danger} />
          </Pressable>
        ) : null}
      </View>
      <ThemedText variant="body" style={styles.bodyText}>
        {body}
      </ThemedText>
      <View style={styles.footerRow}>
        <Pressable
          onPress={onToggleLike}
          disabled={!canLike}
          accessibilityRole="button"
          accessibilityLabel={likedByMe ? t().comments.unlike : t().comments.like}
          hitSlop={8}
          style={[styles.likeBtn, { opacity: canLike ? 1 : DISABLED_OPACITY }]}
        >
          <Ionicons
            name={likedByMe ? 'heart' : 'heart-outline'}
            size={sizes.iconSm}
            color={likedByMe ? colors.likeActive : colors.textMuted}
          />
          <ThemedText variant="caption" muted>
            {likeCount}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  author: {
    fontWeight: '600',
  },
  bodyText: {
    marginLeft: AVATAR_SIZE + spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: AVATAR_SIZE + spacing.sm,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  deleteBtn: {
    padding: spacing.xxs,
  },
});
