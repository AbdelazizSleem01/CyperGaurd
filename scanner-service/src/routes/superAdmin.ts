import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Company } from '../../../database/models/Company';
import { User } from '../../../database/models/User';
import { ScanResult } from '../../../database/models/ScanResult';
import { BreachRecord } from '../../../database/models/BreachRecord';
import { RiskAssessment } from '../../../database/models/RiskAssessment';
import { Report } from '../../../database/models/Report';
import { connectToDatabase } from '../../../database/connection';
import { requireRole, requireSuperAdmin } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const superAdminRouter = Router();

// Middleware to require super-admin role
superAdminRouter.use(requireSuperAdmin);

// ─── Dashboard Overview ───────────────────────────────────────────────────────
superAdminRouter.get('/overview', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const [
    totalCompanies,
    totalUsers,
    totalScans,
    totalBreaches,
    recentScans,
    companies
  ] = await Promise.all([
    Company.countDocuments(),
    User.countDocuments(),
    ScanResult.countDocuments(),
    BreachRecord.countDocuments(),
    ScanResult.find().sort({ createdAt: -1 }).limit(10).lean(),
    Company.find().lean()
  ]);

  // Calculate aggregate stats
  const activeScans = await ScanResult.countDocuments({ status: 'running' });
  const completedScans = await ScanResult.countDocuments({ status: 'completed' });
  const failedScans = await ScanResult.countDocuments({ status: 'failed' });

  // Get company-wise stats
  const companyStats = await Promise.all(
    companies.map(async (company) => {
      const userCount = await User.countDocuments({ companyId: company._id });
      const scanCount = await ScanResult.countDocuments({ companyId: company._id });
      const breachCount = await BreachRecord.countDocuments({ companyId: company._id });
      const latestRisk = await RiskAssessment.findOne({ companyId: company._id })
        .sort({ createdAt: -1 })
        .lean();

      return {
        _id: company._id,
        name: company.name,
        domain: company.domain,
        emailDomains: company.emailDomains,
        createdAt: company.createdAt,
        userCount,
        scanCount,
        breachCount,
        riskScore: latestRisk?.score || 0,
        riskCategory: latestRisk?.category || 'N/A',
        status: 'active' // Can be extended with actual status logic
      };
    })
  );

  // Calculate risk distribution
  const riskDistribution = await RiskAssessment.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  // Daily scan counts for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const dailyScans = await ScanResult.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    { 
      $group: { 
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    data: {
      totalCompanies,
      totalUsers,
      totalScans,
      totalBreaches,
      activeScans,
      completedScans,
      failedScans,
      recentScans,
      companyStats,
      riskDistribution,
      dailyScans
    }
  });
});

// ─── Tenant/Company Management ────────────────────────────────────────────────
superAdminRouter.get('/companies', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const { page = 1, limit = 20, search, status } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  
  let query: any = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { domain: { $regex: search, $options: 'i' } }
    ];
  }

  const companies = await Company.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await Company.countDocuments(query);

  // Get additional stats for each company
  const companiesWithStats = await Promise.all(
    companies.map(async (company) => {
      const userCount = await User.countDocuments({ companyId: company._id });
      const scanCount = await ScanResult.countDocuments({ companyId: company._id });
      const breachCount = await BreachRecord.countDocuments({ companyId: company._id });
      const latestRisk = await RiskAssessment.findOne({ companyId: company._id })
        .sort({ createdAt: -1 })
        .lean();

      return {
        ...company,
        userCount,
        scanCount,
        breachCount,
        riskScore: latestRisk?.score || 0,
        riskCategory: latestRisk?.category || 'N/A',
        status: 'active'
      };
    })
  );

  res.json({
    success: true,
    data: companiesWithStats,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// Get single company details
superAdminRouter.get('/companies/:id', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const company = await Company.findById(req.params.id).lean();
  if (!company) {
    throw new AppError('Company not found', 404, true);
  }

  const users = await User.find({ companyId: company._id })
    .select('-passwordHash -twoFactorSecret')
    .lean();
  
  const scans = await ScanResult.find({ companyId: company._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const breaches = await BreachRecord.find({ companyId: company._id })
    .sort({ detectedAt: -1 })
    .limit(20)
    .lean();

  const latestRisk = await RiskAssessment.findOne({ companyId: company._id })
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: {
      company,
      users,
      scans,
      breaches,
      latestRisk
    }
  });
});

// Update company (including domain)
superAdminRouter.put('/companies/:id', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const { id } = req.params;
  const { name, domain, emailDomains, status } = req.body;

  const updateData: any = {};
  if (name) updateData.name = name;
  if (domain) updateData.domain = domain;
  if (emailDomains) updateData.emailDomains = emailDomains;
  if (status) updateData.status = status;

  const company = await Company.findByIdAndUpdate(id, updateData, { new: true }).lean();

  if (!company) {
    throw new AppError('Company not found', 404, true);
  }

  // Log the action
  console.log(`[SuperAdmin] Company updated: ${id} by ${req.user?.email}`);

  res.json({ success: true, data: company });
});

// Suspend company
superAdminRouter.post('/companies/:id/suspend', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const { id } = req.params;
  const { reason } = req.body;

  // In a real implementation, you'd have a status field on the Company model
  // For now, we'll just log this action
  console.log(`[SuperAdmin] Company suspended: ${id} - Reason: ${reason} by ${req.user?.email}`);

  const company = await Company.findById(id).lean();
  if (!company) {
    throw new AppError('Company not found', 404, true);
  }

  res.json({ 
    success: true, 
    message: 'Company suspended successfully',
    data: { companyId: id, status: 'suspended', reason }
  });
});

// Activate company
superAdminRouter.post('/companies/:id/activate', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const { id } = req.params;

  console.log(`[SuperAdmin] Company activated: ${id} by ${req.user?.email}`);

  const company = await Company.findById(id).lean();
  if (!company) {
    throw new AppError('Company not found', 404, true);
  }

  res.json({ 
    success: true, 
    message: 'Company activated successfully',
    data: { companyId: id, status: 'active' }
  });
});

// Delete company (dangerous!)
superAdminRouter.delete('/companies/:id', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const { id } = req.params;
  const { confirm } = req.body;

  if (confirm !== 'DELETE_COMPANY_CONFIRM') {
    throw new AppError('Confirmation required. Send { confirm: "DELETE_COMPANY_CONFIRM" }', 400, true);
  }

  const company = await Company.findById(id);
  if (!company) {
    throw new AppError('Company not found', 404, true);
  }

  // Delete all associated data
  await Promise.all([
    User.deleteMany({ companyId: id }),
    ScanResult.deleteMany({ companyId: id }),
    BreachRecord.deleteMany({ companyId: id }),
    RiskAssessment.deleteMany({ companyId: id }),
    Report.deleteMany({ companyId: id }),
    Company.findByIdAndDelete(id)
  ]);

  console.log(`[SuperAdmin] Company deleted: ${id} by ${req.user?.email}`);

  res.json({ 
    success: true, 
    message: 'Company and all associated data deleted successfully' 
  });
});

// ─── User Management (Cross-Tenant) ────────────────────────────────────────────
superAdminRouter.get('/users', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const { page = 1, limit = 20, search, role, companyId } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  
  let query: any = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (role) query.role = role;
  if (companyId) query.companyId = companyId;

  const users = await User.find(query)
    .select('-passwordHash -twoFactorSecret')
    .populate('companyId', 'name domain')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// Get user details
superAdminRouter.get('/users/:id', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const user = await User.findById(req.params.id)
    .select('-passwordHash -twoFactorSecret')
    .populate('companyId', 'name domain')
    .lean();

  if (!user) {
    throw new AppError('User not found', 404, true);
  }

  // Get user's scans
  const scans = await ScanResult.find({ companyId: user.companyId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  res.json({
    success: true,
    data: { user, scans }
  });
});

// Update user
superAdminRouter.put('/users/:id', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const { id } = req.params;
  const { name, email, role } = req.body;

  const updateData: any = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (role) updateData.role = role;

  const user = await User.findByIdAndUpdate(id, updateData, { new: true })
    .select('-passwordHash -twoFactorSecret')
    .lean();

  if (!user) {
    throw new AppError('User not found', 404, true);
  }

  console.log(`[SuperAdmin] User updated: ${id} by ${req.user?.email}`);

  res.json({ success: true, data: user });
});

// Reset user password
superAdminRouter.post('/users/:id/reset-password', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const { id } = req.params;
  const tempPassword = Math.random().toString(36).slice(-12);
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const user = await User.findByIdAndUpdate(
    id,
    { passwordHash, lastPasswordChange: new Date() },
    { new: true }
  ).select('-passwordHash -twoFactorSecret').lean();

  if (!user) {
    throw new AppError('User not found', 404, true);
  }

  console.log(`[SuperAdmin] Password reset for user: ${id} by ${req.user?.email}`);

  res.json({
    success: true,
    message: 'Password reset successfully',
    data: { user, tempPassword }
  });
});

// Revoke user sessions
superAdminRouter.post('/users/:id/revoke-sessions', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    id,
    { activeSessions: [] },
    { new: true }
  ).select('-passwordHash -twoFactorSecret').lean();

  if (!user) {
    throw new AppError('User not found', 404, true);
  }

  console.log(`[SuperAdmin] Sessions revoked for user: ${id} by ${req.user?.email}`);

  res.json({
    success: true,
    message: 'All sessions revoked successfully'
  });
});

// Delete user
superAdminRouter.delete('/users/:id', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new AppError('User not found', 404, true);
  }

  console.log(`[SuperAdmin] User deleted: ${id} by ${req.user?.email}`);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// ─── System Statistics ─────────────────────────────────────────────────────────
superAdminRouter.get('/statistics', async (req: Request, res: Response) => {
  await connectToDatabase();

  const { period = '7d' } = req.query;
  
  // Calculate date range
  let startDate = new Date();
  switch (period) {
    case '24h':
      startDate.setDate(startDate.getDate() - 1);
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }

  // Aggregate statistics
  const [
    totalScans,
    completedScans,
    failedScans,
    totalBreaches,
    criticalBreaches,
    totalOpenPorts,
    totalSubdomains,
    avgRiskScore,
    scanTypesDistribution,
    topDomains,
    breachTrend,
    scanTrend
  ] = await Promise.all([
    ScanResult.countDocuments({ createdAt: { $gte: startDate } }),
    ScanResult.countDocuments({ createdAt: { $gte: startDate }, status: 'completed' }),
    ScanResult.countDocuments({ createdAt: { $gte: startDate }, status: 'failed' }),
    BreachRecord.countDocuments({ detectedAt: { $gte: startDate } }),
    BreachRecord.countDocuments({ detectedAt: { $gte: startDate }, severity: 'critical' }),
    ScanResult.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $project: { portsCount: { $size: { $ifNull: ['$ports', []] } } } },
      { $group: { _id: null, total: { $sum: '$portsCount' } } }
    ]),
    ScanResult.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $project: { subdomainsCount: { $size: { $ifNull: ['$subdomains', []] } } } },
      { $group: { _id: null, total: { $sum: '$subdomainsCount' } } }
    ]),
    RiskAssessment.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: null, avg: { $avg: '$score' } } }
    ]),
    ScanResult.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: { path: '$scanTypes', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$scanTypes', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    ScanResult.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$domain', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    BreachRecord.aggregate([
      { $match: { detectedAt: { $gte: startDate } } },
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$detectedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    ScanResult.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  res.json({
    success: true,
    data: {
      period,
      startDate,
      endDate: new Date(),
      scans: {
        total: totalScans,
        completed: completedScans,
        failed: failedScans,
        successRate: totalScans > 0 ? ((completedScans / totalScans) * 100).toFixed(1) : 0
      },
      breaches: {
        total: totalBreaches,
        critical: criticalBreaches
      },
      infrastructure: {
        openPorts: totalOpenPorts[0]?.total || 0,
        subdomains: totalSubdomains[0]?.total || 0
      },
      risk: {
        avgScore: avgRiskScore[0]?.avg?.toFixed(1) || 0
      },
      distributions: {
        scanTypes: scanTypesDistribution,
        topDomains
      },
      trends: {
        breaches: breachTrend,
        scans: scanTrend
      }
    }
  });
});

// ─── Audit Log ─────────────────────────────────────────────────────────────────
superAdminRouter.get('/audit-log', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const { page = 1, limit = 50, action, userId, companyId, startDate, endDate } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  // For now, return a placeholder
  // In a real implementation, you'd have an AuditLog model
  const auditLogs = [
    {
      _id: '1',
      action: 'company_updated',
      userId: 'user1',
      userEmail: 'admin@example.com',
      companyId: 'company1',
      companyName: 'Acme Corp',
      details: { field: 'domain', oldValue: 'old.com', newValue: 'new.com' },
      timestamp: new Date()
    },
    {
      _id: '2',
      action: 'user_password_reset',
      userId: 'user2',
      userEmail: 'admin@example.com',
      companyId: 'company1',
      companyName: 'Acme Corp',
      details: { targetUser: 'user@acme.com' },
      timestamp: new Date()
    }
  ];

  res.json({
    success: true,
    data: auditLogs,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: 2,
      pages: 1
    }
  });
});

// ─── Feature Flags ─────────────────────────────────────────────────────────────
superAdminRouter.get('/feature-flags', async (req: Request, res: Response) => {
  // Feature flags - in a real app, these would be stored in DB
  const featureFlags = [
    {
      id: 'advanced-ai-scan',
      name: 'Advanced AI Scanning',
      description: 'Enable AI-powered vulnerability detection',
      enabled: true,
      updatedAt: new Date()
    },
    {
      id: 'sms-alerts',
      name: 'SMS Alerts',
      description: 'Send SMS notifications for critical alerts',
      enabled: false,
      updatedAt: new Date()
    },
    {
      id: 'realtime-monitoring',
      name: 'Real-time Monitoring',
      description: 'Enable real-time security monitoring',
      enabled: true,
      updatedAt: new Date()
    },
    {
      id: 'dark-web-scan',
      name: 'Dark Web Scanning',
      description: 'Scan dark web for credential leaks',
      enabled: true,
      updatedAt: new Date()
    },
    {
      id: 'auto-remediation',
      name: 'Auto Remediation',
      description: 'Automatically fix common vulnerabilities',
      enabled: false,
      updatedAt: new Date()
    }
  ];

  res.json({
    success: true,
    data: featureFlags
  });
});

superAdminRouter.put('/feature-flags/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { enabled } = req.body;

  console.log(`[SuperAdmin] Feature flag ${id} set to ${enabled} by ${req.user?.email}`);

  res.json({
    success: true,
    message: 'Feature flag updated successfully',
    data: { id, enabled }
  });
});

// ─── Notifications ─────────────────────────────────────────────────────────────
superAdminRouter.get('/notifications', async (req: Request, res: Response) => {
  const notifications = [
    {
      id: '1',
      type: 'maintenance',
      title: 'Scheduled Maintenance',
      message: 'System maintenance scheduled for 2024-01-15 at 02:00 UTC',
      active: true,
      scheduledFor: new Date('2024-01-15T02:00:00Z'),
      createdAt: new Date()
    },
    {
      id: '2',
      type: 'announcement',
      title: 'New Feature Release',
      message: 'We have released a new vulnerability scanner!',
      active: true,
      createdAt: new Date()
    }
  ];

  res.json({
    success: true,
    data: notifications
  });
});

superAdminRouter.post('/notifications', async (req: Request, res: Response) => {
  const { type, title, message, scheduledFor } = req.body;

  console.log(`[SuperAdmin] Notification created: ${title} by ${req.user?.email}`);

  res.status(201).json({
    success: true,
    message: 'Notification created successfully',
    data: {
      id: Date.now().toString(),
      type,
      title,
      message,
      scheduledFor,
      active: true,
      createdAt: new Date()
    }
  });
});

// ─── System Health ─────────────────────────────────────────────────────────────
superAdminRouter.get('/health', async (req: Request, res: Response) => {
  await connectToDatabase();

  // Check database connection
  let dbStatus = 'healthy';
  try {
    await Company.findOne().lean();
  } catch (error) {
    dbStatus = 'unhealthy';
  }

  // Get queue stats (placeholder - would need actual queue implementation)
  const queueStats = {
    pending: 0,
    active: 0,
    completed: 0,
    failed: 0
  };

  // Memory usage
  const memoryUsage = process.memoryUsage();

  // Uptime
  const uptime = process.uptime();

  res.json({
    success: true,
    data: {
      database: {
        status: dbStatus,
        type: 'MongoDB'
      },
      queue: queueStats,
      system: {
        uptime: Math.floor(uptime),
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024)
        },
        nodeVersion: process.version,
        platform: process.platform
      },
      timestamp: new Date()
    }
  });
});

// ─── Support Tools ─────────────────────────────────────────────────────────────
// Impersonate user (get token for another user)
superAdminRouter.post('/impersonate/:userId', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const { userId } = req.params;

  const user = await User.findById(userId)
    .select('-passwordHash -twoFactorSecret')
    .populate('companyId', 'name domain')
    .lean();

  if (!user) {
    throw new AppError('User not found', 404, true);
  }

  console.log(`[SuperAdmin] Impersonation started: ${userId} by ${req.user?.email}`);

  // In a real implementation, you'd generate a temporary token
  res.json({
    success: true,
    message: 'Impersonation token generated',
    data: {
      user,
      impersonatedBy: req.user?.email,
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    }
  });
});

// Run ad-hoc scan for a company
superAdminRouter.post('/run-scan/:companyId', async (req: Request, res: Response) => {
  await connectToDatabase();
  
  const { companyId } = req.params;
  const { scanTypes } = req.body;

  const company = await Company.findById(companyId).lean();
  if (!company) {
    throw new AppError('Company not found', 404, true);
  }

  console.log(`[SuperAdmin] Ad-hoc scan triggered for company: ${companyId} by ${req.user?.email}`);

  res.json({
    success: true,
    message: 'Scan triggered successfully',
    data: {
      companyId,
      domain: company.domain,
      scanTypes: scanTypes || ['all'],
      triggeredBy: req.user?.email,
      triggeredAt: new Date()
    }
  });
});

// ─── Export Data ───────────────────────────────────────────────────────────────
superAdminRouter.get('/export/companies', async (req: Request, res: Response) => {
  await connectToDatabase();

  const companies = await Company.find().lean();

  const csvData = companies.map(c => ({
    id: c._id,
    name: c.name,
    domain: c.domain,
    emailDomains: c.emailDomains?.join(';'),
    createdAt: c.createdAt
  }));

  res.json({
    success: true,
    data: csvData
  });
});

superAdminRouter.get('/export/users', async (req: Request, res: Response) => {
  await connectToDatabase();

  const users = await User.find()
    .select('-passwordHash -twoFactorSecret')
    .populate('companyId', 'name domain')
    .lean();

  const csvData = users.map(u => ({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    company: (u.companyId as any)?.name || 'N/A',
    twoFactorEnabled: u.twoFactorEnabled,
    createdAt: u.createdAt
  }));

  res.json({
    success: true,
    data: csvData
  });
});