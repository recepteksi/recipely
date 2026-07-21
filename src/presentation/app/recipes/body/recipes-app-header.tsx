import { StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { RecipelyLogo } from '@presentation/base/widgets/brand/recipely-logo';
import { useTheme } from '@presentation/base/theme/use-theme';
import { useLayout } from '@presentation/base/responsive/use-layout';
import { spacing, fontSizes, sizes, BrandColors } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import { ValueConstants } from '@core/constants';

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
          unreadCount > ValueConstants.zero
            ? `${t().notifications.title}, ${unreadCount}`
            : t().notifications.title
        }
      >
        <Ionicons
          name={unreadCount > ValueConstants.zero ? 'notifications' : 'notifications-outline'}
          size={sizes.iconMd}
          color={colors.text}
        />
        {unreadCount > ValueConstants.zero ? (
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
    flex: ValueConstants.one,
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
    top: ValueConstants.zero,
    right: ValueConstants.zero,
    minWidth: sizes.notifBadge,
    height: sizes.notifBadge,
    paddingHorizontal: spacing.xs,
    borderRadius: sizes.notifBadge / 2,
    borderWidth: ValueConstants.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: BrandColors.white,
    fontSize: fontSizes.nano,
    fontWeight: '700',
    lineHeight: sizes.notifBadgeLineHeight,
    includeFontPadding: false,
  },
});
