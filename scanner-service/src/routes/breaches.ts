// ─── breaches.ts ─────────────────────────────────────────────────────────────
import { Router, Request, Response } from 'express';
import { BreachRecord } from '../../../database/models/BreachRecord';
import { connectToDatabase } from '../../../database/connection';

export const breachesRouter = Router();

breachesRouter.get('/', async (req: Request, res: Response) => {
  await connectToDatabase();
  const { companyId } = req.user!;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const [breaches, total] = await Promise.all([
    BreachRecord.find({ companyId })
      .sort({ detectedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    BreachRecord.countDocuments({ companyId }),
  ]);

  res.json({
    success: true,
    data: { breaches, total, page, pages: Math.ceil(total / limit) },
  });
});

breachesRouter.get('/stats', async (req: Request, res: Response) => {
  await connectToDatabase();
  const { companyId } = req.user!;

  const stats = await BreachRecord.aggregate([
    { $match: { companyId: companyId } },
    {
      $group: {
        _id: '$severity',
        count: { $sum: 1 },
      },
    },
  ]);

  res.json({ success: true, data: stats });
});
