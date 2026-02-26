import axios from 'axios';
import { BaseIntelligenceProvider, IntelligenceData } from './BaseProvider';
import { logger } from '../../../../shared/utils';
import { PortResult } from '../../../../shared/types';

export class ShodanProvider extends BaseIntelligenceProvider {
    name = 'Shodan';
    private apiKey: string;

    constructor() {
        super();
        this.apiKey = process.env.SHODAN_API_KEY || '';
    }

    async getDomainIntelligence(domain: string): Promise<IntelligenceData> {
        if (!this.apiKey) {
            throw new Error('Shodan API key is missing');
        }

        try {
            logger.info(`Fetching intelligence from Shodan for: ${domain}`);

            // Search for the domain in Shodan
            const searchRes = await axios.get(
                `https://api.shodan.io/shodan/host/search?key=${this.apiKey}&query=hostname:${domain}`
            );

            const ports: PortResult[] = [];
            const subdomainsSet = new Set<string>();

            if (searchRes.data.matches && searchRes.data.matches.length > 0) {
                for (const match of searchRes.data.matches) {
                    // Collect ports
                    if (match.port) {
                        ports.push({
                            port: match.port,
                            service: match.product || match._shodan?.module || 'unknown',
                            state: 'open'
                        });
                    }
                    // Collect hostnames/subdomains
                    if (match.hostnames) {
                        match.hostnames.forEach((hn: string) => {
                            if (hn.endsWith(domain)) {
                                subdomainsSet.add(hn.toLowerCase());
                            }
                        });
                    }
                }
            }

            // Deduplicate ports
            const uniquePorts = Array.from(new Map(ports.map(p => [p.port, p])).values());

            return {
                ports: uniquePorts,
                subdomains: Array.from(subdomainsSet).map(s => ({ subdomain: s, status: 'active' })),
                extra: {
                    total_results: searchRes.data.total
                }
            };
        } catch (error: any) {
            if (error.response?.status === 429) {
                throw new Error('QUOTA_EXCEEDED');
            }
            logger.error('Shodan provider error', { domain, error: error.message });
            throw error;
        }
    }
}
