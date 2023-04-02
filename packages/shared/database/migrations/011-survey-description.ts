import { Kysely } from 'kysely'
import { surveysTable } from './004-survey.js'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(surveysTable).addColumn('description', 'jsonb').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(surveysTable).dropColumn('description').execute()
}
