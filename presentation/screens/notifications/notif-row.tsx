import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, fontSizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import type { NotifItem } from '@presentation/screens/notifications/notif-item';
import { useKindMeta } from '@presentation/screens/notifications/use-kind-meta';

const actionText = (n: NotifItem): string => {
  const labels = t().notifications;
  switch (n.kind) {
    case 'comment': return `${labels.commented} ${n.recipeName ?? ''}`;
    case 'like': return `${labels.liked} ${n.recipeName ?? ''}`;
    case 'favorite': return `${labels.saved} ${n.recipeName ?? ''}`;
    case 'ai_done': return labels.aiDoneLabel;
    case 'moderation_approved': return `${labels.modOk} ${n.recipeName ?? ''}`;
    case 'moderation_pending': return `${labels.modPending} ${n.recipeName ?? ''}`;
    case 'follow': return labels.followed;
    case 'generic': return n.recipeName ?? '';
  }
};

interface NotifRowProps {
  item: NotifItem;
  onTap: (id: string) => void;
}

export const NotifRow = ({ item, onTap }: NotifRowProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const meta = useKindMeta(item.kind);

  return (
    <Pressable
      onPress={() => onTap(item.id)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: item.read ? colors.cardBackground : colors.chipBackground,
          borderLeftWidth: item.read ? 0 : 3,
          borderLeftColor: colors.primary,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.actor} ${actionText(item)}`}
    >
      <View style={[styles.iconCircle, { backgroundColor: meta.color + '20' }]}>
        <Ionicons name={meta.icon} size={20} color={meta.color} />
      </View>
      <View style={styles.rowBody}>
        <ThemedText variant="body" style={styles.actionLine} numberOfLines={2}>
          <ThemedText variant="body" style={{ fontWeight: '700' }}>{item.actor}</ThemedText>
          {' '}{actionText(item)}
        </ThemedText>
        {item.body !== undefined ? (
          <ThemedText variant="caption" muted numberOfLines={2} style={styles.bodyText}>
            {item.body}
          </ThemedText>
        ) : null}
        <ThemedText variant="caption" muted style={styles.timestamp}>
          {item.daysAgo === 0 ? t().notifications.today : `${item.daysAgo}d`}
        </ThemedText>
      </View>
      {!item.read && (
        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowBody: { flex: 1, gap: spacing.xxs },
  actionLine: { fontSize: fontSizes.body, lineHeight: 20 },
  bodyText: { lineHeight: 18 },
  timestamp: { fontSize: fontSizes.small },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: spacing.sm,
    flexShrink: 0,
  },
});
