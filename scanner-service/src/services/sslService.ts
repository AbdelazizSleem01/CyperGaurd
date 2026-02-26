import tls from 'tls';
import { logger } from '../../../shared/utils';
import type { SslResult } from '../../../shared/types';

const WEAK_CIPHERS = [
  'RC4', 'DES', '3DES', 'MD5', 'NULL', 'EXPORT', 'ANON', 'ADH', 'AECDH',
];

export async function checkSsl(domain: string, port = 443): Promise<SslResult> {
  return new Promise((resolve) => {
    const socket = tls.connect(
      { host: domain, port, servername: domain, timeout: 10_000, rejectUnauthorized: false },
      () => {
        try {
          const cert = socket.getPeerCertificate();
          const cipher = socket.getCipher();

          const validUntil = cert.valid_to ? new Date(cert.valid_to) : new Date(0);
          const daysUntilExpiry = Math.ceil(
            (validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          const weakCiphers = cipher?.name
            ? WEAK_CIPHERS.filter((wc) => cipher.name.includes(wc))
            : [];

          socket.destroy();
          resolve({
            domain,
            validUntil,
            issuer: cert.issuer?.O || 'Unknown',
            daysUntilExpiry,
            weakCiphers,
            isValid: daysUntilExpiry > 0 && weakCiphers.length === 0,
          });
        } catch (err) {
          socket.destroy();
          logger.error('SSL check parse error', { domain, error: String(err) });
          resolve(buildErrorResult(domain));
        }
      }
    );

    socket.on('error', (err) => {
      logger.error('SSL check connection error', { domain, error: String(err) });
      resolve(buildErrorResult(domain));
    });

    socket.setTimeout(10_000, () => {
      socket.destroy();
      resolve(buildErrorResult(domain));
    });
  });
}

function buildErrorResult(domain: string): SslResult {
  return {
    domain,
    validUntil: new Date(0),
    issuer: 'Unknown',
    daysUntilExpiry: -1,
    weakCiphers: [],
    isValid: false,
  };
}
