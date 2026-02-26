import useSWR from 'swr';
import { get } from '../utils/apiClient';
import type {
  DashboardStats,
  ScanResult,
  BreachRecord,
  RiskAssessment,
  ReportMeta,
} from '../../../shared/types';

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function useDashboardStats() {
  return useSWR<DashboardStats>('/dashboard/stats', (url) => get<DashboardStats>(url), {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
  });
}

// ─── Scans ────────────────────────────────────────────────────────────────────
interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export function useScans(page = 1, limit = 10) {
  return useSWR<{ scans: ScanResult[]; total: number; pages: number }>(
    `/scans?page=${page}&limit=${limit}`,
    (url) => get<{ scans: ScanResult[]; total: number; pages: number }>(url),
    { refreshInterval: 10_000 }
  );
}

export function useScan(id: string | null) {
  return useSWR<ScanResult>(id ? `/scans/${id}` : null, (url) => get<ScanResult>(url));
}

// ─── Breaches ─────────────────────────────────────────────────────────────────
export function useBreaches(page = 1, limit = 20) {
  return useSWR<{ breaches: BreachRecord[]; total: number; pages: number }>(
    `/breaches?page=${page}&limit=${limit}`,
    (url) => get<{ breaches: BreachRecord[]; total: number; pages: number }>(url)
  );
}

// ─── Risk Assessment ─────────────────────────────────────────────────────────
export function useLatestRisk() {
  return useSWR<RiskAssessment>('/risk/latest', (url) => get<RiskAssessment>(url), { refreshInterval: 60_000 });
}

export function useRiskHistory() {
  return useSWR<{ score: number; category: string; createdAt: string }[]>(
    '/risk/history',
    (url) => get<{ score: number; category: string; createdAt: string }[]>(url)
  );
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export function useReports() {
  return useSWR<ReportMeta[]>('/reports', (url) => get<ReportMeta[]>(url));
}

// ─── Company ──────────────────────────────────────────────────────────────────
export function useCompany() {
  return useSWR('/companies/me', (url) => get(url));
}