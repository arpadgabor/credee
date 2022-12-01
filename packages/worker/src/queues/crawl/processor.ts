import { ProcessCallbackFunction } from 'bull'
import { CrawlInput, CrawlOutput } from './types.js'
import { crawlReddit } from '../../crawlers/index.js'

export const queueCallback =
  (sendOutput: (output: CrawlOutput) => Promise<void>): ProcessCallbackFunction<CrawlInput> =>
  async (job, done) => {
    try {
      const result = await crawlReddit({
        subreddit: job.data.subreddit,
        endAfter: { count: 5 },
      })

      await sendOutput({
        posts: result,
        subreddit: job.data.subreddit,
      })
      done(null)
    } catch (e: unknown) {
      done(e as any)
    }
  }
