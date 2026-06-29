import pino from 'pino';
import { env } from '../config/env';

/**
 * Structured logger. Pretty-printed in dev, JSON in prod.
 * Request-scoped logging is wired via pino-http in app.ts.
 */
export const logger = pino({
  level: env.isProd ? 'info' : 'debug',
  transport: env.isProd
    ? undefined
    : {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
      },
});
