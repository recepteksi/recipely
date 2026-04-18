import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@presentation/base/theme/theme-context';
import { pickColors } from '@presentation/base/theme/colors';
import { radii } from '@presentation/base/theme';
import { ThemedText } from './themed-text';
import { t } from '@presentation/i18n';

export interface ThemeToggleProps {
  value: 'system' | 'light' | 'dark';
  onChange: (value: 'system' | 'light' | 'dark') => void;
}

const options: Array<{ key: 'system' | 'light' | 'dark'; labelKey: 'themeSystem' | 'themeLight' | 'themeDark' }> = [
  { key: 'system', labelKey: 'themeSystem' },
  { key: 'light', labelKey: 'themeLight' },
  { key: 'dark', labelKey: 'themeDark' },
];

export const ThemeToggle = ({ value, onChange }: ThemeToggleProps): React.JSX.Element => {
  const colors = pickColors(useTheme().scheme);

  return (
    <View style={[styles.container, { backgroundColor: colors.inputBackground }]}>
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={[
              styles.segment,
              active ? { backgroundColor: colors.primary } : undefined,
            ]}
          >
            <ThemedText
              variant="caption"
              style={{ color: active ? colors.primaryText : colors.textMuted, fontWeight: '600' }}
            >
              {t().settings[opt.labelKey]}
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
    borderRadius: radii.round,
    height: 34,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
  },
});
