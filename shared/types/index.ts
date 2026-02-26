// ─── Company ─────────────────────────────────────────────────────────────────
export interface Company {
  _id: string;
  name: string;
  domain: string;
  emailDomains: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyDto {
  name: string;
  domain: string;
  emailDomains: string[];
}

// ─── User ─────────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'user';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  createdAt: Date;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
  companyId: string;
}

// ─── Breach / Credential Exposure ────────────────────────────────────────────
export interface BreachRecord {
  _id: string;
  companyId: string;
  email: string;
  breachName: string;
  breachDate: string;
  dataClasses: string[];
  source: 'hibp' | 'dehashed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
}

// ─── External Surface Scan ───────────────────────────────────────────────────
export interface PortResult {
  port: number;
  state: 'open' | 'closed' | 'filtered';
  service: string;
  version?: string;
  product?: string;
}

export interface SslResult {
  domain: string;
  validUntil: Date;
  validFrom?: Date;
  validTo?: Date;
  subject?: string;
  issuer: string;
  daysUntilExpiry: number;
  weakCiphers: string[];
  isValid: boolean;
}

export interface SubdomainResult {
  subdomain: string;
  ip?: string;
  status: 'active' | 'inactive';
  ports?: number[];
}

export interface DiscoveredPath {
  path: string;
  status: number;
  type: string;
}

export interface ScanResult {
  _id: string;
  companyId: string;
  domain: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  ports: PortResult[];
  ssl: SslResult | null;
  subdomains: SubdomainResult[];
  outdatedSoftware: OutdatedSoftware[];
  discoveredPaths: DiscoveredPath[];
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface OutdatedSoftware {
  name: string;
  currentVersion: string;
  latestVersion: string;
  severity: VulnerabilitySeverity;
  recommendation?: string;
}

// ─── Risk Assessment ─────────────────────────────────────────────────────────
export type VulnerabilitySeverity = 'low' | 'medium' | 'high' | 'critical';
export type RiskCategory = 'Low' | 'Medium' | 'High' | 'Critical';

export interface RiskFinding {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: VulnerabilitySeverity;
  recommendation: string;
  affectedAsset: string;
}

export interface RiskAssessment {
  _id: string;
  companyId: string;
  score: number; // 0–100
  category: RiskCategory;
  findings: RiskFinding[];
  createdAt: Date;
  scanId?: string;
}

// ─── PDF Report ───────────────────────────────────────────────────────────────
export interface ReportStats {
  critical: number;
  high: number;
  medium: number;
  low: number;
  openPorts?: number;
  subdomains?: number;
  sensitivePaths?: number;
}

export interface ReportMeta {
  _id: string;
  companyId: string;
  title: string;
  generatedAt: Date;
  filePath: string;
  riskScore: number;
  riskCategory?: RiskCategory;
  language: 'en' | 'ar';
  format?: 'pdf' | 'excel' | 'word';
  stats?: ReportStats;
  sensitivePathsFound?: DiscoveredPath[];
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export interface DashboardStats {
  totalScans: number;
  exposedCredentials: number;
  openPorts: number;
  expiredSslCerts: number;
  riskScore: number;
  riskCategory: RiskCategory;
  lastScanAt?: Date;
  recentBreaches: BreachRecord[];
  riskTrend: { date: string; score: number }[];
}

// ─── API Response Wrapper ─────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Job / Queue ──────────────────────────────────────────────────────────────
export type JobType = 'port-scan' | 'ssl-check' | 'subdomain-enum' | 'breach-check' | 'directory-scan' | 'risk-calc';

export interface ScanJob {
  jobId: string;
  companyId: string;
  domain: string;
  types: JobType[];
  priority: 'low' | 'normal' | 'high';
}
