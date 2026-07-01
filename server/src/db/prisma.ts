/**
 * Database access layer — the real PrismaClient singleton.
 *
 * Public surface (`prisma`, `checkDatabase`, `disconnectPrisma`) is unchanged from
 * the Phase-0 stub, so `server.ts` and the health module don't need edits.
 *
 * A single client is reused across the process; in dev we stash it on `globalThis`
 * so tsx/nodemon hot-reloads don't open a new connection pool on every reload.
 */

import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isDev ? ['warn', 'error'] : ['error'],
  });

if (env.isDev) globalForPrisma.prisma = prisma;

export interface DatabaseStatus {
  configured: boolean;
  up: boolean;
}

/** Lightweight liveness probe used by the health endpoint. */
export async function checkDatabase(): Promise<DatabaseStatus> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { configured: true, up: true };
  } catch {
    // Client is wired, but the DB isn't reachable yet (e.g. no Postgres running).
    return { configured: true, up: false };
  }
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
