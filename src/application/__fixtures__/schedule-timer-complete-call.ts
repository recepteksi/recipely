/** One recorded `scheduleTimerComplete` invocation, for call-argument assertions. */
export type ScheduleTimerCompleteCall = {
  timerId: string;
  recipeName: string;
  endTimeMs: number;
};
