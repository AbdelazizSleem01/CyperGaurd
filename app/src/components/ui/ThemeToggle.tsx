'use client';

import { useTheme } from '../providers/ThemeProvider';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { RiSunLine, RiMoonLine, RiTranslate2 } from 'react-icons/ri';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const t = useTranslations('common');

  return (
    <button
      onClick={toggleTheme}
      className="btn  btn-sm btn-square"
      aria-label={isDark ? t('lightMode') : t('darkMode')}
      title={isDark ? t('lightMode') : t('darkMode')}
    >
      {isDark ? <RiSunLine size={18} /> : <RiMoonLine size={18} />}
    </button>
  );
}

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('common');

  const switchLocale = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    // Replace locale prefix in path
    const segments = pathname.split('/');
    segments[1] = newLocale;
    window.location.href = segments.join('/');
  };

  return (
    <button
      onClick={switchLocale}
      className="btn  btn-sm gap-1 text-xs"
      title={locale === 'en' ? t('arabic') : t('english')}
    >
      <RiTranslate2 size={16} />
      {locale === 'en' ? 'ع' : 'EN'}
    </button>
  );
}

interface SeverityBadgeProps {
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const colorMap = {
    low: 'badge-success',
    medium: 'badge-warning',
    high: 'badge-error',
    critical: 'badge-error opacity-80',
  };
  return (
    <span className={`badge badge-sm capitalize font-semibold ${colorMap[severity]}`}>
      {severity}
    </span>
  );
}

interface StatusBadgeProps {
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-${status} capitalize badge badge-sm `}>
      {status === 'running' && <span className="loading loading-ring loading-xs " />}
      {status}
    </span>
  );
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="card bg-base-200 p-6 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`h-4 bg-base-300 rounded shimmer ${i === 0 ? 'w-1/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-base-content/20 mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-base-content/70 mb-1">{title}</h3>
      {description && <p className="text-sm text-base-content/40 mb-4">{description}</p>}
      {action}
    </div>
  );
}
