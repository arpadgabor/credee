import { Queue, QueueEvents } from 'bullmq'
import { redisConnection } from '../../redis.js'
import { queueName } from './constants.js'
import type { CrawlInput, CrawlOutput } from './types.js'

export const queue = new Queue<CrawlInput, CrawlOutput>(queueName, { connection: redisConnection })
export const queueEvents = new QueueEvents(queueName, { connection: redisConnection })
