import { z } from 'zod'
import { procedure, router } from '../../core/trpc.js'
import { getJobsInQueue, queueRedditCrawl, removeJob } from './jobs.service.js'
import { groupById, list as listRedditPosts } from './reddit.service.js'

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

const redditByPostId = procedure.query(async () => {
  const result = await groupById({})

  return {
    data: result,
    meta: {},
  }
})

const redditResults = procedure
  .input(getRedditResultsInput)
  .output(z.any())
  .query(async ({ input }) => {
    const { data, count } = await listRedditPosts({
      limit: input?.limit,
      offset: input?.offset,
      order: input?.order as any,
    })

    return {
      data,
      meta: {
        count: count || 0,
      },
    }
  })

const redditCrawl = procedure.input(crawlRedditInput).mutation(async ({ input }) => {
  await queueRedditCrawl({
    subreddit: input.subreddit as any,
    stopsAfterCount: input.stopsAfterCount,
    stopsAfterSeconds: input.stopsAfterSeconds,
  })
})

const remove = procedure
  .input(
    z.object({
      jobId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    await removeJob(input.jobId)
  })

const list = procedure.query(async () => {
  return await getJobsInQueue()
})

export const JobsRouter = router({
  redditCrawl,
  list,
  remove,
  redditResults,
  redditByPostId,
})
