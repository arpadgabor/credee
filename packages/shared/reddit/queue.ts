import { Queue, QueueEvents, ConnectionOptions } from 'bullmq'
import type { CrawlInput, CrawlOutput } from './queue.types.js'

export function useReddit({ redisConnection }: { redisConnection: ConnectionOptions }) {
  const queueName = 'reddit-crawler'
  return {
    queueName,
    queue: new Queue<CrawlInput, CrawlOutput>(queueName, { connection: redisConnection }),
    queueEvents: new QueueEvents(queueName, { connection: redisConnection }),
  }
}
