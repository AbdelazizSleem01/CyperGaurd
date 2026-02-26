// ─── notificationService.ts ─────────────────────────────────────────────────
import mongoose from 'mongoose';
import { logger } from '../../../shared/utils';
import { connectToDatabase } from '../../../database/connection';

import { Settings } from '../../../database/models/Settings';
import { Company } from '../../../database/models/Company';
import { User } from '../../../database/models/User';
import { BreachRecord } from '../../../database/models/BreachRecord';
import { RiskAssessment } from '../../../database/models/RiskAssessment';
import { ScanResult } from '../../../database/models/ScanResult';
import {
  sendBreachAlertEmail,
  sendScanCompleteEmail,
  sendHighRiskAlertEmail,
  sendWeeklyDigestEmail,
} from './emailService';

// ─── Types ────────────────────────────────────────────────────────────────────
interface BreachNotificationData {
  companyId: string;
  email: string;
  breachName: string;
  breachDate: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  dataClasses: string[];
}

interface ScanNotificationData {
  companyId: string;
  scanType: string;
  scanResultId: string;
}

interface RiskNotificationData {
  companyId: string;
  riskScore: number;
  riskCategory: string;
  findings: { severity: string }[];
}

// ─── Send Breach Notification ────────────────────────────────────────────────
export async function notifyBreachDetected(data: BreachNotificationData): Promise<void> {
  try {
    await connectToDatabase();

    // Get company settings
    const settings = await Settings.findOne({ companyId: data.companyId });
    if (!settings?.notifications?.emailOnNewBreach) {
      logger.info('Breach email notification disabled', { companyId: data.companyId });
      return;
    }

    // Get notification email
    const notificationEmail = settings.notifications.notificationEmail;
    if (!notificationEmail) {
      // Fallback to admin email
      const admin = await User.findOne({ companyId: data.companyId, role: 'admin' });
      if (!admin?.email) {
        logger.warn('No notification email found for breach alert', { companyId: data.companyId });
        return;
      }
    }

    const email = notificationEmail || (await User.findOne({ companyId: data.companyId, role: 'admin' }))?.email;
    if (!email) return;

    // Send breach alert email
    const sent = await sendBreachAlertEmail(email, {
      email: data.email,
      breach: data.breachName,
      severity: data.severity,
      dataClasses: data.dataClasses,
    });

    if (sent) {
      logger.info('Breach notification sent', { email, breach: data.breachName });
    }
  } catch (error) {
    logger.error('Failed to send breach notification', { error: String(error), data });
  }
}

// ─── Send Scan Complete Notification ─────────────────────────────────────────
export async function notifyScanComplete(data: ScanNotificationData): Promise<void> {
  try {
    await connectToDatabase();

    // Get company settings
    const settings = await Settings.findOne({ companyId: data.companyId });
    if (!settings?.notifications?.emailOnScanComplete) {
      logger.info('Scan complete email notification disabled', { companyId: data.companyId });
      return;
    }

    // Get scan result
    const scanResult = await ScanResult.findById(data.scanResultId);
    if (!scanResult) {
      logger.warn('Scan result not found for notification', { scanResultId: data.scanResultId });
      return;
    }

    // Get company
    const company = await Company.findById(data.companyId);
    if (!company) return;

    // Get risk assessment for this scan
    const riskAssessment = await RiskAssessment.findOne({
      companyId: data.companyId,
      scanResultId: data.scanResultId,
    });

    // Get notification email
    const notificationEmail = settings.notifications.notificationEmail;
    const email = notificationEmail || (await User.findOne({ companyId: data.companyId, role: 'admin' }))?.email;
    if (!email) return;

    // Count findings
    const findingsCount = riskAssessment?.findings?.length || 0;

    // Send scan complete email
    const sent = await sendScanCompleteEmail(email, {
      domain: scanResult.domain,
      scanTypes: data.scanType ? [data.scanType] : ['Full Scan'],
      duration: 'N/A',
      findings: findingsCount,
      companyName: company.name,
      riskScore: riskAssessment?.score || 0,
      riskCategory: riskAssessment?.category || 'Unknown',
    });

    if (sent) {
      logger.info('Scan complete notification sent', { email, scanType: data.scanType });
    }
  } catch (error) {
    logger.error('Failed to send scan complete notification', { error: String(error), data });
  }
}

// ─── Send High Risk Alert Notification ────────────────────────────────────────
export async function notifyHighRisk(data: RiskNotificationData): Promise<void> {
  try {
    await connectToDatabase();

    // Get company settings
    const settings = await Settings.findOne({ companyId: data.companyId });
    if (!settings?.notifications?.emailOnHighRisk) {
      logger.info('High risk email notification disabled', { companyId: data.companyId });
      return;
    }

    // Only send if risk score >= 70
    if (data.riskScore < 70) {
      logger.info('Risk score below threshold, skipping alert', { riskScore: data.riskScore });
      return;
    }

    // Get company
    const company = await Company.findById(data.companyId);
    if (!company) return;

    // Get notification email
    const notificationEmail = settings.notifications.notificationEmail;
    const email = notificationEmail || (await User.findOne({ companyId: data.companyId, role: 'admin' }))?.email;
    if (!email) return;

    // Count findings by severity
    const criticalFindings = data.findings.filter(f => f.severity === 'critical').length;
    const highFindings = data.findings.filter(f => f.severity === 'high').length;

    // Send high risk alert email
    const sent = await sendHighRiskAlertEmail(email, {
      companyName: company.name,
      riskScore: data.riskScore,
      riskCategory: data.riskCategory,
      criticalFindings,
      highFindings,
    });

    if (sent) {
      logger.info('High risk notification sent', { email, riskScore: data.riskScore });
    }
  } catch (error) {
    logger.error('Failed to send high risk notification', { error: String(error), data });
  }
}

// ─── Send Weekly Digest ───────────────────────────────────────────────────────
export async function sendWeeklyDigest(companyId: string): Promise<void> {
  try {
    await connectToDatabase();

    // Get company settings
    const settings = await Settings.findOne({ companyId });
    if (!settings?.notifications?.weeklyDigest) {
      logger.info('Weekly digest disabled', { companyId });
      return;
    }

    // Get company
    const company = await Company.findById(companyId);
    if (!company) return;

    // Get notification email
    const notificationEmail = settings.notifications.notificationEmail;
    const email = notificationEmail || (await User.findOne({ companyId, role: 'admin' }))?.email;
    if (!email) return;

    // Calculate week range
    const now = new Date();
    const weekEnd = now.toISOString().split('T')[0];
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get stats for the week
    const scansCompleted = await ScanResult.countDocuments({
      companyId,
      createdAt: { $gte: new Date(weekStart), $lte: new Date(weekEnd) },
    });

    const newBreaches = await BreachRecord.countDocuments({
      companyId,
      detectedAt: { $gte: new Date(weekStart), $lte: new Date(weekEnd) },
    });

    // Get current risk assessment
    const latestRisk = await RiskAssessment.findOne({ companyId }).sort({ createdAt: -1 });
    const previousRisk = await RiskAssessment.findOne({
      companyId,
      createdAt: { $lt: new Date(weekStart) },
    }).sort({ createdAt: -1 });

    // Determine risk trend
    let riskTrend: 'up' | 'down' | 'stable' = 'stable';
    if (latestRisk && previousRisk) {
      if (latestRisk.score > previousRisk.score + 5) riskTrend = 'up';
      else if (latestRisk.score < previousRisk.score - 5) riskTrend = 'down';
    }

    // Send weekly digest email
    const sent = await sendWeeklyDigestEmail(email, {
      companyName: company.name,
      weekStart,
      weekEnd,
      scansCompleted,
      newBreaches,
      currentRiskScore: latestRisk?.score || 0,
      riskTrend,
    });

    if (sent) {
      logger.info('Weekly digest sent', { email, companyId });
    }
  } catch (error) {
    logger.error('Failed to send weekly digest', { error: String(error), companyId });
  }
}

// ─── Process All Weekly Digests (Cron Job) ────────────────────────────────────
export async function processWeeklyDigests(): Promise<void> {
  try {
    await connectToDatabase();

    // Get all companies with weekly digest enabled
    const settingsWithDigest = await Settings.find({
      'notifications.weeklyDigest': true,
    });

    logger.info('Processing weekly digests', { count: settingsWithDigest.length });

    for (const settings of settingsWithDigest) {
      await sendWeeklyDigest(settings.companyId.toString());
    }
  } catch (error) {
    logger.error('Failed to process weekly digests', { error: String(error) });
  }
}