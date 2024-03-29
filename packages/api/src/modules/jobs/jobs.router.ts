import { z } from 'zod'
import { procedure, router } from '../../core/trpc'
import { getActiveJobs, queueRedditCrawl, removeJob } from './jobs.service'
import { getUpdaterJob, setUpdaterJob } from '@credee/shared/jobs-manager'

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

const getUpdater = procedure.query(async () => {
  return getUpdaterJob()
})

const setUpdaterInterval = procedure
  .input(z.object({ repeatMinutes: z.number(), maxDays: z.number().nullish(), maxScrapes: z.number().nullish() }))
  .mutation(async ({ input }) => {
    return setUpdaterJob({
      repeatMinutes: input.repeatMinutes,
      maxDays: input.maxDays || 3,
      maxScrapes: input.maxScrapes || 36,
    })
  })

export const JobsRouter = router({
  redditCrawl,
  list,
  remove,
  getUpdater,
  setUpdaterInterval,
})
