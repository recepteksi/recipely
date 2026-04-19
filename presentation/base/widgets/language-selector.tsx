import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@presentation/base/theme/theme-context';
import { radii } from '@presentation/base/theme';
import { ThemedText } from './themed-text';

export interface LanguageSelectorProps {
  value: 'en' | 'tr';
  onChange: (value: 'en' | 'tr') => void;
}

const options: Array<{ key: 'en' | 'tr'; label: string }> = [
  { key: 'en', label: 'EN' },
  { key: 'tr', label: 'TR' },
];

export const LanguageSelector = ({ value, onChange }: LanguageSelectorProps): React.JSX.Element => {
  const colors = useTheme().colors;

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
              {opt.label}
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
    width: 100,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
  },
});
