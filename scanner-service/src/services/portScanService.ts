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

    const finish = (state: 'open' | 'closed' | 'filtered') => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ port, state, service });
    };

    socket.setTimeout(timeoutMs);
    socket.connect(port, host, () => finish('open'));
    socket.on('error', () => finish('closed'));
    socket.on('timeout', () => finish('filtered'));
  });
}
