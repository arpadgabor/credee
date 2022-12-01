import { z } from 'zod'
import { procedure, router } from '../../core/trpc.js'
import { sendCrawlInput } from './crawlers.js'

export const TasksRouter = router({
  crawlSubreddit: procedure
    .input(
      z.object({
        subreddit: z.string().startsWith('/r/'),
        stopsAfterCount: z.number().optional().default(25),
        stopsAfterSeconds: z.number().optional(),
      })
    )
    .mutation(({ input }) => {
      sendCrawlInput({ subreddit: '/r/subreddit' })
      return true
    }),
})
