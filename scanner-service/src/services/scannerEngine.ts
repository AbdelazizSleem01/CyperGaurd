'use strict';

import { ScanResult } from '../../../database/models/ScanResult';
import { scanPorts } from './portScanService';
import { checkSsl } from './sslService';
import { enumerateSubdomains } from './subdomainService';
import { scanDirectories } from './directoryScanService';
import { logger } from '../../../shared/utils';
import { notifyScanComplete } from './notificationService';

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

        // 1. Port Scan
        if (scanTypes.includes('port-scan')) {
            try {
                results.ports = await scanPorts(domain);
            } catch (err) {
                logger.error('Port scan failed', { domain, error: String(err) });
            }
        }

        // 2. SSL Check
        if (scanTypes.includes('ssl-check')) {
            try {
                results.ssl = await checkSsl(domain);
            } catch (err) {
                logger.error('SSL check failed', { domain, error: String(err) });
            }
        }

        // 3. Subdomain Enumeration
        if (scanTypes.includes('subdomain-enum') || scanTypes.includes('combined')) {
            try {
                results.subdomains = await enumerateSubdomains(domain);
            } catch (err) {
                logger.error('Subdomain enumeration failed', { domain, error: String(err) });
            }
        }

        // 4. Directory Discovery (New!)
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
