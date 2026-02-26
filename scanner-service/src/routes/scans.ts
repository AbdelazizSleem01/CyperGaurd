import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ScanResult } from '../../../database/models/ScanResult';
import { Company } from '../../../database/models/Company';
import { connectToDatabase } from '../../../database/connection';
import { AppError } from '../middleware/errorHandler';
import { requireRole } from '../middleware/auth';
import { scanQueue } from '../queues/scanQueue';
import { logger } from '../../../shared/utils';
import { notifyScanComplete } from '../services/notificationService';

import { executeFullScan } from '../services/scannerEngine';

export const scansRouter = Router();

// POST /api/scans/trigger — Trigger a new scan
scansRouter.post(
  '/trigger',
  requireRole('admin'),
  [
    body('types').isArray({ min: 1 }).withMessage('At least one scan type required'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    await connectToDatabase();
    const { types } = req.body;
    const companyId = req.user!.companyId;

    const company = await Company.findById(companyId);
    if (!company) throw new AppError('Company not found', 404, true);

    const scanRecord = await ScanResult.create({
      companyId,
      domain: company.domain,
      status: 'pending',
      ports: [],
      ssl: null,
      subdomains: [],
      outdatedSoftware: [],
      discoveredPaths: [],
      startedAt: new Date(),
    });

    // Run scan in background
    executeFullScan(
      scanRecord._id.toString(),
      companyId.toString(),
      company.domain,
      types
    ).catch(err => logger.error('Background scan failed', { scanId: scanRecord._id, error: String(err) }));

    logger.info('Scan triggered', { companyId, domain: company.domain, scanId: scanRecord._id });

    res.status(202).json({
      success: true,
      data: { scanId: scanRecord._id, status: 'pending', message: 'Scan queued successfully' },
    });
  }
);

// GET /api/scans — List scans for company
scansRouter.get('/', async (req: Request, res: Response) => {
  await connectToDatabase();
  const companyId = req.user!.companyId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const [scans, total] = await Promise.all([
    ScanResult.find({ companyId })
      .sort({ startedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ScanResult.countDocuments({ companyId }),
  ]);

  res.json({
    success: true,
    data: { scans, total, page, pages: Math.ceil(total / limit) },
  });
});

// GET /api/scans/:id — Get scan details
scansRouter.get('/:id', async (req: Request, res: Response) => {
  // Skip if not a valid ObjectId (like "new")
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new AppError('Invalid scan ID', 400, true);
  }

  await connectToDatabase();
  const scan = await ScanResult.findOne({
    _id: req.params.id,
    companyId: req.user!.companyId,
  }).lean();

  if (!scan) throw new AppError('Scan not found', 404, true);

  res.json({ success: true, data: scan });
});

// DELETE /api/scans/:id — Delete a scan
scansRouter.delete('/:id', requireRole('admin'), async (req: Request, res: Response) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new AppError('Invalid scan ID', 400, true);
  }

  await connectToDatabase();
  const scan = await ScanResult.findOneAndDelete({
    _id: req.params.id,
    companyId: req.user!.companyId,
  });

  if (!scan) throw new AppError('Scan not found', 404, true);

  logger.info('Scan deleted', { scanId: req.params.id, userId: req.user!.userId });

  res.json({ success: true, message: 'Scan deleted successfully' });
});
