import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { requiredEnv } from '../env'
import * as schema from './schema'

const databaseUrl = requiredEnv('DATABASE_URL')
const sql = neon(databaseUrl)
export const db = drizzle({ client: sql, schema })
