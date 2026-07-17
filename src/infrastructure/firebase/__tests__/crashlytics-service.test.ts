/**
 * Firebase Crashlytics wrapper tests — the native module is mocked so no native
 * code is touched. Verifies arguments are forwarded and errors are swallowed.
 */
/* eslint-disable import/first -- jest.mock() must be hoisted above imports */

jest.mock('@react-native-firebase/crashlytics', () => ({
  getCrashlytics: jest.fn(() => ({ id: 'crashlytics' })),
  log: jest.fn(),
  recordError: jest.fn(),
  setCrashlyticsCollectionEnabled: jest.fn(async () => undefined),
}));

import {
  setCrashReportingEnabled,
  recordCrash,
  logCrashBreadcrumb,
} from '@infrastructure/firebase/crashlytics-service';
import {
  log,
  recordError,
  setCrashlyticsCollectionEnabled,
} from '@react-native-firebase/crashlytics';

const CRASHLYTICS = { id: 'crashlytics' };

describe('crashlytics-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setCrashReportingEnabled', () => {
    it('forwards the flag to Firebase', async () => {
      await setCrashReportingEnabled(false);
      expect(setCrashlyticsCollectionEnabled).toHaveBeenCalledWith(CRASHLYTICS, false);
    });

    it('swallows errors from the native module', async () => {
      jest.mocked(setCrashlyticsCollectionEnabled).mockRejectedValueOnce(new Error('unavailable'));
      await expect(setCrashReportingEnabled(true)).resolves.not.toThrow();
    });
  });

  describe('recordCrash', () => {
    it('records an Error instance directly', () => {
      const error = new Error('boom');
      recordCrash(error);
      expect(recordError).toHaveBeenCalledWith(CRASHLYTICS, error);
    });

    it('wraps a non-Error value into an Error', () => {
      recordCrash('something failed');
      const recorded = jest.mocked(recordError).mock.calls[0]?.[1];
      expect(recorded).toBeInstanceOf(Error);
      expect((recorded as Error).message).toBe('something failed');
    });

    it('logs a breadcrumb before recording when context is given', () => {
      recordCrash(new Error('x'), 'RecipeDetail.load');
      expect(log).toHaveBeenCalledWith(CRASHLYTICS, 'RecipeDetail.load');
      expect(recordError).toHaveBeenCalled();
    });

    it('does not log a breadcrumb when no context is given', () => {
      recordCrash(new Error('x'));
      expect(log).not.toHaveBeenCalled();
    });

    it('swallows errors thrown by the native module', () => {
      jest.mocked(recordError).mockImplementationOnce(() => {
        throw new Error('native crash');
      });
      expect(() => recordCrash(new Error('x'))).not.toThrow();
    });
  });

  describe('logCrashBreadcrumb', () => {
    it('forwards the message to Firebase', () => {
      logCrashBreadcrumb('user opened recipe');
      expect(log).toHaveBeenCalledWith(CRASHLYTICS, 'user opened recipe');
    });
  });
});
