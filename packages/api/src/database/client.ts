import { config } from 'config.js'
import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { Database } from './database.js'

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: config.get('database.host'),
      database: config.get('database.name'),
      password: config.get('database.pass'),
      port: config.get('database.port'),
      user: config.get('database.user'),
    }),
  }),
})
