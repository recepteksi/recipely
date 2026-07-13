import { Platform } from 'react-native';
import { Audio, type AVPlaybackSource } from 'expo-av';
import type { IAlarmAudioService } from '@domain/audio/i-alarm-audio-service';
import { ALARM_SOUND_ASSET } from '@infrastructure/constants/assets';

const ALARM_SOURCE: AVPlaybackSource = ALARM_SOUND_ASSET;

/**
 * Plays a looping alarm tone while the timer-complete overlay is visible.
 *
 * - On iOS the tone plays through the silent switch so the alarm fires even in
 *   vibrate mode (same behaviour as the Clock app).
 * - Every method is a no-op on web.
 */
export class AlarmAudioService implements IAlarmAudioService {
  private sound: Audio.Sound | null = null;

  async start(): Promise<void> {
    if (Platform.OS === 'web') return;
    if (this.sound !== null) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      const { sound } = await Audio.Sound.createAsync(ALARM_SOURCE, {
        isLooping: true,
        volume: 1.0,
        shouldPlay: true,
      });

      this.sound = sound;
    } catch {
      // Audio subsystem unavailable — haptics remain the fallback.
    }
  }

  async stop(): Promise<void> {
    if (this.sound === null) return;
    const s = this.sound;
    this.sound = null;
    try {
      await s.stopAsync();
      await s.unloadAsync();
    } catch {
      // Best-effort cleanup.
    }
  }
}
