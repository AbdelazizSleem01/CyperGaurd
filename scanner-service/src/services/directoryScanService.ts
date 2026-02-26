'use strict';

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { logger } from '../../../shared/utils';

const WORDLIST_PATH = path.join(__dirname, '../../data/wordlists/directories.txt');

export interface DirectoryResult {
    path: string;
    status: number;
    type: string;
}

export async function scanDirectories(domain: string): Promise<DirectoryResult[]> {
    try {
        if (!fs.existsSync(WORDLIST_PATH)) {
            logger.warn('Directory wordlist not found', { path: WORDLIST_PATH });
            return [];
        }

        const content = fs.readFileSync(WORDLIST_PATH, 'utf-8');
        const paths = content.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'))
            .slice(0, 100); // Limit to top 100 for performance

        const baseUrl = `http://${domain}`;
        const results: DirectoryResult[] = [];

        logger.info('Starting directory scan', { domain, pathsCount: paths.length });

        // Use a small concurrency limit to avoid overwhelming the target
        const batchSize = 10;
        for (let i = 0; i < paths.length; i += batchSize) {
            const batch = paths.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(async (p) => {
                    try {
                        const fullPath = p.startsWith('/') ? p : `/${p}`;
                        const response = await axios.get(`${baseUrl}${fullPath}`, {
                            timeout: 5000,
                            validateStatus: (status) => status < 500, // Identify 404, 403, 200, etc.
                            maxRedirects: 2,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CyberSecScanner/1.0',
                            }
                        });

                        if (response.status === 200) {
                            return {
                                path: fullPath,
                                status: response.status,
                                type: 'sensitive-file'
                            };
                        }
                        return null;
                    } catch (err: any) {
                        // Ignore connection errors/timeouts for specific paths
                        return null;
                    }
                })
            );

            results.push(...batchResults.filter((r): r is DirectoryResult => r !== null));
        }

        logger.info('Directory scan completed', { domain, findings: results.length });
        return results;
    } catch (error) {
        logger.error('Directory scan service failed', { domain, error: String(error) });
        return [];
    }
}
