import { Kysely } from 'kysely'

const redditPostsTable = 'reddit_posts'
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(redditPostsTable).addColumn('title_sentiment', 'float4').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(redditPostsTable).dropColumn('title_sentiment').execute()
}
