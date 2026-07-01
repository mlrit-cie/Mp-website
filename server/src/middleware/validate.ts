import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';

/**
 * Validates a request part against a zod schema and replaces it with the parsed
 * (typed, stripped) value. A ZodError is forwarded to the central errorHandler,
 * which maps it to a 422 envelope.
 */
export const validate =
  (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body'): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    req[source] = result.data;
    next();
  };
