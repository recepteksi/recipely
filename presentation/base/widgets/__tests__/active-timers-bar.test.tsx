/**
 * `ActiveTimersBar` must not repeat a timer that's already visible inline on
 * the currently-open recipe detail screen (the prep/cook stat-card countdown,
 * or a step's inline chip) — that was the literal on-screen duplicate from
 * tester feedback. Timers for any other recipe, or shown from any other
 * screen, must still surface here so the cross-navigation/multi-timer bar
 * keeps working.
 */

import { act, type ReactTestRenderer } from 'react-test-renderer';
import { renderComponent } from '@presentation/base/test-support/render-component';
import { ActiveTimersBar } from '@presentation/base/widgets/active-timers-bar';
import { timerStore } from '@application/timers/timer-store';
import type { TimerEntry } from '@application/timers/timer-entry';

let mockPathname = '/recipes/pecan-pie';

jest.mock('expo-router', () => ({
  usePathname: jest.fn(() => mockPathname),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

const makeEntry = (id: string, recipeId: string, recipeName: string): TimerEntry => ({
  id,
  recipeId,
  recipeName,
  durationSeconds: 3000,
  endTimeMs: Date.now() + 2_986_000,
  isPaused: false,
  remainingMsOnPause: 0,
  completionNotifIds: ['notif-1'],
});

describe('ActiveTimersBar — same-screen dedupe', () => {
  let renderer: ReactTestRenderer | undefined;

  afterEach(() => {
    act(() => {
      renderer?.unmount();
    });
    renderer = undefined;
    timerStore.setState({ timers: {}, hydrated: true });
  });

  it('renders nothing when the only active timer belongs to the recipe currently on screen', () => {
    mockPathname = '/recipes/pecan-pie';
    timerStore.setState({
      timers: { 'pecan-pie:cook': makeEntry('pecan-pie:cook', 'pecan-pie', 'Pecan Pie') },
    });

    renderer = renderComponent(<ActiveTimersBar />).renderer;
    const tree = renderer.toJSON();
    const children = Array.isArray(tree) ? tree : tree?.children;
    expect(children).toBeNull();
  });

  it('still shows a timer for a different recipe while viewing this recipe', () => {
    mockPathname = '/recipes/pecan-pie';
    timerStore.setState({
      timers: {
        'pecan-pie:cook': makeEntry('pecan-pie:cook', 'pecan-pie', 'Pecan Pie'),
        'apple-crumble:prep': makeEntry('apple-crumble:prep', 'apple-crumble', 'Apple Crumble'),
      },
    });

    renderer = renderComponent(<ActiveTimersBar />).renderer;
    expect(renderer.toJSON()).not.toBeNull();
  });

  it('shows every timer when not on any recipe detail screen', () => {
    mockPathname = '/my-recipes';
    timerStore.setState({
      timers: { 'pecan-pie:cook': makeEntry('pecan-pie:cook', 'pecan-pie', 'Pecan Pie') },
    });

    renderer = renderComponent(<ActiveTimersBar />).renderer;
    expect(renderer.toJSON()).not.toBeNull();
  });
});
