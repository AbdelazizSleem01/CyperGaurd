import { IIntelligenceProvider, IntelligenceData } from './BaseProvider';
import { VirusTotalProvider } from './VirusTotalProvider';
import { ShodanProvider } from './ShodanProvider';
import { LocalFallbackProvider } from './LocalFallbackProvider';
import { logger } from '../../../../shared/utils';
import { PortResult, SubdomainResult } from '../../../../shared/types';
import Redis from 'ioredis';

export class IntelligenceOrchestrator {
    private providers: IIntelligenceProvider[];
    private fallbackProvider: IIntelligenceProvider;
    private redis: Redis | null = null;

    constructor() {
        this.providers = [
            new VirusTotalProvider(),
            new ShodanProvider()
        ];
        this.fallbackProvider = new LocalFallbackProvider();

        if (process.env.REDIS_URL && process.env.REDIS_URL.startsWith('redis')) {
            this.redis = new Redis(process.env.REDIS_URL, {
                maxRetriesPerRequest: 1,
                connectTimeout: 2000,
                retryStrategy: () => null
            });
            this.redis.on('error', (err: any) => {
                if (err.code !== 'ECONNREFUSED' && err.code !== 'EPERM') {
                    logger.debug('Redis background error', { code: err.code });
                }
            });
        }
    }

    async getSmartIntelligence(domain: string): Promise<IntelligenceData> {
        const cacheKey = `intel-cache:${domain}`;

        // 1. Check Cache
        if (this.redis) {
            try {
                const cached = await this.redis.get(cacheKey);
                if (cached) {
                    logger.info(`Returning cached intelligence for: ${domain}`);
                    return JSON.parse(cached);
                }
            } catch (err) {
                logger.warn('Redis cache read failed', { err });
            }
        }

        const results: IntelligenceData[] = [];
        const errors: any[] = [];

        // Attempt VT and Shodan in parallel
        const promises = this.providers.map(async (provider) => {
            try {
                return await this.retryOperation(() => provider.getDomainIntelligence(domain));
            } catch (err: any) {
                logger.warn(`Provider ${provider.name} failed`, { domain, error: err.message });
                throw err;
            }
        });

        const settled = await Promise.allSettled(promises);

        let allQuotaExceeded = true;
        let anySuccess = false;

        for (const result of settled) {
            if (result.status === 'fulfilled') {
                results.push(result.value);
                anySuccess = true;
                allQuotaExceeded = false;
            } else {
                if (result.reason.message !== 'QUOTA_EXCEEDED') {
                    allQuotaExceeded = false;
                }
            }
        }

        const merged = this.mergeResults(results);
        let finalResult = merged;
        // If both failed, quota exceeded, OR we have no ports (might mean Shodan failed), use fallback
        if (!anySuccess || allQuotaExceeded || merged.ports.length === 0) {
            logger.info('External providers failed, quota exceeded, or returned no ports. Attempting local fallback.');
            const fallbackResult = await this.fallbackProvider.getDomainIntelligence(domain);

            // Merge fallback result with already collected data
            finalResult = this.mergeResults([...results, fallbackResult]);
        }

        // 2. Save to Cache (24 hours)
        if (this.redis) {
            try {
                await this.redis.set(cacheKey, JSON.stringify(finalResult), 'EX', 86400);
            } catch (err) {
                logger.warn('Redis cache write failed', { err });
            }
        }

        return finalResult;
    }

    private async retryOperation<T>(operation: () => Promise<T>, retries = 1, delay = 1000): Promise<T> {
        try {
            return await operation();
        } catch (error: any) {
            if (retries > 0 && error.message !== 'QUOTA_EXCEEDED') {
                logger.info(`Retrying operation... (${retries} attempts left)`);
                await new Promise(res => setTimeout(res, delay));
                return this.retryOperation(operation, retries - 1, delay * 2);
            }
            throw error;
        }
    }

    private mergeResults(dataList: IntelligenceData[]): IntelligenceData {
        const portsMap = new Map<number, PortResult>();
        const subdomainsMap = new Map<string, SubdomainResult>();
        let extraMerged = {};

        for (const data of dataList) {
            data.ports.forEach(p => {
                if (!portsMap.has(p.port)) {
                    portsMap.set(p.port, p);
                }
            });
            data.subdomains.forEach(s => {
                const key = s.subdomain.toLowerCase();
                if (!subdomainsMap.has(key)) {
                    subdomainsMap.set(key, s);
                }
            });
            extraMerged = { ...extraMerged, ...data.extra };
        }

        return {
            ports: Array.from(portsMap.values()),
            subdomains: Array.from(subdomainsMap.values()),
            extra: extraMerged
        };
    }
}
