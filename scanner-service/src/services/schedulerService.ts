'use strict';

import mongoose from 'mongoose';
import cron from 'node-cron';
import { Settings } from '../../../database/models/Settings';
import { Company } from '../../../database/models/Company';
import { ScanResult } from '../../../database/models/ScanResult';
import { connectToDatabase } from '../../../database/connection';
import { logger, normalizeDomain } from '../../../shared/utils';
import { sendScanCompleteEmail, sendBreachAlertEmail } from './emailService';

import {
  notifyScanComplete,
  processWeeklyDigests
} from './notificationService';

import { executeFullScan } from './scannerEngine';

// ─── Run Scan for Company ─────────────────────────────────────────────────────
async function runScanForCompany(companyId: string, domain: string, scanTypes: string[]): Promise<string | null> {
  try {
    const cleanDomain = normalizeDomain(domain);
    logger.info('Starting automated scheduled scan', { companyId, domain: cleanDomain, scanTypes });

    const scanRecord = await ScanResult.create({
      companyId,
      domain: cleanDomain,
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
      cleanDomain,
      scanTypes
    );

    return scanRecord._id.toString();
  } catch (error) {
    logger.error('Scheduled scan failed', { companyId, error: String(error) });
    return null;
  }
}

// ─── Check and Run Scheduled Scans ────────────────────────────────────────────
// ─── Helper: get current time in a specific timezone ──────────────────────────
function getCurrentTimeInTimezone(timezone: string): { time: string; day: string; dateString: string } {
  try {
    const now = new Date();
    // Use Intl.DateTimeFormat to get time in the user's timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const dayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
    });
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const parts = formatter.formatToParts(now);
    const hour = (parts.find(p => p.type === 'hour')?.value || '00').padStart(2, '0');
    const minute = (parts.find(p => p.type === 'minute')?.value || '00').padStart(2, '0');
    // Some locales return "24" for midnight, normalize to "00"
    const normalizedHour = hour === '24' ? '00' : hour;

    return {
      time: `${normalizedHour}:${minute}`,
      day: dayFormatter.format(now).toLowerCase(),
      dateString: dateFormatter.format(now),
    };
  } catch {
    // Fallback to UTC if timezone is invalid
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return {
      time: `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}`,
      day: days[now.getUTCDay()],
      dateString: now.toUTCString(),
    };
  }
}

// ─── Helper: normalize time to HH:MM format ──────────────────────────────────
function normalizeTime(time: string): string {
  if (!time) return '00:00';
  const parts = time.split(':');
  const hour = (parts[0] || '0').padStart(2, '0');
  const minute = (parts[1] || '0').padStart(2, '0');
  return `${hour}:${minute}`;
}

// ─── Check and Run Scheduled Scans ────────────────────────────────────────────
async function checkScheduledScans(): Promise<void> {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (!isDbConnected) {
      await connectToDatabase();
    }

    logger.debug('Checking scheduled scans...');

    const settingsWithAutoScan = await Settings.find({
      'schedule.autoScanEnabled': true,
    });

    for (const settings of settingsWithAutoScan) {
      const { schedule } = settings;

      // Get current time in the user's timezone (default to UTC if not set)
      const userTimezone = schedule.timezone || 'UTC';
      const { time: currentTime, day: currentDay, dateString: todayString } = getCurrentTimeInTimezone(userTimezone);

      // Normalize stored scan time to ensure HH:MM format
      const normalizedScanTime = normalizeTime(schedule.scanTime);

      logger.debug('Comparing scan schedule', {
        companyId: settings.companyId,
        userTimezone,
        currentTime,
        scanTime: normalizedScanTime,
        currentDay,
        scanDay: schedule.scanDay,
        frequency: schedule.frequency,
      });

      let shouldRun = false;

      if (schedule.frequency === 'daily' && normalizedScanTime === currentTime) {
        shouldRun = true;
      } else if (schedule.frequency === 'weekly' &&
        schedule.scanDay === currentDay &&
        normalizedScanTime === currentTime) {
        shouldRun = true;
      }

      // Check if already ran today (using the user's timezone date)
      const lastAutoScanAt = settings.lastAutoScanAt;
      let alreadyRanToday = false;
      if (lastAutoScanAt) {
        const lastRunInUserTz = getCurrentTimeInTimezone(userTimezone);
        // Compare using the timezone-aware date string
        try {
          const lastRunFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: userTimezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
          const lastRunDateString = lastRunFormatter.format(lastAutoScanAt);
          alreadyRanToday = lastRunDateString === todayString;
        } catch {
          alreadyRanToday = lastAutoScanAt.toDateString() === new Date().toDateString();
        }
      }

      if (shouldRun) {
        if (alreadyRanToday) {
          logger.debug(`Scan for company ${settings.companyId} already run today`);
        } else {
          const company = await Company.findById(settings.companyId);
          if (company && company.domain) {
            logger.info(`Triggering auto-scan for ${company.domain}`, {
              companyId: settings.companyId,
              timezone: userTimezone,
              scheduledTime: normalizedScanTime,
            });
            await runScanForCompany(
              settings.companyId.toString(),
              company.domain,
              schedule.scanTypes?.length ? schedule.scanTypes : ['port-scan', 'ssl-check', 'subdomain-enum', 'breach-check', 'directory-scan', 'risk-calc']
            );

            await Settings.findByIdAndUpdate(settings._id, {
              lastAutoScanAt: new Date()
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