import { useEffect, useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { ResponsiveContainer } from '@presentation/base/widgets/responsive-container';
import { useLayout } from '@presentation/base/responsive/layout-context';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import type { Notification } from '@domain/notifications/notification';

type NotifKind =
  | 'comment'
  | 'like'
  | 'favorite'
  | 'ai_done'
  | 'moderation_approved'
  | 'moderation_pending'
  | 'follow'
  | 'generic';

interface NotifItem {
  id: string;
  kind: NotifKind;
  actor: string;
  recipeName?: string;
  daysAgo: number;
  read: boolean;
  body?: string;
}

const KNOWN_KINDS = new Set<NotifKind>([
  'comment',
  'like',
  'favorite',
  'ai_done',
  'moderation_approved',
  'moderation_pending',
  'follow',
]);

const resolveKind = (raw: string): NotifKind => {
  return KNOWN_KINDS.has(raw as NotifKind) ? (raw as NotifKind) : 'generic';
};

const daysSince = (createdAt: Date): number => {
  const ms = Date.now() - createdAt.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
};

const toNotifItem = (n: Notification): NotifItem => ({
  id: n.id,
  kind: resolveKind(n.type),
  actor: n.senderDisplayName ?? 'Recipely',
  recipeName: n.recipeTitle ?? undefined,
  daysAgo: daysSince(n.createdAt),
  read: n.read,
});

interface SectionData {
  title: string;
  data: NotifItem[];
}

const buildSections = (items: NotifItem[], filter: 'all' | 'unread'): SectionData[] => {
  const visible = filter === 'unread' ? items.filter((n) => !n.read) : items;
  const today = visible.filter((n) => n.daysAgo === 0);
  const yesterday = visible.filter((n) => n.daysAgo === 1);
  const earlier = visible.filter((n) => n.daysAgo > 1);
  const sections: SectionData[] = [];
  const labels = t().notifications;
  if (today.length > 0) sections.push({ title: labels.today, data: today });
  if (yesterday.length > 0) sections.push({ title: labels.yesterday, data: yesterday });
  if (earlier.length > 0) sections.push({ title: labels.earlier, data: earlier });
  return sections;
};

interface KindMeta {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const useKindMeta = (kind: NotifKind): KindMeta => {
  const colors = useTheme().colors;
  const map: Record<NotifKind, KindMeta> = {
    comment: { icon: 'chatbubble-outline', color: colors.primary },
    like: { icon: 'heart', color: colors.danger },
    favorite: { icon: 'bookmark', color: colors.primary },
    ai_done: { icon: 'sparkles-outline', color: colors.primary },
    moderation_approved: { icon: 'shield-checkmark-outline', color: colors.success },
    moderation_pending: { icon: 'alert-circle-outline', color: colors.warning },
    follow: { icon: 'person-add-outline', color: colors.primary },
    generic: { icon: 'notifications-outline', color: colors.primary },
  };
  return map[kind];
};

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

const NotifRow = ({ item, onTap }: NotifRowProps): React.JSX.Element => {
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

export const NotificationsScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;
  const insets = useSafeAreaInsets();
  const { isWebShell } = useLayout();

  const { notificationsStore } = useStores();
  const state = notificationsStore((s) => s.state);
  const load = notificationsStore((s) => s.load);
  const markAllRead = notificationsStore((s) => s.markAllRead);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (state.status === 'idle') void load();
  }, [state.status, load]);

  const items: NotifItem[] = useMemo(() => {
    if (state.status !== 'loaded') return [];
    return state.items.map(toNotifItem);
  }, [state]);

  const unreadCount =
    state.status === 'loaded' ? state.unreadCount : 0;
  const sections = buildSections(items, filter);

  const tap = (_id: string): void => {
    // Tapping a notification only routes to the underlying entity — the
    // markOneRead endpoint is not yet wired through the store, and faking the
    // read flag locally would diverge from the server source of truth.
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ResponsiveContainer route="notifications" gutter={false} fill>
      <View style={[styles.header, { paddingTop: isWebShell ? spacing.md : insets.top + spacing.sm, borderBottomColor: colors.cardBorder }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.chipBackground }]}
          accessibilityRole="button"
          accessibilityLabel={t().notifications.title}
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </Pressable>
        <ThemedText variant="subtitle" style={styles.headerTitle}>
          {t().notifications.title}
        </ThemedText>
        {unreadCount > 0 ? (
          <Pressable
            onPress={() => { void markAllRead(); }}
            style={styles.markReadBtn}
            accessibilityRole="button"
            accessibilityLabel={t().notifications.markRead}
          >
            <ThemedText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
              {t().notifications.markRead}
            </ThemedText>
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <View style={styles.filterRow}>
        {(['all', 'unread'] as const).map((f) => {
          const isActive = filter === f;
          const label = f === 'all'
            ? `${t().notifications.all} (${items.length})`
            : `${t().notifications.unread} (${unreadCount})`;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isActive ? colors.primary : colors.chipBackground,
                  borderColor: isActive ? colors.primary : colors.cardBorder,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={label}
            >
              <ThemedText
                variant="caption"
                style={{ color: isActive ? colors.primaryText : colors.text, fontWeight: '600' }}
              >
                {label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <NotifRow item={item} onTap={tap} />}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
            <ThemedText variant="caption" muted style={styles.sectionTitle}>
              {section.title.toUpperCase()}
            </ThemedText>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText variant="body" muted style={{ textAlign: 'center' }}>
              {t().notifications.empty}
            </ThemedText>
          </View>
        }
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + spacing.xxl }]}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.cardBorder }]} />}
      />
      </ResponsiveContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: sizes.iconBtn,
    height: sizes.iconBtn,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '700' },
  markReadBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  headerSpacer: { width: sizes.iconBtn },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.round,
    borderWidth: 1,
    height: sizes.chipHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSizes.micro,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
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
  separator: { height: StyleSheet.hairlineWidth, marginLeft: spacing.lg + 40 + spacing.md },
  listContent: {},
  empty: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
});
