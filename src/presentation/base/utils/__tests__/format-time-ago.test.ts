import { formatTimeAgo } from '@presentation/base/utils/format-time-ago';

describe('formatTimeAgo', () => {
  const NOW = new Date('2026-06-07T12:00:00.000Z').getTime();

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const ago = (ms: number): Date => new Date(NOW - ms);

  it('returns just now for durations under a minute', () => {
    expect(formatTimeAgo(ago(10 * 1000))).toBe('just now');
    expect(formatTimeAgo(ago(59 * 1000))).toBe('just now');
  });

  it('formats minutes', () => {
    expect(formatTimeAgo(ago(5 * 60 * 1000))).toBe('5m ago');
    expect(formatTimeAgo(ago(59 * 60 * 1000))).toBe('59m ago');
  });

  it('formats hours', () => {
    expect(formatTimeAgo(ago(3 * 60 * 60 * 1000))).toBe('3h ago');
    expect(formatTimeAgo(ago(23 * 60 * 60 * 1000))).toBe('23h ago');
  });

  it('formats days', () => {
    expect(formatTimeAgo(ago(2 * 24 * 60 * 60 * 1000))).toBe('2d ago');
  });

  it('clamps a zero or future date to just now', () => {
    expect(formatTimeAgo(new Date(NOW))).toBe('just now');
    expect(formatTimeAgo(new Date(NOW + 10 * 1000))).toBe('just now');
  });
});
