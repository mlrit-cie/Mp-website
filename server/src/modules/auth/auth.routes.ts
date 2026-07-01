import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/requireAuth';
import { asyncHandler } from '../../lib/asyncHandler';
import { registerSchema, loginSchema } from './auth.schema';
import * as authController from './auth.controller';

/**
 * Auth routes. Tighter rate limit than the global one to blunt brute-force /
 * credential-stuffing on the credential endpoints.
 */
const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30, // per IP per window across auth endpoints
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many attempts, try again later' } },
});

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(authController.register));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', authLimiter, asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));
router.get('/me', requireAuth, asyncHandler(authController.me));

export default router;
