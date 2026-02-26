import axios from 'axios';
import dns from 'dns/promises';
import fs from 'fs';
import path from 'path';
import { logger } from '../../../shared/utils';
import type { SubdomainResult } from '../../../shared/types';

const WORDLIST_PATH = path.join(__dirname, '../../data/wordlists/subdomains.txt');

export async function enumerateSubdomains(domain: string): Promise<SubdomainResult[]> {
  const passiveResults = await fetchFromCrtSh(domain);
  const activeResults = await fetchFromLocalWordlist(domain);

  const merged = [...new Set([...passiveResults, ...activeResults])];
  const resolved = await resolveSubdomains(merged);
  return resolved;
}

async function fetchFromCrtSh(domain: string): Promise<string[]> {
  try {
    const { data } = await axios.get<{ name_value: string }[]>(
      `https://crt.sh/?q=%.${domain}&output=json`,
      { timeout: 15_000, headers: { 'Accept': 'application/json' } }
    );

    const subdomains = new Set<string>();
    for (const entry of data) {
      entry.name_value.split('\n').forEach((name) => {
        const cleaned = name.trim().replace(/^\*\./, '');
        if (cleaned.endsWith(`.${domain}`) || cleaned === domain) {
          subdomains.add(cleaned.toLowerCase());
        }
      });
    }
    return [...subdomains];
  } catch (err) {
    logger.error('crt.sh enumeration failed', { domain, error: String(err) });
    return [];
  }
}

async function fetchFromLocalWordlist(domain: string): Promise<string[]> {
  try {
    if (!fs.existsSync(WORDLIST_PATH)) {
      logger.warn('Subdomain wordlist not found', { path: WORDLIST_PATH });
      return [];
    }

    const content = fs.readFileSync(WORDLIST_PATH, 'utf-8');
    const prefixes = content.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));

    // Limit to top 200 to keep it fast
    return prefixes.slice(0, 200).map(p => `${p}.${domain}`);
  } catch (err) {
    logger.error('Local subdomain enumeration failed', { error: String(err) });
    return [];
  }
}

async function resolveSubdomains(subdomains: string[]): Promise<SubdomainResult[]> {
  // Increase limit slightly for higher coverage
  const limit = 200;
  const results = await Promise.allSettled(
    subdomains.slice(0, limit).map(async (subdomain): Promise<SubdomainResult> => {
      try {
        const addresses = await dns.resolve4(subdomain);
        return { subdomain, ip: addresses[0], status: 'active' };
      } catch {
        return { subdomain, status: 'inactive' };
      }
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<SubdomainResult> => r.status === 'fulfilled')
    .map((r) => r.value);
}
