import type { RequestHandler } from 'express';

/** Catch-all for unmatched routes. Registered after all real routes. */
export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `Route not found: ${req.method} ${req.originalUrl}` },
  });
};
