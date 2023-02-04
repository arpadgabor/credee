import { Kysely, sql } from 'kysely'
import { redditPostsTable } from './001-reddit-posts.js'

export const surveysTable = 'surveys'
export const participantsTable = 'participants'
export const responsesTable = 'responses_credibility'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(surveysTable)
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('title', 'varchar(255)', col => col.notNull())
    .addColumn('ends_at', 'timestamptz')
    .execute()

  await db.schema
    .createTable(participantsTable)
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('survey_id', 'integer', col => col.references(`${surveysTable}.id`).notNull().onDelete('set null'))
    .addColumn('external_platform', 'varchar(16)', col => col.notNull())
    .addColumn('external_participant_id', 'varchar(64)', col => col.notNull())
    .addColumn('age_range', 'varchar(32)')
    .addColumn('gender', 'varchar(32)')
    .addColumn('nationality', 'varchar(32)')
    .addColumn('marital_status', 'varchar(32)')
    .addColumn('academic_status', 'varchar(32)')
    .addColumn('employment_status', 'varchar(32)')
    .addColumn('annual_income_level', 'varchar(32)')
    .addColumn('onboarding_answers', 'jsonb', col => col.defaultTo(sql`'{}'::jsonb`))
    .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`now()`))
    .execute()

  await db.schema
    .createTable(responsesTable)
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('survey_id', 'integer', col => col.references(`${surveysTable}.id`).notNull().onDelete('set null'))
    .addColumn('participant_id', 'integer', col => col.references(`${participantsTable}.id`).notNull().onDelete('set null'))
    .addColumn('post_id', 'varchar(255)', col => col.notNull())
    .addColumn('post_variant_id', 'integer', col => col.references(`${redditPostsTable}.id`).notNull().onDelete('set null'))
    .addColumn('credibility', 'int2', col => col.notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(responsesTable).execute()
  await db.schema.dropTable(participantsTable).execute()
  await db.schema.dropTable(surveysTable).execute()
}
