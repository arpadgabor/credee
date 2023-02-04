import { Kysely } from 'kysely'
import { redditPostsTable } from './001-reddit-posts.js'
import { surveysTable } from './004-survey.js'

const surveyRedditDatasetTable = 'survey_reddit_dataset'
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(surveyRedditDatasetTable)
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('post_variant_id', 'integer', col => col.references(`${redditPostsTable}.id`).onDelete('restrict').notNull())
    .addColumn('survey_id', 'integer', col => col.references(`${surveysTable}.id`).onDelete('restrict').notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(surveyRedditDatasetTable).execute()
}
