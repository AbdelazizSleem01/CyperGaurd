import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { logger } from '../../../shared/utils';
import type { ScanJob } from '../../../shared/types';

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

redisConnection.on('connect', () => logger.info('Redis connected for scan queue'));
redisConnection.on('error', (err) => logger.error('Redis error', { error: String(err) }));

export const scanQueue = new Queue<ScanJob>('scan-jobs', {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export { redisConnection };
