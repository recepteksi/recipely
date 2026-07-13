import type { IAlarmAudioService } from '@domain/audio/i-alarm-audio-service';

/**
 * Recording test double for `IAlarmAudioService`. It plays no audio but tracks
 * how many times the alarm was started/stopped and whether it is currently
 * "playing", so tests can assert overlay start/stop wiring without the platform
 * audio subsystem.
 */
export class FakeAlarmAudioService implements IAlarmAudioService {
  startCount = 0;
  stopCount = 0;
  isPlaying = false;

  start(): Promise<void> {
    this.startCount += 1;
    this.isPlaying = true;
    return Promise.resolve();
  }

  stop(): Promise<void> {
    this.stopCount += 1;
    this.isPlaying = false;
    return Promise.resolve();
  }
}
