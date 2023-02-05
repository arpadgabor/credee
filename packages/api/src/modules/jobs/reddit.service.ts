import { sql } from 'kysely'
import { db } from '@credee/shared/database'
import type { RedditPost } from '@credee/shared/database'
import { z } from 'zod'

//#region listRedditResults
interface RedditListOptions {
  limit?: number
  offset?: number
  order?: { column: keyof RedditPost; sort: 'asc' | 'desc' }[]
}
export async function listRedditResults({ limit, offset, order }: RedditListOptions = { limit: 25, offset: 0 }) {
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
//#endregion

//#region groupById
export const groupByIdQuerySchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
  flair: z.string().optional(),
  subreddit: z.string().optional(),
  title: z.string().optional(),
})
export const groupByIdItem = z.object({
  post_id: z.string(),
  title: z.string(),
  flair: z.string().nullish(),
  created_at: z.date(),
  subreddit: z.string(),
  domain: z.string(),
  permalink: z.string(),
  url: z.string().nullish(),
  title_sentiment: z.number().nullish(),
  history: z.array(
    z.object({
      score: z.number(),
      gold: z.number(),
      inserted_at: z.string(),
      comments: z.number(),
      ratio: z.number(),
    })
  ),
})
type GroupByIdItem = z.infer<typeof groupByIdItem>

export async function groupById({ limit, offset, flair, subreddit, title }: z.infer<typeof groupByIdQuerySchema>) {
  let countQuery = db.selectFrom('reddit_posts').select(db.fn.count('post_id').distinct().as('count'))
  let query = db
    .selectFrom('reddit_posts')
    .groupBy(['post_id', 'title', 'flair', 'created_at', 'subreddit', 'domain', 'permalink', 'url'])
    .select([
      'post_id',
      'title',
      'flair',
      'created_at',
      'subreddit',
      'domain',
      'permalink',
      'url',
      $ => sql`max(${$.ref('title_sentiment')})`.as('title_sentiment'),
      $ =>
        sql<GroupByIdItem['history']>`jsonb_agg(
          json_build_object(
            'score', ${$.ref('score')},
            'gold', ${$.ref('gold_count')},
            'inserted_at', ${$.ref('inserted_at')},
            'comments', ${$.ref('nr_of_comments')},
            'ratio', ${$.ref('ratio')}
          )
          order by ${$.ref('inserted_at')} asc)`.as('history'),
    ])
    .orderBy('created_at', 'desc')
    .limit(limit ?? 10)
    .offset(offset ?? 0)

  if (flair) {
    query = query.where('flair', '=', flair)
    countQuery = countQuery.where('flair', '=', flair)
  }
  if (subreddit) {
    query = query.where('subreddit', '=', subreddit)
    countQuery = countQuery.where('subreddit', '=', subreddit)
  }
  if (title) {
    query = query.where('title', 'ilike', '%' + title + '%')
    countQuery = countQuery.where('title', 'ilike', '%' + title + '%')
  }

  const [data, count] = await Promise.all([query.execute(), countQuery.executeTakeFirst()])

  return {
    data: data as GroupByIdItem[],
    count: Number(count?.count),
  }
}
//#endregion

//#region getRedditFilters
export const redditFiltersResult = z.object({
  subreddits: z.array(z.string()),
  flairs: z.array(z.string()),
})

export async function getRedditFilters() {
  const [subreddits, flairs] = await Promise.all([
    db.selectFrom('reddit_posts').distinct().select('subreddit').execute(),
    db.selectFrom('reddit_posts').distinct().select('flair').execute(),
  ])

  return {
    subreddits: subreddits.map(item => item.subreddit),
    flairs: flairs.map(item => item.flair).filter(Boolean) as string[],
  }
}
//#endregion
