import type { Ionicons } from '@expo/vector-icons';

export interface TabConfig<K extends string> {
  key: K;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}
