import { useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { AvatarImage } from '@presentation/base/widgets/avatar-image';
import { PrimaryButton } from '@presentation/base/widgets/primary-button';
import { useTheme } from '@presentation/base/theme/theme-context';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { TabBar, type TabBarKey } from '@presentation/base/widgets/tab-bar';
import { t } from '@presentation/i18n';

type ProfileTab = 'recipes' | 'saved' | 'activity';

interface MockProfileRecipe {
  id: string;
  name: string;
  image: string;
  rating: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
}

interface ActivityEvent {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  daysAgo: number;
}

const MOCK_PROFILE_RECIPES: MockProfileRecipe[] = [
  { id: 'p1', name: 'Creamy Lemon Pasta', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300', rating: 4.8, prepTimeMinutes: 10, cookTimeMinutes: 20 },
  { id: 'p2', name: 'Mushroom Risotto', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=300', rating: 4.6, prepTimeMinutes: 15, cookTimeMinutes: 25 },
  { id: 'p3', name: 'Greek Salad', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300', rating: 4.5, prepTimeMinutes: 10, cookTimeMinutes: 0 },
  { id: 'p4', name: 'Chocolate Cake', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300', rating: 4.9, prepTimeMinutes: 20, cookTimeMinutes: 35 },
];

export const ProfileScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ProfileTab>('recipes');

  const { authStore, createdRecipesStore, savedRecipesStore } = useStores();
  const authState = authStore((s) => s.state);
  const createdRecipes = createdRecipesStore((s) => s.recipes);
  const savedIds = savedRecipesStore((s) => s.savedIds);

  const user = authState.status === 'authenticated' ? authState.session.user : null;
  const displayName = user?.displayName ?? 'Recipely User';
  const email = user?.email.value ?? '';
  const photoUri = user?.photoUrl ?? undefined;

  const activityEvents: ActivityEvent[] = [
    { icon: 'sparkles', label: t().profile.activityAi, daysAgo: 0 },
    { icon: 'chatbubble', label: t().profile.activityComments, daysAgo: 1 },
    { icon: 'heart', label: t().profile.activityLikes, daysAgo: 3 },
    { icon: 'trophy', label: t().profile.activityBadge, daysAgo: 7 },
  ];

  const onTabChange = (key: TabBarKey): void => {
    if (key === 'recipes') router.replace('/recipes');
    else if (key === 'myRecipes') router.replace('/my-recipes');
  };

  const recipeGridItems: MockProfileRecipe[] =
    createdRecipes.length > 0
      ? createdRecipes.slice(0, 4).map((r) => ({
          id: r.id,
          name: r.name,
          image: r.image ?? '',
          rating: r.rating ?? 0,
          prepTimeMinutes: r.prepTimeMinutes,
          cookTimeMinutes: r.cookTimeMinutes,
        }))
      : MOCK_PROFILE_RECIPES;

  const savedGridItems: MockProfileRecipe[] =
    savedIds.size > 0 ? recipeGridItems : MOCK_PROFILE_RECIPES;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + sizes.tabBarHeight + spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroBand, { paddingTop: insets.top + spacing.sm }]}
        >
          <View style={styles.heroActions}>
            <View style={styles.heroActionsRight}>
              <Pressable
                onPress={() => router.push('/notifications')}
                style={[styles.heroActionBtn, { backgroundColor: 'rgba(255,255,255,0.22)' }]}
                accessibilityRole="button"
                accessibilityLabel={t().notifications.title}
              >
                <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
              </Pressable>
              <Pressable
                onPress={() => router.push('/settings')}
                style={[styles.heroActionBtn, { backgroundColor: 'rgba(255,255,255,0.22)' }]}
                accessibilityRole="button"
                accessibilityLabel={t().settings.title}
              >
                <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.identitySection}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.background }, shadows.md]}>
            <AvatarImage uri={photoUri} name={displayName} size={104} />
          </View>
          <ThemedText variant="subtitle" style={styles.displayName}>
            {displayName}
          </ThemedText>
          <ThemedText variant="caption" muted style={styles.emailText}>
            {email}
          </ThemedText>

          <View style={styles.badgesRow}>
            {[
              { icon: 'trophy-outline' as keyof typeof Ionicons.glyphMap, label: t().profile.badgeEarlyAdopter },
              { icon: 'shield-checkmark-outline' as keyof typeof Ionicons.glyphMap, label: t().profile.badgeVerified },
              { icon: 'flame-outline' as keyof typeof Ionicons.glyphMap, label: t().profile.badgeStreak },
            ].map((b) => (
              <View
                key={b.label}
                style={[styles.badge, { backgroundColor: colors.chipBackground }]}
              >
                <Ionicons name={b.icon} size={12} color={colors.chipText} />
                <ThemedText variant="caption" style={[styles.badgeLabel, { color: colors.chipText }]}>
                  {b.label}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        <StatsRow />

        <View style={styles.actionsRow}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label={t().profile.editProfile}
              onPress={() => router.push('/settings')}
            />
          </View>
          <Pressable
            style={[styles.shareBtn, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}
            accessibilityRole="button"
            accessibilityLabel={t().profile.shareProfile}
          >
            <Ionicons name="share-outline" size={20} color={colors.text} />
          </Pressable>
        </View>

        <TabSegment activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'recipes' && (
          <RecipeGrid items={recipeGridItems} />
        )}
        {activeTab === 'saved' && (
          <RecipeGrid items={savedGridItems} />
        )}
        {activeTab === 'activity' && (
          <ActivityTimeline events={activityEvents} />
        )}
      </ScrollView>
      <TabBar active="profile" onChange={onTabChange} />
    </View>
  );
};

const StatsRow = (): React.JSX.Element => {
  const colors = useTheme().colors;
  const stats = [
    { label: t().profile.recipes, value: '24' },
    { label: t().profile.likes, value: '1.2k' },
    { label: t().profile.views, value: '8.4k' },
    { label: t().profile.followers, value: '312' },
  ];
  return (
    <View
      style={[
        styles.statsRow,
        { backgroundColor: colors.surface, borderColor: colors.cardBorder },
        shadows.sm,
      ]}
    >
      {stats.map((stat, idx) => (
        <View key={stat.label} style={[styles.statCell, idx < stats.length - 1 ? [styles.statDivider, { borderRightColor: colors.cardBorder }] : null]}>
          <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
          <ThemedText variant="caption" muted style={styles.statLabel}>
            {stat.label.toUpperCase()}
          </ThemedText>
        </View>
      ))}
    </View>
  );
};

interface TabSegmentProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

const TabSegment = ({ activeTab, onTabChange }: TabSegmentProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const tabs: { key: ProfileTab; label: string }[] = [
    { key: 'recipes', label: t().profile.tabRecipes },
    { key: 'saved', label: t().profile.tabSaved },
    { key: 'activity', label: t().profile.tabActivity },
  ];
  return (
    <View
      style={[
        styles.tabSegment,
        { backgroundColor: colors.surface, borderColor: colors.cardBorder },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            style={[
              styles.tabBtn,
              { backgroundColor: isActive ? colors.primary : 'transparent' },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <ThemedText
              variant="caption"
              style={{ color: isActive ? colors.primaryText : colors.text, fontWeight: '600' }}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
};

interface RecipeGridProps {
  items: MockProfileRecipe[];
}

const RecipeGrid = ({ items }: RecipeGridProps): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;

  if (items.length === 0) {
    return (
      <View style={styles.emptyGrid}>
        <ThemedText variant="body" muted style={{ textAlign: 'center' }}>
          {t().profile.nothingYet}
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={2}
      scrollEnabled={false}
      contentContainerStyle={styles.gridContent}
      columnWrapperStyle={styles.gridRow}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push({ pathname: '/recipes/[recipeId]', params: { recipeId: item.id } })}
          style={({ pressed }) => [
            styles.gridCard,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 },
            shadows.sm,
          ]}
          accessibilityRole="button"
          accessibilityLabel={item.name}
        >
          <Image
            source={{ uri: item.image }}
            style={styles.gridImage}
            contentFit="cover"
          />
          <View style={styles.gridCardInfo}>
            <ThemedText
              style={[styles.gridCardName, { color: colors.text }]}
              numberOfLines={2}
            >
              {item.name}
            </ThemedText>
            <View style={styles.gridCardMeta}>
              <Ionicons name="star" size={11} color={colors.starFilled} />
              <ThemedText variant="caption" muted style={styles.gridMeta}>
                {item.rating.toFixed(1)}
              </ThemedText>
              <ThemedText variant="caption" muted style={styles.gridMeta}>
                · {item.prepTimeMinutes + item.cookTimeMinutes}m
              </ThemedText>
            </View>
          </View>
        </Pressable>
      )}
    />
  );
};

interface ActivityTimelineProps {
  events: ActivityEvent[];
}

const ActivityTimeline = ({ events }: ActivityTimelineProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <View style={styles.timeline}>
      {events.map((ev) => (
        <View key={ev.label} style={styles.timelineRow}>
          <View style={[styles.timelineIcon, { backgroundColor: colors.chipBackground }]}>
            <Ionicons name={ev.icon} size={16} color={colors.primary} />
          </View>
          <View style={styles.timelineBody}>
            <ThemedText variant="body" style={styles.timelineLabel}>
              {ev.label}
            </ThemedText>
            <ThemedText variant="caption" muted>
              {ev.daysAgo === 0 ? t().profile.today : `${ev.daysAgo} ${t().profile.daysAgo}`}
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroBand: {
    height: 132,
    justifyContent: 'flex-start',
  },
  heroActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
  },
  heroActionsRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identitySection: {
    alignItems: 'center',
    marginTop: -56,
    paddingBottom: spacing.lg,
  },
  avatarContainer: {
    width: 112,
    height: 112,
    borderRadius: 56,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayName: {
    fontWeight: '700',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emailText: {
    marginTop: spacing.xxs,
    textAlign: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.round,
    height: sizes.chipHeight,
  },
  badgeLabel: {
    fontSize: fontSizes.small,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xxs,
  },
  statDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  statValue: {
    fontWeight: '800',
    fontSize: 18,
  },
  statLabel: {
    fontSize: fontSizes.micro,
    letterSpacing: 0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSegment: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.xs,
    borderRadius: radii.round,
    borderWidth: 1,
  },
  tabBtn: {
    flex: 1,
    height: sizes.iconBtn,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContent: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  gridRow: {
    gap: spacing.sm,
  },
  gridCard: {
    flex: 1,
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: 120,
  },
  gridCardInfo: {
    padding: spacing.sm,
    gap: spacing.xxs,
  },
  gridCardName: {
    fontWeight: '600',
    fontSize: fontSizes.caption,
    lineHeight: 18,
  },
  gridCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  gridMeta: {
    fontSize: fontSizes.small,
  },
  emptyGrid: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  timeline: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  timelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  timelineBody: {
    flex: 1,
    gap: spacing.xxs,
  },
  timelineLabel: {
    fontWeight: '500',
    lineHeight: 20,
  },
});
