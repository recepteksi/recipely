import { formatTimer } from '@presentation/base/utils/format-timer';

describe('formatTimer', () => {
  it('formats whole minutes', () => {
    expect(formatTimer(0)).toBe('00:00');
    expect(formatTimer(60)).toBe('01:00');
    expect(formatTimer(600)).toBe('10:00');
  });

  it('zero-pads minutes and seconds', () => {
    expect(formatTimer(5)).toBe('00:05');
    expect(formatTimer(65)).toBe('01:05');
    expect(formatTimer(90)).toBe('01:30');
  });

  it('handles large durations', () => {
    expect(formatTimer(3599)).toBe('59:59');
    expect(formatTimer(3600)).toBe('60:00');
  });

  it('clamps negative input to zero', () => {
    expect(formatTimer(-1)).toBe('00:00');
    expect(formatTimer(-120)).toBe('00:00');
  });

  it('floors fractional seconds', () => {
    expect(formatTimer(59.9)).toBe('00:59');
    expect(formatTimer(125.4)).toBe('02:05');
  });
});
