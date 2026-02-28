import type { RiskAssessment, RiskCategory, VulnerabilitySeverity } from '../types';

// ─── Risk Score Calculator ────────────────────────────────────────────────────
export const SEVERITY_WEIGHTS: Record<VulnerabilitySeverity, number> = {
  low: 2,
  medium: 8,
  high: 20,
  critical: 35,
};

export function calculateRiskScore(findings: { severity: VulnerabilitySeverity }[]): number {
  if (findings.length === 0) return 0;

  const rawScore = findings.reduce((acc, f) => acc + SEVERITY_WEIGHTS[f.severity], 0);
  return Math.min(100, Math.round(rawScore));
}

export function getRiskCategory(score: number): RiskCategory {
  if (score >= 75) return 'Critical';
  if (score >= 50) return 'High';
  if (score >= 25) return 'Medium';
  return 'Low';
}

export function getRiskColor(category: RiskCategory): string {
  const map: Record<RiskCategory, string> = {
    Low: '#22c55e',
    Medium: '#f59e0b',
    High: '#ef4444',
    Critical: '#7c3aed',
  };
  return map[category];
}

// ─── SSL Helpers ──────────────────────────────────────────────────────────────
export function getDaysUntilExpiry(expiryDate: Date | string): number {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isSslExpiringSoon(daysUntilExpiry: number, thresholdDays = 30): boolean {
  return daysUntilExpiry <= thresholdDays;
}

// ─── Date Formatting ──────────────────────────────────────────────────────────
export function formatDate(date: Date | string, locale: 'en' | 'ar' = 'en'): string {
  return new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Severity Badge Colors (Tailwind) ─────────────────────────────────────────
export function getSeverityBadgeClass(severity: VulnerabilitySeverity): string {
  const map: Record<VulnerabilitySeverity, string> = {
    low: 'badge-success',
    medium: 'badge-warning',
    high: 'badge-error',
    critical: 'badge-error opacity-80',
  };
  return map[severity];
}

// ─── Domain validation ────────────────────────────────────────────────────────
export function isValidDomain(domain: string): boolean {
  const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

// ─── Domain normalization ─────────────────────────────────────────────────────
export function normalizeDomain(input: string): string {
  let value = input.trim();
  try {
    const url = new URL(value);
    return url.hostname.toLowerCase();
  } catch {
    // not a full URL, strip protocol and trailing slashes
    value = value.replace(/^https?:\/\//i, '');
    value = value.replace(/\/+$/, '');
    return value.toLowerCase();
  }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export function paginate<T>(items: T[], page: number, limit: number): { data: T[]; total: number; pages: number } {
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);
  return { data, total: items.length, pages: Math.ceil(items.length / limit) };
}

// ─── Logger ───────────────────────────────────────────────────────────────────
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export const logger = {
  log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, level, message, ...meta };
    if (level === 'error') {
      console.error(JSON.stringify(entry));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  },
  info: (msg: string, meta?: Record<string, unknown>) => logger.log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => logger.log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => logger.log('error', msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => logger.log('debug', msg, meta),
};
