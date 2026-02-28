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

        // derive a few simple vulnerability hints based on ports
        const vulnerabilities: any[] = [];
        const dangerousPorts: Record<number, { title: string; description: string; severity: string }> = {
            21: { title: 'FTP Service Exposed', description: 'FTP is unencrypted and often targeted by attackers.', severity: 'high' },
            23: { title: 'Telnet Service Exposed', description: 'Telnet transmits data in plaintext.', severity: 'critical' },
            3389: { title: 'RDP Service Exposed', description: 'Remote Desktop exposed publicly can be abused.', severity: 'high' }
        };
        ports.forEach(p => {
            if (dangerousPorts[p.port]) {
                const info = dangerousPorts[p.port];
                vulnerabilities.push({
                    title: info.title,
                    description: info.description,
                    severity: info.severity,
                    source: 'local-fallback'
                });
            }
        });

        return {
            ports,
            subdomains,
            vulnerabilities,
            extra: {
                source: 'internal_tools'
            }
        };
    }
}
