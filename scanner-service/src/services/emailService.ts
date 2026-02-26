'use strict';

import nodemailer from 'nodemailer';
import { logger } from '../../../shared/utils';

// ─── Email Configuration ──────────────────────────────────────────────────────
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

function getEmailConfig(): EmailConfig | null {
  const host = process.env.SMTP_HOST;
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user,
    pass,
    from: (process.env.SMTP_FROM || `CyberGuard <${user}>`).trim(),
  };
}

// ─── Create Transporter ───────────────────────────────────────────────────────
function createTransporter() {
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
}

// ─── Send Email ───────────────────────────────────────────────────────────────
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<boolean> {
  try {
    const transporter = createTransporter();
    const config = getEmailConfig();

    if (!transporter || !config) {
      logger.warn('Email not sent - SMTP not configured', { to, subject });
      return false;
    }

    const info = await transporter.sendMail({
      from: config.from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    logger.info('Email sent successfully', { to, subject, messageId: info.messageId });
    return true;
  } catch (error) {
    logger.error('Failed to send email', { to, subject, error: String(error) });
    return false;
  }
}

// ─── Send Test Email ───────────────────────────────────────────────────────────
export async function sendTestEmail(to: string): Promise<boolean> {
  const subject = 'CyberGuard - Test Email';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🛡️ CyberGuard</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Email Configuration Test</h2>
        <p style="color: #666; line-height: 1.6;">
          This is a test email from CyberGuard Security Platform.
        </p>
        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #2e7d32; margin: 0; font-weight: bold;">✅ Email Configuration Working</p>
          <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">
            Your email notifications are properly configured. You will receive alerts for security events.
          </p>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          CyberGuard Security Platform - Protecting your organization from cyber threats.
        </p>
      </div>
    </div>
  `;

  return sendEmail(to, subject, html);
}

// ─── Verify Email Connection ───────────────────────────────────────────────────
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      logger.warn('SMTP not configured');
      return false;
    }

    await transporter.verify();
    logger.info('SMTP connection verified successfully');
    return true;
  } catch (error) {
    logger.error('SMTP verification failed', { error: String(error) });
    return false;
  }
}

// ─── Send Breach Alert Email ───────────────────────────────────────────────────
export async function sendBreachAlertEmail(
  to: string,
  data: {
    email: string;
    breach: string;
    severity: string;
    dataClasses: string[];
  }
): Promise<boolean> {
  const subject = `⚠️ CyberGuard Alert: Credential Breach Detected - ${data.breach}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Breach Alert</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="color: #333; line-height: 1.6;">
          We detected a credential exposure for your organization:
        </p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p style="margin: 0 0 10px 0;"><strong style="color: #333;">Email:</strong> <span style="color: #666;">${data.email}</span></p>
          <p style="margin: 0 0 10px 0;"><strong style="color: #333;">Breach:</strong> <span style="color: #666;">${data.breach}</span></p>
          <p style="margin: 0 0 10px 0;"><strong style="color: #333;">Severity:</strong> <span style="color: ${data.severity === 'Critical' ? '#ef4444' : data.severity === 'High' ? '#f97316' : '#eab308'};">${data.severity}</span></p>
          <p style="margin: 0;"><strong style="color: #333;">Compromised Data:</strong> <span style="color: #666;">${data.dataClasses.join(', ')}</span></p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/breaches" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            View Details in Dashboard
          </a>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          CyberGuard Security Platform - Protecting your organization from cyber threats.
        </p>
      </div>
    </div>
  `;

  return sendEmail(to, subject, html);
}

// ─── Send Scan Complete Email ───────────────────────────────────────────────────
export interface ScanCompleteData {
  domain: string;
  scanTypes: string[];
  duration: string;
  findings: number;
  companyName?: string;
  riskScore?: number;
  riskCategory?: string;
}

export async function sendScanCompleteEmail(
  to: string,
  data: ScanCompleteData
): Promise<boolean> {
  const subject = `✅ CyberGuard: Scan Complete - ${data.domain}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">✅ Scan Complete</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="color: #333; line-height: 1.6;">
          Your security scan has completed successfully:
        </p>
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <p style="margin: 0 0 10px 0;"><strong style="color: #333;">Domain:</strong> <span style="color: #666;">${data.domain}</span></p>
          <p style="margin: 0 0 10px 0;"><strong style="color: #333;">Scan Types:</strong> <span style="color: #666;">${data.scanTypes.join(', ')}</span></p>
          <p style="margin: 0 0 10px 0;"><strong style="color: #333;">Duration:</strong> <span style="color: #666;">${data.duration}</span></p>
          <p style="margin: 0;"><strong style="color: #333;">Findings:</strong> <span style="color: #666;">${data.findings} issues found</span></p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/scans" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            View Scan Results
          </a>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          CyberGuard Security Platform - Protecting your organization from cyber threats.
        </p>
      </div>
    </div>
  `;

  return sendEmail(to, subject, html);
}

// ─── Send Weekly Digest Email ───────────────────────────────────────────────────
export interface WeeklyDigestData {
  companyName: string;
  weekStart: string;
  weekEnd: string;
  scansCompleted: number;
  newBreaches: number;
  currentRiskScore: number;
  riskTrend: 'up' | 'down' | 'stable';
}

export async function sendWeeklyDigestEmail(
  to: string,
  data: WeeklyDigestData
): Promise<boolean> {
  const trendIcon = data.riskTrend === 'up' ? '📈' : data.riskTrend === 'down' ? '📉' : '➡️';
  const trendColor = data.riskTrend === 'up' ? '#ef4444' : data.riskTrend === 'down' ? '#10b981' : '#6b7280';

  const subject = `📊 CyberGuard Weekly Digest - ${data.weekEnd}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">📊 Weekly Security Digest</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="color: #333; line-height: 1.6;">
          Here's your weekly security summary for <strong>${data.companyName}</strong>:
        </p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Report Period: ${data.weekStart} to ${data.weekEnd}</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0;">
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="color: #10b981; font-size: 28px; font-weight: bold; margin: 0;">${data.scansCompleted}</p>
            <p style="color: #666; margin: 5px 0 0 0;">Scans Completed</p>
          </div>
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="color: #ef4444; font-size: 28px; font-weight: bold; margin: 0;">${data.newBreaches}</p>
            <p style="color: #666; margin: 5px 0 0 0;">New Breaches</p>
          </div>
        </div>
        <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
          <p style="margin: 0 0 10px 0;"><strong style="color: #333;">Current Risk Score:</strong> <span style="color: ${data.currentRiskScore >= 75 ? '#ef4444' : data.currentRiskScore >= 50 ? '#f97316' : '#10b981'}; font-size: 18px; font-weight: bold;">${data.currentRiskScore}/100</span></p>
          <p style="margin: 0;"><strong style="color: #333;">Risk Trend:</strong> <span style="color: ${trendColor};">${trendIcon} ${data.riskTrend}</span></p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            View Full Dashboard
          </a>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          CyberGuard Security Platform - Protecting your organization from cyber threats.
        </p>
      </div>
    </div>
  `;

  return sendEmail(to, subject, html);
}

// ─── Send High Risk Alert Email ─────────────────────────────────────────────────
export async function sendHighRiskAlertEmail(
  to: string,
  data: {
    companyName?: string;
    riskScore: number;
    riskCategory: string;
    criticalFindings?: number;
    highFindings?: number;
    findings?: string[];
  }
): Promise<boolean> {
  const subject = `🔴 CyberGuard: High Risk Alert - Score ${data.riskScore}/100`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🔴 High Risk Alert</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="color: #333; line-height: 1.6;">
          Your organization's risk score has exceeded the threshold:
        </p>
        <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
          <p style="margin: 0 0 10px 0;"><strong style="color: #333;">Risk Score:</strong> <span style="color: ${data.riskScore >= 75 ? '#ef4444' : data.riskScore >= 50 ? '#f97316' : '#eab308'}; font-size: 18px; font-weight: bold;">${data.riskScore}/100</span></p>
          <p style="margin: 0 0 10px 0;"><strong style="color: #333;">Risk Category:</strong> <span style="color: #666;">${data.riskCategory}</span></p>
          <p style="margin: 0;"><strong style="color: #333;">Key Findings:</strong></p>
          <ul style="color: #666; margin: 10px 0; padding-left: 20px;">
            ${(data.findings || []).map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            View Dashboard
          </a>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          CyberGuard Security Platform - Protecting your organization from cyber threats.
        </p>
      </div>
    </div>
  `;

  return sendEmail(to, subject, html);
}