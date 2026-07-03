import type { registerApplication } from '@application/di/register';

export type Stores = ReturnType<typeof registerApplication>;
