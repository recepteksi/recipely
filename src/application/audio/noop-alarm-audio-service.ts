import type { IAlarmAudioService } from '@domain/audio/i-alarm-audio-service';

/**
 * Null-object alarm-audio service used only when none is registered in the
 * container (unit tests that mount the alarm overlay without the composition
 * root). Both methods are inert — the real service is always registered before
 * the UI mounts in the app.
 */
export const noopAlarmAudioService: IAlarmAudioService = {
  start: async () => {},
  stop: async () => {},
};
