'use strict';

import mongoose from 'mongoose';
import cron from 'node-cron';
import { Settings } from '../../../database/models/Settings';
import { Company } from '../../../database/models/Company';
import { ScanResult } from '../../../database/models/ScanResult';
import { connectToDatabase } from '../../../database/connection';
import { logger } from '../../../shared/utils';
import { sendScanCompleteEmail, sendBreachAlertEmail } from './emailService';

import {
  notifyScanComplete,
  processWeeklyDigests
} from './notificationService';

import { executeFullScan } from './scannerEngine';

// ─── Run Scan for Company ─────────────────────────────────────────────────────
async function runScanForCompany(companyId: string, domain: string, scanTypes: string[]): Promise<string | null> {
  try {
    logger.info('Starting automated scheduled scan', { companyId, domain, scanTypes });

    const scanRecord = await ScanResult.create({
      companyId,
      domain,
      status: 'pending',
      ports: [],
      ssl: null,
      subdomains: [],
      outdatedSoftware: [],
      discoveredPaths: [],
      startedAt: new Date(),
    });

    // Run actual scan
    await executeFullScan(
      scanRecord._id.toString(),
      companyId,
      domain,
      scanTypes
    );

    return scanRecord._id.toString();
  } catch (error) {
    logger.error('Scheduled scan failed', { companyId, error: String(error) });
    return null;
  }
}

// ─── Check and Run Scheduled Scans ────────────────────────────────────────────
async function checkScheduledScans(): Promise<void> {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (!isDbConnected) {
      await connectToDatabase();
    }

    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];

    logger.debug('Checking scheduled scans', { currentTime, currentDay });

    const settingsWithAutoScan = await Settings.find({
      'schedule.autoScanEnabled': true,
    });

    for (const settings of settingsWithAutoScan) {
      const { schedule } = settings;

      let shouldRun = false;

      if (schedule.frequency === 'daily' && schedule.scanTime === currentTime) {
        shouldRun = true;
      } else if (schedule.frequency === 'weekly' &&
        schedule.scanDay === currentDay &&
        schedule.scanTime === currentTime) {
        shouldRun = true;
      }

      const today = now.toDateString();
      const lastAutoScanAt = settings.lastAutoScanAt;
      const lastRunDate = lastAutoScanAt?.toDateString();

      if (shouldRun) {
        if (lastRunDate === today) {
          logger.debug(`Scan for company ${settings.companyId} already run today`);
        } else {
          const company = await Company.findById(settings.companyId);
          if (company && company.domain) {
            logger.info(`Triggering auto-scan for ${company.domain}`, { companyId: settings.companyId });
            await runScanForCompany(
              settings.companyId.toString(),
              company.domain,
              schedule.scanTypes?.length ? schedule.scanTypes : ['port-scan', 'ssl-check', 'subdomain-enum', 'breach-check', 'directory-scan', 'risk-calc']
            );

            await Settings.findByIdAndUpdate(settings._id, {
              lastAutoScanAt: now
            });
          }
        }
      }
    }
  } catch (error) {
    logger.error('Error checking scheduled scans', { error: String(error) });
  }
}

// ─── Initialize Scheduler ─────────────────────────────────────────────────────
export function initializeScheduler(): void {
  logger.info('Initializing all background schedulers...');

  // Check every minute for scheduled scans
  cron.schedule('* * * * *', async () => {
    await checkScheduledScans();
  });

  // Schedule weekly digest: Every Sunday at 9:00 AM
  cron.schedule('0 9 * * 0', async () => {
    logger.info('Triggering weekly digest processing job');
    await processWeeklyDigests();
  });

  logger.info('Schedulers initialized (Auto-scan: 1m, Weekly Digest: Sun 9am)');
}

// ─── Manual Trigger for Testing ───────────────────────────────────────────────
export async function triggerManualScan(companyId: string, scanTypes: string[]): Promise<string | null> {
  await connectToDatabase();

  const company = await Company.findById(companyId);
  if (!company || !company.domain) {
    throw new Error('Company not found or has no domain');
  }

  return runScanForCompany(companyId, company.domain, scanTypes);
}