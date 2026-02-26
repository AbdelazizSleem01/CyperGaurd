import axios from 'axios';
import { BaseIntelligenceProvider, IntelligenceData } from './BaseProvider';
import { logger } from '../../../../shared/utils';

export class VirusTotalProvider extends BaseIntelligenceProvider {
    name = 'VirusTotal';
    private apiKey: string;

    constructor() {
        super();
        this.apiKey = process.env.VIRUSTOTAL_API_KEY || '';
    }

    async getDomainIntelligence(domain: string): Promise<IntelligenceData> {
        if (!this.apiKey) {
            throw new Error('VirusTotal API key is missing');
        }

        try {
            logger.info(`Fetching intelligence from VirusTotal for: ${domain}`);

            const response = await axios.get(
                `https://www.virustotal.com/api/v3/domains/${domain}/subdomains?limit=40`,
                {
                    headers: {
                        'x-apikey': this.apiKey
                    }
                }
            );

            const subdomains = response.data.data.map((item: any) => ({
                subdomain: item.id,
                status: 'active' // We assume active if VT has it, but validation happens later
            }));

            return {
                ports: [], // VT doesn't provide port info in the subdomains endpoint usually
                subdomains,
                extra: {
                    last_analysis_stats: response.data.meta?.last_analysis_stats
                }
            };
        } catch (error: any) {
            if (error.response?.status === 429) {
                throw new Error('QUOTA_EXCEEDED');
            }
            logger.error('VirusTotal provider error', { domain, error: error.message });
            throw error;
        }
    }
}
