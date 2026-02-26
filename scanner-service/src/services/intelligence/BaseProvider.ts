import { PortResult, SubdomainResult } from '../../../../shared/types';

export interface IntelligenceData {
    ports: PortResult[];
    subdomains: SubdomainResult[];
    vulnerabilities?: any[];
    extra?: Record<string, any>;
}

export interface IIntelligenceProvider {
    name: string;
    getDomainIntelligence(domain: string): Promise<IntelligenceData>;
}

export abstract class BaseIntelligenceProvider implements IIntelligenceProvider {
    abstract name: string;
    abstract getDomainIntelligence(domain: string): Promise<IntelligenceData>;

    protected async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
