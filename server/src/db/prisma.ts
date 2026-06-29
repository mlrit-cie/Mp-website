/**
 * Database access layer.
 *
 * Phase 0 (scaffolding): Prisma is NOT instantiated yet because the schema has
 * no models (`prisma generate` needs at least one). The DB probe therefore
 * reports "not configured" so the server boots and serves health checks.
 *
 * Phase 2 (database schema & models) will replace this file with the real
 * PrismaClient singleton — the public surface (`checkDatabase`,
 * `disconnectPrisma`) stays the same so nothing downstream changes:
 *
 *   import { PrismaClient } from '@prisma/client';
 *   export const prisma = new PrismaClient({ log: env.isDev ? ['warn','error'] : ['error'] });
 *   export async function checkDatabase() {
 *     try { await prisma.$queryRaw`SELECT 1`; return { configured: true, up: true }; }
 *     catch { return { configured: true, up: false }; }
 *   }
 */

export interface DatabaseStatus {
  configured: boolean;
  up: boolean;
}

export async function checkDatabase(): Promise<DatabaseStatus> {
  return { configured: false, up: false };
}

export async function disconnectPrisma(): Promise<void> {
  // no-op until Prisma is wired in Phase 2
}
