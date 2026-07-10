/**
 * Unit tests for `useRefreshFailureToast`, driven through a probe component
 * (react-test-renderer has no `renderHook`) whose `failure` prop is re-rendered
 * via `renderer.update`. The hook has no theme/safe-area dependency, so — unlike
 * the provider-wrapped `renderComponent` helper — the probe is created directly
 * with `react-test-renderer`'s own `create`, so `update` re-renders the exact
 * same root element (required for React to diff in place rather than remount).
 */

import { act, create } from 'react-test-renderer';
import { useRefreshFailureToast } from '@presentation/screens/recipes/list/hooks/use-refresh-failure-toast';
import { showErrorToast } from '@presentation/base/feedback/show-toast';
import { NetworkFailure } from '@core/failure';
import type { Failure } from '@presentation/base/types';

jest.mock('@presentation/base/feedback/show-toast', () => ({
  showErrorToast: jest.fn(),
}));

interface ProbeProps {
  failure: Failure | undefined;
}

const Probe = ({ failure }: ProbeProps): null => {
  useRefreshFailureToast(failure);
  return null;
};

describe('useRefreshFailureToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not toast on mount when there is no failure', () => {
    act(() => {
      create(<Probe failure={undefined} />);
    });

    expect(showErrorToast).not.toHaveBeenCalled();
  });

  it('does not toast on mount even if a failure is already present', () => {
    const failure = new NetworkFailure('offline');
    act(() => {
      create(<Probe failure={failure} />);
    });

    expect(showErrorToast).not.toHaveBeenCalled();
  });

  it('toasts once on an undefined -> defined transition', () => {
    const failure = new NetworkFailure('offline');
    let renderer!: ReturnType<typeof create>;
    act(() => {
      renderer = create(<Probe failure={undefined} />);
    });

    act(() => {
      renderer.update(<Probe failure={failure} />);
    });

    expect(showErrorToast).toHaveBeenCalledTimes(1);
    expect(showErrorToast).toHaveBeenCalledWith(failure);
  });

  it('does not re-toast while the same failure stays set across re-renders', () => {
    const failure = new NetworkFailure('offline');
    let renderer!: ReturnType<typeof create>;
    act(() => {
      renderer = create(<Probe failure={undefined} />);
    });

    act(() => {
      renderer.update(<Probe failure={failure} />);
    });
    act(() => {
      renderer.update(<Probe failure={failure} />);
    });

    expect(showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('re-arms after the failure clears, toasting again on the next transition', () => {
    const failure = new NetworkFailure('offline');
    let renderer!: ReturnType<typeof create>;
    act(() => {
      renderer = create(<Probe failure={undefined} />);
    });

    act(() => {
      renderer.update(<Probe failure={failure} />);
    });
    act(() => {
      renderer.update(<Probe failure={undefined} />);
    });
    act(() => {
      renderer.update(<Probe failure={failure} />);
    });

    expect(showErrorToast).toHaveBeenCalledTimes(2);
  });
});
