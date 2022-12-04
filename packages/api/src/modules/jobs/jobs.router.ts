import { db } from '../../database/client.js'
import { z } from 'zod'
import { procedure, router } from '../../core/trpc.js'
import { getJobsInQueue, sendCrawlInput } from './jobs.service.js'

const crawlRedditInput = z.object({
  subreddit: z.string().startsWith('/r/'),
  stopsAfterCount: z.number().max(100).optional().default(25),
  stopsAfterSeconds: z
    .number()
    .max(60 * 5)
    .optional(),
})
export type CrawlRedditInput = z.infer<typeof crawlRedditInput>

const redditResults = z.object({
  meta: z.object({ count: z.number() }),
  data: z.array(
    z.object({
      id: z.number(),
      post_id: z.string(),
      title: z.string(),
      author: z.string(),
      subreddit: z.string(),
      created_at: z.date().or(z.string()),
      score: z.number(),
      ratio: z.number(),
      nr_of_comments: z.number(),
      permalink: z.string(),
      domain: z.string(),
      url: z.string(),
      url_title: z.string(),
    })
  ),
})
export type RedditResultsResponse = z.infer<typeof redditResults>

export const JobsRouter = router({
  redditCrawl: procedure.input(crawlRedditInput).mutation(async ({ input }) => {
    await sendCrawlInput({
      subreddit: input.subreddit as any,
      stopsAfterCount: input.stopsAfterCount,
      stopsAfterSeconds: input.stopsAfterSeconds,
    })
  }),

  redditResults: procedure
    .input(
      z
        .object({
          limit: z.number().default(25).optional(),
          offset: z.number().default(25).optional(),
          sort: z.enum(['created_at', 'score', 'ratio', 'nr_of_comments', 'domain']).optional(),
          direction: z.enum(['asc', 'desc']).optional(),
        })
        .optional()
    )
    // .output(redditResults)
    .query(async ({ input }) => {
      const query = db
        .selectFrom('reddit_posts')
        .select([
          'id',
          'post_id',
          'title',
          'author',
          'subreddit',
          'created_at',
          'score',
          'ratio',
          'nr_of_comments',
          'permalink',
          'domain',
          'url',
          'url_title',
        ])
        .limit(input?.limit ?? 10)
        .offset(input?.offset ?? 0)
        .if(!!input?.sort, qb => qb.orderBy(input!.sort!, input?.direction))

      const [data, count] = await Promise.all([
        query.execute(),
        db.selectFrom('reddit_posts').select(db.fn.count<number>('id').as('count')).executeTakeFirst(),
      ])

      return {
        data,
        meta: {
          count: Number(count!.count),
        },
      } as RedditResultsResponse
    }),

  list: procedure.query(async () => {
    return await getJobsInQueue()
  }),
})
