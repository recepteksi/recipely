import { HEALTH_URL } from '@infrastructure/constants/api';

export type HealthStatus = 'unknown' | 'connected' | 'disconnected';

export interface IHealthCheckService {
  check(): Promise<HealthStatus>;
}

/**
 * Probes the backend health endpoint with a 5-second timeout to determine
 * whether the server is reachable. Returns `'connected'`, `'disconnected'`, or
 * `'unknown'` — never throws.
 */
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
