import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { AvatarImage } from '@presentation/base/widgets/media/avatar-image';
import { useTheme } from '@presentation/base/theme/use-theme';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';

const NOTIF_BTN_SIZE = 38;
const AVATAR_SIZE = 36;

export interface WebHeaderActionsProps {
  createLabel: string;
  notificationsLabel: string;
  profileLabel: string;
  unreadCount: number;
  isProfileActive: boolean;
  avatarName: string;
  avatarUri?: string;
  onCreate: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

/** Right cluster: Create CTA + notifications bell with badge + avatar route to profile. */
export const WebHeaderActions = ({
  createLabel,
  notificationsLabel,
  profileLabel,
  unreadCount,
  isProfileActive,
  avatarName,
  avatarUri,
  onCreate,
  onOpenNotifications,
  onOpenProfile,
}: WebHeaderActionsProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const badgeText = unreadCount > 9 ? '9+' : String(unreadCount);

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onCreate}
        accessibilityRole="button"
        accessibilityLabel={createLabel}
        style={({ pressed }) => [
          styles.createBtn,
          shadows.sm,
          { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Ionicons name="add" size={16} color={colors.primaryText} />
        <ThemedText style={[styles.createLabel, { color: colors.primaryText }]}>
          {createLabel}
        </ThemedText>
      </Pressable>

      <Pressable
        onPress={onOpenNotifications}
        accessibilityRole="button"
        accessibilityLabel={notificationsLabel}
        style={({ pressed }) => [
          styles.iconBtn,
          {
            backgroundColor: colors.surface,
            borderColor: colors.cardBorder,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Ionicons
          name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
          size={18}
          color={colors.text}
        />
        {unreadCount > 0 ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.danger, borderColor: colors.background },
            ]}
          >
            <ThemedText style={styles.badgeText}>{badgeText}</ThemedText>
          </View>
        ) : null}
      </Pressable>

      <Pressable
        onPress={onOpenProfile}
        accessibilityRole="button"
        accessibilityLabel={profileLabel}
        style={({ pressed }) => [
          styles.avatarBtn,
          {
            borderColor: isProfileActive ? colors.primary : colors.cardBorder,
            backgroundColor: isProfileActive ? colors.chipBackground : colors.surface,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <AvatarImage name={avatarName} uri={avatarUri} size={AVATAR_SIZE - 4} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: NOTIF_BTN_SIZE,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
  },
  createLabel: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
  },
  iconBtn: {
    width: NOTIF_BTN_SIZE,
    height: NOTIF_BTN_SIZE,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: fontSizes.nano + 1,
    fontWeight: '700',
    lineHeight: sizes.notifBadgeLineHeight,
    includeFontPadding: false,
  },
  avatarBtn: {
    width: NOTIF_BTN_SIZE,
    height: NOTIF_BTN_SIZE,
    borderRadius: NOTIF_BTN_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
