import { Platform } from 'react-native';
import { Audio, type AVPlaybackSource } from 'expo-av';

// WHY: Metro does not resolve path aliases (@/) for binary assets — only for
// JS/TS modules. A relative path is required so the bundler can include the
// file at build time.
const ALARM_SOURCE: AVPlaybackSource = require('../../assets/sounds/alarm.mp3') as AVPlaybackSource;

let _sound: Audio.Sound | null = null;

/**
 * Starts a looping alarm tone.
 *
 * - On iOS: plays through the silent switch so the alarm fires even on vibrate
 *   mode (same behaviour as the Clock app).
 * - No-op on web.
 */
export const startAlarmAudio = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  if (_sound !== null) return;

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

    _sound = sound;
  } catch {
    // Audio subsystem unavailable — haptics remain the fallback.
  }
};

/** Stops and unloads the alarm tone. Safe to call even if no audio is playing. */
export const stopAlarmAudio = async (): Promise<void> => {
  if (_sound === null) return;
  const s = _sound;
  _sound = null;
  try {
    await s.stopAsync();
    await s.unloadAsync();
  } catch {
    // Best-effort cleanup.
  }
};
