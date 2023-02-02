import { sql } from 'kysely'
import { db } from '@credee/shared/database'
import type { RedditPost } from '@credee/shared/database'
interface RedditListOptions {
  limit?: number
  offset?: number
  order?: { column: keyof RedditPost; sort: 'asc' | 'desc' }[]
}

export async function list({ limit, offset, order }: RedditListOptions = { limit: 25, offset: 0 }) {
  let query = db
    .selectFrom('reddit_posts')
    .select([
      'id',
      'post_id',
      'title',
      'author',
      'subreddit',
      'created_at',
      'inserted_at',
      'score',
      'ratio',
      'nr_of_comments',
      'permalink',
      'domain',
      'url',
      'url_title',
      'screenshot_filename',
    ])
    .limit(limit ?? 10)
    .offset(offset ?? 0)

  order?.forEach(order => {
    query = query.orderBy(order.column as any, order.sort)
  })

  const [data, count] = await Promise.all([
    query.execute(),
    db.selectFrom('reddit_posts').select(db.fn.count('id').as('count')).executeTakeFirst(),
  ])

  return { data, count: Number(count?.count) }
}

export async function groupById({}) {
  return await db
    .selectFrom('reddit_posts')
    .groupBy(['post_id', 'title', 'flair'])
    .select([
      'post_id',
      'title',
      'flair',
      eb => sql`max(${eb.ref('inserted_at')})`.as('inserted_at'),
      eb => sql`max(${eb.ref('score')})`.as('score'),
      eb => sql`max(${eb.ref('gold_count')})`.as('gold_count'),
      eb => sql`count(${eb.ref('post_id')})`.as('scrape_count'),
    ])
    .orderBy('inserted_at', 'desc')
    .execute()
}
