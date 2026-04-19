import { StyleSheet, View } from 'react-native';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing } from '@presentation/base/theme';
import { ThemedText } from './themed-text';

export interface SectionHeaderProps {
  title: string;
}

export const SectionHeader = ({ title }: SectionHeaderProps): React.JSX.Element => {
  const colors = useTheme().colors;

  return (
    <View style={styles.container}>
      <ThemedText variant="label" muted>{title}</ThemedText>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
    marginLeft: spacing.md,
  },
});
