export interface TimerEntry {
  /** Stable unique key: `${recipeId}:step${stepIndex}:${durationMin}min` */
  id: string;
  recipeId: string;
  recipeName: string;
  durationSeconds: number;
  /** Absolute ms timestamp when the timer is scheduled to complete. */
  endTimeMs: number;
  isPaused: boolean;
  /** Only valid while paused: remaining ms at the moment pause was pressed. */
  remainingMsOnPause: number;
  /**
   * IDs of all scheduled completion/reminder notifications.
   * First entry is the main alert; the rest are 2-minute reminders.
   * All are cancelled together when the timer is stopped or dismissed.
   */
  completionNotifIds: string[];
}
