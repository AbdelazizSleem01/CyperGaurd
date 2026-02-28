'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useScan } from '../../../../../hooks/useApi';
import { StatusBadge, SeverityBadge } from '../../../../../components/ui/ThemeToggle';
import {
  RiShieldLine,
  RiServerLine,
  RiGlobalLine,
  RiLockLine,
  RiArrowLeftLine,
  RiRefreshLine,
  RiInformationLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiAlertLine,
  RiRadarLine,
  RiDownloadLine,
  RiShareLine,
  RiPrinterLine,
  RiArrowRightLine
} from 'react-icons/ri';
import Link from 'next/link';
import { formatDate, normalizeDomain } from '@shared/utils';
import { useTranslations, useLocale } from 'next-intl';

export default function ScanDetailPage() {
  const { id, locale } = useParams();
  const router = useRouter();
  const t = useTranslations('scans.scanDetail');
  const tScans = useTranslations('scans');
  const currentLocale = useLocale();

  // Redirect "new" to the admin page (new scans are created from admin panel)
  useEffect(() => {
    if (id === 'new') {
      router.push(`/${locale}/admin`);
    }
  }, [id, locale, router]);

  // Don't render anything for "new" - wait for redirect
  if (id === 'new') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const { data: scan, isLoading, mutate } = useScan(id as string);

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
          {/* Back button skeleton */}
          <div className="h-8 w-24 bg-base-300/50 rounded-lg shimmer" />

          {/* Header skeleton */}
          <div className="relative mb-8">
            <div className="absolute -left-4 top-0 w-1 h-full bg-linear-to-b from-primary via-secondary to-accent rounded-full" />
            <div className="pl-4 space-y-3">
              <div className="h-8 w-64 bg-base-300/50 rounded-lg shimmer" />
              <div className="h-4 w-48 bg-base-300/30 rounded-lg shimmer" />
            </div>
          </div>

          {/* Cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="relative overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 p-6">
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-secondary to-accent" />
                <div className="space-y-4">
                  <div className="h-6 w-32 bg-base-300/50 rounded-lg shimmer" />
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-12 bg-base-300/30 rounded-lg shimmer" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="relative min-h-screen bg-linear-to-br from-base-200 to-base-300 flex items-center justify-center p-4">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, oklch(var(--p)/0.3) 1px, transparent 0)',
            backgroundSize: '50px 50px',
          }} />
        </div>

        <div className="relative bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-error/30 p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
            <RiErrorWarningLine className="text-error" size={32} />
          </div>
          <h2 className="text-xl font-bold text-base-content mb-2">{t('scanNotFound')}</h2>
          <p className="text-sm text-base-content/50 mb-6">{t('scanNotFoundDesc')}</p>
          <button
            onClick={() => router.back()}
            className="btn btn-primary gap-2 bg-linear-to-r from-primary to-secondary border-0"
          >
            <RiArrowLeftLine size={16} />
            {t('goBack')}
          </button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <RiCheckboxCircleLine className="text-success" size={20} />;
      case 'running': return <RiRadarLine className="text-info animate-pulse" size={20} />;
      case 'failed': return <RiErrorWarningLine className="text-error" size={20} />;
      case 'pending': return <RiTimeLine className="text-warning" size={20} />;
      default: return <RiInformationLine className="text-base-content/50" size={20} />;
    }
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
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-4000" />

      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* Back button and actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-sm text-base-content/50 hover:text-primary transition-all duration-300 hover:-translate-x-1"
          >
            <RiArrowLeftLine size={16} className="group-hover:scale-110 transition-transform" />
            {t('backToScans')}
          </button>


        </div>

        {/* Header with enhanced styling */}
        <div className="relative">
          <div className="absolute -left-4 top-0 w-1 h-full bg-linear-to-b from-primary via-secondary to-accent rounded-full" />
          <div className="pl-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent font-mono">
                  {normalizeDomain(scan.domain)}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(scan.status)}
                    <StatusBadge status={scan.status} />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-base-content/40">
                    <RiTimeLine size={12} />
                    {t('started')} {formatDate(scan.startedAt, currentLocale as 'en' | 'ar')}
                  </div>
                  {scan.completedAt && (
                    <div className="flex items-center gap-1 text-xs text-base-content/40">
                      <RiCheckboxCircleLine size={12} className="text-success" />
                      {t('completed')} {formatDate(scan.completedAt, currentLocale as 'en' | 'ar')}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex gap-3">
                <div className="px-3 py-2 bg-base-100/50 backdrop-blur-sm rounded-xl border border-base-300/50 text-center">
                  <p className="text-xs text-base-content/40">{t('ports')}</p>
                  <p className="text-lg font-bold text-warning">{scan.ports?.length || 0}</p>
                </div>
                <div className="px-3 py-2 bg-base-100/50 backdrop-blur-sm rounded-xl border border-base-300/50 text-center">
                  <p className="text-xs text-base-content/40">{t('subdomains')}</p>
                  <p className="text-lg font-bold text-info">{scan.subdomains?.length || 0}</p>
                </div>
                <div className="px-3 py-2 bg-base-100/50 backdrop-blur-sm rounded-xl border border-base-300/50 text-center">
                  <p className="text-xs text-base-content/40">{t('vulnerabilities')}</p>
                  <p className="text-lg font-bold text-error">{(scan.outdatedSoftware?.length || 0) + (scan.vulnerabilities?.length || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {scan.error && (
          <div className="relative overflow-hidden bg-error/10 backdrop-blur-sm rounded-2xl border border-error/30 p-4 animate-slide-down">
            <div className="absolute inset-0 bg-linear-to-r from-error/5 to-transparent" />
            <div className="relative flex items-center gap-3">
              <RiAlertLine className="text-error" size={20} />
              <span className="text-sm text-error/90">{scan.error}</span>
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Open Ports Card */}
          <div className="relative group overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 transition-all duration-300 hover:shadow-2xl hover:border-warning/30">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-warning to-orange-500" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-linear-to-br from-warning to-orange-500" />

            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-base-content flex items-center gap-2">
                  <RiServerLine className="text-warning" size={20} />
                  {t('openPorts')}
                </h2>
                <span className="badge badge-warning badge-sm">{scan.ports?.length || 0} {t('total')}</span>
              </div>

              {scan.ports?.length ? (
                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                  {scan.ports.map((p, index) => (
                    <div
                      key={p.port}
                      className="group/item flex items-center justify-between p-3 bg-base-200/30 rounded-xl hover:bg-base-200/50 transition-all duration-200 animate-slide-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-lg font-bold text-warning">{p.port}</span>
                        <div className="flex flex-col">
                          <span className="text-sm text-base-content/80 capitalize">{p.service}</span>
                          {p.product && (
                            <span className="text-xs text-base-content/40">{p.product}</span>
                          )}
                          {p.banner && (
                            <span className="text-xs text-base-content/30 mt-0.5 truncate" title={p.banner}>{p.banner}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.version && (
                          <span className="text-xs text-base-content/40">{p.version}</span>
                        )}
                        <span className="badge badge-success badge-sm">{p.state}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-base-200/50 flex items-center justify-center mb-2">
                    <RiServerLine className="text-base-content/30" size={24} />
                  </div>
                  <p className="text-sm text-base-content/40">{t('noOpenPorts')}</p>
                  <p className="text-xs text-base-content/30 mt-1">{t('allPortsSecured')}</p>
                </div>
              )}
            </div>
          </div>

          {/* SSL Certificate Card */}
          <div className="relative group overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 transition-all duration-300 hover:shadow-2xl hover:border-success/30">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-success to-emerald-500" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-linear-to-br from-success to-emerald-500" />

            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-base-content flex items-center gap-2">
                  <RiLockLine className={scan.ssl?.isValid ? 'text-success' : 'text-error'} size={20} />
                  {t('sslCertificate')}
                </h2>
                {scan.ssl && (
                  <span className={`badge badge-sm ${scan.ssl.isValid ? 'badge-success' : 'badge-error'}`}>
                    {scan.ssl.isValid ? t('valid') : t('invalid')}
                  </span>
                )}
              </div>

              {scan.ssl ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-base-200/30 rounded-xl">
                      <p className="text-xs text-base-content/40 mb-1">{t('issuer')}</p>
                      <p className="text-sm font-medium text-base-content/80">{scan.ssl.issuer}</p>
                    </div>
                    <div className="p-3 bg-base-200/30 rounded-xl">
                      <p className="text-xs text-base-content/40 mb-1">{t('expiresIn')}</p>
                      <p className={`text-sm font-bold ${scan.ssl.daysUntilExpiry < 30 ? 'text-error' : 'text-success'}`}>
                        {scan.ssl.daysUntilExpiry} {t('days')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-base-200/30 rounded-xl">
                      <span className="text-sm text-base-content/60">{t('subject')}</span>
                      <span className="text-sm font-mono">{scan.ssl.subject || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-base-200/30 rounded-xl">
                      <span className="text-sm text-base-content/60">{t('validFrom')}</span>
                      <span className="text-sm">{scan.ssl.validFrom ? formatDate(scan.ssl.validFrom, currentLocale as 'en' | 'ar') : 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-base-200/30 rounded-xl">
                      <span className="text-sm text-base-content/60">{t('validUntil')}</span>
                      <span className="text-sm">{scan.ssl.validTo ? formatDate(scan.ssl.validTo, currentLocale as 'en' | 'ar') : 'N/A'}</span>
                    </div>

                    {scan.ssl.weakCiphers.length > 0 && (
                      <div className="p-3 bg-error/10 rounded-xl border border-error/30">
                        <p className="text-xs text-error/80 mb-2">{t('weakCiphersDetected')}</p>
                        <div className="flex flex-wrap gap-1">
                          {scan.ssl.weakCiphers.map((cipher, i) => (
                            <span key={i} className="badge badge-error badge-sm">{cipher}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-base-200/50 flex items-center justify-center mb-2">
                    <RiLockLine className="text-base-content/30" size={24} />
                  </div>
                  <p className="text-sm text-base-content/40">{t('sslCheckPending')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Subdomains Card */}
          <div className="relative group overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 transition-all duration-300 hover:shadow-2xl hover:border-info/30">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-info to-blue-500" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-linear-to-br from-info to-blue-500" />

            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-base-content flex items-center gap-2">
                  <RiGlobalLine className="text-info" size={20} />
                  {t('subdomains')}
                </h2>
                <span className="badge badge-info badge-sm">{scan.subdomains?.length || 0} {t('subdomainsFound')}</span>
              </div>

              {scan.subdomains?.length ? (
                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                  {scan.subdomains.map((s, index) => (
                    <div
                      key={s.subdomain}
                      className="group/item flex items-center justify-between p-3 bg-base-200/30 rounded-xl hover:bg-base-200/50 transition-all duration-200 animate-slide-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex flex-col">
                        <span className="font-mono text-sm text-base-content/80">{s.subdomain}</span>
                        {s.ip && (
                          <span className="text-xs text-base-content/40">{s.ip}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {s.ports && s.ports.length > 0 && (
                          <span className="text-xs text-base-content/40">{s.ports.length} {t('ports')}</span>
                        )}
                        <span className={`badge badge-sm ${s.status === 'active' ? 'badge-success' : ''}`}>
                          {s.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-base-200/50 flex items-center justify-center mb-2">
                    <RiGlobalLine className="text-base-content/30" size={24} />
                  </div>
                  <p className="text-sm text-base-content/40">{t('noSubdomains')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Outdated Software Card */}
          <div className="relative group overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 transition-all duration-300 hover:shadow-2xl hover:border-error/30">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-error to-red-500" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-linear-to-br from-error to-red-500" />

            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-base-content flex items-center gap-2">
                  <RiShieldLine className="text-error" size={20} />
                  {t('outdatedSoftware')}
                </h2>
                <span className="badge badge-error badge-sm">{scan.outdatedSoftware?.length || 0} {t('vulnerabilities')}</span>
              </div>

              {scan.outdatedSoftware?.length ? (
                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                  {scan.outdatedSoftware.map((sw, index) => (
                    <div
                      key={index}
                      className="group/item p-3 bg-base-200/30 rounded-xl hover:bg-base-200/50 transition-all duration-200 animate-slide-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-base-content/90">{sw.name}</span>
                        <SeverityBadge severity={sw.severity as any} />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-base-content/40">{t('current')} {sw.currentVersion}</span>
                        <RiArrowRightLine className="text-base-content/20" size={12} />
                        <span className="text-success">{t('latest')} {sw.latestVersion}</span>
                      </div>
                      {sw.recommendation && (
                        <p className="text-xs text-warning/80 mt-2 p-2 bg-warning/5 rounded-lg">
                          {sw.recommendation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-base-200/50 flex items-center justify-center mb-2">
                    <RiShieldLine className="text-base-content/30" size={24} />
                  </div>
                  <p className="text-sm text-base-content/40">{t('noOutdatedSoftware')}</p>
                  <p className="text-xs text-base-content/30 mt-1">{t('allSystemsUpdated')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Vulnerabilities Card (from intelligence) */}
          {scan.vulnerabilities && scan.vulnerabilities.length > 0 && (
            <div className="relative group overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 transition-all duration-300 hover:shadow-2xl hover:border-error/30">
              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-error to-red-500" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-linear-to-br from-error to-red-500" />

              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-base-content flex items-center gap-2">
                    <RiInformationLine className="text-error" size={20} />
                    {t('externalVulnerabilities')}
                  </h2>
                  <span className="badge badge-error badge-sm">{scan.vulnerabilities.length} {t('found')}</span>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                  {scan.vulnerabilities.map((v, idx) => (
                    <div key={idx} className="p-3 bg-base-200/30 rounded-xl hover:bg-base-200/50 transition-all duration-200 animate-slide-in" style={{ animationDelay: `${idx * 50}ms` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-base-content/90">{v.title}</span>
                        <SeverityBadge severity={v.severity as any} />
                      </div>
                      <p className="text-xs text-base-content/70">{v.description}</p>
                      {v.recommendation && (
                        <p className="text-xs text-warning/80 mt-2 p-2 bg-warning/5 rounded-lg">
                          {v.recommendation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {scan.intelExtras && Object.keys(scan.intelExtras).length > 0 && (
            <div className="relative mt-6 overflow-hidden bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-xl border border-base-300/50 p-6">
              <h3 className="text-base font-semibold mb-2">{t('intelExtras')}</h3>
              <pre className="text-xs overflow-x-auto max-h-40 bg-base-200/30 p-2 rounded">
                {JSON.stringify(scan.intelExtras, null, 2)}
              </pre>
            </div>
          )}

          {/* end results grid */}
        </div>

        {/* Scan Metadata */}
        <div className="relative overflow-hidden bg-base-100/50 backdrop-blur-sm rounded-2xl border border-base-300/50 p-4">
          <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5" />
          <div className="relative flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <RiRadarLine className="text-primary/50" size={14} />
              <span className="text-base-content/40">{t('scanId')}</span>
              <span className="font-mono text-primary/80">{id}</span>
            </div>
            <div className="flex items-center gap-2">
              <RiTimeLine className="text-secondary/50" size={14} />
              <span className="text-base-content/40">{t('duration')}</span>
              <span className="text-base-content/60">
                {scan.completedAt
                  ? `${Math.round((new Date(scan.completedAt).getTime() - new Date(scan.startedAt).getTime()) / 1000)} ${t('seconds')}`
                  : t('inProgress')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <RiPrinterLine className="text-accent/50" size={14} />
              <span className="text-base-content/40">{t('scanner')}</span>
              <span className="text-base-content/60">v2.1.0</span>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 mt-4 pt-4 border-t border-base-300/30">
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiShieldLine size={14} className="text-primary/50" />
            {t('comprehensiveScan')}
          </span>
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiTimeLine size={14} className="text-secondary/50" />
            {t('realtimeResults')}
          </span>
          <span className="flex items-center gap-1 text-xs text-base-content/30 hover:text-base-content/50 transition-colors duration-200">
            <RiRadarLine size={14} className="text-accent/50" />
            {t('detailedAnalysis')}
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
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: oklch(var(--b3)/0.5);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: oklch(var(--b3)/0.8);
        }
      `}</style>
    </div>
  );
}