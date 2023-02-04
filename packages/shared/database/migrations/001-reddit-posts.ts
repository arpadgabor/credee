import { Kysely, sql } from 'kysely'

export const redditPostsTable = 'reddit_posts'
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(redditPostsTable)
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('post_id', 'varchar(16)', col => col.notNull())
    .addColumn('created_at', 'timestamptz', col => col.notNull())
    .addColumn('title', 'text', col => col.notNull())
    .addColumn('subreddit', 'varchar(255)', col => col.notNull())
    .addColumn('author', 'varchar(255)', col => col.notNull())
    .addColumn('permalink', 'text', col => col.notNull())
    .addColumn('domain', 'varchar(255)')
    .addColumn('url', 'text')
    .addColumn('url_title', 'text')
    .addColumn('score', 'integer', col => col.defaultTo(0))
    .addColumn('ratio', 'real', col => col.defaultTo(0))
    .addColumn('gold_count', 'integer', col => col.defaultTo(0))
    .addColumn('is_original_content', 'boolean', col => col.defaultTo(false))
    .addColumn('is_self_post', 'boolean', col => col.defaultTo(false))
    .addColumn('is_cross_post', 'boolean', col => col.defaultTo(false))
    .addColumn('is_video', 'boolean', col => col.defaultTo(false))
    .addColumn('is_image', 'boolean', col => col.defaultTo(false))
    .addColumn('is_link', 'boolean', col => col.defaultTo(false))
    .addColumn('media', 'jsonb')
    .addColumn('nr_of_comments', 'integer')
    .addColumn('comments', 'text')
    .addColumn('comments_raw', 'jsonb')
    .addColumn('awards', 'jsonb')
    .addColumn('inserted_at', 'timestamptz', col => col.defaultTo(sql`now()`))
    .execute()

  await db.schema.createIndex('reddit_posts_post_id_index').on(redditPostsTable).column('post_id').execute()
  await db.schema.createIndex('reddit_posts_subreddit_index').on(redditPostsTable).column('subreddit').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(redditPostsTable).execute()
}
