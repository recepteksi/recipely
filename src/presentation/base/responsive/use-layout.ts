import { useContext } from 'react';
import { LayoutContext } from '@presentation/base/responsive/layout-context';
import type { LayoutContextValue } from '@presentation/base/responsive/layout-context-value';

/** Reads the current viewport metrics published by {@link LayoutProvider}. */
export const useLayout = (): LayoutContextValue => useContext(LayoutContext);
