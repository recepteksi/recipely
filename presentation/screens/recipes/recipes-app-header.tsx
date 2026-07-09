import { StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { RecipelyLogo } from '@presentation/base/widgets/recipely-logo';
import { useTheme } from '@presentation/base/theme/theme-context';
import { useLayout } from '@presentation/base/responsive/layout-context';
import { spacing, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

export interface RecipesAppHeaderProps {
  onNotificationsPress: () => void;
  unreadCount: number;
}

export const RecipesAppHeader = ({
  onNotificationsPress,
  unreadCount,
}: RecipesAppHeaderProps): React.JSX.Element | null => {
  const colors = useTheme().colors;
  const { isWebShell } = useLayout();
  if (isWebShell) return null;
  const badgeText = unreadCount > 9 ? '9+' : String(unreadCount);
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.titles}>
        <RecipelyLogo size={sizes.iconMd} />
        <ThemedText variant="title" style={styles.screenTitle}>
          {t().recipes.title}
        </ThemedText>
      </View>
      <Pressable
        onPress={onNotificationsPress}
        style={[styles.bell, { backgroundColor: colors.surface }]}
        accessibilityRole="button"
        accessibilityLabel={
          unreadCount > 0
            ? `${t().notifications.title}, ${unreadCount}`
            : t().notifications.title
        }
      >
        <Ionicons
          name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
          size={sizes.iconMd}
          color={colors.text}
        />
        {unreadCount > 0 ? (
          <View style={[styles.badge, { backgroundColor: colors.danger, borderColor: colors.background }]}>
            <ThemedText style={styles.badgeText}>{badgeText}</ThemedText>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  titles: {
    flex: 1,
    gap: spacing.xxs,
  },
  screenTitle: {
    fontWeight: '700',
  },
  bell: {
    width: sizes.iconBtn,
    height: sizes.iconBtn,
    borderRadius: sizes.iconBtn / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: sizes.notifBadge,
    height: sizes.notifBadge,
    paddingHorizontal: spacing.xs,
    borderRadius: sizes.notifBadge / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: fontSizes.nano,
    fontWeight: '700',
  },
});
