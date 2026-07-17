import type { AlarmEntry } from '@application/timers/alarm-entry';

export interface AlarmStoreState {
  /** Non-null while an alarm overlay is visible. */
  activeAlarm: AlarmEntry | null;
  /** Triggers the alarm overlay. No-op if the same timer's alarm is already active. */
  trigger: (timerId: string, recipeName: string) => void;
  dismiss: () => void;
}
