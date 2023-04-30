import { Queue, QueueEvents, ConnectionOptions } from 'bullmq'
import type { CrawlInput, CrawlOutput } from './queue.types'

export function useRedditCrawler({ redisConnection }: { redisConnection: ConnectionOptions }) {
  const queueName = 'reddit-crawler'
  return {
    queueName,
    queue: new Queue<CrawlInput, CrawlOutput>(queueName, { connection: redisConnection }),
    queueEvents: new QueueEvents(queueName, { connection: redisConnection }),
  }
}

export type UpdaterOptions = {
  repeatMinutes?: number
  maxScrapes?: number
  maxDays?: number
}

/** Updates the data of old crawls */
export function useRedditUpdater({ redisConnection }: { redisConnection: ConnectionOptions }) {
  const queueName = 'reddit-updater'
  return {
    queueName,
    queue: new Queue<UpdaterOptions>(queueName, { connection: redisConnection }),
    queueEvents: new QueueEvents(queueName, { connection: redisConnection }),
  }
}
