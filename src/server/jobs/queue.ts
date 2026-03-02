import { Queue } from 'bullmq';
import type { ConnectionOptions } from 'bullmq';

export const connection: ConnectionOptions = {
  host: process.env.UPSTASH_REDIS_HOST ?? 'localhost',
  port: Number(process.env.UPSTASH_REDIS_PORT ?? 6379),
  password: process.env.UPSTASH_REDIS_PASSWORD,
  tls: process.env.UPSTASH_REDIS_HOST ? {} : undefined,
  maxRetriesPerRequest: null,
};

// ─── Queues ──────────────────────────────────────────────
export const scoringQueue = new Queue('scoring-queue', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});
