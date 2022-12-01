import { ProcessCallbackFunction } from 'bull'
import { CrawlInput, CrawlOutput } from './types.js'
import { crawlReddit } from '../../crawlers/index.js'

export const queueCallback =
  (sendOutput: (output: CrawlOutput) => Promise<unknown>): ProcessCallbackFunction<CrawlInput> =>
  async (job, done) => {
    const jobsInQueue = await job.queue.count()
    try {
      console.log(`Processing ${job.data.subreddit}... [${jobsInQueue}]`)

      const result = await crawlReddit({
        subreddit: job.data.subreddit,
        endAfter: job.data.stopsAfterSeconds
          ? { seconds: job.data.stopsAfterSeconds * 1000 }
          : { count: job.data.stopsAfterCount ?? 5 },
      })

      await sendOutput({
        posts: result,
        subreddit: job.data.subreddit,
      })

      console.log(`Done processing ${job.data.subreddit}.`)

      done(null)
    } catch (e: unknown) {
      done(e as any)
    }
  }
