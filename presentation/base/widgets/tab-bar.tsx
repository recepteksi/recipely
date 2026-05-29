import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@presentation/base/theme/theme-context';
import { useLayout } from '@presentation/base/responsive/layout-context';
import { sizes, spacing, fontSizes } from '@presentation/base/theme';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { t } from '@presentation/i18n';

export type TabBarKey = 'recipes' | 'myRecipes' | 'profile';

export interface TabBarProps {
  active: TabBarKey;
  onChange: (key: TabBarKey) => void;
}

interface TabConfig {
  key: TabBarKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

/**
 * Bottom navigation bar with icon-and-label tabs for the main app sections.
 * Returns null on the web shell breakpoint — the WebHeader replaces it there.
 */
export const TabBar = ({ active, onChange }: TabBarProps): React.JSX.Element | null => {
  const colors = useTheme().colors;
  const insets = useSafeAreaInsets();
  const { isWebShell } = useLayout();
  const bottomPad = Math.max(insets.bottom, 12);
  if (isWebShell) return null;

  const tabs: TabConfig[] = [
    { key: 'recipes', label: t().navigation.recipes, icon: 'restaurant-outline' },
    { key: 'myRecipes', label: t().navigation.myRecipes, icon: 'bookmark-outline' },
    { key: 'profile', label: t().navigation.profile, icon: 'person-outline' },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
          paddingBottom: bottomPad,
          height: sizes.tabBarHeight + bottomPad,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const tint = isActive ? colors.tabBarActive : colors.tabBarInactive;
        const filledIcon = (tab.icon.replace('-outline', '') as keyof typeof Ionicons.glyphMap);
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(tab.key)}
            style={styles.tab}
          >
            <Ionicons name={isActive ? filledIcon : tab.icon} size={22} color={tint} />
            <ThemedText
              variant="caption"
              style={[styles.label, { color: tint, fontWeight: isActive ? '700' : '500' }]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.sm,
    gap: spacing.xxs,
  },
  label: {
    fontSize: fontSizes.micro,
  },
});
