import { EventEmitter } from 'node:events'
import { Worker } from 'bullmq'
import { CrawlInput, CrawlOutput } from './types.js'
import { crawlReddit } from '../../crawlers/index.js'
import { queueName } from './constants.js'
import { redisConnection } from '../../redis.js'

const notifications = new EventEmitter()

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
