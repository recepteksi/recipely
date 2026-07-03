import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { spacing, radii, fontSizes } from '@presentation/base/theme';

export interface TileProps {
  label: string;
  value: number;
  unit: string;
  tileColor: string;
  valueColor: string;
  labelColor: string;
}

export const NutritionTile = ({ label, value, unit, tileColor, valueColor, labelColor }: TileProps): React.JSX.Element => (
  <View style={[styles.tile, { backgroundColor: tileColor }]}>
    <View style={styles.tileValueRow}>
      <ThemedText style={[styles.tileValue, { color: valueColor }]}>{String(value)}</ThemedText>
      <ThemedText style={[styles.tileUnit, { color: labelColor }]}>{unit}</ThemedText>
    </View>
    <ThemedText style={[styles.tileLabel, { color: labelColor }]}>{label}</ThemedText>
  </View>
);

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },
  tileValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  tileValue: {
    fontSize: fontSizes.heading,
    fontWeight: '700' as const,
    lineHeight: fontSizes.heading + 4,
  },
  tileUnit: {
    fontSize: fontSizes.micro,
    lineHeight: fontSizes.heading + 4,
    paddingBottom: 1,
  },
  tileLabel: {
    fontSize: fontSizes.micro,
    marginTop: spacing.xxs,
  },
});
