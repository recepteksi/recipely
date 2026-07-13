/**
 * Contract constants shared between the notification service (which schedules
 * timer alerts) and the app-level response handler (which reads them back).
 */

/** Notification `data.type` marking a timer-completion alert. */
export const TIMER_COMPLETE = 'timer-complete';

/** Action identifier for the notification's "dismiss" button. */
export const DISMISS_ALARM_ACTION = 'DISMISS_ALARM';
