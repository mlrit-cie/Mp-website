import { z } from 'zod';
import { env } from '../../config/env';

/** Email must be within the allowed institutional domain (e.g. @mlrit.ac.in). */
const institutionalEmail = z
  .string()
  .email('A valid email is required')
  .refine(
    (e) => e.toLowerCase().endsWith(`@${env.ALLOWED_EMAIL_DOMAIN.toLowerCase()}`),
    `Email must be a @${env.ALLOWED_EMAIL_DOMAIN} address`
  );

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(120),
  email: institutionalEmail,
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
