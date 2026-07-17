import type { ReactTestInstance, ReactTestRenderer } from 'react-test-renderer';

export interface RenderResult {
  /** Root instance for role / type / prop queries. */
  root: ReactTestInstance;
  /** Underlying renderer, for `unmount` / `toJSON` when a test needs them. */
  renderer: ReactTestRenderer;
}
