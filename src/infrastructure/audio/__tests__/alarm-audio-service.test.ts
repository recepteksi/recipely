/**
 * Contract test for `AlarmAudioService`. It must conform to the
 * `IAlarmAudioService` port, be a no-op on web, and on native start a single
 * looping sound (idempotent while already playing) and unload it on stop.
 * `expo-av` is mocked so no real audio subsystem is touched.
 */
/* eslint-disable import/first -- jest.mock() must be hoisted above imports */

jest.mock('expo-av', () => {
  const sound = {
    stopAsync: jest.fn((): Promise<void> => Promise.resolve()),
    unloadAsync: jest.fn((): Promise<void> => Promise.resolve()),
  };
  return {
    Audio: {
      __sound: sound,
      setAudioModeAsync: jest.fn((): Promise<void> => Promise.resolve()),
      Sound: {
        createAsync: jest.fn((): Promise<{ sound: typeof sound }> => Promise.resolve({ sound })),
      },
    },
  };
});

import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { AlarmAudioService } from '@infrastructure/audio/alarm-audio-service';

type AudioMock = {
  __sound: { stopAsync: jest.Mock; unloadAsync: jest.Mock };
  setAudioModeAsync: jest.Mock;
  Sound: { createAsync: jest.Mock };
};
const audio = Audio as unknown as AudioMock;
const platform = Platform as { OS: string };
const originalOS = platform.OS;

describe('AlarmAudioService', () => {
  let service: AlarmAudioService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AlarmAudioService();
  });

  afterEach(() => {
    platform.OS = originalOS;
  });

  it('exposes the IAlarmAudioService port shape', () => {
    expect(typeof service.start).toBe('function');
    expect(typeof service.stop).toBe('function');
  });

  describe('on web', () => {
    beforeEach(() => {
      platform.OS = 'web';
    });

    it('does not touch the audio subsystem on start or stop', async () => {
      await service.start();
      await service.stop();

      expect(audio.Sound.createAsync).not.toHaveBeenCalled();
      expect(audio.setAudioModeAsync).not.toHaveBeenCalled();
    });
  });

  describe('on native', () => {
    beforeEach(() => {
      platform.OS = 'ios';
    });

    it('configures audio and creates one looping sound on start', async () => {
      await service.start();

      expect(audio.setAudioModeAsync).toHaveBeenCalledTimes(1);
      expect(audio.Sound.createAsync).toHaveBeenCalledTimes(1);
    });

    it('is idempotent while already playing', async () => {
      await service.start();
      await service.start();

      expect(audio.Sound.createAsync).toHaveBeenCalledTimes(1);
    });

    it('stops and unloads the sound on stop', async () => {
      await service.start();

      await service.stop();

      expect(audio.__sound.stopAsync).toHaveBeenCalledTimes(1);
      expect(audio.__sound.unloadAsync).toHaveBeenCalledTimes(1);
    });

    it('is a safe no-op when stop is called with nothing playing', async () => {
      await service.stop();

      expect(audio.__sound.stopAsync).not.toHaveBeenCalled();
    });
  });
});
