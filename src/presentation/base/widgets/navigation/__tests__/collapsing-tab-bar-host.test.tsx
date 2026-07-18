import { act } from 'react-test-renderer';
import type { LayoutChangeEvent } from 'react-native';
import { renderComponent } from '@presentation/base/test-support/render-component';
import type { RenderResult } from '@presentation/base/test-support/render-result';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppThemeProvider } from '@presentation/base/theme/theme-context';
import { durations } from '@presentation/base/theme';
import { CollapsingTabBarHost } from '@presentation/base/widgets/navigation/collapsing-tab-bar-host';
import type { CollapsingTabBarHostProps } from '@presentation/base/widgets/navigation/collapsing-tab-bar-host';
import { TabBar } from '@presentation/base/widgets/navigation/tab-bar';

jest.mock('@expo/vector-icons', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  const Icon = (props: { name: string }): React.JSX.Element => <Text>{`icon:${props.name}`}</Text>;
  return { Ionicons: Icon, MaterialCommunityIcons: Icon };
});

const MEASURED_HEIGHT = 68;

const tabState = (): NonNullable<CollapsingTabBarHostProps['state']> => ({
  active: 'recipes',
  onChange: jest.fn(),
});

/** Wraps an update in the same provider tree `renderComponent` mounts with. */
const update = (result: RenderResult, state: CollapsingTabBarHostProps['state']): void => {
  act(() => {
    result.renderer.update(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 320, height: 640 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <AppThemeProvider>
          <CollapsingTabBarHost state={state} />
        </AppThemeProvider>
      </SafeAreaProvider>,
    );
  });
};

/** Fires the measuring wrapper's onLayout with the given content height. */
const measure = (result: RenderResult, height: number = MEASURED_HEIGHT): void => {
  const wrapper = result.root.findAllByType(TabBar)[0]?.parent;
  const onLayout = wrapper?.props.onLayout as (event: LayoutChangeEvent) => void;
  act(() => {
    onLayout({
      nativeEvent: { layout: { x: 0, y: 0, width: 320, height } },
    } as LayoutChangeEvent);
  });
};

describe('CollapsingTabBarHost', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the TabBar when a tab state is provided', () => {
    const result = renderComponent(<CollapsingTabBarHost state={tabState()} />);

    expect(result.root.findAllByType(TabBar)).toHaveLength(1);
  });

  it('renders nothing when mounted directly on a tab-less route', () => {
    const result = renderComponent(<CollapsingTabBarHost state={null} />);

    expect(result.root.findAllByType(TabBar)).toHaveLength(0);
  });

  it('keeps the last TabBar mounted while the collapse animation runs', () => {
    const result = renderComponent(<CollapsingTabBarHost state={tabState()} />);
    measure(result);

    update(result, null);

    expect(result.root.findAllByType(TabBar)).toHaveLength(1);
  });

  it('unmounts the TabBar after the collapse animation completes', () => {
    const result = renderComponent(<CollapsingTabBarHost state={tabState()} />);
    measure(result);

    update(result, null);
    act(() => {
      jest.advanceTimersByTime(durations.tabBarToggleMs * 2);
    });

    expect(result.root.findAllByType(TabBar)).toHaveLength(0);
  });

  it('keeps the TabBar mounted when re-shown mid-collapse (interrupted animation)', () => {
    const result = renderComponent(<CollapsingTabBarHost state={tabState()} />);
    measure(result);

    update(result, null);
    act(() => {
      jest.advanceTimersByTime(durations.tabBarToggleMs / 2);
    });
    update(result, tabState());

    // The cancelled collapse callback (finished: false) must not unmount.
    expect(result.root.findAllByType(TabBar)).toHaveLength(1);
    act(() => {
      jest.advanceTimersByTime(durations.tabBarToggleMs * 2);
    });
    expect(result.root.findAllByType(TabBar)).toHaveLength(1);
  });

  it('forgets the measured height after a zero-height layout (web-shell self-hide)', () => {
    const result = renderComponent(<CollapsingTabBarHost state={tabState()} />);
    measure(result);
    measure(result, 0); // TabBar self-hid on the web-shell breakpoint

    update(result, null);

    // With no known height there is nothing to animate — the host must snap
    // to hidden immediately instead of collapsing a transparent ghost strip.
    expect(result.root.findAllByType(TabBar)).toHaveLength(0);
  });

  it('remounts the TabBar when navigation returns to a tab route', () => {
    const result = renderComponent(<CollapsingTabBarHost state={tabState()} />);
    measure(result);

    update(result, null);
    act(() => {
      jest.advanceTimersByTime(durations.tabBarToggleMs * 2);
    });
    update(result, tabState());

    expect(result.root.findAllByType(TabBar)).toHaveLength(1);
  });
});
