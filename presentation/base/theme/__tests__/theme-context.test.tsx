/**
 * `AppThemeProvider` must not trust a persisted `theme_id` blindly: if the
 * palette was trimmed (or storage is otherwise corrupted) and the stored id
 * is no longer one of `ALL_THEMES`, it must fall back to `DEFAULT_THEME_ID`
 * instead of handing an unknown id to `getThemeColors` (which would throw on
 * an undefined lookup and blank the screen).
 */
/* eslint-disable import/first -- jest.mock() must be hoisted above imports */

const mockKvStore: Record<string, string> = {};

jest.mock('@infrastructure/storage/kv-store', () => ({
  kvStore: {
    getItem: jest.fn(async (key: string) => mockKvStore[key] ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockKvStore[key] = value;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete mockKvStore[key];
    }),
  },
}));

import { act, create } from 'react-test-renderer';
import { AppThemeProvider, useTheme } from '@presentation/base/theme/theme-context';
import { DEFAULT_THEME_ID, type ThemeId } from '@presentation/base/theme/theme-id';

const flushMicrotasks = async (): Promise<void> => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

const renderThemeId = (): { latest: () => ThemeId } => {
  let latest!: ThemeId;
  const Probe = (): null => {
    latest = useTheme().themeId;
    return null;
  };

  act(() => {
    create(
      <AppThemeProvider>
        <Probe />
      </AppThemeProvider>,
    );
  });

  return { latest: () => latest };
};

describe('AppThemeProvider — stale persisted theme_id', () => {
  beforeEach(() => {
    for (const key of Object.keys(mockKvStore)) delete mockKvStore[key];
  });

  it('falls back to the default theme when nothing is persisted', async () => {
    const { latest } = renderThemeId();
    await flushMicrotasks();

    expect(latest()).toBe(DEFAULT_THEME_ID);
  });

  it('adopts a persisted theme_id that is still part of the trimmed palette', async () => {
    mockKvStore.theme_id = 'royal-purple';

    const { latest } = renderThemeId();
    await flushMicrotasks();

    expect(latest()).toBe('royal-purple');
  });

  it('falls back to the default instead of crashing when the persisted theme_id was removed from the palette', async () => {
    // e.g. a value persisted before the palette was trimmed from 20 to 4.
    mockKvStore.theme_id = 'chartreuse-zap';

    const { latest } = renderThemeId();
    await flushMicrotasks();

    expect(latest()).toBe(DEFAULT_THEME_ID);
  });

  it('falls back to the default for garbage/corrupted storage values', async () => {
    mockKvStore.theme_id = 'not-a-real-theme';

    const { latest } = renderThemeId();
    await flushMicrotasks();

    expect(latest()).toBe(DEFAULT_THEME_ID);
  });
});
