import { Kysely, sql } from 'kysely'
import { responsesTable } from './004-survey.js'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(responsesTable)
    .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`now()`))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(responsesTable).dropColumn('created_at').execute()
}
