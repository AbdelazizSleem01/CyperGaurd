'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'react-toastify';
import {
  RiScanLine,
  RiArrowRightLine,
  RiRefreshLine,
  RiSearchLine,
  RiFilterLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiLoaderLine,
  RiPauseCircleLine,
  RiArrowLeftLine,
  RiArrowRightSLine,
  RiHistoryLine,
  RiRadarLine,
  RiInformationLine,
  RiExternalLinkLine,
  RiDownloadLine,
  RiDeleteBinLine
} from 'react-icons/ri';
import { useScans } from '../../../../hooks/useApi';
import { del } from '../../../../utils/apiClient';
import { StatusBadge, EmptyState } from '../../../../components/ui/ThemeToggle';
import { formatDate } from '../../../../../../shared/utils';
import Link from 'next/link';

export default function ScansPage() {
  const t = useTranslations('scans');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deletingScanId, setDeletingScanId] = useState<string | null>(null);
  const { data, isLoading, mutate } = useScans(page);

  // Delete scan function
  const deleteScan = async (scanId: string) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      setDeletingScanId(scanId);
      await del(`/scans/${scanId}`);
      toast.success(t('scanDeleted'));
      mutate();
    } catch (err: any) {
      toast.error(err.message || t('deleteFailed'));
    } finally {
      setDeletingScanId(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await mutate();
    toast.success(t('refreshed'));
    setTimeout(() => setRefreshing(false), 500);
  };

  // Export scans to CSV
  const handleExportCSV = () => {
    if (!data?.scans?.length) {
      toast.error(t('noScansToExport'));
      return;
    }

    setExporting(true);

    try {
      const scans = filteredScans || data.scans;

      const headers = [
        t('export.domain'),
        t('export.status'),
        t('export.portsCount'),
        t('export.subdomainsCount'),
        t('export.pathsCount'),
        t('export.startedAt'),
        t('export.completedAt')
      ];

      const rows = scans.map(scan => [
        scan.domain,
        formatStatus(scan.status),
        scan.ports?.length?.toString() || '0',
        scan.subdomains?.length?.toString() || '0',
        scan.discoveredPaths?.length?.toString() || '0',
        scan.startedAt ? new Date(scan.startedAt).toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }) : t('notStarted'),
        scan.completedAt ? new Date(scan.completedAt).toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }) : t('inProgress')
      ]);

      const summary = [
        [t('export.exportDate'), new Date().toLocaleString()],
        [t('export.totalScans'), scans.length.toString()],
        [t('export.completedScans'), scans.filter(s => s.status === 'completed').length.toString()],
        [t('export.pendingScans'), scans.filter(s => s.status === 'pending').length.toString()],
        [t('export.failedScans'), scans.filter(s => s.status === 'failed').length.toString()],
        ['', '']
      ];

      const csvContent = [
        ...summary.map(row => row.join(',')),
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], {
        type: 'text/csv;charset=utf-8;'
      });

      const fileName = `scans-export-${new Date().toISOString().split('T')[0]}-${new Date().getHours()}-${new Date().getMinutes()}.csv`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(t('exportSuccess', { count: scans.length }));

    } catch (err) {
      console.error('Export error:', err);
      toast.error(t('exportFailed'));
    } finally {
      setExporting(false);
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'completed': `✅ ${t('completed')}`,
      'pending': `⏳ ${t('pending')}`,
      'failed': `❌ ${t('failed')}`,
      'in_progress': `🔄 ${t('running')}`,
      'cancelled': `⛔ ${t('cancelled')}`
    };
    return statusMap[status] || status;
  };

  const handleExportExcel = async () => {
    if (!data?.scans?.length) {
      toast.error(t('noScansToExport'));
      return;
    }

    setExporting(true);

    try {
      handleExportCSV();

    } catch (err) {
      toast.error(t('exportFailed'));
    } finally {
      setExporting(false);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'info';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'ghost';
    }
  };

  const filteredScans = data?.scans?.filter(scan => {
    if (filter !== 'all' && scan.status !== filter) return false;
    if (search && !scan.domain.includes(search.toLowerCase())) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-linear-to-br from-base-200 to-base-300 p-4 md:p-6 lg:p-8">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, oklch(var(--p)/0.3) 1px, transparent 0)',
            backgroundSize: '50px 50px',
          }} />
        </div>

        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-2000" />

        <div className="relative max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="relative mb-8">
            <div className="absolute -left-4 top-0 w-1 h-full bg-linear-to-b from-primary via-secondary to-accent rounded-full" />
            <div className="pl-4">
              <div className="h-8 w-48 bg-base-300/50 rounded-lg shimmer mb-2" />
              <div className="h-4 w-64 bg-base-300/30 rounded-lg shimmer" />
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="relative overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-secondary to-accent" />
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-4 w-32 bg-base-300 rounded-lg" />
                  <div className="h-4 w-24 bg-base-300 rounded-lg" />
                  <div className="h-4 w-16 bg-base-300 rounded-lg" />
                  <div className="h-4 w-16 bg-base-300 rounded-lg" />
                  <div className="h-4 w-32 bg-base-300 rounded-lg" />
                  <div className="h-4 w-32 bg-base-300 rounded-lg" />
                  <div className="h-4 w-20 bg-base-300 rounded-lg ml-auto" />
                </div>
              ))}
            </div>
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
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-4000" />

      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* Page Header with enhanced styling */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="relative">
            <div className="absolute -left-4 top-0 w-1 h-full bg-linear-to-b from-primary via-secondary to-accent rounded-full" />
            <div className="pl-4">
              <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('title')}
              </h1>
              <p className="text-sm text-base-content/50 mt-1 flex items-center gap-2">
                <RiRadarLine size={14} className="text-primary/50" />
                {t('subtitle')}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn btn-sm gap-2 border border-base-300/50 hover:border-primary/30 transition-all duration-300 group"
            >
              {refreshing ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <RiRefreshLine size={14} className="group-hover:rotate-180 transition-transform duration-500" />
              )}
              <span className="text-sm">{refreshing ? t('refreshing') : t('refresh')}</span>
            </button>

            {/* New Scan Button - goes to Admin panel */}
            <Link
              href={`/${locale}/admin`}
              className="btn btn-primary btn-sm gap-2 bg-linear-to-r from-primary to-secondary border-0 hover:from-primary-focus hover:to-secondary-focus transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
            >
              <RiScanLine size={14} />
              {t('newScan')}
            </Link>
          </div>
        </div>

        {!data?.scans?.length ? (
          <div className="relative overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 p-12">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-secondary to-accent" />

            <div className="relative text-center max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <RiScanLine className="text-primary" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-base-content mb-2">{t('noScansTitle')}</h3>
              <p className="text-sm text-base-content/50 mb-6">
                {t('noScansDescription')}
              </p>
              <Link
                href={`/${locale}/dashboard`}
                className="btn btn-primary gap-2 bg-linear-to-r from-primary to-secondary border-0"
              >
                <RiRadarLine size={16} />
                {t('goToDashboard')}
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: t('totalScans'), value: data.total, icon: RiHistoryLine, color: 'text-primary' },
                { label: t('runningScans'), value: data.scans.filter(s => s.status === 'running').length, icon: RiLoaderLine, color: 'text-info' },
                { label: t('completedScans'), value: data.scans.filter(s => s.status === 'completed').length, icon: RiCheckboxCircleLine, color: 'text-success' },
                { label: t('failedScans'), value: data.scans.filter(s => s.status === 'failed').length, icon: RiErrorWarningLine, color: 'text-error' },
              ].map((stat, idx) => (
                <div
                  key={stat.label}
                  className="group relative overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-xl shadow-lg border border-base-300/50 p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                  style={{ animationDelay: `${idx * 100}ms` }}
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

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <RiFilterLine size={20} className="text-base-content/40" />
                <div className="flex gap-1 p-1 bg-base-200/50 backdrop-blur-sm rounded-xl border border-base-300/50">
                  {['all', 'running', 'completed', 'failed'].map((status) => (
                    <button
                      key={status}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${filter === status
                        ? `bg-linear-to-r from-${getStatusColor(status)} to-${getStatusColor(status)}/70 shadow-lg`
                        : 'text-base-content/50 hover:text-base-content/80 hover:bg-base-300/30'
                        }`}
                      onClick={() => setFilter(status)}
                    >
                      {status === 'all' ? t('filterAll') : t(status)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" size={14} />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  className="input input-sm input-bordered rounded-md w-full bg-base-100/50 backdrop-blur-sm pl-8 focus:pl-10 transition-all duration-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Main Table Card */}
            <div className="relative group overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 transition-all duration-300 hover:shadow-2xl">
              {/* Decorative header gradient */}
              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-secondary to-accent" />

              <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-linear-to-br from-primary via-secondary to-accent" />

              <div className="relative">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-base-300/50">
                  <h3 className="font-semibold text-base-content flex items-center gap-2">
                    <RiScanLine className="text-primary" size={18} />
                    {t('scanHistory')}
                  </h3>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-base-200/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('domain')}</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('status')}</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider whitespace-nowrap">{t('ports')}</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('subdomains')}</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-error">{t('sensitivePaths')}</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('startedAt')}</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('completedAt')}</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-base-300/30">
                      {(filteredScans || data.scans).map((scan, index) => (
                        <tr
                          key={scan._id}
                          className="group/row hover:bg-base-200/30 transition-all duration-200 animate-slide-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm text-base-content/80 group-hover/row:text-base-content transition-colors">
                                {scan.domain}
                              </span>
                              {scan.status === 'running' && (
                                <span className="flex h-2 w-2">
                                  <span className="animate-ping absolute h-2 w-2 rounded-full bg-info opacity-75" />
                                  <span className="relative rounded-full h-2 w-2 bg-info" />
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={scan.status} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium text-base-content/80">{scan.ports?.length ?? 0}</span>
                              {scan.ports?.length > 0 && (
                                <span className="text-xs text-base-content/40">{t('open')}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium text-base-content/80">{scan.subdomains?.length ?? 0}</span>
                              {scan.subdomains?.length > 0 && (
                                <span className="text-xs text-base-content/40">{t('found')}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium text-error">{scan.discoveredPaths?.length ?? 0}</span>
                              {scan.discoveredPaths?.length > 0 && (
                                <span className="text-xs text-error/60">{t('discovered')}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 whitespace-nowrap text-xs text-base-content/40">
                              <RiTimeLine size={12} />
                              {formatDate(scan.startedAt, locale as 'en' | 'ar')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {scan.completedAt ? (
                              <div className="flex items-center gap-1 text-xs text-base-content/40 whitespace-nowrap">
                                <RiCheckboxCircleLine size={12} className="text-success" />
                                {formatDate(scan.completedAt, locale as 'en' | 'ar')}
                              </div>
                            ) : (
                              <span className="text-xs text-base-content/30">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/${locale}/scans/${scan._id}`}
                                className="btn rounded-md btn-xs gap-1 text-primary hover:text-primary-focus hover:bg-primary/5 transition-all duration-200 group/btn"
                              >
                                <span>{t('viewDetails')}</span>
                                <RiArrowRightLine size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                              </Link>
                              <button
                                onClick={() => deleteScan(scan._id)}
                                disabled={deletingScanId === scan._id}
                                className={`btn btn-xs btn-square transition-all duration-200 hover:scale-110 ${deletingScanId === scan._id
                                  ? 'loading loading-spinner loading-xs text-error'
                                  : 'text-base-content/30 hover:text-error hover:bg-error/10'
                                  }`}
                              >
                                {deletingScanId !== scan._id && <RiDeleteBinLine size={14} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {data.pages > 1 && (
                  <div className="px-6 py-4 border-t border-base-300/50 flex items-center justify-between">
                    <p className="text-xs text-base-content/40">
                      {t('showing')} <span className="font-medium text-base-content/60">{(page - 1) * 10 + 1}</span> {t('to')}{' '}
                      <span className="font-medium text-base-content/60">
                        {Math.min(page * 10, data.total)}
                      </span>{' '}
                      {t('of')} <span className="font-medium text-base-content/60">{data.total}</span> {t('scansCount')}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        className="btn btn-sm btn-square transition-all duration-200 hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                      >
                        <RiArrowLeftLine size={16} />
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, data.pages) }, (_, i) => {
                          let pageNum = i + 1;
                          if (data.pages > 5 && page > 3) {
                            pageNum = page - 3 + i;
                          }
                          if (pageNum <= data.pages) {
                            return (
                              <button
                                key={pageNum}
                                className={`w-8 h-8 rounded-xl text-sm transition-all duration-200 ${page === pageNum
                                  ? 'bg-linear-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25'
                                  : 'hover:bg-base-200/50 text-base-content/60'
                                  }`}
                                onClick={() => setPage(pageNum)}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                          return null;
                        })}
                      </div>

                      <button
                        className="btn btn-sm btn-square transition-all duration-200 hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                        disabled={page === data.pages}
                        onClick={() => setPage(p => p + 1)}
                      >
                        <RiArrowRightSLine size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Export Options */}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleExportCSV}
                disabled={exporting || !data?.scans?.length}
                className="btn btn-sm gap-2 border border-base-300/50 hover:border-primary/30 transition-all duration-300"
              >
                {exporting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <RiDownloadLine size={14} />
                )}
                {exporting ? t('exporting') : t('exportCSV')}
              </button>
            </div>
          </>
        )
        }

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 mt-8 pt-4 border-t border-base-300/30">
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiRadarLine size={14} className="text-primary/50" />
            {t('realtimeScanning')}
          </span>
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiHistoryLine size={14} className="text-secondary/50" />
            {t('historicalData')}
          </span>
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiInformationLine size={14} className="text-accent/50" />
            {t('detailedReports')}
          </span>
        </div>
      </div >

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            oklch(var(--b2)/0.5) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div >
  );
}