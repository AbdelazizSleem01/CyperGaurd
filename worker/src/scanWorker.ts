import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../../.env.local') });
dotenv.config();
import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

import { connectToDatabase } from '../../database/connection';
import { ScanResult } from '../../database/models/ScanResult';
import { BreachRecord } from '../../database/models/BreachRecord';
import { RiskAssessment } from '../../database/models/RiskAssessment';
import { Company } from '../../database/models/Company';

import { scanPorts } from '../../scanner-service/src/services/portScanService';
import { checkSsl } from '../../scanner-service/src/services/sslService';
import { enumerateSubdomains } from '../../scanner-service/src/services/subdomainService';
import { checkHibp, checkDehashed } from '../../scanner-service/src/services/breachService';
import { buildRiskAssessment } from '../../scanner-service/src/services/riskService';
import { logger } from '../../shared/utils';
import type { ScanJob } from '../../shared/types';

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

async function processScanJob(job: Job<ScanJob>): Promise<void> {
  const { jobId, companyId, domain, types } = job.data;
  logger.info('Processing scan job', { jobId, domain, types });

  await connectToDatabase();

  // Mark scan as running
  await ScanResult.findByIdAndUpdate(jobId, { status: 'running' });

  try {
    const updates: Partial<{
      ports: unknown[];
      ssl: unknown;
      subdomains: unknown[];
      outdatedSoftware: unknown[];
    }> = {};

    // ─── Port Scan ─────────────────────────────────────────────────────────
    if (types.includes('port-scan')) {
      await job.updateProgress(10);
      const ports = await scanPorts(domain);
      updates.ports = ports;
      logger.info('Port scan complete', { domain, openPorts: ports.length });
    }

    // ─── SSL Check ─────────────────────────────────────────────────────────
    if (types.includes('ssl-check')) {
      await job.updateProgress(30);
      const ssl = await checkSsl(domain);
      updates.ssl = ssl;
      logger.info('SSL check complete', { domain, valid: ssl.isValid });
    }

    // ─── Subdomain Enumeration ─────────────────────────────────────────────
    if (types.includes('subdomain-enum')) {
      await job.updateProgress(50);
      const subdomains = await enumerateSubdomains(domain);
      updates.subdomains = subdomains;
      logger.info('Subdomain enum complete', { domain, count: subdomains.length });
    }

    // ─── Breach Check ─────────────────────────────────────────────────────
    if (types.includes('breach-check')) {
      await job.updateProgress(70);
      const company = await Company.findById(companyId);
      if (company?.emailDomains?.length) {
        // For a real impl, fetch actual email list from your directory
        const testEmails = company.emailDomains.map((d) => `admin@${d}`);
        const allBreaches = await Promise.all([
          ...testEmails.map((e) => checkHibp(e)),
          ...testEmails.map((e) => checkDehashed(e)),
        ]);

        for (const breachList of allBreaches) {
          for (const breach of breachList) {
            await BreachRecord.findOneAndUpdate(
              { companyId, email: breach.email, breachName: breach.breachName },
              { $setOnInsert: { ...breach, companyId, detectedAt: new Date() } },
              { upsert: true }
            );
          }
        }
      }
    }

    // ─── Save Scan Results ─────────────────────────────────────────────────
    await job.updateProgress(85);
    await ScanResult.findByIdAndUpdate(jobId, {
      ...updates,
      status: 'completed',
      completedAt: new Date(),
    });

    // ─── Risk Calculation ──────────────────────────────────────────────────
    if (types.includes('risk-calc') || types.includes('breach-check')) {
      await job.updateProgress(92);
      const scanResult = await ScanResult.findById(jobId).lean();
      const breaches = await BreachRecord.find({ companyId }).lean();

      if (scanResult) {
        const assessment = buildRiskAssessment({
          scanResult: scanResult as any,
          breaches: breaches as any,
          companyId,
        });

        await RiskAssessment.create({ ...assessment, createdAt: new Date() });
      }
    }

    await job.updateProgress(100);
    logger.info('Scan job completed', { jobId, domain });
  } catch (err) {
    logger.error('Scan job failed', { jobId, domain, error: String(err) });
    await ScanResult.findByIdAndUpdate(jobId, {
      status: 'failed',
      error: String(err),
      completedAt: new Date(),
    });
    throw err;
  }
}

// ─── Scheduled Scans Worker ───────────────────────────────────────────────────
export function startScanWorker() {
  const worker = new Worker<ScanJob>('scan-jobs', processScanJob, {
    connection: redisConnection as any,
    concurrency: 3,
  });

  worker.on('completed', (job) => {
    logger.info('Job completed', { jobId: job.id });
  });

  worker.on('failed', (job, err) => {
    logger.error('Job failed', { jobId: job?.id, error: String(err) });
  });

  worker.on('progress', (job, progress) => {
    logger.info('Job progress', { jobId: job.id, progress });
  });

  logger.info('Scan worker started');
  return worker;
}

startScanWorker();
