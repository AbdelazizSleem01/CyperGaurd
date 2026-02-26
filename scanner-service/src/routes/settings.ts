import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Settings } from '../../../database/models/Settings';
import { User } from '../../../database/models/User';
import { connectToDatabase } from '../../../database/connection';
import { AppError } from '../middleware/errorHandler';
import { sendTestEmail, verifyEmailConnection } from '../services/emailService';

export const settingsRouter = Router();

// ─── Get All Settings ────────────────────────────────────────────────────────
settingsRouter.get('/', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  let settings = await Settings.findOne({ companyId: req.user!.companyId }).lean();
  
  // Create default settings if not exists
  if (!settings) {
    await Settings.create({
      companyId: req.user!.companyId,
      notifications: {
        emailOnNewBreach: true,
        emailOnScanComplete: false,
        emailOnHighRisk: true,
        toastOnNewBreach: true,
        toastOnScanComplete: true,
        weeklyDigest: false,
        notificationEmail: '',
      },
      schedule: {
        autoScanEnabled: true,
        frequency: 'daily',
        scanTime: '02:00',
        scanDay: 'monday',
        scanTypes: ['port-scan', 'ssl-check', 'breach-check', 'risk-calc'],
      },
    });
    settings = await Settings.findOne({ companyId: req.user!.companyId }).lean();
  }
  
  res.json({ success: true, data: settings });
});

// ─── Update Notifications ────────────────────────────────────────────────────
settingsRouter.put('/notifications', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const settings = await Settings.findOneAndUpdate(
    { companyId: req.user!.companyId },
    { notifications: req.body },
    { new: true, upsert: true }
  ).lean();
  
  res.json({ success: true, data: settings });
});

// ─── Update Schedule ──────────────────────────────────────────────────────────
settingsRouter.put('/schedule', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const settings = await Settings.findOneAndUpdate(
    { companyId: req.user!.companyId },
    { schedule: req.body },
    { new: true, upsert: true }
  ).lean();
  
  res.json({ success: true, data: settings });
});

// ─── Update Profile ───────────────────────────────────────────────────────────
settingsRouter.put('/profile', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const { name, email } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.user!.userId,
    { name, email },
    { new: true }
  ).select('-passwordHash').lean();
  
  if (!user) {
    throw new AppError('User not found', 404, true);
  }
  
  res.json({ success: true, data: user });
});

// ─── Change Password ─────────────────────────────────────────────────────────
settingsRouter.put('/password', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    throw new AppError('Current and new password are required', 400, true);
  }
  
  if (newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters', 400, true);
  }
  
  const user = await User.findById(req.user!.userId).select('+passwordHash');
  
  if (!user) {
    throw new AppError('User not found', 404, true);
  }
  
  const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
  
  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401, true);
  }
  
  const passwordHash = await bcrypt.hash(newPassword, 12);
  user.passwordHash = passwordHash;
  user.lastPasswordChange = new Date();
  await user.save();
  
  res.json({ success: true, message: 'Password changed successfully' });
});

// ─── Get Security Overview ───────────────────────────────────────────────────
settingsRouter.get('/security', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const user = await User.findById(req.user!.userId)
    .select('twoFactorEnabled lastPasswordChange activeSessions loginAttempts lockUntil createdAt')
    .lean();
  
  if (!user) {
    throw new AppError('User not found', 404, true);
  }
  
  // Get current session ID from request (we'll use the token as session identifier)
  const currentSessionId = req.headers.authorization?.split(' ')[1]?.slice(0, 32) || 'current';
  
  const securityData = {
    twoFactorEnabled: user.twoFactorEnabled || false,
    lastPasswordChange: user.lastPasswordChange || user.createdAt,
    activeSessions: (user.activeSessions || []).map((session: any) => ({
      ...session,
      isCurrent: session.sessionId === currentSessionId
    })),
    loginAttempts: user.loginAttempts || 0,
    isLocked: user.lockUntil && new Date(user.lockUntil) > new Date(),
    passwordStrength: 'Strong', // Could be calculated based on password policy
  };
  
  res.json({ success: true, data: securityData });
});

// ─── Revoke All Sessions ─────────────────────────────────────────────────────
settingsRouter.post('/security/revoke-sessions', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const currentSessionId = req.headers.authorization?.split(' ')[1]?.slice(0, 32) || 'current';
  
  // Keep only the current session
  const user = await User.findByIdAndUpdate(
    req.user!.userId,
    { 
      $set: { 
        activeSessions: (await User.findById(req.user!.userId))?.activeSessions?.filter(
          (s: any) => s.sessionId === currentSessionId
        ) || []
      } 
    },
    { new: true }
  ).select('activeSessions').lean();
  
  res.json({ 
    success: true, 
    message: 'All other sessions have been revoked',
    data: user?.activeSessions || []
  });
});

// ─── Enable/Disable 2FA ──────────────────────────────────────────────────────
settingsRouter.post('/security/2fa/toggle', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const { enable } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.user!.userId,
    { twoFactorEnabled: enable },
    { new: true }
  ).select('twoFactorEnabled').lean();
  
  res.json({ 
    success: true, 
    message: enable ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled',
    data: { twoFactorEnabled: user?.twoFactorEnabled }
  });
});

// ─── Generate 2FA Secret ─────────────────────────────────────────────────────
settingsRouter.get('/security/2fa/setup', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  // Generate a random secret for 2FA
  const secret = crypto.randomBytes(20).toString('hex').toUpperCase().slice(0, 32);
  
  await User.findByIdAndUpdate(
    req.user!.userId,
    { twoFactorSecret: secret }
  );
  
  res.json({ 
    success: true, 
    data: { 
      secret,
      qrCodeUrl: `otpauth://totp/CyberSec:${req.user!.email}?secret=${secret}&issuer=CyberSec`
    }
  });
});

// ─── Update Session Activity ─────────────────────────────────────────────────
settingsRouter.post('/security/session', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const sessionId = req.headers.authorization?.split(' ')[1]?.slice(0, 32) || crypto.randomBytes(16).toString('hex');
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
  
  // Add or update session
  await User.findByIdAndUpdate(
    req.user!.userId,
    {
      $pull: { activeSessions: { sessionId } }
    }
  );
  
  await User.findByIdAndUpdate(
    req.user!.userId,
    {
      $push: {
        activeSessions: {
          sessionId,
          userAgent,
          ipAddress,
          createdAt: new Date(),
          lastActivity: new Date(),
          isCurrent: true
        }
      }
    }
  );
  
  res.json({ success: true, message: 'Session updated' });
});

// ─── Test Email Configuration ────────────────────────────────────────────────
settingsRouter.post('/email/test', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  // Get notification email from settings or user email
  const settings = await Settings.findOne({ companyId: req.user!.companyId });
  const testEmail = req.body.email || settings?.notifications?.notificationEmail || req.user!.email;
  
  if (!testEmail) {
    throw new AppError('No email address found for testing', 400, true);
  }
  
  const sent = await sendTestEmail(testEmail);
  
  if (sent) {
    res.json({ 
      success: true, 
      data: { 
        message: `Test email sent successfully to ${testEmail}` 
      }
    });
  } else {
    throw new AppError('Failed to send test email. Check SMTP configuration.', 500, true);
  }
});

// ─── Verify SMTP Connection ──────────────────────────────────────────────────
settingsRouter.get('/email/verify', async (_req: Request, res: Response) => {
  const connected = await verifyEmailConnection();
  
  res.json({ 
    success: true, 
    data: { 
      connected,
      message: connected ? 'SMTP connection successful' : 'SMTP connection failed'
    }
  });
});
