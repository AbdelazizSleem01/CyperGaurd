import { BaseIntelligenceProvider, IntelligenceData } from './BaseProvider';
import { enumerateSubdomains } from '../subdomainService';
import { scanPorts } from '../portScanService';
import { logger } from '../../../../shared/utils';

export class LocalFallbackProvider extends BaseIntelligenceProvider {
    name = 'LocalFallback';

    async getDomainIntelligence(domain: string): Promise<IntelligenceData> {
        logger.info(`Running local fallback scan for: ${domain}`);

        // We can run these in parallel
        const [subdomains, ports] = await Promise.all([
            enumerateSubdomains(domain),
            scanPorts(domain)
        ]);

        return {
            ports,
            subdomains,
            extra: {
                source: 'internal_tools'
            }
        };
    }
}
