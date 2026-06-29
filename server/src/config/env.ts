import 'dotenv/config';
import { z } from 'zod';

/**
 * Single source of truth for runtime configuration.
 * Validated once at boot — the process refuses to start on bad config.
 */
const EnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3001),

    DATABASE_URL: z
      .string()
      .min(1)
      .default('postgresql://postgres:postgres@localhost:5432/mlrit_project_hub?schema=public'),

    JWT_ACCESS_SECRET: z.string().min(1).default('dev-access-secret-change-me'),
    JWT_REFRESH_SECRET: z.string().min(1).default('dev-refresh-secret-change-me'),
    ACCESS_TOKEN_TTL: z.string().default('15m'),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),

    CORS_ORIGINS: z.string().default('http://localhost:8080,http://localhost:8081'),
    ALLOWED_EMAIL_DOMAIN: z.string().default('mlrit.ac.in'),

    STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
    UPLOAD_DIR: z.string().default('var/uploads'),
  })
  .superRefine((val, ctx) => {
    // Never allow the dev secret defaults to leak into production.
    if (val.NODE_ENV === 'production') {
      if (val.JWT_ACCESS_SECRET.includes('change-me')) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['JWT_ACCESS_SECRET'], message: 'Must be set in production' });
      }
      if (val.JWT_REFRESH_SECRET.includes('change-me')) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['JWT_REFRESH_SECRET'], message: 'Must be set in production' });
      }
    }
  });

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:\n', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const raw = parsed.data;

export const env = {
  ...raw,
  isProd: raw.NODE_ENV === 'production',
  isDev: raw.NODE_ENV === 'development',
  isTest: raw.NODE_ENV === 'test',
  corsOrigins: raw.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
};

export type Env = typeof env;
