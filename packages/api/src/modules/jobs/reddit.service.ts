import { db } from '../../database/client.js'
import type { RedditPost } from '../../database/database.js'
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
    db.selectFrom('reddit_posts').select(db.fn.count<number>('id').as('count')).executeTakeFirst(),
  ])

  return { data, count: count?.count }
}
