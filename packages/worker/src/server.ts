import { config } from './config.js'
import { queueCallback } from './queues/crawl/processor.js'
import { createQueue } from './queues/crawl/queue.js'

const { inputQueue: crawlQueue, sendCrawlOutput } = createQueue(config.get('redisUrl'))

crawlQueue.process(queueCallback(sendCrawlOutput))
console.log('Waiting for messages...')
