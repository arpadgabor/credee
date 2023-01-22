import { Kysely, sql } from 'kysely'

const redditPostsTable = 'reddit_posts'
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(redditPostsTable).addColumn('flair', 'varchar(255)').execute()

  await db.schema.createIndex('reddit_posts_flair_index').on(redditPostsTable).column('flair').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(redditPostsTable).dropColumn('flair').execute()
}
