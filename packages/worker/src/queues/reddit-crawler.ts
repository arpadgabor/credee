import { useReddit } from '@credee/shared/reddit/queue.js'
import type { CrawlInput, CrawlOutput } from '@credee/shared/reddit/types.js'
import { Worker } from 'bullmq'
import { EventEmitter } from 'node:events'
import { crawlReddit } from '../crawlers/index.js'
import { redisConnection } from '../redis.js'

const notifications = new EventEmitter()

const { queueName } = useReddit({
  redisConnection,
})

export const worker = new Worker<CrawlInput, CrawlOutput>(
  queueName,
  async job => {
    console.log(`Processing ${job.data.subreddit}...`)

    notifications.on('progress', async ({ post, progress }) => {
      await job.updateProgress(progress)

      console.log(`Processing: ${progress * 100}%`)
      console.log(`Sending ${post.id}.`)
    })

    const result = await crawlReddit({
      notifications,
      subreddit: job.data.subreddit,
      endAfter: { count: job.data.stopsAfterCount ?? 5 },
    }).catch(e => {
      console.log(e)
      throw e
    })

    return {
      jobId: job.id,
      posts: result,
      subreddit: job.data.subreddit,
    }
  },
  { autorun: false, connection: redisConnection }
)
