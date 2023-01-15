import { ProcessCallbackFunction } from 'bull'
import { CrawlInput, CrawlOutput } from './types.js'
import { crawlReddit } from '../../crawlers/index.js'
import { EventEmitter } from  'events'

const notifications = new EventEmitter()

export const queueCallback =
  (sendOutput: (output: CrawlOutput) => Promise<unknown>): ProcessCallbackFunction<CrawlInput> =>
  async (job, done) => {
    const jobsInQueue = await job.queue.count()
    try {
      console.log(`Processing ${job.data.subreddit}... [${jobsInQueue}]`)

      notifications.on('progress', async ({ post, progress }) => {
        job.progress(progress)
        console.log(`Processing: ${progress}%`)
        console.log(`Sending ${post.id}.`)

        await sendOutput({
          jobId: job.id,
          posts: [post],
          subreddit: job.data.subreddit,
        })
      })

      const result = await crawlReddit({
        notifications,
        subreddit: job.data.subreddit,
        endAfter: { count: job.data.stopsAfterCount ?? 5 },
      })
      console.log(result)

      // await sendOutput({
      //   jobId: job.id,
      //   posts: result,
      //   subreddit: job.data.subreddit,
      // })

      console.log(`Done processing ${job.data.subreddit}.`)

      done(null)
    } catch (e: unknown) {
      done(e as any)
    }
  }
