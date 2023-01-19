import { z } from 'zod'
import { procedure, router } from '../../core/trpc.js'
import { db } from '../../database/client.js'
import { getJobsInQueue, queueRedditCrawl } from './jobs.service.js'

const crawlRedditInput = z.object({
  subreddit: z.string().startsWith('/r/'),
  stopsAfterCount: z.number().max(100).optional().default(25),
  stopsAfterSeconds: z
    .number()
    .max(60 * 5)
    .optional(),
})
export type CrawlRedditInput = z.infer<typeof crawlRedditInput>

const getRedditResultsInput = z
  .object({
    limit: z.number().default(25).optional(),
    offset: z.number().default(25).optional(),
    order: z
      .array(
        z.object({
          column: z.enum(['created_at', 'inserted_at', 'score', 'ratio', 'nr_of_comments', 'domain', 'title']).optional(),
          sort: z.enum(['asc', 'desc']).optional(),
        })
      )
      .optional(),
  })
  .optional()

const getRedditResultsOutput = z.object({
  meta: z.object({
    count: z.number(),
  }),
  data: z.array(
    z.object({
      id: z.number(),
      post_id: z.string(),
      title: z.string(),
      author: z.string(),
      subreddit: z.string(),
      created_at: z.date().or(z.string()),
      inserted_at: z.date().or(z.string()),
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

export const JobsRouter = router({
  redditCrawl: procedure.input(crawlRedditInput).mutation(async ({ input }) => {
    await queueRedditCrawl({
      subreddit: input.subreddit as any,
      stopsAfterCount: input.stopsAfterCount,
      stopsAfterSeconds: input.stopsAfterSeconds,
    })
  }),

  redditResults: procedure
    .input(getRedditResultsInput)
    .output(getRedditResultsOutput)
    .query(async ({ input }) => {
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
        ])
        .limit(input?.limit ?? 10)
        .offset(input?.offset ?? 0)

      input?.order?.forEach(order => {
        query = query.orderBy(order.column as any, order.sort)
      })

      const [data, count] = await Promise.all([
        query.execute(),
        db.selectFrom('reddit_posts').select(db.fn.count<number>('id').as('count')).executeTakeFirst(),
      ])

      return {
        data,
        meta: {
          count: Number(count!.count) || 0,
        },
      }
    }),

  list: procedure.query(async () => {
    return await getJobsInQueue()
  }),
})
