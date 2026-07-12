import type { Breakpoint } from '@presentation/base/responsive/breakpoint';
import type { Orientation } from '@presentation/base/responsive/orientation';

export interface LayoutContextValue {
  width: number;
  height: number;
  aspectRatio: number;
  orientation: Orientation;
  breakpoint: Breakpoint;
  /** True on Platform.OS === 'web' when the viewport is wide enough for the desktop shell. */
  isWebShell: boolean;
  /** True for portrait phones and any narrow viewport regardless of platform. */
  isCompact: boolean;
}
