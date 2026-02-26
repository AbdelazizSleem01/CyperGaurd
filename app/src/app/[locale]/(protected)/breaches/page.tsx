'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  RiShieldLine,
  RiAlertLine,
  RiInformationLine,
  RiTimeLine,
  RiSearchLine,
  RiFilterLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiDatabaseLine,
  RiFileWarningLine,
  RiExternalLinkLine
} from 'react-icons/ri';
import { useBreaches } from '../../../../hooks/useApi';
import { SeverityBadge, EmptyState } from '../../../../components/ui/ThemeToggle';
import { formatDate } from '../../../../../../shared/utils';

export default function BreachesPage() {
  const t = useTranslations('breaches');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all'); // all, high, medium, low
  const { data, isLoading } = useBreaches(page);

  const filteredBreaches = data?.breaches?.filter(breach => {
    if (filter === 'all') return true;
    return breach.severity.toLowerCase() === filter.toLowerCase();
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
                  <div className="h-4 w-4 bg-base-300 rounded-full" />
                  <div className="h-4 w-32 bg-base-300 rounded-lg" />
                  <div className="h-4 w-40 bg-base-300 rounded-lg" />
                  <div className="h-4 w-24 bg-base-300 rounded-lg" />
                  <div className="h-4 w-48 bg-base-300 rounded-lg flex-1" />
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
                <RiShieldLine size={14} className="text-primary/50" />
                {t('subtitle')}
              </p>
            </div>
          </div>

          {/* Filter and Stats */}
          <div className="flex items-center gap-3">
            {/* Severity Filter */}
            <div className="dropdown dropdown-end">
              <button
                tabIndex={0}
                className="btn btn-sm gap-2 border border-base-300/50 hover:border-primary/30 transition-all duration-300"
              >
                <RiFilterLine size={14} className="text-base-content/60" />
                <span className="text-sm">{filter === 'all' ? t('filterAll') : t(filter)}</span>
              </button>
              <div
                tabIndex={0}
                className="dropdown-content mt-2 z-50 w-48 bg-base-100/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-base-300/50 overflow-hidden animate-slide-down"
              >
                <div className="px-3 py-2 border-b border-base-300/50 bg-linear-to-r from-primary/5 to-secondary/5">
                  <p className="text-xs font-semibold text-base-content/60">{t('filterBySeverity')}</p>
                </div>
                <div className="p-2 space-y-1">
                  {['all', 'critical', 'high', 'medium', 'low'].map((s) => (
                    <button
                      key={s}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-200 ${filter === s
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-base-200/50 text-base-content/70'
                        }`}
                      onClick={() => setFilter(s)}
                    >
                      {s === 'all' ? t('filterAll') : t(s)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Count Badge */}
            <div className="px-3 py-2 bg-base-100/50 backdrop-blur-sm rounded-xl border border-base-300/50">
              <span className="text-xs text-base-content/60">{t('total')}: </span>
              <span className="text-sm font-semibold text-primary">{data?.total || 0}</span>
            </div>
          </div>
        </div>

        {!data?.breaches?.length ? (
          <div className="relative overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 p-12">
            <div className="absolute inset-0 bg-linear-to-br from-success/5 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-success via-success to-success" />

            <div className="relative text-center max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <RiCheckboxCircleLine className="text-success" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-base-content mb-2">{t('noBreachesTitle')}</h3>
              <p className="text-sm text-base-content/50 mb-6">
                {t('noBreachesDescription')}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-base-content/30">
                <RiShieldLine size={14} />
                <span>{t('lastChecked')}: {formatDate(new Date().toISOString(), locale as 'en' | 'ar')}</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: t('critical'), value: data.breaches.filter(b => b.severity === 'critical').length, color: 'text-purple-500', icon: RiErrorWarningLine },
                { label: t('high'), value: data.breaches.filter(b => b.severity === 'high').length, color: 'text-error', icon: RiAlertLine },
                { label: t('medium'), value: data.breaches.filter(b => b.severity === 'medium').length, color: 'text-warning', icon: RiInformationLine },
                { label: t('low'), value: data.breaches.filter(b => b.severity === 'low').length, color: 'text-success', icon: RiShieldLine },
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

            {/* Main Table Card */}
            <div className="relative group overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 transition-all duration-300 hover:shadow-2xl">
              {/* Decorative header gradient */}
              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-secondary to-accent" />

              <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-linear-to-br from-primary via-secondary to-accent" />

              <div className="relative">
                {/* Table Header with search */}
                <div className="px-6 py-4 border-b border-base-300/50 flex items-center justify-between">
                  <h3 className="font-semibold text-base-content flex items-center gap-2">
                    <RiDatabaseLine className="text-accent" size={18} />
                    {t('breachDatabase')}
                  </h3>
                  <div className="relative">
                    <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" size={14} />
                    <input
                      type="text"
                      placeholder={t('searchPlaceholder')}
                      className="input input-xs input-bordered bg-base-200/50 pl-8 w-48 focus:w-64 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-base-200/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('email')}</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('breach')}</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('source')}</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('severity')}</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('dataClasses')}</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('date')}</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-base-300/30">
                      {(filteredBreaches || data.breaches).map((breach, index) => (
                        <tr
                          key={breach._id}
                          className="group/row hover:bg-base-200/30 transition-all duration-200 animate-slide-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs text-base-content/80 group-hover/row:text-base-content transition-colors">
                              {breach.email}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-base-content/90">{breach.breachName}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="badge badge-sm uppercase border-base-300/50 text-base-content/60">
                              {breach.source}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <SeverityBadge severity={breach.severity} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {breach.dataClasses.slice(0, 3).map((cls) => (
                                <span
                                  key={cls}
                                  className="badge badge-outline badge-xs border-base-content/20 text-base-content/50 hover:border-primary/30 hover:text-primary/70 transition-colors duration-200 cursor-default"
                                >
                                  {cls}
                                </span>
                              ))}
                              {breach.dataClasses.length > 3 && (
                                <div className="dropdown dropdown-top">
                                  <span
                                    tabIndex={0}
                                    className="badge badge-xs cursor-pointer hover:bg-base-300/50 transition-colors"
                                  >
                                    +{breach.dataClasses.length - 3}
                                  </span>
                                  <div
                                    tabIndex={0}
                                    className="dropdown-content z-50 bg-base-100/95 backdrop-blur-sm rounded-xl shadow-xl border border-base-300/50 p-3 max-w-xs animate-slide-up"
                                  >
                                    <p className="text-xs font-semibold text-base-content/60 mb-2">{t('allDataClasses')}:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {breach.dataClasses.map((cls) => (
                                        <span key={cls} className="badge badge-outline badge-xs">{cls}</span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-xs text-base-content/40">
                              <RiTimeLine size={12} />
                              {formatDate(breach.detectedAt, locale as 'en' | 'ar')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button className="btn btn-xs btn-square text-base-content/30 hover:text-primary transition-all duration-200 hover:scale-110">
                              <RiExternalLinkLine size={14} />
                            </button>
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
                      {t('of')} <span className="font-medium text-base-content/60">{data.total}</span> {t('results')}
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
                        <RiArrowRightLine size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Export and Actions */}
            <div className="flex justify-end gap-2">
              <button className="btn btn-sm gap-2 border border-base-300/50 hover:border-primary/30 transition-all duration-300">
                <RiFileWarningLine size={14} />
                {t('exportReport')}
              </button>
            </div>
          </>
        )}

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 mt-8 pt-4 border-t border-base-300/30">
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiShieldLine size={14} className="text-primary/50" />
            {t('realtimeMonitoring')}
          </span>
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiDatabaseLine size={14} className="text-secondary/50" />
            {t('recordsChecked')}
          </span>
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiTimeLine size={14} className="text-accent/50" />
            {t('updatedDaily')}
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
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
    </div>
  );
}