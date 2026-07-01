import type { RequestHandler } from 'express';
import type { UserRole } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../lib/errors';

/**
 * Coarse RBAC (mirrors the frontend RoleGate). Fine-grained resource scoping
 * (own team, assigned sections, etc.) lives in the services.
 * Must run after requireAuth.
 */
export const requireRole =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) return next(new ForbiddenError());
    next();
  };
