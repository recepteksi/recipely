import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SectionList, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { ResponsiveContainer } from '@presentation/base/widgets/layout/responsive-container';
import { ErrorState } from '@presentation/base/widgets/feedback/error-state';
import {
  failureContent,
  failureIcon,
  failureSeverity,
} from '@presentation/base/errors/failure-content';
import { useLayout } from '@presentation/base/responsive/layout-context';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import type { Notification } from '@domain/notifications/notification';
import type { NotifKind } from '@presentation/screens/notifications/notif-kind';
import type { NotifItem } from '@presentation/screens/notifications/notif-item';
import type { SectionData } from '@presentation/screens/notifications/section-data';
import { NotifRow } from '@presentation/screens/notifications/notif-row';

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
  // Surface free-text payload (e.g. the comment body) as the secondary line.
  body: n.message ?? undefined,
});

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

  // Opening the screen is itself an acknowledgement: load the latest feed, then
  // mark everything read so the bell badge clears. Runs once per mount.
  useEffect(() => {
    void (async () => {
      await load();
      if (notificationsStore.getState().unreadCount > 0) {
        await markAllRead();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      {state.status === 'loading' || state.status === 'idle' ? (
        <View style={styles.empty}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : state.status === 'error' ? (
        <ErrorState
          severity={failureSeverity(state.failure)}
          icon={failureIcon(state.failure)}
          title={failureContent(state.failure).title}
          body={failureContent(state.failure).body}
          primaryLabel={t().errors.retry}
          onPrimary={() => void load()}
        />
      ) : (
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
      )}
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
  separator: { height: StyleSheet.hairlineWidth, marginLeft: spacing.lg + 40 + spacing.md },
  listContent: {},
  empty: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
});
