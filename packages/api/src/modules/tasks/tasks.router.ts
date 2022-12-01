import { z } from 'zod'
import { procedure, router } from '../../core/trpc.js'
import { getJobsInQueue, sendCrawlInput } from './jobs.js'

export const TasksRouter = router({
  crawlSubreddit: procedure
    .input(
      z.object({
        subreddit: z.string().startsWith('/r/'),
        stopsAfterCount: z.number().max(100).optional().default(25),
        stopsAfterSeconds: z
          .number()
          .max(60 * 5)
          .optional(),
      })
    )
    .mutation(({ input }) => {
      sendCrawlInput({
        subreddit: input.subreddit as any,
        stopsAfterCount: input.stopsAfterCount,
        stopsAfterSeconds: input.stopsAfterSeconds,
      })
      return true
    }),

  jobs: procedure.query(async () => {
    return await getJobsInQueue()
  }),
})
