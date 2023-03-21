import { z } from 'zod'
import { procedure, router } from '../../core/trpc'
import { getActiveJobs, getJobsInQueue, queueRedditCrawl, removeJob } from './jobs.service'
import { groupById, listRedditResults as listRedditPosts } from './reddit.service'

const crawlRedditInput = z.object({
  subreddit: z.string().startsWith('/r/'),
  stopsAfterCount: z.number().max(100).optional().default(5),
  repeat: z
    .object({
      every: z.number().optional(),
      pattern: z.string().optional(),
      immediately: z.boolean().optional(),
      count: z.number().optional(),
      prevMillis: z.number().optional(),
      offset: z.number().optional(),
    })
    .optional(),
})
export type CrawlRedditInput = z.infer<typeof crawlRedditInput>

const redditCrawl = procedure.input(crawlRedditInput).mutation(async ({ input }) => {
  await queueRedditCrawl(
    {
      subreddit: input.subreddit as any,
      count: input.stopsAfterCount,
    },
    input.repeat ?? { every: 1_000 * 60 * 60 }
  )
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
  return await getActiveJobs()
})

export const JobsRouter = router({
  redditCrawl,
  list,
  remove,
})
