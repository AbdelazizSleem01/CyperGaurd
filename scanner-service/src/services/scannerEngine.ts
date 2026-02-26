'use strict';

import { ScanResult } from '../../../database/models/ScanResult';
import { scanPorts } from './portScanService';
import { checkSsl } from './sslService';
import { enumerateSubdomains } from './subdomainService';
import { scanDirectories } from './directoryScanService';
import { logger } from '../../../shared/utils';
import { notifyScanComplete } from './notificationService';
import { IntelligenceOrchestrator } from './intelligence/IntelligenceOrchestrator';

export async function executeFullScan(scanId: string, companyId: string, domain: string, scanTypes: string[]): Promise<void> {
    try {
        logger.info('Executing real-time security scan', { scanId, domain, scanTypes });

        await ScanResult.findByIdAndUpdate(scanId, { status: 'running' });

        const results: any = {
            ports: [],
            ssl: null,
            subdomains: [],
            discoveredPaths: [],
            completedAt: new Date(),
        };

        const orchestrator = new IntelligenceOrchestrator();

        // 1. Unified Intelligence Scan (VT + Shodan + Fallback)
        let intelData = null;
        if (scanTypes.includes('port-scan') || scanTypes.includes('subdomain-enum') || scanTypes.includes('combined')) {
            try {
                intelData = await orchestrator.getSmartIntelligence(domain);
            } catch (err) {
                logger.error('Intelligence scan failed, proceeding with manual scans', { error: String(err) });
            }
        }

        // 2. Map Results back to specific scan types
        if (scanTypes.includes('port-scan')) {
            results.ports = intelData ? intelData.ports : await scanPorts(domain);
        }

        if (scanTypes.includes('ssl-check')) {
            try {
                results.ssl = await checkSsl(domain);
            } catch (err) {
                logger.error('SSL check failed', { domain, error: String(err) });
            }
        }

        if (scanTypes.includes('subdomain-enum') || scanTypes.includes('combined')) {
            results.subdomains = intelData ? intelData.subdomains : await enumerateSubdomains(domain);
        }

        // 4. Directory Discovery (Always manual as it requires active probing)
        if (scanTypes.includes('directory-scan') || scanTypes.includes('combined')) {
            try {
                results.discoveredPaths = await scanDirectories(domain);
            } catch (err) {
                logger.error('Directory discovery failed', { domain, error: String(err) });
            }
        }

        await ScanResult.findByIdAndUpdate(scanId, {
            ...results,
            status: 'completed'
        });

        logger.info('Security scan completed successfully', { scanId, domain });

        // Trigger notification
        try {
            await notifyScanComplete({
                companyId,
                scanType: scanTypes.join(', '),
                scanResultId: scanId,
            });
        } catch (notifyError) {
            logger.error('Failed to trigger scan completion notification', { scanId, error: String(notifyError) });
        }

    } catch (error) {
        logger.error('Major failure in scanner engine', { scanId, error: String(error) });
        await ScanResult.findByIdAndUpdate(scanId, {
            status: 'failed',
            error: String(error),
            completedAt: new Date(),
        });
    }
}
