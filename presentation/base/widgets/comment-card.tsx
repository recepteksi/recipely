import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii } from '@presentation/base/theme';

export interface CommentCardProps {
  body: string;
  createdAt: Date;
  isOwn: boolean;
  onDelete?: () => void;
}

/** Displays a single recipe comment with a delete button for the comment owner. */
export const CommentCard = ({
  body,
  createdAt,
  isOwn,
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
      <View style={styles.bodyRow}>
        <ThemedText variant="body" style={styles.bodyText}>
          {body}
        </ThemedText>
        {isOwn ? (
          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            hitSlop={8}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
          </Pressable>
        ) : null}
      </View>
      <ThemedText variant="caption" muted style={styles.date}>
        {createdAt.toLocaleDateString()}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bodyText: {
    flex: 1,
  },
  deleteBtn: {
    paddingTop: spacing.xxs,
  },
  date: {
    marginTop: spacing.xs,
  },
});
