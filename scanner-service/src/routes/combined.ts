import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Company } from '../../../database/models/Company';
import { RiskAssessment } from '../../../database/models/RiskAssessment';
import { Report } from '../../../database/models/Report';
import { User } from '../../../database/models/User';
import { ScanResult } from '../../../database/models/ScanResult';
import { BreachRecord } from '../../../database/models/BreachRecord';
import { connectToDatabase } from '../../../database/connection';
import { requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle } from 'docx';

// ─── Companies ────────────────────────────────────────────────────────────────
export const companiesRouter = Router();

companiesRouter.get('/me', async (req: Request, res: Response) => {
  await connectToDatabase();
  const company = await Company.findById(req.user!.companyId).lean();
  if (!company) throw new AppError('Company not found', 404, true);
  res.json({ success: true, data: company });
});

companiesRouter.put('/me', requireRole('admin'), async (req: Request, res: Response) => {
  await connectToDatabase();
  const { name, emailDomains } = req.body;
  const company = await Company.findByIdAndUpdate(
    req.user!.companyId,
    { name, emailDomains },
    { new: true }
  ).lean();
  res.json({ success: true, data: company });
});

// ─── Risk ─────────────────────────────────────────────────────────────────────
export const riskRouter = Router();

riskRouter.get('/latest', async (req: Request, res: Response) => {
  await connectToDatabase();
  const assessment = await RiskAssessment.findOne({ companyId: req.user!.companyId })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: assessment });
});

riskRouter.get('/history', async (req: Request, res: Response) => {
  await connectToDatabase();
  const assessments = await RiskAssessment.find({ companyId: req.user!.companyId })
    .sort({ createdAt: -1 })
    .limit(30)
    .select('score category createdAt')
    .lean();
  res.json({ success: true, data: assessments });
});

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportsRouter = Router();

reportsRouter.get('/', async (req: Request, res: Response) => {
  await connectToDatabase();
  const reports = await Report.find({ companyId: req.user!.companyId })
    .sort({ generatedAt: -1 })
    .lean();
  res.json({ success: true, data: reports });
});

reportsRouter.post('/generate', requireRole('admin'), async (req: Request, res: Response) => {
  await connectToDatabase();
  const { language = 'en', format = 'pdf' } = req.body;
  const companyId = req.user!.companyId;

  // Get latest scan and risk data
  const latestScan = await ScanResult.findOne({ companyId, status: 'completed' })
    .sort({ completedAt: -1 })
    .lean();

  const breaches = await BreachRecord.find({ companyId }).lean();

  const riskAssessment = await RiskAssessment.findOne({ companyId })
    .sort({ createdAt: -1 })
    .lean();

  // Calculate stats
  const stats = {
    critical: breaches.filter((b: any) => b.severity === 'critical').length,
    high: breaches.filter((b: any) => b.severity === 'high').length,
    medium: breaches.filter((b: any) => b.severity === 'medium').length,
    low: breaches.filter((b: any) => b.severity === 'low').length,
    openPorts: latestScan?.ports?.length || 0,
    subdomains: latestScan?.subdomains?.length || 0,
    sensitivePaths: latestScan?.discoveredPaths?.length || 0,
  };

  // Create report
  const report = await Report.create({
    companyId,
    title: `Security Report - ${new Date().toLocaleDateString()}`,
    format,
    language,
    generatedAt: new Date(),
    riskScore: riskAssessment?.score || 0,
    riskCategory: riskAssessment?.category || 'Low',
    stats,
    sensitivePathsFound: latestScan?.discoveredPaths || [],
    summary: `This report covers ${stats.openPorts} open ports, ${stats.subdomains} subdomains, ${stats.sensitivePaths} sensitive paths found, and ${breaches.length} potential breach exposures.`,
    recommendations: [
      'Review and close unnecessary open ports',
      'Update SSL certificates before expiration',
      'Implement multi-factor authentication',
      'Regular security audits recommended',
      'Restrict access to discovered sensitive files or paths',
    ],
  });

  res.status(201).json({
    success: true,
    data: report,
    message: `Report generated successfully`,
  });
});

// ==================== IMPROVED FILE GENERATION ====================

reportsRouter.get('/:id/download', async (req: Request, res: Response) => {
  await connectToDatabase();
  const report = await Report.findOne({ _id: req.params.id, companyId: req.user!.companyId });
  if (!report) throw new AppError('Report not found', 404, true);

  const r = report.toObject() as any;
  const format = r.format || 'pdf';
  const filename = r.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

  // ─── IMPROVED EXCEL GENERATION ────────────────────────────────────
  if (format === 'excel') {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'CyberSec SaaS';
    workbook.lastModifiedBy = 'CyberSec SaaS';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Main Report Sheet
    const sheet = workbook.addWorksheet('Security Report', {
      properties: { tabColor: { argb: 'FF4F46E5' } },
      views: [{ showGridLines: false }]
    });

    // Company Logo/Header Section
    sheet.mergeCells('A1:F1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = '🔒 CYBERSEC SECURITY REPORT';
    titleCell.font = {
      size: 24,
      bold: true,
      color: { argb: 'FFFFFFFF' },
      name: 'Arial'
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 40;

    // Report Title
    sheet.mergeCells('A2:F2');
    const reportTitleCell = sheet.getCell('A2');
    reportTitleCell.value = r.title;
    reportTitleCell.font = { size: 16, bold: true, color: { argb: 'FF1F2937' } };
    reportTitleCell.alignment = { horizontal: 'center' };
    sheet.getRow(2).height = 30;

    // Metadata Section
    sheet.getRow(4).height = 20;
    sheet.getCell('A4').value = 'Generated:';
    sheet.getCell('A4').font = { bold: true, color: { argb: 'FF4B5563' } };
    sheet.getCell('B4').value = new Date(r.generatedAt).toLocaleString();
    sheet.getCell('D4').value = 'Language:';
    sheet.getCell('D4').font = { bold: true, color: { argb: 'FF4B5563' } };
    sheet.getCell('E4').value = r.language === 'ar' ? '🇸🇦 العربية' : '🇬🇧 English';
    sheet.getCell('E4').font = { color: { argb: 'FF4F46E5' } };

    // Risk Score Section
    sheet.mergeCells('A6:F6');
    const riskHeaderCell = sheet.getCell('A6');
    riskHeaderCell.value = 'RISK ASSESSMENT';
    riskHeaderCell.font = { size: 14, bold: true, color: { argb: 'FF1F2937' } };

    sheet.mergeCells('A7:C7');
    const riskScoreCell = sheet.getCell('A7');
    riskScoreCell.value = `${r.riskScore}%`;
    riskScoreCell.font = { size: 32, bold: true, color: { argb: 'FF4F46E5' } };
    riskScoreCell.alignment = { horizontal: 'right' };

    sheet.mergeCells('D7:F7');
    const riskCategoryCell = sheet.getCell('D7');
    riskCategoryCell.value = r.riskCategory;
    riskCategoryCell.font = { size: 18, bold: true };
    riskCategoryCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: r.riskCategory === 'Critical' ? 'FFDC2626' :
          r.riskCategory === 'High' ? 'FFF59E0B' :
            r.riskCategory === 'Medium' ? 'FF3B82F6' : 'FF10B981'
      }
    };
    riskCategoryCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Statistics Section
    sheet.mergeCells('A9:F9');
    const statsHeaderCell = sheet.getCell('A9');
    statsHeaderCell.value = 'SECURITY STATISTICS';
    statsHeaderCell.font = { size: 14, bold: true, color: { argb: 'FF1F2937' } };

    // Stats Cards
    const stats = [
      { label: 'CRITICAL', value: r.stats?.critical || 0, color: 'FFDC2626' },
      { label: 'HIGH', value: r.stats?.high || 0, color: 'FFF59E0B' },
      { label: 'MEDIUM', value: r.stats?.medium || 0, color: 'FF3B82F6' },
      { label: 'LOW', value: r.stats?.low || 0, color: 'FF6B7280' },
      { label: 'OPEN PORTS', value: r.stats?.openPorts || 0, color: 'FF8B5CF6' },
      { label: 'SUBDOMAINS', value: r.stats?.subdomains || 0, color: 'FF10B981' }
    ];

    stats.forEach((stat, index) => {
      const row = 11;
      const col = index * 2 + 1;

      // Value Cell
      const valueCell = sheet.getCell(row, col);
      valueCell.value = stat.value;
      valueCell.font = { size: 20, bold: true, color: { argb: stat.color } };
      valueCell.alignment = { horizontal: 'center' };

      // Label Cell
      const labelCell = sheet.getCell(row + 1, col);
      labelCell.value = stat.label;
      labelCell.font = { size: 10, bold: true, color: { argb: 'FF6B7280' } };
      labelCell.alignment = { horizontal: 'center' };

      sheet.mergeCells(row, col, row, col + 1);
      sheet.mergeCells(row + 1, col, row + 1, col + 1);
    });

    // Summary Section
    sheet.mergeCells('A14:F14');
    const summaryHeaderCell = sheet.getCell('A14');
    summaryHeaderCell.value = 'EXECUTIVE SUMMARY';
    summaryHeaderCell.font = { size: 14, bold: true, color: { argb: 'FF1F2937' } };

    sheet.mergeCells('A15:F16');
    const summaryCell = sheet.getCell('A15');
    summaryCell.value = r.summary || 'No summary available';
    summaryCell.font = { size: 11 };
    summaryCell.alignment = { wrapText: true, vertical: 'top' };
    summaryCell.border = {
      top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
    };

    // Recommendations Section
    if (r.recommendations?.length) {
      sheet.mergeCells('A18:F18');
      const recHeaderCell = sheet.getCell('A18');
      recHeaderCell.value = 'SECURITY RECOMMENDATIONS';
      recHeaderCell.font = { size: 14, bold: true, color: { argb: 'FF1F2937' } };

      r.recommendations.forEach((rec: string, i: number) => {
        const row = 20 + i;
        sheet.mergeCells(`A${row}:F${row}`);
        const recCell = sheet.getCell(`A${row}`);
        recCell.value = `${i + 1}. ${rec}`;
        recCell.font = { size: 11 };
        if (i % 2 === 0) {
          recCell.fill = {
            type: 'pattern' as const,
            pattern: 'solid' as const,
            fgColor: { argb: 'FFF9FAFB' }
          };
        }
      });
    }

    // Footer
    const lastRow = sheet.lastRow?.number || 30;
    sheet.mergeCells(`A${lastRow + 2}:F${lastRow + 2}`);
    const footerCell = sheet.getCell(`A${lastRow + 2}`);
    footerCell.value = '🔒 Generated by CyberSec SaaS Security Platform • Confidential';
    footerCell.font = { size: 9, color: { argb: 'FF9CA3AF' } };
    footerCell.alignment = { horizontal: 'center' };

    // Column Widths
    sheet.columns = [
      { width: 15 }, { width: 15 }, { width: 15 },
      { width: 15 }, { width: 15 }, { width: 15 }
    ];

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
    return;
  }

  // ─── IMPROVED WORD GENERATION ─────────────────────────────────────
  if (format === 'word') {
    const getRiskColor = (category: string) => {
      switch (category?.toLowerCase()) {
        case 'critical': return 'DC2626';
        case 'high': return 'F59E0B';
        case 'medium': return '3B82F6';
        default: return '10B981';
      }
    };

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 }
          }
        },
        children: [
          // Header with gradient effect
          new Paragraph({
            children: [
              new TextRun({
                text: '🔒 CYBERSEC SECURITY REPORT',
                size: 48,
                bold: true,
                color: '4F46E5'
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Report Title
          new Paragraph({
            text: r.title,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          // Metadata Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'Generated:', alignment: AlignmentType.RIGHT })],
                    width: { size: 20, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: new Date(r.generatedAt).toLocaleString(), alignment: AlignmentType.LEFT })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: 'Language:', alignment: AlignmentType.RIGHT })],
                    width: { size: 20, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: r.language === 'ar' ? '🇸🇦 العربية' : '🇬🇧 English', alignment: AlignmentType.LEFT })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // Risk Score Card
          new Paragraph({
            text: 'Risk Assessment',
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, color: 'E5E7EB', size: 1 },
              bottom: { style: BorderStyle.SINGLE, color: 'E5E7EB', size: 1 },
              left: { style: BorderStyle.SINGLE, color: 'E5E7EB', size: 1 },
              right: { style: BorderStyle.SINGLE, color: 'E5E7EB', size: 1 },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: `${r.riskScore}%`,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 200, after: 100 }
                      }),
                    ],
                    shading: { fill: 'F3F4F6' },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: r.riskCategory,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 200, after: 100 }
                      }),
                    ],
                    shading: { fill: getRiskColor(r.riskCategory) },
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // Statistics Section
          new Paragraph({
            text: 'Security Statistics',
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'Critical', alignment: AlignmentType.CENTER })],
                    shading: { fill: 'FEE2E2' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: 'High', alignment: AlignmentType.CENTER })],
                    shading: { fill: 'FEF3C7' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: 'Medium', alignment: AlignmentType.CENTER })],
                    shading: { fill: 'DBEAFE' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: 'Low', alignment: AlignmentType.CENTER })],
                    shading: { fill: 'F3F4F6' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: 'Open Ports', alignment: AlignmentType.CENTER })],
                    shading: { fill: 'EDE9FE' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: 'Subdomains', alignment: AlignmentType.CENTER })],
                    shading: { fill: 'D1FAE5' },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      text: String(r.stats?.critical || 0),
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 200, after: 200 }
                    })],
                  }),
                  new TableCell({ children: [new Paragraph({ text: String(r.stats?.high || 0), alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ text: String(r.stats?.medium || 0), alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ text: String(r.stats?.low || 0), alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ text: String(r.stats?.openPorts || 0), alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ text: String(r.stats?.subdomains || 0), alignment: AlignmentType.CENTER })] }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // Summary Section
          new Paragraph({
            text: 'Executive Summary',
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: r.summary || 'No summary available',
            spacing: { after: 200 },
          }),

          // Recommendations Section
          ...(r.recommendations?.length ? [
            new Paragraph({
              text: 'Security Recommendations',
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 200 },
            }),
            ...r.recommendations.map((rec: string, i: number) =>
              new Paragraph({
                text: `${i + 1}. ${rec}`,
                bullet: { level: 0 },
                spacing: { after: 100 },
              })
            ),
          ] : []),

          // Footer
          new Paragraph({
            text: '─'.repeat(50),
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 100 },
          }),

          new Paragraph({
            text: '🔒 Generated by CyberSec SaaS Security Platform • Confidential',
            alignment: AlignmentType.CENTER,
          }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.docx"`);
    res.send(buffer);
    return;
  }

  // ─── IMPROVED PDF GENERATION ──────────────────────────────────────
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4',
    info: {
      Title: r.title,
      Author: 'CyberSec SaaS',
      Subject: 'Security Report',
      Keywords: 'security, report, cybersecurity',
    }
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
  doc.pipe(res);

  const isAr = r.language === 'ar';

  // Helper for drawing boxes and headers
  const drawSectionHeader = (title: string, y: number) => {
    doc.rect(50, y, 5, 20).fill('#4F46E5');
    doc.fontSize(16).fillColor('#1F2937').font('Helvetica-Bold')
      .text(title, 65, y + 2, { width: 485, align: isAr ? 'right' : 'left' });
  };

  // Header Bar
  doc.rect(0, 0, 595, 120).fill('#4F46E5');
  doc.fontSize(24).fillColor('#FFFFFF').font('Helvetica-Bold')
    .text('CYBERSEC SECURITY REPORT', 0, 45, { align: 'center', width: 595 });
  doc.fontSize(12).fillColor('#E0E7FF').font('Helvetica')
    .text(r.title, 0, 80, { align: 'center', width: 595 });

  doc.y = 150;

  // Metadata Row
  const metaY = doc.y;
  doc.fontSize(10).fillColor('#6B7280').font('Helvetica');
  doc.text('Generated:', 50, metaY, { continued: true })
    .fillColor('#1F2937').text(` ${new Date(r.generatedAt).toLocaleString()}`, { continued: true })
    .fillColor('#6B7280').text('    Language:', { continued: true })
    .fillColor('#1F2937').text(` ${r.language === 'ar' ? 'Arabic' : 'English'}`);

  doc.moveDown(2.5);

  // Risk Assessment Core Section
  const riskY = doc.y;
  // Left Box: Score
  doc.roundedRect(50, riskY, 240, 100, 8).fill('#F8FAF9').stroke('#E5E7EB');
  doc.fontSize(10).fillColor('#6B7280').text(isAr ? 'درجة المخاطر' : 'Risk Score', 70, riskY + 15);
  doc.fontSize(42).fillColor('#4F46E5').font('Helvetica-Bold').text(`${r.riskScore}%`, 70, riskY + 35);

  // Right Box: Category
  const catColor = r.riskCategory === 'Critical' ? '#DC2626' :
    r.riskCategory === 'High' ? '#F59E0B' :
      r.riskCategory === 'Medium' ? '#3B82F6' : '#10B981';

  doc.roundedRect(305, riskY, 240, 100, 8).fill(catColor);
  doc.fontSize(20).fillColor('#FFFFFF').font('Helvetica-Bold')
    .text(r.riskCategory.toUpperCase(), 305, riskY + 40, { width: 240, align: 'center' });

  doc.y = riskY + 130;

  // Statistics Grid
  drawSectionHeader(isAr ? 'إحصائيات الأمان' : 'Security Statistics', doc.y);
  doc.moveDown(1.5);

  const statsY = doc.y;
  const stats = [
    { label: isAr ? 'حرجة' : 'CRITICAL', value: r.stats?.critical || 0, color: '#DC2626' },
    { label: isAr ? 'عالية' : 'HIGH', value: r.stats?.high || 0, color: '#F59E0B' },
    { label: isAr ? 'متوسطة' : 'MEDIUM', value: r.stats?.medium || 0, color: '#3B82F6' },
    { label: isAr ? 'منخفضة' : 'LOW', value: r.stats?.low || 0, color: '#6B7280' },
    { label: isAr ? 'المنافذ' : 'PORTS', value: r.stats?.openPorts || 0, color: '#8B5CF6' },
    { label: isAr ? 'النطاقات' : 'DOMAINS', value: r.stats?.subdomains || 0, color: '#10B981' }
  ];

  stats.forEach((stat, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 50 + col * 175;
    const y = statsY + row * 70;

    doc.roundedRect(x, y, 165, 60, 4).fill('#F9FAFB').stroke('#F1F5F9');
    doc.fontSize(18).fillColor(stat.color).font('Helvetica-Bold')
      .text(String(stat.value), x, y + 12, { width: 165, align: 'center' });
    doc.fontSize(8).fillColor('#94A3B8').font('Helvetica')
      .text(stat.label, x, y + 38, { width: 165, align: 'center' });
  });

  doc.y = statsY + 160;

  // Executive Summary
  drawSectionHeader(isAr ? 'الملخص التنفيذي' : 'Executive Summary', doc.y);
  doc.moveDown(1.2);

  const summaryBoxY = doc.y;
  doc.roundedRect(50, summaryBoxY, 495, 80, 8).fill('#F8FAFC').stroke('#E2E8F0');
  doc.fontSize(11).fillColor('#334155').font('Helvetica')
    .text(r.summary || 'No summary available', 65, summaryBoxY + 20, {
      width: 465,
      align: isAr ? 'right' : 'justify',
      lineGap: 4
    });

  doc.y = summaryBoxY + 110;

  // Sensitive Paths Section
  if (r.sensitivePathsFound?.length) {
    drawSectionHeader(isAr ? 'مسارات حساسة مكشوفة' : 'Sensitive Path Exposures', doc.y);
    doc.moveDown(1.5);

    const pathsY = doc.y;
    r.sensitivePathsFound.slice(0, 10).forEach((p: any, i: number) => {
      const y = pathsY + i * 25;
      if (y > 750) doc.addPage();

      doc.rect(50, y, 495, 20).fill(i % 2 === 0 ? '#F9FAFB' : '#FFFFFF');
      doc.fontSize(10).fillColor('#EF4444').font('Helvetica-Bold')
        .text('⚠️ ALERT:', 60, y + 5);
      doc.fontSize(10).fillColor('#374151').font('Helvetica')
        .text(`${p.path} (Status: ${p.status})`, 120, y + 5, { width: 410, align: isAr ? 'right' : 'left' });
    });
    doc.y += (r.sensitivePathsFound.length * 25) + 20;
  }

  // Recommendations
  if (r.recommendations?.length) {
    drawSectionHeader(isAr ? 'توصيات أمنية' : 'Security Recommendations', doc.y);
    doc.moveDown(1.5);

    r.recommendations.forEach((rec: string, i: number) => {
      const currentY = doc.y;
      if (currentY > 750) doc.addPage();

      doc.circle(60, doc.y + 6, 3).fill('#F59E0B');
      doc.fontSize(10).fillColor('#475569').font('Helvetica')
        .text(rec, 75, doc.y, { width: 470, align: isAr ? 'right' : 'left' });
      doc.moveDown(1.2);
    });
  }

  // Footer
  const pageHeight = doc.page.height;
  doc.fontSize(8).fillColor('#94A3B8').font('Helvetica')
    .text('CONFIDENTIAL SECURITY REPORT • GENERATED BY CYBERSEC SAAS', 0, pageHeight - 40, { align: 'center', width: 595 });

  doc.end();
});

// ─── EXPORT ALL REPORTS ───────────────────────────────────────────────────────
reportsRouter.post('/export-all', async (req: Request, res: Response) => {
  await connectToDatabase();
  const { format = 'pdf' } = req.body;
  const reports = await Report.find({ companyId: req.user!.companyId })
    .sort({ generatedAt: -1 })
    .lean();

  const formattedReports = reports.map((r: any) => ({
    title: r.title,
    riskScore: r.riskScore,
    riskCategory: r.riskCategory,
    summary: r.summary,
    recommendations: r.recommendations,
    stats: r.stats,
    generatedAt: r.generatedAt,
    language: r.language,
    format: r.format || format,
  }));

  if (format === 'excel') {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'CyberSec SaaS';

    const sheet = workbook.addWorksheet('All Reports', {
      properties: { tabColor: { argb: 'FF4F46E5' } }
    });

    // Title
    sheet.mergeCells('A1:F1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = '📊 ALL SECURITY REPORTS';
    titleCell.font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }
    };
    titleCell.alignment = { horizontal: 'center' };

    // Headers
    sheet.getRow(3).values = [
      'Title', 'Risk Score', 'Risk Category',
      'Critical', 'High', 'Medium',
      'Open Ports', 'Subdomains', 'Generated Date', 'Language'
    ];
    sheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(3).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF374151' }
    };

    // Data
    formattedReports.forEach((r: any, i: number) => {
      const row = sheet.getRow(i + 4);
      row.values = [
        r.title,
        `${r.riskScore}%`,
        r.riskCategory,
        r.stats?.critical || 0,
        r.stats?.high || 0,
        r.stats?.medium || 0,
        r.stats?.openPorts || 0,
        r.stats?.subdomains || 0,
        new Date(r.generatedAt).toLocaleDateString(),
        r.language === 'ar' ? 'العربية' : 'English'
      ];

      // Conditional formatting
      if (r.riskScore >= 75) {
        row.getCell(2).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF10B981' }
        };
      } else if (r.riskScore >= 50) {
        row.getCell(2).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF59E0B' }
        };
      } else {
        row.getCell(2).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDC2626' }
        };
      }
    });

    // Auto-fit columns
    sheet.columns.forEach(col => {
      col.width = 18;
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="all-reports.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
    return;
  }

  if (format === 'word') {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: '📊 ALL SECURITY REPORTS',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: `Generated on: ${new Date().toLocaleString()}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          ...formattedReports.map((r: any, idx: number) => [
            new Paragraph({
              text: `Report ${idx + 1}: ${r.title}`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 100 },
            }),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: 'Risk Score', alignment: AlignmentType.CENTER })], shading: { fill: 'F3F4F6' } }),
                    new TableCell({ children: [new Paragraph({ text: `${r.riskScore}%`, alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Category', alignment: AlignmentType.CENTER })], shading: { fill: 'F3F4F6' } }),
                    new TableCell({ children: [new Paragraph({ text: r.riskCategory, alignment: AlignmentType.CENTER })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: 'Critical', alignment: AlignmentType.CENTER })], shading: { fill: 'FEE2E2' } }),
                    new TableCell({ children: [new Paragraph({ text: String(r.stats?.critical || 0), alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ text: 'High', alignment: AlignmentType.CENTER })], shading: { fill: 'FEF3C7' } }),
                    new TableCell({ children: [new Paragraph({ text: String(r.stats?.high || 0), alignment: AlignmentType.CENTER })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: 'Medium', alignment: AlignmentType.CENTER })], shading: { fill: 'DBEAFE' } }),
                    new TableCell({ children: [new Paragraph({ text: String(r.stats?.medium || 0), alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Open Ports', alignment: AlignmentType.CENTER })], shading: { fill: 'EDE9FE' } }),
                    new TableCell({ children: [new Paragraph({ text: String(r.stats?.openPorts || 0), alignment: AlignmentType.CENTER })] }),
                  ],
                }),
              ],
            }),

            new Paragraph({ text: '', spacing: { after: 200 } }),
          ]).flat(),

          new Paragraph({
            text: '─'.repeat(50),
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
          }),

          new Paragraph({
            text: '🔒 Generated by CyberSec SaaS Security Platform',
            alignment: AlignmentType.CENTER,
          }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="all-reports.docx"');
    res.send(buffer);
    return;
  }

  // HTML/PDF Export
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Security Reports</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    /* Header Card */
    .header-card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      margin-bottom: 40px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .header-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2);
    }
    
    .header-title {
      font-size: 32px;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    
    .header-meta {
      color: #6b7280;
      font-size: 14px;
    }
    
    /* Stats Overview */
    .stats-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
    }
    
    .stat-label {
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
    }
    
    .stat-value.critical { color: #dc2626; }
    .stat-value.high { color: #f59e0b; }
    .stat-value.medium { color: #3b82f6; }
    
    /* Report Cards */
    .report-card {
      background: white;
      border-radius: 20px;
      margin-bottom: 30px;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .report-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 30px 50px -20px rgba(0, 0, 0, 0.2);
    }
    
    .report-header {
      padding: 20px 30px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f9fafb;
    }
    
    .report-title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }
    
    .report-badge {
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
      background: #4f46e5;
      color: white;
    }
    
    .report-content {
      padding: 30px;
    }
    
    /* Risk Score Display */
    .risk-score-container {
      display: flex;
      align-items: center;
      gap: 30px;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%);
      border-radius: 16px;
    }
    
    .risk-score-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 700;
      color: white;
      background: linear-gradient(135deg, #667eea, #764ba2);
    }
    
    .risk-score-details {
      flex: 1;
    }
    
    .risk-score-label {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 5px;
    }
    
    .risk-score-value {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    }
    
    .risk-score-category {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
      margin-top: 5px;
    }
    
    .category-critical { background: #fee2e2; color: #dc2626; }
    .category-high { background: #fef3c7; color: #f59e0b; }
    .category-medium { background: #dbeafe; color: #3b82f6; }
    .category-low { background: #d1fae5; color: #10b981; }
    
    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin: 30px 0;
    }
    
    .stat-item {
      text-align: center;
      padding: 15px;
      background: #f9fafb;
      border-radius: 12px;
    }
    
    .stat-number {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 5px;
    }
    
    .stat-text {
      font-size: 12px;
      color: #6b7280;
    }
    
    /* Recommendations */
    .recommendations {
      background: #fef3c7;
      border-radius: 12px;
      padding: 20px;
      margin-top: 20px;
    }
    
    .recommendations-title {
      font-size: 14px;
      font-weight: 600;
      color: #92400e;
      margin-bottom: 10px;
    }
    
    .recommendations-list {
      list-style: none;
    }
    
    .recommendations-list li {
      margin: 8px 0;
      font-size: 13px;
      color: #78350f;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .recommendations-list li::before {
      content: "•";
      color: #f59e0b;
      font-weight: bold;
    }
    
    /* Footer */
    .footer {
      text-align: center;
      margin-top: 60px;
      padding: 20px;
      color: #9ca3af;
      font-size: 12px;
    }
    
    .footer hr {
      margin: 20px 0;
      border: none;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header-card">
      <h1 class="header-title">📊 All Security Reports</h1>
      <p class="header-meta">Generated on: ${new Date().toLocaleString()} • Total Reports: ${formattedReports.length}</p>
    </div>
    
    <!-- Overview Stats -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-label">Total Reports</div>
        <div class="stat-value">${formattedReports.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Critical Issues</div>
        <div class="stat-value critical">${formattedReports.reduce((sum, r) => sum + (r.stats?.critical || 0), 0)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">High Issues</div>
        <div class="stat-value high">${formattedReports.reduce((sum, r) => sum + (r.stats?.high || 0), 0)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Medium Issues</div>
        <div class="stat-value medium">${formattedReports.reduce((sum, r) => sum + (r.stats?.medium || 0), 0)}</div>
      </div>
    </div>
    
    <!-- Individual Reports -->
    ${formattedReports.map((r, idx) => `
      <div class="report-card">
        <div class="report-header">
          <span class="report-title">${idx + 1}. ${r.title}</span>
          <span class="report-badge">${r.language === 'ar' ? 'العربية' : 'English'}</span>
        </div>
        
        <div class="report-content">
          <div class="risk-score-container">
            <div class="risk-score-circle">${r.riskScore}</div>
            <div class="risk-score-details">
              <div class="risk-score-label">Risk Score</div>
              <div class="risk-score-value">${r.riskScore}%</div>
              <span class="risk-score-category category-${r.riskCategory.toLowerCase()}">${r.riskCategory}</span>
            </div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number" style="color: #dc2626;">${r.stats?.critical || 0}</div>
              <div class="stat-text">Critical</div>
            </div>
            <div class="stat-item">
              <div class="stat-number" style="color: #f59e0b;">${r.stats?.high || 0}</div>
              <div class="stat-text">High</div>
            </div>
            <div class="stat-item">
              <div class="stat-number" style="color: #3b82f6;">${r.stats?.medium || 0}</div>
              <div class="stat-text">Medium</div>
            </div>
            <div class="stat-item">
              <div class="stat-number" style="color: #8b5cf6;">${r.stats?.openPorts || 0}</div>
              <div class="stat-text">Open Ports</div>
            </div>
            <div class="stat-item">
              <div class="stat-number" style="color: #10b981;">${r.stats?.subdomains || 0}</div>
              <div class="stat-text">Subdomains</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${new Date(r.generatedAt).toLocaleDateString()}</div>
              <div class="stat-text">Generated</div>
            </div>
          </div>
          
          <p style="color: #4b5563; margin: 20px 0; font-size: 14px; line-height: 1.6;">
            ${r.summary || 'No summary available'}
          </p>
          
          ${r.recommendations?.length ? `
            <div class="recommendations">
              <div class="recommendations-title">📋 Security Recommendations</div>
              <ul class="recommendations-list">
                ${r.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('')}
    
    <!-- Footer -->
    <div class="footer">
      <hr>
      <p>🔒 Generated by CyberSec SaaS Security Platform • Confidential</p>
      <p style="margin-top: 5px;">This document contains sensitive security information</p>
    </div>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Disposition', 'attachment; filename="all-reports.html"');
  res.send(html);
});

reportsRouter.delete('/:id', requireRole('admin'), async (req: Request, res: Response) => {
  await connectToDatabase();
  const report = await Report.findOneAndDelete({
    _id: req.params.id,
    companyId: req.user!.companyId,
  });

  if (!report) {
    throw new AppError('Report not found', 404, true);
  }

  res.json({ success: true, message: 'Report deleted successfully' });
});

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminRouter = Router();

adminRouter.use(requireRole('admin'));

adminRouter.get('/companies', async (_req: Request, res: Response) => {
  await connectToDatabase();
  const companies = await Company.find().lean();
  res.json({ success: true, data: companies });
});

adminRouter.get('/users', async (req: Request, res: Response) => {
  await connectToDatabase();
  const users = await User.find({ companyId: req.user!.companyId }).lean();
  res.json({ success: true, data: users });
});

adminRouter.post('/users', async (req: Request, res: Response) => {
  await connectToDatabase();
  const { email, name, role } = req.body;
  const tempPassword = Math.random().toString(36).slice(-10);
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const user = await User.create({
    email,
    name,
    passwordHash,
    role: role || 'user',
    companyId: req.user!.companyId,
  });

  res.status(201).json({
    success: true,
    data: { user, tempPassword },
  });
});

// Update user
adminRouter.put('/users/:id', async (req: Request, res: Response) => {
  await connectToDatabase();
  const { id } = req.params;
  const { name, email, role } = req.body;

  const user = await User.findOneAndUpdate(
    { _id: id, companyId: req.user!.companyId },
    { name, email, role },
    { new: true }
  ).select('-passwordHash').lean();

  if (!user) {
    throw new AppError('User not found', 404, true);
  }

  res.json({ success: true, data: user });
});

// Delete user
adminRouter.delete('/users/:id', async (req: Request, res: Response) => {
  await connectToDatabase();
  const { id } = req.params;

  const user = await User.findOneAndDelete({
    _id: id,
    companyId: req.user!.companyId,
    role: { $ne: 'admin' },
  });

  if (!user) {
    throw new AppError('User not found or cannot be deleted', 404, true);
  }

  res.json({ success: true, message: 'User deleted successfully' });
});