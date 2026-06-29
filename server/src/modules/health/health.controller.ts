import type { Request, Response } from 'express';
import { checkDatabase } from '../../db/prisma';
import { env } from '../../config/env';

/**
 * Liveness — process is up. Never touches the DB so it always answers fast.
 */
export function getHealth(_req: Request, res: Response): void {
  res.json({
    status: 'ok',
    service: 'mlrit-project-hub-server',
    env: env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Readiness — process + database reachable.
 * Until Prisma is wired (Phase 2) this reports `not_configured`.
 */
export async function getDbHealth(_req: Request, res: Response): Promise<void> {
  const { configured, up } = await checkDatabase();
  const timestamp = new Date().toISOString();

  if (!configured) {
    res.status(200).json({
      status: 'ok',
      database: 'not_configured',
      note: 'Prisma models land in Phase 2',
      timestamp,
    });
    return;
  }

  res.status(up ? 200 : 503).json({
    status: up ? 'ok' : 'degraded',
    database: up ? 'up' : 'down',
    timestamp,
  });
}
