import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { CommentCard } from '@presentation/base/widgets/comment-card';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, sizes, fontSizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import type { RecipeCommentsState } from '@application/comments/recipe-comments-state';

export interface WebRecipeDetailCommentsProps {
  commentState: RecipeCommentsState | undefined;
  userId: string | null;
  commentInput: string;
  submitError: string | null;
  onChangeCommentInput: (value: string) => void;
  onAddComment: () => void;
  onLoadMore: () => void;
  onToggleCommentLike: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
}

/**
 * Comments section for the web recipe detail: h2 header, input, list, and
 * load-more. Reuses the parent's handlers/state. The input row and like
 * button are always shown/enabled — a guest's tap is caught by
 * `onAddComment` / `onToggleCommentLike` (wired to `useGuestGate` in the
 * parent screen), which opens a sign-in prompt instead of running the action.
 */
export const WebRecipeDetailComments = ({
  commentState,
  userId,
  commentInput,
  submitError,
  onChangeCommentInput,
  onAddComment,
  onLoadMore,
  onToggleCommentLike,
  onDeleteComment,
}: WebRecipeDetailCommentsProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const total = commentState?.total ?? 0;
  const items = commentState?.items ?? [];
  const canLoadMore = commentState !== undefined && items.length < commentState.total;
  const submitDisabled = commentState?.isSubmitting === true || commentInput.trim().length === 0;

  return (
    <View style={styles.section}>
      <ThemedText style={[styles.heading, { color: colors.text }]}>
        {total > 0 ? `${t().comments.title} · ${String(total)}` : t().comments.title}
      </ThemedText>

      <View style={styles.inputRow}>
        <TextInput
          value={commentInput}
          onChangeText={onChangeCommentInput}
          placeholder={t().comments.placeholder}
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          multiline
          maxLength={2000}
        />
        <Pressable
          onPress={onAddComment}
          disabled={submitDisabled}
          accessibilityRole="button"
          accessibilityLabel={t().comments.send}
          style={({ pressed }) => [
            styles.sendBtn,
            { backgroundColor: colors.primary, opacity: pressed || submitDisabled ? 0.6 : 1 },
          ]}
        >
          <Ionicons name="send" size={sizes.iconSm} color={colors.onOverlay} />
        </Pressable>
      </View>

      {submitError !== null ? (
        <ThemedText variant="caption" style={[styles.error, { color: colors.danger }]}>
          {submitError}
        </ThemedText>
      ) : null}

      {commentState?.isLoading === true ? (
        <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
      ) : items.length === 0 ? (
        <ThemedText variant="caption" muted style={styles.empty}>
          {t().comments.empty}
        </ThemedText>
      ) : (
        <View style={styles.list}>
          {items.map((comment) => (
            <CommentCard
              key={comment.id}
              body={comment.body}
              authorDisplayName={comment.authorDisplayName}
              authorPhotoUrl={comment.authorPhotoUrl}
              createdAt={comment.createdAt}
              isOwn={comment.authorId === userId}
              likeCount={comment.likeCount}
              likedByMe={comment.likedByMe}
              canLike
              onToggleLike={() => onToggleCommentLike(comment.id)}
              onDelete={() => onDeleteComment(comment.id)}
            />
          ))}
        </View>
      )}

      {canLoadMore ? (
        <Pressable
          onPress={onLoadMore}
          accessibilityRole="button"
          accessibilityLabel={t().comments.loadMore}
          style={({ pressed }) => [
            styles.loadMore,
            { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <ThemedText variant="caption" muted>
            {commentState?.isLoadingMore === true ? t().common.loading : t().comments.loadMore}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  heading: {
    fontSize: fontSizes.subheading,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: sizes.searchBarHeight,
  },
  sendBtn: {
    width: sizes.searchBarHeight,
    height: sizes.searchBarHeight,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {},
  loader: {
    marginVertical: spacing.md,
  },
  empty: {},
  list: {
    gap: spacing.sm,
  },
  loadMore: {
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.round,
    borderWidth: 1,
  },
});
