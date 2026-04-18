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
import { spacing, radii, shadows } from '@presentation/base/theme';
import { ALL_THEMES, getThemeDefinition, getThemeColors, type ThemeId } from '@presentation/base/theme/themes';
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
  const [previewId, setPreviewId] = useState<ThemeId | null>(themeId);

  const filteredThemeIds = useMemo(() => {
    let result = ALL_THEMES;

    // Filter by tab
    if (activeTab === 'light') {
      result = result.filter((id) => {
        const def = getThemeDefinition(id);
        return def.light.background !== def.dark.background;
      });
    } else if (activeTab === 'dark') {
      result = result.filter((id) => {
        const def = getThemeDefinition(id);
        return def.light.background === def.dark.background;
      });
    }

    // Filter by search
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

  const previewTheme = previewId ? getThemeDefinition(previewId) : null;
  const previewColors = previewId ? getThemeColors(previewId, scheme) : null;

  const handleSelect = (id: ThemeId) => {
    onSelect(id);
    onClose();
  };

  const tabCounts = useMemo(() => {
    const lightCount = ALL_THEMES.filter((id) => {
      const def = getThemeDefinition(id);
      return def.light.background !== def.dark.background;
    }).length;
    const darkCount = ALL_THEMES.filter((id) => {
      const def = getThemeDefinition(id);
      return def.light.background === def.dark.background;
    }).length;
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
            <View style={styles.titleGroup}>
              <ThemedText variant="title" style={styles.title}>
                {t().settings.chooseTheme}
              </ThemedText>
              <ThemedText variant="body" muted style={styles.subtitle}>
                {previewTheme
                  ? `${previewTheme.name} / ${previewTheme.nameTr}`
                  : 'Select a theme'}
              </ThemedText>
            </View>
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

          {/* Search bar */}
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: colors.inputBackground },
            ]}
          >
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
          <View
            style={[styles.tabContainer, { backgroundColor: colors.inputBackground }]}
          >
            {TAB_OPTIONS.map((tab) => {
              const isActive = activeTab === tab.key;
              const count = tabCounts[tab.key];
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[
                    styles.tab,
                    isActive
                      ? { backgroundColor: colors.primary }
                      : undefined,
                  ]}
                >
                  <ThemedText
                    variant="caption"
                    style={{
                      color: isActive ? colors.primaryText : colors.textMuted,
                      fontWeight: '600',
                    }}
                  >
                    {tab.label} ({count})
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
              const isPreview = id === previewId;
              const themeColors = getThemeColors(id, scheme);

              return (
                <Pressable
                  key={id}
                  onPress={() => {
                    setPreviewId(id);
                  }}
                  onLongPress={() => handleSelect(id)}
                  style={({ pressed }) => [
                    styles.swatchWrapper,
                    pressed ? { opacity: 0.8, transform: [{ scale: 0.96 }] } : undefined,
                  ]}
                >
                  {/* Active ring */}
                  {isActive && (
                    <View
                      style={[
                        styles.activeRing,
                        { borderColor: colors.primary },
                      ]}
                    />
                  )}
                  {/* Swatch circle with gradient */}
                  <LinearGradient
                    colors={
                      scheme === 'dark'
                        ? [def.dark.primaryGradientStart, def.dark.primaryGradientEnd]
                        : [def.light.primaryGradientStart, def.light.primaryGradientEnd]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.swatch,
                      isPreview && !isActive
                        ? { borderWidth: 2, borderColor: colors.primary }
                        : undefined,
                    ]}
                  >
                    {/* Inner mini-preview */}
                    <View
                      style={[
                        styles.miniPreview,
                        { backgroundColor: themeColors.background },
                      ]}
                    >
                      <View
                        style={[
                          styles.miniPrimaryDot,
                          { backgroundColor: themeColors.primary },
                        ]}
                      />
                      <View
                        style={[
                          styles.miniTextLine,
                          { backgroundColor: themeColors.text },
                        ]}
                      />
                      <View
                        style={[
                          styles.miniTextLine,
                          styles.miniTextLineShort,
                          { backgroundColor: themeColors.textMuted },
                        ]}
                      />
                    </View>
                  </LinearGradient>
                  {/* Theme name */}
                  <ThemedText
                    variant="caption"
                    muted={!isActive}
                    style={[
                      styles.swatchLabel,
                      isActive ? { color: colors.primary, fontWeight: '600' } : undefined,
                    ]}
                    numberOfLines={1}
                  >
                    {def.name}
                  </ThemedText>
                  {/* Tap hint */}
                  <ThemedText variant="caption" muted style={styles.tapHint}>
                    Tap to preview
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

        {/* Live preview card */}
        {previewTheme && previewColors && (
          <View
            style={[
              styles.previewCard,
              { backgroundColor: previewColors.cardBackground, borderColor: previewColors.cardBorder },
            ]}
          >
            <View style={styles.previewHeader}>
              <ThemedText variant="subtitle" style={{ color: previewColors.text }}>
                {previewTheme.name}
              </ThemedText>
              <ThemedText variant="caption" muted style={{ color: previewColors.textMuted }}>
                {previewTheme.description}
              </ThemedText>
            </View>
            <View style={styles.previewColors}>
              {/* Background */}
              <View style={styles.previewColorItem}>
                <View
                  style={[
                    styles.previewColorSwatch,
                    { backgroundColor: previewColors.background, borderColor: previewColors.border },
                  ]}
                />
                <ThemedText variant="caption" muted style={{ color: previewColors.textMuted }}>
                  Background
                </ThemedText>
              </View>
              {/* Primary */}
              <View style={styles.previewColorItem}>
                <LinearGradient
                  colors={[previewColors.primaryGradientStart, previewColors.primaryGradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.previewColorSwatch}
                />
                <ThemedText variant="caption" muted style={{ color: previewColors.textMuted }}>
                  Primary
                </ThemedText>
              </View>
              {/* Surface */}
              <View style={styles.previewColorItem}>
                <View
                  style={[
                    styles.previewColorSwatch,
                    { backgroundColor: previewColors.surface, borderColor: previewColors.border },
                  ]}
                />
                <ThemedText variant="caption" muted style={{ color: previewColors.textMuted }}>
                  Surface
                </ThemedText>
              </View>
              {/* Chip */}
              <View style={styles.previewColorItem}>
                <View
                  style={[
                    styles.previewColorSwatch,
                    { backgroundColor: previewColors.chipBackground, borderColor: previewColors.border },
                  ]}
                >
                  <ThemedText
                    variant="caption"
                    style={{ color: previewColors.chipText, fontSize: 10 }}
                  >
                    Chip
                  </ThemedText>
                </View>
                <ThemedText variant="caption" muted style={{ color: previewColors.textMuted }}>
                  Chip
                </ThemedText>
              </View>
            </View>
            <Pressable
              onPress={() => handleSelect(previewId!)}
              style={({ pressed }) => [
                styles.applyButton,
                { backgroundColor: previewColors.primary },
                pressed ? { opacity: 0.85 } : undefined,
              ]}
            >
              <ThemedText
                variant="body"
                style={{ color: previewColors.primaryText, fontWeight: '700' }}
              >
                Apply Theme
              </ThemedText>
            </Pressable>
          </View>
        )}
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  titleGroup: {
    flex: 1,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 13,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
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
    position: 'relative',
  },
  activeRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: 20,
    borderRadius: radii.round,
    borderWidth: 3,
    zIndex: 1,
  },
  swatch: {
    width: 64,
    height: 64,
    borderRadius: radii.xl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  miniPreview: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    padding: spacing.xs,
    gap: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniPrimaryDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  miniTextLine: {
    width: 32,
    height: 4,
    borderRadius: 2,
  },
  miniTextLineShort: {
    width: 20,
  },
  swatchLabel: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  tapHint: {
    fontSize: 9,
    marginTop: 1,
    opacity: 0.6,
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
  previewCard: {
    margin: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  previewHeader: {
    gap: spacing.xs,
  },
  previewColors: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.md,
  },
  previewColorItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  previewColorSwatch: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButton: {
    height: 48,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
