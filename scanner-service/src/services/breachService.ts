import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { logger } from '../../../shared/utils';
import type { BreachRecord } from '../../../shared/types';

// ─── Configuration ───────────────────────────────────────────────────────────
const USE_REAL_HIBP = process.env.USE_REAL_HIBP === 'true';
const USE_REAL_DEHASHED = process.env.USE_REAL_DEHASHED === 'true';

// Paths to local public datasets
const HIBP_DATA_PATH = path.join(__dirname, '../../data/hibp-public.json');
const DEHASHED_DATA_PATH = path.join(__dirname, '../../data/dehashed-public.json');

// ─── Have I Been Pwned ────────────────────────────────────────────────────────
export async function checkHibp(
  email: string
): Promise<Omit<BreachRecord, '_id' | 'companyId' | 'detectedAt'>[]> {
  if (!USE_REAL_HIBP) {
    return checkHibpLocal(email);
  }

  const apiKey = process.env.HIBP_API_KEY;
  if (!apiKey || apiKey === 'your-hibp-api-key') {
    logger.warn('HIBP_API_KEY not configured, skipping HIBP check');
    return [];
  }

  try {
    const { data } = await axios.get(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`,
      {
        headers: {
          'hibp-api-key': apiKey,
          'User-Agent': 'CyberSecMonitor/1.0',
        },
        timeout: 10_000,
      }
    );

    return (data as any[]).map((breach) => ({
      email,
      breachName: breach.Name,
      breachDate: breach.BreachDate,
      dataClasses: breach.DataClasses || [],
      source: 'hibp' as const,
      severity: computeBreachSeverity(breach.DataClasses || []),
    }));
  } catch (err: any) {
    if (err?.response?.status === 404) return []; // No breaches found
    logger.error('HIBP API error', { email, error: String(err) });
    return [];
  }
}

async function checkHibpLocal(email: string): Promise<Omit<BreachRecord, '_id' | 'companyId' | 'detectedAt'>[]> {
  try {
    if (!fs.existsSync(HIBP_DATA_PATH)) {
      logger.warn('Local HIBP dataset not found', { path: HIBP_DATA_PATH });
      return [];
    }

    const rawData = fs.readFileSync(HIBP_DATA_PATH, 'utf-8');
    const datasets = JSON.parse(rawData);
    const breaches = datasets[email] || [];

    return breaches.map((breach: any) => ({
      email,
      breachName: breach.Name,
      breachDate: breach.BreachDate,
      dataClasses: breach.DataClasses || [],
      source: 'hibp' as const,
      severity: computeBreachSeverity(breach.DataClasses || []),
    }));
  } catch (err) {
    logger.error('Error reading local HIBP dataset', { error: String(err) });
    return [];
  }
}

// ─── DeHashed ─────────────────────────────────────────────────────────────────
export async function checkDehashed(
  email: string
): Promise<Omit<BreachRecord, '_id' | 'companyId' | 'detectedAt'>[]> {
  if (!USE_REAL_DEHASHED) {
    return checkDehashedLocal(email);
  }

  const apiKey = process.env.DEHASHED_API_KEY;
  const apiEmail = process.env.DEHASHED_EMAIL;
  if (!apiKey || !apiEmail || apiKey === 'your-dehashed-api-key') {
    logger.warn('DEHASHED credentials not configured, skipping DeHashed check');
    return [];
  }

  try {
    const { data } = await axios.get('https://api.dehashed.com/search', {
      params: { query: `email:${email}`, size: 50 },
      auth: { username: apiEmail, password: apiKey },
      headers: { Accept: 'application/json' },
      timeout: 10_000,
    });

    if (!data?.entries?.length) return [];

    return (data.entries as any[]).map((entry) => ({
      email,
      breachName: entry.database_name || 'Unknown',
      breachDate: '',
      dataClasses: buildDataClasses(entry),
      source: 'dehashed' as const,
      severity: 'high' as const,
    }));
  } catch (err: any) {
    logger.error('DeHashed API error', { email, error: String(err) });
    return [];
  }
}

async function checkDehashedLocal(email: string): Promise<Omit<BreachRecord, '_id' | 'companyId' | 'detectedAt'>[]> {
  try {
    if (!fs.existsSync(DEHASHED_DATA_PATH)) {
      logger.warn('Local DeHashed dataset not found', { path: DEHASHED_DATA_PATH });
      return [];
    }

    const rawData = fs.readFileSync(DEHASHED_DATA_PATH, 'utf-8');
    const datasets = JSON.parse(rawData);
    const entries = datasets[email] || [];

    return entries.map((entry: any) => ({
      email,
      breachName: entry.database_name || 'Unknown',
      breachDate: '',
      dataClasses: buildDataClasses(entry),
      source: 'dehashed' as const,
      severity: 'high' as const,
    }));
  } catch (err) {
    logger.error('Error reading local DeHashed dataset', { error: String(err) });
    return [];
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildDataClasses(entry: Record<string, unknown>): string[] {
  const classes: string[] = [];
  if (entry.password || entry.hashed_password) classes.push('Passwords');
  if (entry.username) classes.push('Usernames');
  if (entry.phone) classes.push('Phone numbers');
  if (entry.address) classes.push('Physical addresses');
  return classes;
}

function computeBreachSeverity(
  dataClasses: string[]
): 'low' | 'medium' | 'high' | 'critical' {
  const normalized = dataClasses.map((d) => d.toLowerCase());
  if (normalized.some((d) => d.includes('password') || d.includes('credit card'))) return 'critical';
  if (normalized.some((d) => d.includes('phone') || d.includes('address'))) return 'high';
  if (normalized.some((d) => d.includes('email') || d.includes('username'))) return 'medium';
  return 'low';
}
