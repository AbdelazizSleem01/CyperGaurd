import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import type { RiskAssessment, ScanResult, BreachRecord, Company } from '../../../shared/types';
import { getRiskColor, formatDate } from '../../../shared/utils';

const REPORTS_DIR = process.env.REPORTS_DIR || path.join(__dirname, '../../../reports');

interface ReportData {
  company: Company;
  riskAssessment: RiskAssessment;
  scanResult: ScanResult;
  breaches: BreachRecord[];
  language: 'en' | 'ar';
}

export async function generatePdfReport(data: ReportData): Promise<string> {
  await fs.promises.mkdir(REPORTS_DIR, { recursive: true });

  const fileName = `report-${data.company._id}-${Date.now()}.pdf`;
  const filePath = path.join(REPORTS_DIR, fileName);

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 50, left: 60, right: 60 } });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    const isAr = data.language === 'ar';
    const t = translations(isAr);

    // ─── Cover Page ──────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 200).fill('#0f172a');
    doc.fillColor('#ffffff').fontSize(28).font('Helvetica-Bold')
      .text(t.title, 60, 70, { align: isAr ? 'right' : 'left' });
    doc.fontSize(16).fillColor('#94a3b8')
      .text(data.company.name, 60, 110, { align: isAr ? 'right' : 'left' });
    doc.fontSize(12)
      .text(`${t.generatedOn}: ${formatDate(new Date(), data.language)}`, 60, 140, { align: isAr ? 'right' : 'left' });

    doc.moveDown(8);

    // ─── Risk Score Badge ────────────────────────────────────────────────────
    const scoreColor = getRiskColor(data.riskAssessment.category);
    doc.roundedRect(60, 220, 160, 80, 8).fill(scoreColor);
    doc.fillColor('#ffffff').fontSize(40).font('Helvetica-Bold')
      .text(data.riskAssessment.score.toString(), 60, 235, { width: 160, align: 'center' });
    doc.fontSize(12).text(t.riskScore, 60, 275, { width: 160, align: 'center' });
    doc.fillColor('#0f172a').fontSize(14).font('Helvetica')
      .text(`${t.category}: ${data.riskAssessment.category}`, 240, 240);

    doc.addPage();

    // ─── Executive Summary ───────────────────────────────────────────────────
    sectionHeader(doc, t.executiveSummary, isAr);
    doc.fontSize(11).fillColor('#374151').font('Helvetica')
      .text(
        `${t.summaryText
          .replace('{company}', data.company.name)
          .replace('{score}', data.riskAssessment.score.toString())
          .replace('{category}', data.riskAssessment.category)
          .replace('{findings}', data.riskAssessment.findings.length.toString())
          .replace('{breaches}', data.breaches.length.toString())}`,
        { align: isAr ? 'right' : 'left', lineGap: 4 }
      );

    doc.moveDown();

    // ─── Findings Table ──────────────────────────────────────────────────────
    sectionHeader(doc, t.findings, isAr);

    for (const finding of data.riskAssessment.findings) {
      const severityColors: Record<string, string> = {
        critical: '#7c3aed',
        high: '#ef4444',
        medium: '#f59e0b',
        low: '#22c55e',
      };

      const y = doc.y;
      doc.roundedRect(60, y, doc.page.width - 120, 90, 4)
        .fill('#f8fafc').stroke('#e2e8f0');

      const badgeColor = severityColors[finding.severity] || '#64748b';
      doc.roundedRect(65, y + 8, 65, 18, 3).fill(badgeColor);
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
        .text(finding.severity.toUpperCase(), 65, y + 13, { width: 65, align: 'center' });

      doc.fillColor('#1e293b').fontSize(11).font('Helvetica-Bold')
        .text(finding.title, 140, y + 10, { width: doc.page.width - 220 });
      doc.fillColor('#64748b').fontSize(9).font('Helvetica')
        .text(finding.description, 65, y + 35, { width: doc.page.width - 130 });
      doc.fillColor('#1d4ed8').fontSize(9)
        .text(`💡 ${finding.recommendation}`, 65, y + 62, { width: doc.page.width - 130 });

      doc.moveDown(0.5).y += 10;
    }

    // ─── Credential Exposures ────────────────────────────────────────────────
    if (data.breaches.length > 0) {
      doc.addPage();
      sectionHeader(doc, t.breaches, isAr);

      const tableTop = doc.y + 10;
      const colWidths = [200, 100, 100, 80];
      const headers = [t.email, t.breachSource, t.breachDate, t.severity];
      let x = 60;

      doc.rect(60, tableTop, doc.page.width - 120, 24).fill('#0f172a');
      headers.forEach((header, i) => {
        doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold')
          .text(header, x + 5, tableTop + 7, { width: colWidths[i] });
        x += colWidths[i];
      });

      data.breaches.slice(0, 30).forEach((breach, idx) => {
        const rowY = tableTop + 24 + idx * 22;
        if (rowY > doc.page.height - 80) return;

        doc.rect(60, rowY, doc.page.width - 120, 22).fill(idx % 2 === 0 ? '#f8fafc' : '#ffffff');
        let rx = 60;
        [breach.email, breach.source, breach.breachDate, breach.severity].forEach((val, i) => {
          doc.fillColor('#374151').fontSize(9).font('Helvetica')
            .text(String(val), rx + 5, rowY + 6, { width: colWidths[i] });
          rx += colWidths[i];
        });
      });
    }

    doc.end();
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  return filePath;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sectionHeader(doc: InstanceType<typeof PDFDocument>, title: string, rtl: boolean) {
  doc.moveDown(0.5);
  doc.rect(60, doc.y, doc.page.width - 120, 2).fill('#3b82f6');
  doc.moveDown(0.3);
  doc.fillColor('#1e293b').fontSize(16).font('Helvetica-Bold')
    .text(title, { align: rtl ? 'right' : 'left' });
  doc.moveDown(0.5);
}

function translations(ar: boolean) {
  if (ar) {
    return {
      title: 'تقرير مراقبة الأمن السيبراني',
      generatedOn: 'تاريخ الإصدار',
      riskScore: 'درجة المخاطر',
      category: 'الفئة',
      executiveSummary: 'الملخص التنفيذي',
      summaryText:
        'تم فحص بنية {company} الأمنية وتقييم مستوى المخاطر. حصلت الشركة على درجة مخاطر {score}/100 وتصنيف {category}. تم رصد {findings} ثغرة أمنية و{breaches} تسرب بيانات.',
      findings: 'نتائج الفحص الأمني',
      breaches: 'تسريبات بيانات الاعتماد',
      email: 'البريد الإلكتروني',
      breachSource: 'المصدر',
      breachDate: 'تاريخ الاختراق',
      severity: 'الخطورة',
    };
  }
  return {
    title: 'Cybersecurity Monitoring Report',
    generatedOn: 'Generated On',
    riskScore: 'Risk Score',
    category: 'Category',
    executiveSummary: 'Executive Summary',
    summaryText:
      'A comprehensive security assessment was conducted for {company}. The organization received a risk score of {score}/100 with a {category} risk classification. A total of {findings} vulnerabilities were identified and {breaches} credential breach(es) detected.',
    findings: 'Security Findings',
    breaches: 'Credential Exposures',
    email: 'Email',
    breachSource: 'Source',
    breachDate: 'Breach Date',
    severity: 'Severity',
  };
}
