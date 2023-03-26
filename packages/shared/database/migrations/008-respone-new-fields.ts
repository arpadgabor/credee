import { Kysely } from 'kysely'
import { participantsTable, responsesTable } from './004-survey.js'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(responsesTable)
    .addColumn('content_style', 'text')
    .addColumn('content_style_other', 'text')
    .addColumn('content_style_effect', 'int2')
    .addColumn('topic_familiarity', 'int2')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(responsesTable)
    .dropColumn('content_style')
    .dropColumn('content_style_other')
    .dropColumn('content_style_effect')
    .dropColumn('topic_familiarity')
    .execute()
}
