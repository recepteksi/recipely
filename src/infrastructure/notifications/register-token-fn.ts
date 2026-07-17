import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { DevicePlatform } from '@domain/notifications/device-platform';

/** Registers a push token with the backend; shared contract of the platform pair. */
export type RegisterTokenFn = (
  token: string,
  platform: DevicePlatform,
) => Promise<Result<void, Failure>>;
