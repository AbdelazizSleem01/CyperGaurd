import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

import { User } from '../../../database/models/User';
import { Company } from '../../../database/models/Company';
import { connectToDatabase } from '../../../database/connection';
import { AppError } from '../middleware/errorHandler';
import type { AuthPayload } from '../../../shared/types';
import { logger, normalizeDomain } from '../../../shared/utils';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post(
  '/register',
  [
    body('companyName').trim().notEmpty().withMessage('يرجى إدخال اسم الشركة (Company name is required)'),
    body('domain').trim().notEmpty().isURL({ require_tld: true }).withMessage('يرجى إدخال رابط صالح لنطاق الشركة (Valid company domain is required)'),
    body('emailDomains').isArray({ min: 1 }).withMessage('يجب إضافة نطاق بريد إلكتروني واحد على الأقل (At least one email domain is required)'),
    body('adminEmail').isEmail().normalizeEmail().withMessage('يرجى إدخال بريد إلكتروني صالح للمسؤول (Valid admin email is required)'),
    body('adminName').trim().notEmpty().withMessage('يرجى إدخال اسم المسؤول (Admin name is required)'),
    body('password').isLength({ min: 8 }).withMessage('يجب أن لا تقل كلمة المرور عن 8 أحرف (Password must be at least 8 characters)'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { companyName, domain, emailDomains, adminEmail, adminName, password } = req.body;

    await connectToDatabase();

    // make sure we store only hostname (no http/https or trailing slash)
    const normalizedDomain = normalizeDomain(domain);

    const existingCompany = await Company.findOne({ domain: normalizedDomain });
    if (existingCompany) {
      throw new AppError('نطاق الشركة هذا مسجل بالفعل، يرجى استخدام نطاق آخر أو تسجيل الدخول (This company domain is already registered)', 409, true);
    }

    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      throw new AppError('هذا البريد الإلكتروني مستخدم بالفعل، يرجى تسجيل الدخول بدلاً من ذلك (This email is already in use)', 409, true);
    }

    const company = await Company.create({
      name: companyName,
      domain: normalizedDomain,
      emailDomains: emailDomains.map((d: string) => d.toLowerCase()),
    });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: adminEmail,
      name: adminName,
      passwordHash,
      role: 'admin',
      companyId: company._id,
    });

    const payload: AuthPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      companyId: company._id.toString(),
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      data: { token, user: { id: user._id, email: user.email, name: user.name, role: user.role, companyId: user.companyId } },
    });
  }
);

// POST /api/auth/login
authRouter.post(
  '/login',
  [
    body('email').isEmail().withMessage('يرجى إدخال بريد إلكتروني صحيح (Please enter a valid email address)').normalizeEmail(),
    body('password').notEmpty().withMessage('كلمة المرور مطلوبة (Password is required)'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { email, password } = req.body;
    await connectToDatabase();

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new AppError('هذا البريد الإلكتروني غير مسجل لدينا (This email address is not registered)', 401, true);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('كلمة المرور أو البريد الإلكتروني غير صحيح، يرجى المحاولة مرة أخرى (Incorrect password or email, please try again)', 401, true);
    }

    const payload: AuthPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      companyId: user.companyId.toString(),
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.json({
      success: true,
      data: { token, user: { id: user._id, email: user.email, name: user.name, role: user.role, companyId: user.companyId } },
    });
  }
);

// GET /api/auth/me
authRouter.get('/me', async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    await connectToDatabase();
    const user = await User.findById(payload.userId).populate('companyId');
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.json({ success: true, data: user });
  } catch {
    res.status(403).json({ success: false, error: 'Invalid token' });
  }
});

// Helper function to create email transporter
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// POST /api/auth/forgot-password
authRouter.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email required')],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { email } = req.body;
    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpiry,
    });

    // Send email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/en/auth/reset-password?token=${resetToken}`;


    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: (process.env.SMTP_USER || '').trim(),
            pass: (process.env.SMTP_PASS || '').trim(),
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'CyberGuard <noreply@cyberguard.com>',
          to: email,
          subject: 'CyberGuard - Password Reset',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🛡️ CyberGuard</h1>
              </div>
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
                <p style="color: #666; line-height: 1.6;">
                  Hello ${user.name || 'User'},<br><br>
                  We received a request to reset your password. Click the button below to set a new password:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" 
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                    Reset Password
                  </a>
                </div>
                <p style="color: #999; font-size: 12px;">
                  Or copy this link: ${resetUrl}<br><br>
                  This link will expire in 1 hour. If you did not request a password reset, please ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">
                  CyberGuard Security Platform - Protecting your organization from cyber threats.
                </p>
              </div>
            </div>
          `,
        });
        logger.info('Password reset email sent', { email });
        return res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
      } catch (emailErr) {
        logger.error('Failed to send password reset email', { email, error: String(emailErr) });
        throw new AppError(`Failed to send email: ${String(emailErr)}`, 500, true);
      }
    } else {
      logger.warn('SMTP credentials missing, password reset email skipped', { email });
      throw new AppError('Email service is not configured', 500, true);
    }
  }
);

// POST /api/auth/reset-password
authRouter.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { token, password } = req.body;
    await connectToDatabase();

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400, true);
    }

    // Update password
    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password has been reset successfully' });
  }
);
