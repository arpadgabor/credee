import { Kysely } from 'kysely'
import { redditPostsTable } from './001-reddit-posts.js'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(redditPostsTable).addColumn('flair', 'varchar(255)').execute()

  await db.schema.createIndex('reddit_posts_flair_index').on(redditPostsTable).column('flair').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(redditPostsTable).dropColumn('flair').execute()
}
