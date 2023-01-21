import { config } from '../config.js'
import { Kysely, PostgresDialect, RawBuilder, sql } from 'kysely'
import pg from 'pg'
import { Database } from './database.js'

const pool = new pg.Pool({
  host: config.get('database.host'),
  database: config.get('database.name'),
  password: config.get('database.pass'),
  port: config.get('database.port'),
  user: config.get('database.user'),
  connectionTimeoutMillis: 5000,
})

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
})

export function json<T>(obj: T): RawBuilder<T> {
  return sql`${JSON.stringify(obj)}`
}
