/**
 * `AppThemeProvider` must not trust a persisted `theme_id` blindly: if the
 * palette was trimmed (or storage is otherwise corrupted) and the stored id
 * is no longer one of `ALL_THEMES`, it must fall back to `DEFAULT_THEME_ID`
 * instead of handing an unknown id to `getThemeColors` (which would throw on
 * an undefined lookup and blank the screen).
 */
import { act, create } from 'react-test-renderer';
import { container } from '@core/di/container-instance';
import { TOKENS } from '@core/di/tokens';
import type { IKeyValueStore } from '@domain/storage/i-key-value-store';
import { AppThemeProvider } from '@presentation/base/theme/theme-context';
import { useTheme } from '@presentation/base/theme/use-theme';
import type { ThemeId } from '@presentation/base/theme/theme-id';
import { DEFAULT_THEME_ID } from '@presentation/base/theme/theme-defaults';

const mockKvStore: Record<string, string> = {};

// Register an in-memory key-value store under the DI token so the provider's
// `getKeyValueStore()` accessor reads/writes it instead of the platform store.
const fakeKvStore: IKeyValueStore = {
  getItem: async (key: string) => mockKvStore[key] ?? null,
  setItem: async (key: string, value: string) => { mockKvStore[key] = value; },
  removeItem: async (key: string) => { delete mockKvStore[key]; },
};
container.register(TOKENS.KeyValueStore, () => fakeKvStore);

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
