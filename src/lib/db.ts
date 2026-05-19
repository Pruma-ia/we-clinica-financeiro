import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '@/db/schema'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  // eslint-disable-next-line no-console
  console.warn('[db] DATABASE_URL ausente em .env')
}

export const sql = neon(databaseUrl ?? 'postgresql://placeholder:placeholder@placeholder.neon.tech/placeholder')
export const db = drizzle(sql, { schema })

export type Database = typeof db
