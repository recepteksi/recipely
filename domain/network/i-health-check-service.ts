export type HealthStatus = 'unknown' | 'connected' | 'disconnected';

export interface IHealthCheckService {
  check(): Promise<HealthStatus>;
}
