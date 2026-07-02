import type { HealthStatus } from '@domain/network/health-status';

export interface IHealthCheckService {
  check(): Promise<HealthStatus>;
}
