import { useReddit } from '@credee/shared/reddit/queue'
import type { CrawlInput } from '@credee/shared/reddit/types'
import { Worker } from 'bullmq'
import { crawlReddit } from '../crawlers/index.js'
import { redisConnection } from '../redis.js'

const { queueName } = useReddit({
  redisConnection,
})

export const worker = new Worker<CrawlInput>(
  queueName,
  async job => {
    console.log(`Processing ${job.data.subreddit}...`)

    await crawlReddit({
      subreddit: job.data.subreddit,
      endAfter: { count: job.data.stopsAfterCount ?? 5 },
    }).catch(e => {
      console.log(e)
      throw e
    })
    console.log('Done!')
  },
  { autorun: false, connection: redisConnection }
)
