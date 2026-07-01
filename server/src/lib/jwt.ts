/**
 * JWT access tokens + refresh-token crypto.
 *
 * - Access token: short-lived (env.ACCESS_TOKEN_TTL) HS256 JWT, sent as a Bearer
 *   header, verified per request by requireAuth.
 * - Refresh token: opaque high-entropy random string (NOT a JWT). The raw value
 *   goes in an httpOnly cookie; only its SHA-256 hash is stored in the DB.
 */
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { UserRole } from '@prisma/client';
import { env } from '../config/env';

export interface AccessTokenPayload {
  sub: string; // userId
  role: UserRole;
  approved: boolean;
  email: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload & jwt.JwtPayload;
}

/** New opaque refresh token: the raw value (for the cookie) + its stored hash + expiry. */
export function createRefreshToken(): { raw: string; hash: string; expiresAt: Date } {
  const raw = crypto.randomBytes(48).toString('base64url');
  return {
    raw,
    hash: hashRefreshToken(raw),
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
  };
}

/** SHA-256 is fine here (the token is high-entropy random, unlike a password). */
export function hashRefreshToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}
