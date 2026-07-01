import type { Request, Response, CookieOptions } from 'express';
import { env } from '../../config/env';
import * as authService from './auth.service';

/**
 * Controllers: parse the request, call the service, shape the HTTP response.
 * The refresh token travels ONLY as an httpOnly cookie scoped to /api/auth,
 * so it's never readable by JS and only sent to the refresh/logout routes.
 */

const REFRESH_COOKIE = 'refresh_token';

function refreshCookieOptions(expires?: Date): CookieOptions {
  return {
    httpOnly: true,
    secure: env.isProd, // requires HTTPS in production
    sameSite: 'strict',
    path: '/api/auth',
    ...(expires ? { expires } : {}),
  };
}

function setRefreshCookie(res: Response, raw: string, expiresAt: Date): void {
  res.cookie(REFRESH_COOKIE, raw, refreshCookieOptions(expiresAt));
}

export async function register(req: Request, res: Response): Promise<void> {
  const result = await authService.register(req.body, req.headers['user-agent']);
  setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
  res.status(201).json({ user: result.user, accessToken: result.accessToken });
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body, req.headers['user-agent']);
  setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
  res.json({ user: result.user, accessToken: result.accessToken });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  const result = await authService.refresh(raw, req.headers['user-agent']);
  setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
  res.json({ user: result.user, accessToken: result.accessToken });
}

export async function logout(req: Request, res: Response): Promise<void> {
  await authService.logout(req.cookies?.[REFRESH_COOKIE] as string | undefined);
  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
  res.json({ ok: true });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await authService.getMe(req.user!.id);
  res.json({ user });
}
