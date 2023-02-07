import { Queue, QueueEvents, ConnectionOptions } from 'bullmq'
import type { CrawlInput, CrawlOutput } from './queue.types.js'

export function useRedditCrawler({ redisConnection }: { redisConnection: ConnectionOptions }) {
  const queueName = 'reddit-crawler'
  return {
    queueName,
    queue: new Queue<CrawlInput, CrawlOutput>(queueName, { connection: redisConnection }),
    queueEvents: new QueueEvents(queueName, { connection: redisConnection }),
  }
}

/** Updates the data of old crawls */
export function useRedditUpdater({ redisConnection }: { redisConnection: ConnectionOptions }) {
  const queueName = 'reddit-updater'
  return {
    queueName,
    queue: new Queue<null>(queueName, { connection: redisConnection }),
    queueEvents: new QueueEvents(queueName, { connection: redisConnection }),
  }
}
