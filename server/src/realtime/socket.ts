import type { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '../config/env';
import { logger } from '../lib/logger';

/**
 * Socket.IO bootstrap (Phase 0: connection plumbing only).
 *
 * Phase 6 will:
 *   - authenticate the handshake with the JWT access token,
 *   - join each socket to a per-user room (`user:<id>`),
 *   - let NotificationService.emit() push to that room.
 */
let io: SocketIOServer | null = null;

export function initSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: { origin: env.corsOrigins, credentials: true },
  });

  io.on('connection', (socket) => {
    logger.debug({ socketId: socket.id }, 'socket connected');
    socket.on('disconnect', (reason) => {
      logger.debug({ socketId: socket.id, reason }, 'socket disconnected');
    });
  });

  logger.info('Socket.IO initialized');
  return io;
}

export function getIo(): SocketIOServer {
  if (!io) throw new Error('Socket.IO not initialized — call initSocket() first');
  return io;
}
