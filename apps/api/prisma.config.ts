import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

config({ path: '../../.env' }); // repo-root .env
config(); // optional apps/api/.env override

export default defineConfig({
  schema: 'prisma/schema',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
