import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';
import { env } from '../config/env';

/**
 * Centralized error handler. Maps domain/validation errors to the standard
 * envelope: { error: { code, message, details? } }.
 * Must be registered LAST in the middleware chain.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // Zod validation failures
  if (err instanceof ZodError) {
    res.status(422).json({
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: err.flatten() },
    });
    return;
  }

  // Known domain errors
  if (err instanceof AppError) {
    if (err.statusCode >= 500) req.log?.error({ err }, err.message);
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  // Unknown / unexpected
  req.log?.error({ err }, 'Unhandled error');
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: env.isProd ? 'Something went wrong' : String((err as Error)?.message ?? err),
    },
  });
};
