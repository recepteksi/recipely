import type { Ionicons } from '@expo/vector-icons';
import type { TabBarKey } from '@presentation/base/widgets/tab-bar-key';

export interface TabConfig {
  key: TabBarKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}
