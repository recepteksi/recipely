import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { BREAKPOINTS } from './breakpoints';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';
export type Orientation = 'portrait' | 'landscape';

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

const DEFAULT_VALUE: LayoutContextValue = {
  width: 0,
  height: 0,
  aspectRatio: 1,
  orientation: 'portrait',
  breakpoint: 'mobile',
  isWebShell: false,
  isCompact: true,
};

const LayoutContext = createContext<LayoutContextValue>(DEFAULT_VALUE);

export interface LayoutProviderProps {
  children: ReactNode;
}

const resolveBreakpoint = (width: number): Breakpoint => {
  if (width >= BREAKPOINTS.wide) return 'wide';
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
};

/**
 * Publishes the current viewport metrics to descendants so screens can pick
 * compact-vs-expanded layouts. Width/height come from `useWindowDimensions()`
 * which updates on resize (web) and rotation (native).
 */
export const LayoutProvider = ({ children }: LayoutProviderProps): React.JSX.Element => {
  const { width, height } = useWindowDimensions();

  const value = useMemo<LayoutContextValue>(() => {
    const breakpoint = resolveBreakpoint(width);
    const orientation: Orientation = width >= height ? 'landscape' : 'portrait';
    const isWebShell = Platform.OS === 'web' && width >= BREAKPOINTS.desktop;
    const isCompact = breakpoint === 'mobile';
    const aspectRatio = height === 0 ? 1 : width / height;
    return { width, height, aspectRatio, orientation, breakpoint, isWebShell, isCompact };
  }, [width, height]);

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};

export const useLayout = (): LayoutContextValue => useContext(LayoutContext);
