import { Kysely } from 'kysely'

export const redditPostsTable = 'reddit_posts'
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(redditPostsTable).addColumn('screenshot_filename', 'varchar(255)').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(redditPostsTable).dropColumn('screenshot_filename').execute()
}
