import { useReddit } from '@credee/shared/reddit/queue.js'
import type { CrawlInput, CrawlOutput } from '@credee/shared/reddit/types.js'
import { Job, Worker } from 'bullmq'
import { EventEmitter } from 'node:events'
import { crawlReddit } from '../crawlers/index.js'
import { redisConnection } from '../redis.js'

const notifications = new EventEmitter()

const { queueName, queue } = useReddit({
  redisConnection,
})

export const worker = new Worker<CrawlInput, CrawlOutput>(
  queueName,
  async job => {
    console.log(`Processing ${job.data.subreddit}...`)
    const runningJob = await Job.fromId(queue, job.id)

    const updateProgress = async (event: { progress: number }) => {
      await runningJob.updateProgress(event.progress)
      console.log(`Processing: ${event.progress}`)
    }

    notifications.on('progress', updateProgress)

    const result = await crawlReddit({
      notifications,
      subreddit: job.data.subreddit,
      endAfter: { count: job.data.stopsAfterCount ?? 5 },
    }).catch(e => {
      console.log(e)
      throw e
    })

    notifications.off('progress', updateProgress)

    return {
      jobId: job.id,
      posts: result,
      subreddit: job.data.subreddit,
    }
  },
  { autorun: false, connection: redisConnection }
)
