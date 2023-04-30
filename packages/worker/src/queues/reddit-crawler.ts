import { useRedditCrawler } from '@credee/shared/reddit/queue'
import type { CrawlInput } from '@credee/shared/reddit/types'
import { Worker } from 'bullmq'
import { crawlReddit } from '../crawlers/index.js'
import { redisConnection } from '../redis.js'

const { queueName } = useRedditCrawler({
  redisConnection,
})

// uncomment for testing on local machine
// await crawlReddit({
//   subreddit: '/r/science',
//   count: 5,
// })

export const worker = new Worker<CrawlInput>(
  queueName,
  async job => {
    console.log(`Processing ${job.data.subreddit}...`)
    console.log(job.log('test'))
    await crawlReddit({
      subreddit: job.data.subreddit,
      count: job.data.count ?? 5,
    }).catch(e => {
      console.log(e)
    })
  },
  { autorun: false, connection: redisConnection }
)
