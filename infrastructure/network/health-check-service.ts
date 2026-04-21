import type { Failure } from '@core/failure';
import { NetworkFailure } from '@core/failure';
import { HEALTH_URL } from '@infrastructure/constants/api';

export type HealthStatus = 'unknown' | 'connected' | 'disconnected';

export interface IHealthCheckService {
  check(): Promise<HealthStatus>;
}

export class HealthCheckService implements IHealthCheckService {
  async check(): Promise<HealthStatus> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5_000);

      const response = await fetch(HEALTH_URL, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return 'disconnected';
      }
      return 'connected';
    } catch {
      return 'disconnected';
    }
  }
}
