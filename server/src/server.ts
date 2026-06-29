import { createServer } from 'http';
import { createApp } from './app';
import { initSocket } from './realtime/socket';
import { env } from './config/env';
import { logger } from './lib/logger';
import { disconnectPrisma } from './db/prisma';

const app = createApp();
const httpServer = createServer(app);

// Realtime transport (Socket.IO) shares the HTTP server.
initSocket(httpServer);

const server = httpServer.listen(env.PORT, () => {
  logger.info(`🚀 API listening on http://localhost:${env.PORT}  (env: ${env.NODE_ENV})`);
  logger.info(`   Health: http://localhost:${env.PORT}/api/health`);
});

// Graceful shutdown
async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received — shutting down`);
  server.close(async () => {
    await disconnectPrisma();
    logger.info('Closed HTTP server and DB connection');
    process.exit(0);
  });
  // Force-exit if shutdown hangs.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
