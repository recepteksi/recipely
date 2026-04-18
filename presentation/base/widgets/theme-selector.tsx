import { useState, useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii } from '@presentation/base/theme';
import { ALL_THEMES, getThemeDefinition, getThemeColors, getPreferredVariant, type ThemeId } from '@presentation/base/theme/themes';
import { ThemedText } from './themed-text';
import { t } from '@presentation/i18n';

type FilterTab = 'all' | 'light' | 'dark';

interface ThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (themeId: ThemeId) => void;
}

const TAB_OPTIONS: Array<{ key: FilterTab; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
];

export const ThemeSelector = ({
  visible,
  onClose,
  onSelect,
}: ThemeSelectorProps): React.JSX.Element => {
  const { themeId, scheme, colors } = useTheme();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThemeIds = useMemo(() => {
    let result = ALL_THEMES;

    if (activeTab === 'light') {
      result = result.filter((id) => getPreferredVariant(id) === 'light');
    } else if (activeTab === 'dark') {
      result = result.filter((id) => getPreferredVariant(id) === 'dark');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((id) => {
        const def = getThemeDefinition(id);
        return (
          def.name.toLowerCase().includes(q) ||
          def.nameTr.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [activeTab, searchQuery]);

  const handleSelect = (id: ThemeId) => {
    onSelect(id);
    onClose();
  };

  const tabCounts = useMemo(() => {
    const lightCount = ALL_THEMES.filter((id) => getPreferredVariant(id) === 'light').length;
    const darkCount = ALL_THEMES.filter((id) => getPreferredVariant(id) === 'dark').length;
    return { all: ALL_THEMES.length, light: lightCount, dark: darkCount };
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerTop}>
            <ThemedText variant="title">{t().settings.chooseTheme}</ThemedText>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 },
              ]}
              hitSlop={12}
            >
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>

          {/* Search */}
          <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground }]}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t().common.search}
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </Pressable>
            )}
          </View>

          {/* Filter tabs */}
          <View style={[styles.tabContainer, { backgroundColor: colors.inputBackground }]}>
            {TAB_OPTIONS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[
                    styles.tab,
                    isActive ? { backgroundColor: colors.primary } : undefined,
                  ]}
                >
                  <ThemedText
                    variant="caption"
                    style={{
                      color: isActive ? colors.primaryText : colors.textMuted,
                      fontWeight: '600',
                    }}
                  >
                    {tab.label} ({tabCounts[tab.key]})
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Theme grid */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {filteredThemeIds.map((id) => {
              const def = getThemeDefinition(id);
              const isActive = id === themeId;
              const isDarkScheme = scheme === 'dark';
              const themeColors = isDarkScheme ? def.dark : def.light;
              const gradColors = isDarkScheme
                ? [def.dark.primaryGradientStart, def.dark.primaryGradientEnd]
                : [def.light.primaryGradientStart, def.light.primaryGradientEnd];

              return (
                <Pressable
                  key={id}
                  onPress={() => handleSelect(id)}
                  style={({ pressed }) => [
                    styles.swatchWrapper,
                    pressed ? { opacity: 0.75 } : undefined,
                  ]}
                >
                  {/* Gradient circle with check badge if active */}
                  <View style={styles.swatchOuter}>
                    <LinearGradient
                      colors={gradColors as [string, string, ...string[]]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.swatch}
                    >
                      {/* Mini preview inside */}
                      <View style={[styles.miniPreview, { backgroundColor: themeColors.background }]}>
                        <View style={[styles.miniPrimaryDot, { backgroundColor: themeColors.primary }]} />
                        <View style={[styles.miniTextLine, { backgroundColor: themeColors.text }]} />
                        <View style={[styles.miniTextLine, styles.miniTextLineShort, { backgroundColor: themeColors.textMuted }]} />
                      </View>
                    </LinearGradient>
                    {/* Checkmark badge for active theme */}
                    {isActive && (
                      <View style={[styles.badge, { backgroundColor: themeColors.primary }]}>
                        <Ionicons name="checkmark" size={12} color={themeColors.primaryText} />
                      </View>
                    )}
                  </View>
                  {/* Theme name */}
                  <ThemedText
                    variant="caption"
                    style={[
                      styles.swatchLabel,
                      isActive
                        ? { color: colors.primary, fontWeight: '700' }
                        : { color: colors.textMuted },
                    ]}
                    numberOfLines={1}
                  >
                    {def.name}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {filteredThemeIds.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="color-palette-outline" size={48} color={colors.textMuted} />
              <ThemedText variant="body" muted style={styles.emptyText}>
                No themes match your search.
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: radii.lg,
    padding: 4,
  },
  tab: {
    flex: 1,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    padding: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  swatchWrapper: {
    alignItems: 'center',
    width: 80,
  },
  swatchOuter: {
    position: 'relative',
    marginBottom: spacing.xs,
  },
  swatch: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniPreview: {
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: spacing.xs,
    gap: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniPrimaryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  miniTextLine: {
    width: 28,
    height: 3,
    borderRadius: 1.5,
  },
  miniTextLineShort: {
    width: 18,
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  swatchLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  emptyText: {
    textAlign: 'center',
  },
});