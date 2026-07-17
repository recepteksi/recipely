import { shouldDismissDrag } from '@presentation/base/utils/should-dismiss-drag';

describe('shouldDismissDrag', () => {
  it('dismisses on a plain tap (near-zero movement in both axes)', () => {
    expect(shouldDismissDrag({ dx: 0, dy: 0, vy: 0 })).toBe(true);
    expect(shouldDismissDrag({ dx: 2, dy: -3, vy: 0 })).toBe(true);
  });

  it('dismisses once the downward drag distance clears the threshold', () => {
    expect(shouldDismissDrag({ dx: 0, dy: 91, vy: 0 })).toBe(true);
    expect(shouldDismissDrag({ dx: 0, dy: 500, vy: 0 })).toBe(true);
  });

  it('dismisses on a fast downward flick even if the distance threshold was not reached', () => {
    expect(shouldDismissDrag({ dx: 0, dy: 40, vy: 0.9 })).toBe(true);
  });

  it('snaps back (does not dismiss) for a moderate drag below both thresholds', () => {
    expect(shouldDismissDrag({ dx: 0, dy: 40, vy: 0.2 })).toBe(false);
    expect(shouldDismissDrag({ dx: 0, dy: 90, vy: 0.79 })).toBe(false);
  });

  it('does not dismiss a large upward drag (only downward movement counts toward the thresholds)', () => {
    expect(shouldDismissDrag({ dx: 0, dy: -40, vy: -0.1 })).toBe(false);
  });
});
