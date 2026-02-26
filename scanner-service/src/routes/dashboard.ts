import { Router, Request, Response } from 'express';
import { ScanResult } from '../../../database/models/ScanResult';
import { BreachRecord } from '../../../database/models/BreachRecord';
import { RiskAssessment } from '../../../database/models/RiskAssessment';
import { connectToDatabase } from '../../../database/connection';
import { authenticateToken } from '../middleware/auth';

export const dashboardRouter = Router();

dashboardRouter.get('/stats', authenticateToken, async (req: Request, res: Response) => {
    await connectToDatabase();
    const companyId = req.user!.companyId;

    const [
        totalScans,
        exposedCredentials,
        latestRisk,
        recentBreaches,
        riskHistory,
        latestScan
    ] = await Promise.all([
        ScanResult.countDocuments({ companyId }),
        BreachRecord.countDocuments({ companyId }),
        RiskAssessment.findOne({ companyId }).sort({ createdAt: -1 }).lean(),
        BreachRecord.find({ companyId }).sort({ detectedAt: -1 }).limit(5).lean(),
        RiskAssessment.find({ companyId }).sort({ createdAt: -1 }).limit(10).select('score createdAt').lean(),
        ScanResult.findOne({ companyId, status: 'completed' }).sort({ completedAt: -1 }).lean()
    ]);

    // Aggregate stats from latest scan for ports/certs
    let openPorts = 0;
    let expiredSslCerts = 0;

    if (latestScan) {
        openPorts = latestScan.ports?.length || 0;
        if (latestScan.ssl && !latestScan.ssl.isValid) {
            expiredSslCerts = 1;
        }
    }

    res.json({
        success: true,
        data: {
            totalScans,
            exposedCredentials,
            openPorts,
            expiredSslCerts,
            riskScore: latestRisk?.score ?? 0,
            riskCategory: latestRisk?.category ?? 'Low',
            lastScanAt: latestScan?.completedAt,
            recentBreaches,
            riskTrend: riskHistory.map(h => ({
                date: h.createdAt.toISOString(),
                score: h.score
            })).reverse()
        }
    });
});
