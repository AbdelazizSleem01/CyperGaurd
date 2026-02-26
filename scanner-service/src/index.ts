'use strict';
import 'express-async-errors';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../../.env.local') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { connectToDatabase } from '../../database/connection';
import { logger } from '../../shared/utils';
import { authRouter } from './routes/auth';
import { companiesRouter } from './routes/companies';
import { scansRouter } from './routes/scans';
import { breachesRouter } from './routes/breaches';
import { reportsRouter } from './routes/reports';
import { riskRouter } from './routes/risk';
import { adminRouter } from './routes/admin';
import { dashboardRouter } from './routes/dashboard';
import { settingsRouter } from './routes/settings';
import { errorHandler } from './middleware/errorHandler';
import { authenticateToken } from './middleware/auth';
import { initializeScheduler } from './services/schedulerService';

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many auth requests, try again later.' },
});

app.use(globalLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/companies', authenticateToken, companiesRouter);
app.use('/api/scans', authenticateToken, scansRouter);
app.use('/api/breaches', authenticateToken, breachesRouter);
app.use('/api/reports', authenticateToken, reportsRouter);
app.use('/api/risk', authenticateToken, riskRouter);
app.use('/api/admin', authenticateToken, adminRouter);
app.use('/api/dashboard', authenticateToken, dashboardRouter);
app.use('/api/settings', authenticateToken, settingsRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

async function bootstrap() {
  await connectToDatabase();
  initializeScheduler();
  app.listen(PORT, () => {
    logger.info(`Scanner service running on port ${PORT}`);
    logger.info('Auto-scan scheduler is active');
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start scanner service', { error: String(err) });
  process.exit(1);
});