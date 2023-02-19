import { Kysely, sql } from 'kysely'
import { redditPostsTable } from './001-reddit-posts.js'
import { participantsTable } from './004-survey.js'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(participantsTable)
    .alterColumn('external_participant_id', t => t.dropNotNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(participantsTable)
    .alterColumn('external_participant_id', t => t.setNotNull())
    .execute()
}
