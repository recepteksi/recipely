import { useContext } from 'react';
import { WebShellStateContext } from '@presentation/base/responsive/web-shell-state';
import type { WebShellStateValue } from '@presentation/base/responsive/web-shell-state-value';

/** Reads the web-shell-only UI state (e.g. the header search query). */
export const useWebShellState = (): WebShellStateValue => useContext(WebShellStateContext);
