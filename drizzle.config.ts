import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'
import { requiredEnv } from './lib/env'

const databaseUrl = requiredEnv('DATABASE_URL')

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
})
