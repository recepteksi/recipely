import { StyleSheet, View } from 'react-native';
import { SkeletonLoader } from '@presentation/base/widgets/skeleton-loader';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, sizes } from '@presentation/base/theme';

export const SkeletonCard = (): React.JSX.Element => {
  const colors = useTheme().colors;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
      ]}
    >
      <SkeletonLoader width="100%" height={sizes.cardImageHeight} borderRadius={0} />
      <View style={styles.body}>
        <SkeletonLoader width="60%" height={18} borderRadius={radii.sm} />
        <View style={styles.row}>
          <SkeletonLoader width={60} height={14} borderRadius={radii.sm} />
          <SkeletonLoader width={60} height={14} borderRadius={radii.sm} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
  },
  body: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
