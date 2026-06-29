import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { logger } from './lib/logger';
import api from './routes';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

/**
 * Builds the Express app with the full middleware pipeline but does NOT
 * start listening — so tests (supertest) and server.ts can both use it.
 *
 * Pipeline order:
 *   helmet → cors → body parsers → cookies → request logger
 *   → rate limit → routes → 404 → error handler
 */
export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(pinoHttp({ logger }));

  // Global rate limit (tighter limits will be added on /auth in Phase 1).
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 1000,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
    }),
  );

  // Liveness at root for simple uptime checks; full API under /api.
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api', api);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
