import 'dotenv/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { connectToDatabase } from '../../database/connection';
import { Company } from '../../database/models/Company';
import { logger } from '../../shared/utils';
import type { ScanJob } from '../../shared/types';

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const scanQueue = new Queue<ScanJob>('scan-jobs', { connection: redisConnection as any });

async function scheduleAllCompanies(): Promise<void> {
  await connectToDatabase();
  const companies = await Company.find().lean();

  for (const company of companies) {
    await scanQueue.add(
      'scheduled-scan' as any,
      {
        jobId: '',
        companyId: company._id.toString(),
        domain: company.domain,
        types: ['port-scan', 'ssl-check', 'subdomain-enum', 'breach-check', 'risk-calc'],
        priority: 'low',
      },
      { delay: Math.random() * 60_000 } 
    );
  }

  logger.info(`Scheduled scans for ${companies.length} companies`);
}

export async function setupScheduledJobs(): Promise<void> {
  await scanQueue.add(
    'nightly-scan-trigger' as any,
    { jobId: '', companyId: 'all', domain: '', types: [], priority: 'low' },
    {
      repeat: {
        pattern: '0 2 * * *', 
      },
    }
  );

  logger.info('Scheduled jobs configured');
}

if (require.main === module) {
  scheduleAllCompanies()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('Scheduler error', { error: String(err) });
      process.exit(1);
    });
}
