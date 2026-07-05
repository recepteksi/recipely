import type { Ionicons } from '@expo/vector-icons';

export interface KindMeta {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}
