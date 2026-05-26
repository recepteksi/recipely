import { StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

export interface RecipesAppHeaderProps {
  onNotificationsPress: () => void;
}

export const RecipesAppHeader = ({ onNotificationsPress }: RecipesAppHeaderProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.titles}>
        <ThemedText variant="caption" muted style={styles.appName}>
          Recipely
        </ThemedText>
        <ThemedText variant="title" style={styles.screenTitle}>
          {t().recipes.title}
        </ThemedText>
      </View>
      <Pressable
        onPress={onNotificationsPress}
        style={[styles.bell, { backgroundColor: colors.surface }]}
        accessibilityRole="button"
        accessibilityLabel={t().notifications.title}
      >
        <Ionicons name="notifications-outline" size={sizes.iconMd} color={colors.text} />
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
  appName: {
    fontSize: fontSizes.micro,
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
});
