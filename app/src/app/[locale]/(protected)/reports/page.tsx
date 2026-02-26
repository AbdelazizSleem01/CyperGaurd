'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'react-toastify';
import {
  RiFileTextLine,
  RiDownloadLine,
  RiAddLine,
  RiRefreshLine,
  RiFilePdfLine,
  RiFileExcelLine,
  RiFileWordLine,
  RiCalendarLine,
  RiTimeLine,
  RiShieldLine,
  RiBarChartLine,
  RiRadarLine,
  RiArrowRightLine,
  RiDeleteBinLine,
  RiGlobalLine,
  RiFileCopyLine,
  RiFileSettingsLine
} from 'react-icons/ri';
import { useReports } from '../../../../hooks/useApi';
import { post, del, get } from '../../../../utils/apiClient';
import { formatDate } from '../../../../../../shared/utils';
import Link from 'next/link';

export default function ReportsPage() {
  const t = useTranslations('reports');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { data: reports, isLoading, mutate } = useReports();
  const [generating, setGenerating] = useState(false);
  const [lang, setLang] = useState<'en' | 'ar'>(locale as 'en' | 'ar');
  const [filter, setFilter] = useState('all');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel' | 'word'>('pdf');
  const [exportingAll, setExportingAll] = useState(false);

  const generateReport = async () => {
    try {
      setGenerating(true);
      await post('/reports/generate', { language: lang, format: reportFormat });
      toast.success(t('generateSuccess'));
      mutate();
    } catch (err: any) {
      toast.error(err.message || t('generateFailed'));
    } finally {
      setGenerating(false);
    }
  };

  const handleExportAll = async () => {
    try {
      setExportingAll(true);

      // Get token from cookies
      const token = document.cookie.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1];
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiBaseUrl}/reports/export-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ format: reportFormat }),
      });

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('spreadsheetml')) {
        // Excel
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reports-export-${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t('exportExcelSuccess'));
      } else if (contentType.includes('wordprocessingml')) {
        // Word
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reports-export-${new Date().toISOString().split('T')[0]}.docx`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t('exportWordSuccess'));
      } else if (contentType.includes('pdf')) {
        // PDF
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reports-export-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t('exportPdfSuccess'));
      } else {
        // Fallback
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reports-export-${new Date().toISOString().split('T')[0]}.${reportFormat === 'excel' ? 'xlsx' : reportFormat === 'word' ? 'docx' : 'pdf'}`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t('exportSuccess'));
      }
    } catch (err: any) {
      toast.error(err.message || t('exportFailed'));
    } finally {
      setExportingAll(false);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDownload = async (reportId: string, format: string) => {
    try {
      // Get token from cookies
      const token = document.cookie.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1];
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiBaseUrl}/reports/${reportId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('spreadsheetml')) {
        // Excel
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t('downloadExcelSuccess'));
      } else if (contentType.includes('wordprocessingml')) {
        // Word
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.docx`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t('downloadWordSuccess'));
      } else if (contentType.includes('pdf')) {
        // PDF
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t('downloadPdfSuccess'));
      } else {
        // Fallback
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.${format === 'excel' ? 'xlsx' : format === 'word' ? 'docx' : 'pdf'}`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t('downloadSuccess'));
      }
    } catch (err: any) {
      toast.error(err.message || t('downloadFailed'));
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      setDeletingId(reportId);
      await del(`/reports/${reportId}`);
      toast.success(t('deleteSuccess'));
      mutate();
    } catch (err: any) {
      toast.error(err.message || t('deleteFailed'));
    } finally {
      setDeletingId(null);
    }
  };

  const getFileIcon = (format?: string) => {
    switch (format) {
      case 'pdf': return <RiFilePdfLine className="text-error" size={20} />;
      case 'excel': return <RiFileExcelLine className="text-success" size={20} />;
      case 'word': return <RiFileWordLine className="text-primary" size={20} />;
      default: return <RiFileTextLine className="text-primary" size={20} />;
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 75) return 'text-success';
    if (score >= 50) return 'text-warning';
    if (score >= 25) return 'text-error';
    return 'text-error';
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-linear-to-br from-base-200 to-base-300 p-4 md:p-6 lg:p-8">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, oklch(var(--p)/0.3) 1px, transparent 0)',
            backgroundSize: '50px 50px',
          }} />
        </div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-2000" />
        <div className="relative max-w-7xl mx-auto space-y-6">
          <div className="relative mb-8">
            <div className="absolute -left-4 top-0 w-1 h-full bg-linear-to-b from-primary via-secondary to-accent rounded-full" />
            <div className="pl-4">
              <div className="h-8 w-48 bg-base-300/50 rounded-lg shimmer mb-2" />
              <div className="h-4 w-64 bg-base-300/30 rounded-lg shimmer" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="relative overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 p-6">
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-secondary to-accent" />
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 bg-base-300/50 rounded-lg shimmer" />
                    <div className="w-16 h-6 bg-base-300/30 rounded-lg shimmer" />
                  </div>
                  <div className="h-5 w-32 bg-base-300/50 rounded-lg shimmer" />
                  <div className="h-4 w-24 bg-base-300/30 rounded-lg shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-linear-to-br from-base-200 to-base-300 p-4 md:p-6 lg:p-8">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, oklch(var(--p)/0.3) 1px, transparent 0)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Floating gradient orbs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-2000" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-4000" />

      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="mb-8">
          {/* Title Section */}
          <div className="relative mb-6">
            <div className="absolute -left-4 top-0 w-1 h-full bg-linear-to-b from-primary via-secondary to-accent rounded-full" />
            <div className="pl-4">
              <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('title')}
              </h1>
              <p className="text-xs sm:text-sm text-base-content/50 mt-1 flex items-center gap-2">
                <RiBarChartLine size={14} className="text-primary/50 shrink-0" />
                <span>{t('subtitle')}</span>
              </p>
            </div>
          </div>

          {/* Actions Toolbar - Clean Design */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-base-100/50 backdrop-blur-sm rounded-xl border border-base-300/50">
            {/* Left Side - Controls */}
            <div className="flex flex-wrap items-center gap-2 flex-1">


              {/* Format Selector */}
              <div className="flex items-center gap-2">
                <RiFileSettingsLine className="text-base-content/40" size={42} />
                <select
                  className="select select-sm border bg-base-200/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value as 'pdf' | 'excel' | 'word')}
                  aria-label="Select format"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="word">Word</option>
                </select>
              </div>
            </div>

            {/* Right Side - Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Refresh Button */}
              <button
                onClick={() => { mutate(); toast.success(t('refreshed')); }}
                className="btn btn-sm btn-square border border-base-300/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group"
                aria-label="Refresh reports"
              >
                <RiRefreshLine size={16} className="group-hover:rotate-180 transition-transform duration-500" />
              </button>

              {/* Generate Button */}
              <button
                className="btn btn-primary btn-sm gap-2 bg-linear-to-r from-primary to-secondary border-0 hover:from-primary-focus hover:to-secondary-focus transition-all duration-300"
                onClick={generateReport}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />
                    <span>{t('generating')}</span>
                  </>
                ) : (
                  <>
                    <RiAddLine size={16} />
                    <span>{t('generate')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Filter Tabs - Scrollable on Mobile */}
        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <div className="flex items-center gap-2 p-1 bg-base-200/50 backdrop-blur-sm rounded-xl border border-base-300/50 w-fit min-w-max">
            {['all', 'pdf', 'excel', 'word'].map((type) => (
              <button
                key={type}
                className={`px-3 sm:px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 ${filter === type
                  ? 'bg-linear-to-r from-primary to-secondary text-white shadow-lg'
                  : 'text-base-content/50 hover:text-base-content/80 hover:bg-base-300/30'
                  }`}
                onClick={() => setFilter(type)}
              >
                {type === 'all' && <RiFileCopyLine size={14} />}
                {type === 'pdf' && <RiFilePdfLine size={14} />}
                {type === 'excel' && <RiFileExcelLine size={14} />}
                {type === 'word' && <RiFileWordLine size={14} />}
                <span>{type === 'all' ? t('filterAll') : type.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>

        {!reports?.length ? (
          <div className="relative overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 p-12">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-secondary to-accent" />

            <div className="relative text-center max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <RiFileTextLine className="text-primary" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-base-content mb-2">{t('noReportsTitle')}</h3>
              <p className="text-sm text-base-content/50 mb-6">
                {t('noReportsDescription')}
              </p>
              <button
                onClick={generateReport}
                disabled={generating}
                className="btn btn-primary gap-2 bg-linear-to-r from-primary to-secondary border-0"
              >
                {generating ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <RiAddLine size={16} />
                )}
                {t('generateFirst')}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: t('totalReports'), value: reports.length, icon: RiFileTextLine, color: 'text-primary' },
                { label: t('pdfReports'), value: reports.filter(r => r.format === 'pdf').length, icon: RiFilePdfLine, color: 'text-error' },
                { label: t('excelReports'), value: reports.filter(r => r.format === 'excel').length, icon: RiFileExcelLine, color: 'text-success' },
                { label: t('wordReports'), value: reports.filter(r => r.format === 'word').length, icon: RiFileWordLine, color: 'text-info' },
                { label: t('sensitivePaths'), value: reports.reduce((acc, r) => acc + (r.stats?.sensitivePaths || 0), 0), icon: RiShieldLine, color: 'text-accent' },
              ].map((stat, idx) => (
                <div
                  key={stat.label}
                  className="group relative overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-xl shadow-lg border border-base-300/50 p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-linear-to-br from-primary to-secondary" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-xs text-base-content/40 uppercase tracking-wider">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
                    </div>
                    <stat.icon size={24} className={`${stat.color} opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {reports
                .filter(report => filter === 'all' || report.format === filter)
                .map((report, index) => (
                  <div
                    key={report._id}
                    className="relative group overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-secondary to-accent" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-linear-to-br from-primary via-secondary to-accent" />

                    <div className="relative p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-linear-to-r from-primary to-secondary rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
                          <div className="relative w-12 h-12 bg-linear-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center">
                            {getFileIcon(report.format)}
                          </div>
                        </div>
                        <span className="badge badge-sm uppercase bg-base-200/50 backdrop-blur-sm border-base-300/50">
                          {report.language}
                        </span>
                      </div>

                      {/* Content */}
                      <h3 className="font-semibold text-base-content text-lg mb-1 group-hover:text-primary transition-colors">
                        {report.title}
                      </h3>

                      <p className="text-xs text-base-content/40 mb-4 flex items-center gap-2">
                        <RiCalendarLine size={12} />
                        {formatDate(report.generatedAt, locale as 'en' | 'ar')}
                      </p>

                      {/* Risk Score */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-base-content/40">{t('riskScore')}</span>
                          <span className={`text-xs font-bold ${getRiskColor(report.riskScore)}`}>
                            {report.riskCategory || t('moderate')}
                          </span>
                        </div>
                        <div className="relative h-2 bg-base-300/50 rounded-full overflow-hidden">
                          <div
                            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${report.riskScore >= 75 ? 'bg-success' : report.riskScore >= 50 ? 'bg-warning' : 'bg-error'}`}
                            style={{ width: `${report.riskScore}%` }}
                          />
                        </div>
                        <p className="text-right text-lg font-bold text-primary mt-1">
                          {report.riskScore}/100
                        </p>
                      </div>

                      {/* Stats Preview */}
                      <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-base-200/30 rounded-xl">
                        <div className="text-center">
                          <p className="text-xs text-base-content/40">{t('critical')}</p>
                          <p className="text-sm font-bold text-error">{report.stats?.critical || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-base-content/40">{t('high')}</p>
                          <p className="text-sm font-bold text-warning">{report.stats?.high || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-base-content/40">{t('medium')}</p>
                          <p className="text-sm font-bold text-info">{report.stats?.medium || 0}</p>
                        </div>
                        <div className="text-center border-l border-base-content/10">
                          <p className="text-xs text-base-content/40">{t('sensitivePaths')}</p>
                          <p className="text-sm font-bold text-accent">{report.stats?.sensitivePaths || 0}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-base-content/30">
                          <RiTimeLine size={12} />
                          <span>{t('updated')} {formatDate(report.generatedAt, locale as 'en' | 'ar')}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Preview Button */}
                          <button
                            onClick={() => toast.info(t('previewComingSoon'))}
                            className="btn btn-xs gap-1 text-primary hover:text-primary-focus transition-all duration-200"
                          >
                            <span>{t('preview')}</span>
                            <RiArrowRightLine size={12} />
                          </button>

                          {/* Download Button */}
                          <button
                            onClick={() => handleDownload(report._id, report.format)}
                            className="btn btn-primary btn-xs gap-1 bg-linear-to-r from-primary to-secondary border-0 hover:from-primary-focus hover:to-secondary-focus transition-all duration-200"
                          >
                            <RiDownloadLine size={12} />
                            {t('download')}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(report._id)}
                            disabled={deletingId === report._id}
                            className="btn btn-xs btn-square text-error hover:bg-error/10 transition-all duration-200"
                          >
                            {deletingId === report._id ? (
                              <span className="loading loading-spinner loading-xs" />
                            ) : (
                              <RiDeleteBinLine size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Export All Button */}
            {reports.length > 0 && (
              <div className="flex  justify-center items-center gap-3 mt-4">
                <div className="relative sm:w-auto">
                  <select
                    className="select select-sm sm:w-auto w-24 border border-base-300/50 bg-base-100/50 backdrop-blur-sm"
                    value={reportFormat}
                    onChange={(e) => setReportFormat(e.target.value as 'pdf' | 'excel' | 'word')}
                    aria-label="Select format for export"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="word">Word</option>
                  </select>
                  <RiFileSettingsLine className="absolute left-2 top-1/2 -translate-y-1/2 text-base-content/40 text-sm" size={14} />
                </div>
                <button
                  onClick={handleExportAll}
                  disabled={exportingAll}
                  className="btn btn-sm gap-2 border border-base-300/50 hover:border-primary/30 transition-all duration-300  sm:w-auto"
                >
                  {exportingAll ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <RiDownloadLine size={14} />
                  )}
                  {t('exportAll')}
                </button>
              </div>
            )}
          </>
        )}

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 mt-8 pt-4 border-t border-base-300/30">
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiShieldLine size={14} className="text-primary/50" />
            {t('soc2Compliant')}
          </span>
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiFileTextLine size={14} className="text-secondary/50" />
            {t('multipleFormats')}
          </span>
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiRadarLine size={14} className="text-accent/50" />
            {t('realtimeData')}
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 10s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.5s ease-out; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .shimmer {
          background: linear-gradient(90deg, transparent 0%, oklch(var(--b2)/0.5) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}