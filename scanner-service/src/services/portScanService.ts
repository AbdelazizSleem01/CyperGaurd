import net from 'net';
import { logger } from '../../../shared/utils';
import type { PortResult } from '../../../shared/types';

// Common ports with their typical services
const COMMON_PORTS: [number, string][] = [
  [21, 'ftp'],
  [22, 'ssh'],
  [23, 'telnet'],
  [25, 'smtp'],
  [53, 'dns'],
  [80, 'http'],
  [110, 'pop3'],
  [143, 'imap'],
  [443, 'https'],
  [445, 'smb'],
  [3306, 'mysql'],
  [3389, 'rdp'],
  [5432, 'postgresql'],
  [5900, 'vnc'],
  [6379, 'redis'],
  [8080, 'http-alt'],
  [8443, 'https-alt'],
  [27017, 'mongodb'],
];

export async function scanPorts(
  host: string,
  ports: [number, string][] = COMMON_PORTS,
  timeoutMs = 3000
): Promise<PortResult[]> {
  const results = await Promise.allSettled(
    ports.map(([port, service]) => checkPort(host, port, service, timeoutMs))
  );

  const portResults: PortResult[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      portResults.push(result.value);
    }
  }

  logger.info('Port scan completed', { host, openPorts: portResults.filter((r) => r.state === 'open').length });
  return portResults.filter((r) => r.state === 'open'); // Only return open ports
}

function checkPort(
  host: string,
  port: number,
  service: string,
  timeoutMs: number
): Promise<PortResult> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;
    let banner = '';

    const finish = (state: 'open' | 'closed' | 'filtered') => {
      if (settled) return;
      settled = true;
      socket.destroy();
      const result: PortResult = { port, state, service };
      // mirror service into product if available (helps UI show something)
      if (service) {
        result.product = service;
      }
      if (banner) {
        // take first line or header for brevity
        result.banner = banner.split('\r\n')[0] || banner;
      }
      resolve(result);
    };

    socket.setTimeout(timeoutMs);
    socket.connect(port, host, () => {
      // attempt a basic banner request for HTTP-like services
      if (service.includes('http') || port === 80 || port === 443) {
        socket.write('HEAD / HTTP/1.0\r\nHost: ' + host + '\r\n\r\n');
      }
    });

    socket.on('data', (data) => {
      // accumulate data but do not wait too long
      banner += data.toString();
      // after receiving some bytes, we can close connection
      if (banner.length > 0) {
        finish('open');
      }
    });

    socket.on('error', () => finish('closed'));
    socket.on('timeout', () => finish('filtered'));
    socket.on('close', () => {
      if (!settled) {
        // if closed without data it's still open
        finish('open');
      }
    });
  });
}
