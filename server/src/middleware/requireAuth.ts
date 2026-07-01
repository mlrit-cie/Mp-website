import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { UnauthorizedError } from '../lib/errors';

/**
 * Verifies the Bearer access token and attaches `req.user`.
 * 401 if the header is missing/malformed or the token is invalid/expired.
 */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new UnauthorizedError());
  }
  try {
    const payload = verifyAccessToken(header.slice('Bearer '.length));
    req.user = {
      id: payload.sub,
      role: payload.role,
      approved: payload.approved,
      email: payload.email,
    };
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};
