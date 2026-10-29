import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { db } from '../db/database.js';
import * as schema from '../db/schema.js';
import { openAPI } from 'better-auth/plugins';
import { getEnv } from '../env.js';

export const auth = betterAuth({
  baseURL: getEnv('BETTER_AUTH_URL'),
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    openAPI({
      disableDefaultReference: true,
    }),
  ],
  trustedOrigins: ['http://localhost:3000', 'http://localhost:5173'],
});
