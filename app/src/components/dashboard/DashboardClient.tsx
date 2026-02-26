'use client';

import { lazy, Suspense, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'react-toastify';
import {
  RiScanLine,
  RiShieldLine,
  RiServerLine,
  RiLockLine,
  RiTimeLine,
  RiAlertLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiArrowDownLine,
  RiArrowUpLine,
  RiSettings4Line,
  RiHistoryLine,
  RiRadarLine,
} from 'react-icons/ri';

import { useDashboardStats, useRiskHistory } from '../../hooks/useApi';
import { post } from '../../utils/apiClient';
import { SeverityBadge, CardSkeleton } from '../ui/ThemeToggle';
import { formatDate } from '../../../../shared/utils';
import { useAuth } from '../providers/AuthProvider';

const RiskGauge = lazy(() =>
  import('../charts/RiskGauge').then((m) => ({ default: m.RiskGauge }))
);
const RiskTrendChart = lazy(() =>
  import('../charts/RiskTrendChart').then((m) => ({ default: m.RiskTrendChart }))
);

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

function StatCard({ label, value, icon, color = 'text-primary', subtitle, trend, trendValue }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-linear-to-br from-primary via-secondary to-accent" />

      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-primary/20 to-transparent rounded-bl-full" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-base-content/40 uppercase tracking-wider mb-1 flex items-center gap-1">
            {label}
            {trend && (
              <span className={`flex items-center text-xs ${trend === 'up' ? 'text-error' : trend === 'down' ? 'text-success' : 'text-base-content/30'
                }`}>
                {trend === 'up' && <RiArrowUpLine size={12} />}
                {trend === 'down' && <RiArrowDownLine size={12} />}
                {trendValue}
              </span>
            )}
          </p>
          <p className={`text-3xl font-bold ${color} transition-all duration-300 group-hover:scale-105 origin-left`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-base-content/40 mt-1 flex items-center gap-1">
              <RiTimeLine size={10} />
              {subtitle}
            </p>
          )}
        </div>
        <div className={`${color} opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

const SCAN_TYPES = ['port-scan', 'ssl-check', 'subdomain-enum', 'breach-check', 'risk-calc'];

export function DashboardClient() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const tRisk = useTranslations('risk');
  const locale = useLocale();
  const { user } = useAuth();
  const { data: stats, isLoading, error, mutate } = useDashboardStats();
  const { data: history } = useRiskHistory();

  const [isScanning, setIsScanning] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(SCAN_TYPES);
  const [showScanMenu, setShowScanMenu] = useState(false);

  const triggerScan = async () => {
    if (selectedTypes.length === 0) {
      toast.warning(t('selectScanType'));
      return;
    }
    if (!user) {
      toast.error(t('pleaseLogin'));
      return;
    }

    if (!user.companyId) {
      toast.error(t('companyIdNotFound'));
      return;
    }
    try {
      setIsScanning(true);
      setShowScanMenu(false);
      await post('/scans/trigger', {
        types: selectedTypes,
        companyId: user.companyId
      });
      toast.success(t('scanQueued'));
      setTimeout(() => mutate(), 5000);
    } catch (err: any) {
      toast.error(err.message || t('scanFailed'));
    } finally {
      setIsScanning(false);
    }
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const getScanTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'port-scan': t('scanTypesList.portScan'),
      'ssl-check': t('scanTypesList.sslCheck'),
      'subdomain-enum': t('scanTypesList.subdomainEnum'),
      'breach-check': t('scanTypesList.breachCheck'),
      'risk-calc': t('scanTypesList.riskCalc'),
    };
    return labels[type] || type.replace('-', ' ');
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <CardSkeleton rows={2} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-error/30 p-8">
        <div className="absolute inset-0 bg-linear-to-br from-error/5 to-transparent" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
            <RiAlertLine className="text-error" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base-content mb-1">{t('errorLoadingDashboard')}</h3>
            <p className="text-sm text-base-content/60">{error.message}</p>
          </div>
          <button
            className="btn btn-error btn-sm gap-2"
            onClick={() => mutate()}
          >
            <RiScanLine size={14} />
            {tCommon('retry')}
          </button>
        </div>
      </div>
    );
  }

  const getRiskColor = (category?: string) => {
    switch (category) {
      case 'Critical':
      case tRisk('critical'):
        return 'text-purple-500';
      case 'High':
      case tRisk('high'):
        return 'text-error';
      case 'Medium':
      case tRisk('medium'):
        return 'text-warning';
      case 'Low':
      case tRisk('low'):
        return 'text-success';
      default:
        return 'text-success';
    }
  };

  const riskColor = getRiskColor(stats?.riskCategory);

  const getRiskTrend = () => {
    if (!history || history.length < 2) return undefined;
    const lastTwo = history.slice(-2);
    if (lastTwo[1].score > lastTwo[0].score) return 'up';
    if (lastTwo[1].score < lastTwo[0].score) return 'down';
    return 'neutral';
  };

  const riskTrend = getRiskTrend();
  const trendValue = riskTrend === 'up' ? '+5%' : riskTrend === 'down' ? '-3%' : '0%';

  const getTranslatedRiskCategory = (category?: string) => {
    if (!category) return '';
    const categoryMap: Record<string, string> = {
      'Critical': tRisk('critical'),
      'High': tRisk('high'),
      'Medium': tRisk('medium'),
      'Low': tRisk('low'),
    };
    return categoryMap[category] || category;
  };

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

          {/* Enhanced Scan Trigger Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowScanMenu(!showScanMenu)}
              className="btn btn-primary bg-linear-to-r from-primary to-secondary border-0 hover:from-primary-focus hover:to-secondary-focus gap-2 h-11 px-5 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
              disabled={isScanning}
            >
              {isScanning ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  <span>{t('generating')}</span>
                </>
              ) : (
                <>
                  <RiScanLine size={18} />
                  <span>{t('triggerScan')}</span>
                  <RiArrowDownLine size={16} className={`transition-transform duration-300 ${showScanMenu ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {/* Enhanced Dropdown Menu with Glass Effect */}
            {showScanMenu && (
              <div className={`absolute mt-2 w-72 z-5 ${locale === 'ar' ? '  left-0' : 'right-0'}`}>
                <div className="bg-base-100/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-base-300/50 overflow-hidden animate-slide-down">
                  {/* Dropdown header */}
                  <div className="px-4 py-3 border-b border-base-300/50 bg-linear-to-r from-primary/5 to-secondary/5">
                    <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wider flex items-center gap-1">
                      <RiSettings4Line size={14} className="text-primary" />
                      {t('scanTypes')}
                    </p>
                  </div>

                  {/* Scan types list */}
                  <div className="p-3 space-y-2">
                    {SCAN_TYPES.map((type, index) => (
                      <label
                        key={type}
                        className="group flex items-center gap-3 p-2 rounded-xl hover:bg-base-200/50 cursor-pointer transition-all duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={selectedTypes.includes(type)}
                            onChange={() => toggleType(type)}
                          />
                          <div className="w-4 h-4 border-2 border-base-content/30 rounded peer-checked:border-primary peer-checked:bg-primary transition-all duration-200" />
                          <RiCheckboxCircleLine className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" size={12} />
                        </div>
                        <span className="flex-1 text-sm text-base-content/70 group-hover:text-base-content transition-colors">
                          {getScanTypeLabel(type)}
                        </span>
                        <span className="text-xs text-base-content/30">
                          {index + 1}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Dropdown footer */}
                  <div className="px-3 py-3 border-t border-base-300/50 bg-base-200/30">
                    <button
                      className="btn btn-primary btn-sm w-full bg-linear-to-r from-primary to-secondary border-0 hover:from-primary-focus hover:to-secondary-focus gap-2"
                      onClick={triggerScan}
                      disabled={isScanning}
                    >
                      {isScanning ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <RiScanLine size={14} />
                      )}
                      {t('startScan')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid with enhanced cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label={t('riskScore')}
            value={stats?.riskScore ?? '—'}
            icon={<RiShieldLine size={28} />}
            color={riskColor}
            subtitle={getTranslatedRiskCategory(stats?.riskCategory)}
            trend={riskTrend}
            trendValue={trendValue}
          />
          <StatCard
            label={t('exposedCredentials')}
            value={stats?.exposedCredentials ?? 0}
            icon={<RiLockLine size={28} />}
            color={stats?.exposedCredentials ? 'text-error' : 'text-success'}
            trend={stats?.exposedCredentials ? 'up' : 'down'}
            trendValue={stats?.exposedCredentials ? '+2' : '0'}
          />
          <StatCard
            label={t('openPorts')}
            value={stats?.openPorts ?? 0}
            icon={<RiServerLine size={28} />}
            color={stats?.openPorts ? 'text-warning' : 'text-success'}
            trend={stats?.openPorts ? 'up' : 'down'}
            trendValue={stats?.openPorts ? '+3' : '0'}
          />
          <StatCard
            label={t('totalScans')}
            value={stats?.totalScans ?? 0}
            icon={<RiScanLine size={28} />}
            subtitle={stats?.lastScanAt ? formatDate(stats.lastScanAt, locale as 'en' | 'ar') : t('noScansYet')}
            trend="neutral"
            trendValue="+0"
          />
        </div>

        {/* Risk Gauge + Trend with enhanced styling */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Risk Gauge */}
          <div className="relative group overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 p-6 transition-all duration-300 hover:shadow-2xl hover:border-primary/30">
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-linear-to-br from-primary via-secondary to-accent" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-primary/10 to-transparent rounded-bl-full" />

            <div className="relative flex flex-col items-center">
              <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-4 flex items-center gap-1">
                <RiRadarLine size={14} className="text-primary" />
                {t('riskScore')}
              </p>
              {stats?.riskScore !== undefined ? (
                <Suspense fallback={
                  <div className="flex items-center justify-center h-[220px]">
                    <span className="loading loading-ring loading-lg text-primary" />
                  </div>
                }>
                  <RiskGauge score={stats.riskScore} category={stats.riskCategory} size={220} />
                </Suspense>
              ) : (
                <div className="h-[220px] flex items-center justify-center">
                  <p className="text-base-content/30 text-sm flex items-center gap-2">
                    <RiInformationLine size={16} />
                    {t('noData')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Trend Chart */}
          <div className="lg:col-span-2">
            {history && history.length > 0 ? (
              <Suspense fallback={
                <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 p-6 h-full flex items-center justify-center">
                  <CardSkeleton rows={4} />
                </div>
              }>
                <div className="relative group overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 p-6 transition-all duration-300 hover:shadow-2xl hover:border-secondary/30">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-linear-to-br from-secondary via-accent to-primary" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-secondary/10 to-transparent rounded-bl-full" />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider flex items-center gap-1">
                        <RiHistoryLine size={14} className="text-secondary" />
                        {t('riskHistory')}
                      </p>
                      <span className="text-xs text-base-content/30">
                        {t('lastScans', { count: history.length })}
                      </span>
                    </div>
                    <RiskTrendChart
                      data={history.map((h) => ({
                        date: formatDate(h.createdAt, locale as 'en' | 'ar'),
                        score: h.score,
                      }))}
                    />
                  </div>
                </div>
              </Suspense>
            ) : (
              <div className="relative overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 p-12 h-full flex items-center justify-center">
                <div className="absolute inset-0 bg-linear-to-br from-base-200/50 to-transparent" />
                <div className="relative text-center">
                  <RiHistoryLine className="mx-auto text-4xl text-base-content/20 mb-3" />
                  <p className="text-base-content/30 text-sm">{t('noData')}</p>
                  <p className="text-xs text-base-content/20 mt-1">{t('runScansToSeeHistory')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Breaches Table with enhanced styling */}
        <div className="relative group overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 transition-all duration-300 hover:shadow-2xl hover:border-accent/30">
          {/* Decorative header gradient */}
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-secondary to-accent" />

          <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-linear-to-br from-primary via-secondary to-accent" />

          <div className="relative">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-base-300/50 flex items-center justify-between">
              <h3 className="font-semibold text-base-content flex items-center gap-2">
                <RiAlertLine className="text-accent" size={18} />
                {t('recentBreaches')}
              </h3>
              {stats?.recentBreaches?.length > 0 && (
                <span className="badge badge-sm badge-accent/20 text-accent border-accent/30">
                  {stats.recentBreaches.length} {t('total')}
                </span>
              )}
            </div>

            {/* Table Content */}
            {stats?.recentBreaches?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-base-200/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('table.email')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('table.breach')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('table.source')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('table.severity')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">{t('table.detected')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-300/30">
                    {stats.recentBreaches.map((breach, index) => (
                      <tr
                        key={breach._id}
                        className="group/row hover:bg-base-200/30 transition-colors duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-3">
                          <span className="font-mono text-xs text-base-content/80 group-hover/row:text-base-content transition-colors">
                            {breach.email}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-base-content/70">{breach.breachName}</td>
                        <td className="px-6 py-3">
                          <span className="badge badge-sm uppercase border-base-300/50 text-base-content/60">
                            {breach.source}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <SeverityBadge severity={breach.severity} />
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-1 text-xs text-base-content/40">
                            <RiTimeLine size={12} />
                            {formatDate(breach.detectedAt, locale as 'en' | 'ar')}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                  <RiCheckboxCircleLine className="text-success" size={24} />
                </div>
                <p className="text-base-content/70 font-medium mb-1">{t('noRecentBreaches')}</p>
                <p className="text-xs text-base-content/30">{t('yourSystemsSecure')} 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 mt-8 pt-4 border-t border-base-300/30">
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiShieldLine size={14} className="text-primary/50" />
            {t('enterpriseGradeSecurity')}
          </span>
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiScanLine size={14} className="text-secondary/50" />
            {t('realtimeMonitoring')}
          </span>
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiLockLine size={14} className="text-accent/50" />
            {t('gdprCompliant')}
          </span>
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiTimeLine size={14} className="text-primary/50" />
            {t('protection24')}
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
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}