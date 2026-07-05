import type { Ionicons } from '@expo/vector-icons';
import type { WebHeaderTabKey } from '@presentation/base/widgets/web-header/web-header-tab-key';

export interface TabConfig {
  key: WebHeaderTabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}
