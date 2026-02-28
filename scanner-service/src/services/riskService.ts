import { v4 as uuidv4 } from 'uuid';
import { calculateRiskScore, getRiskCategory } from '../../../shared/utils';
import type {
  RiskFinding,
  RiskAssessment,
  ScanResult,
  BreachRecord,
  VulnerabilitySeverity,
} from '../../../shared/types';

interface AssessmentInput {
  scanResult: ScanResult;
  breaches: BreachRecord[];
  companyId: string;
}

export function buildRiskAssessment(input: AssessmentInput): Omit<RiskAssessment, '_id' | 'createdAt'> {
  const findings: RiskFinding[] = [];

  // ─── Open Ports ──────────────────────────────────────────────────────────
  const dangerousPorts: Record<number, { severity: VulnerabilitySeverity; desc: string }> = {
    21: { severity: 'high', desc: 'FTP is unencrypted and should be replaced with SFTP.' },
    23: { severity: 'critical', desc: 'Telnet transmits data in plaintext. Disable immediately.' },
    3389: { severity: 'high', desc: 'RDP exposed to internet is a frequent ransomware vector.' },
    5900: { severity: 'high', desc: 'VNC is often poorly secured; restrict access.' },
    6379: { severity: 'critical', desc: 'Redis exposed without auth is a major risk.' },
    27017: { severity: 'critical', desc: 'MongoDB exposed without auth can lead to data exfiltration.' },
    3306: { severity: 'high', desc: 'MySQL should not be publicly accessible.' },
    5432: { severity: 'high', desc: 'PostgreSQL should not be publicly accessible.' },
  };

  for (const port of input.scanResult.ports) {
    const info = dangerousPorts[port.port];
    if (info) {
      findings.push({
        id: uuidv4(),
        category: 'Open Ports',
        title: `Exposed ${port.service.toUpperCase()} Port (${port.port})`,
        description: info.desc,
        severity: info.severity,
        recommendation: `Close or firewall port ${port.port} unless strictly required. Use VPN for administrative access.`,
        affectedAsset: `${input.scanResult.domain}:${port.port}`,
      });
    }
  }

  // ─── SSL Issues ───────────────────────────────────────────────────────────
  if (input.scanResult.ssl) {
    const ssl = input.scanResult.ssl;
    if (ssl.daysUntilExpiry <= 0) {
      findings.push({
        id: uuidv4(),
        category: 'SSL/TLS',
        title: 'SSL Certificate Expired',
        description: `The SSL certificate for ${ssl.domain} has expired.`,
        severity: 'critical',
        recommendation: 'Renew the SSL certificate immediately. Consider using Let\'s Encrypt with auto-renewal.',
        affectedAsset: ssl.domain,
      });
    } else if (ssl.daysUntilExpiry <= 30) {
      findings.push({
        id: uuidv4(),
        category: 'SSL/TLS',
        title: 'SSL Certificate Expiring Soon',
        description: `SSL certificate expires in ${ssl.daysUntilExpiry} days.`,
        severity: 'medium',
        recommendation: 'Renew the SSL certificate before expiry.',
        affectedAsset: ssl.domain,
      });
    }

    for (const cipher of ssl.weakCiphers) {
      findings.push({
        id: uuidv4(),
        category: 'SSL/TLS',
        title: `Weak Cipher Suite Detected: ${cipher}`,
        description: `The server supports the deprecated cipher ${cipher}.`,
        severity: 'high',
        recommendation: 'Disable weak cipher suites and use only TLS 1.2+ with strong ciphers (AES-GCM, ChaCha20).',
        affectedAsset: ssl.domain,
      });
    }
  }

  // ─── Credential Exposures ─────────────────────────────────────────────────
  if (input.breaches.length > 0) {
    const criticalBreaches = input.breaches.filter((b) => b.severity === 'critical');
    const highBreaches = input.breaches.filter((b) => b.severity === 'high');

    if (criticalBreaches.length > 0) {
      findings.push({
        id: uuidv4(),
        category: 'Credential Exposure',
        title: `${criticalBreaches.length} Critical Credential Exposure(s) Found`,
        description: `Emails with passwords found in breach databases: ${criticalBreaches.map((b) => b.email).join(', ')}`,
        severity: 'critical',
        recommendation: 'Force password resets for all affected accounts. Implement MFA immediately.',
        affectedAsset: criticalBreaches.map((b) => b.email).join(', '),
      });
    }

    if (highBreaches.length > 0) {
      findings.push({
        id: uuidv4(),
        category: 'Credential Exposure',
        title: `${highBreaches.length} High-Severity Breach(es) Detected`,
        description: 'Employee emails found in data breach databases.',
        severity: 'high',
        recommendation: 'Review affected accounts and rotate credentials. Monitor for suspicious activity.',
        affectedAsset: highBreaches.map((b) => b.email).join(', '),
      });
    }
  }

  // ─── Outdated Software ────────────────────────────────────────────────────
  for (const sw of input.scanResult.outdatedSoftware) {
    findings.push({
      id: uuidv4(),
      category: 'Outdated Software',
      title: `${sw.name} Outdated (${sw.currentVersion} → ${sw.latestVersion})`,
      description: `Running an outdated version of ${sw.name} may contain known vulnerabilities.`,
      severity: sw.severity as VulnerabilitySeverity,
      recommendation: `Update ${sw.name} to version ${sw.latestVersion} as soon as possible.`,
      affectedAsset: input.scanResult.domain,
    });
  }

  // ─── Additional Vulnerabilities Provided by Intelligence ────────────────
  if (input.scanResult.vulnerabilities) {
    for (const vuln of input.scanResult.vulnerabilities) {
      findings.push({
        id: uuidv4(),
        category: 'External Vulnerability',
        title: vuln.title,
        description: vuln.description,
        severity: vuln.severity as VulnerabilitySeverity,
        recommendation: vuln.recommendation || '',
        affectedAsset: input.scanResult.domain,
      });
    }
  }

  const score = calculateRiskScore(findings);
  const category = getRiskCategory(score);

  return {
    companyId: input.companyId,
    scanId: input.scanResult._id,
    score,
    category,
    findings,
  };
}
