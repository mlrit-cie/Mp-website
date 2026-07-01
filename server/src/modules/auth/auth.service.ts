/**
 * Auth service — all authentication business logic.
 *
 * Token model:
 * - Access JWT (short-lived) returned in the JSON body → frontend keeps it in memory.
 * - Refresh token (opaque, hashed in DB) → httpOnly cookie, rotated on every use
 *   with reuse detection.
 *
 * Approval: register/login SUCCEED for unapproved users (so the pending screen
 * can show); protected routes are gated by requireApproved.
 */
import type { User, UserRole } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { hashPassword, verifyPassword } from '../../lib/hash';
import { signAccessToken, createRefreshToken, hashRefreshToken } from '../../lib/jwt';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../lib/errors';
import type { RegisterInput, LoginInput } from './auth.schema';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  approved: boolean;
  sectionId: string | null;
  department: string | null;
  rollNumber: string | null;
  phone: string | null;
  githubLink: string | null;
  linkedinLink: string | null;
  avatar: string | null;
}

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

/** Never leak passwordHash / googleSub to the client. */
export function toPublicUser(u: User): PublicUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    approved: u.approved,
    sectionId: u.sectionId,
    department: u.department,
    rollNumber: u.rollNumber,
    phone: u.phone,
    githubLink: u.githubLink,
    linkedinLink: u.linkedinLink,
    avatar: u.avatar,
  };
}

/** Default role inferred from the email (admin can override later). Mirrors the frontend. */
export function getRoleFromEmail(email: string): UserRole {
  const e = email.toLowerCase();
  if (e.includes('admin')) return 'admin';
  if (e.includes('faculty')) return 'faculty';
  if (e.includes('mentor')) return 'student_mentor';
  return 'student';
}

async function issueTokens(user: User, userAgent?: string): Promise<Omit<AuthResult, 'user'>> {
  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    approved: user.approved,
    email: user.email,
  });
  const refresh = createRefreshToken();
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refresh.hash,
      userAgent: userAgent ?? null,
      expiresAt: refresh.expiresAt,
    },
  });
  return { accessToken, refreshToken: refresh.raw, refreshExpiresAt: refresh.expiresAt };
}

export async function register(input: RegisterInput, userAgent?: string): Promise<AuthResult> {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ConflictError('An account with this email already exists');

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email,
      passwordHash: await hashPassword(input.password),
      role: getRoleFromEmail(email),
      approved: false,
    },
  });

  return { user: toPublicUser(user), ...(await issueTokens(user, userAgent)) };
}

export async function login(input: LoginInput, userAgent?: string): Promise<AuthResult> {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  // Same error whether the email is unknown or the password is wrong (no user enumeration).
  if (!user || !user.passwordHash) throw new UnauthorizedError('Invalid email or password');

  const ok = await verifyPassword(user.passwordHash, input.password);
  if (!ok) throw new UnauthorizedError('Invalid email or password');

  return { user: toPublicUser(user), ...(await issueTokens(user, userAgent)) };
}

export async function refresh(rawToken: string | undefined, userAgent?: string): Promise<AuthResult> {
  if (!rawToken) throw new UnauthorizedError('Missing refresh token');
  const tokenHash = hashRefreshToken(rawToken);
  const row = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!row) throw new UnauthorizedError('Invalid refresh token');

  // Reuse detection: a revoked token presented again → someone has an old copy.
  // Revoke every active token for that user and force re-login.
  if (row.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: row.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new UnauthorizedError('Refresh token reuse detected — please sign in again');
  }

  if (row.expiresAt.getTime() < Date.now()) {
    throw new UnauthorizedError('Refresh token expired');
  }

  const user = await prisma.user.findUnique({ where: { id: row.userId } });
  if (!user) throw new UnauthorizedError('Invalid refresh token');

  // Rotate: revoke the presented token, issue a fresh pair.
  await prisma.refreshToken.update({ where: { id: row.id }, data: { revokedAt: new Date() } });

  return { user: toPublicUser(user), ...(await issueTokens(user, userAgent)) };
}

export async function logout(rawToken: string | undefined): Promise<void> {
  if (!rawToken) return;
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashRefreshToken(rawToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getMe(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');
  return toPublicUser(user);
}
