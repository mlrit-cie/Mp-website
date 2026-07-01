import 'express';

/**
 * Request augmentation. `req.user` is populated by the auth middleware
 * (added in Phase 1); declared here so the whole codebase is type-aware now.
 */
declare global {
  namespace Express {
    interface AuthenticatedUser {
      id: string; // UUID (matches Prisma String @id)
      role: 'admin' | 'faculty' | 'student_mentor' | 'student';
      approved: boolean;
      email: string;
    }

    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
