import type { RequestHandler } from 'express';
import { UnauthorizedError, PendingApprovalError } from '../lib/errors';

/**
 * Gates protected routes behind admin approval. Login itself succeeds for
 * unapproved users (so the frontend can show the pending screen); this returns
 * 403 PENDING_APPROVAL until an admin approves them.
 * Must run after requireAuth.
 */
export const requireApproved: RequestHandler = (req, _res, next) => {
  if (!req.user) return next(new UnauthorizedError());
  if (!req.user.approved) return next(new PendingApprovalError());
  next();
};
