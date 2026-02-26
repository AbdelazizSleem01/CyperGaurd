import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../../database/connection';
import { ScanResult } from '../../../../../../database/models/ScanResult';
import { BreachRecord } from '../../../../../../database/models/BreachRecord';
import { RiskAssessment } from '../../../../../../database/models/RiskAssessment';
import jwt from 'jsonwebtoken';
import type { AuthPayload, DashboardStats } from '../../../../../../shared/types';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    const { companyId } = payload;

    await connectToDatabase();

    const [
      scans,
      breachCount,
      recentBreaches,
      latestRisk,
      riskHistory,
    ] = await Promise.all([
      ScanResult.find({ companyId }).sort({ startedAt: -1 }).limit(1).lean(),
      BreachRecord.countDocuments({ companyId }),
      BreachRecord.find({ companyId }).sort({ detectedAt: -1 }).limit(5).lean(),
      RiskAssessment.findOne({ companyId }).sort({ createdAt: -1 }).lean(),
      RiskAssessment.find({ companyId })
        .sort({ createdAt: -1 })
        .limit(30)
        .select('score category createdAt')
        .lean(),
    ]);

    const totalScans = await ScanResult.countDocuments({ companyId });
    const latestScan = scans[0];

    const stats: DashboardStats = {
      totalScans,
      exposedCredentials: breachCount,
      openPorts: latestScan?.ports?.length ?? 0,
      expiredSslCerts: latestScan?.ssl?.isValid === false ? 1 : 0,
      riskScore: latestRisk?.score ?? 0,
      riskCategory: latestRisk?.category ?? 'Low',
      lastScanAt: latestScan?.startedAt,
      recentBreaches: recentBreaches as any,
      riskTrend: riskHistory.map((r) => ({
        date: new Date(r.createdAt).toLocaleDateString(),
        score: r.score,
      })),
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
