import { config } from './config.js'
import { crawlCallback, createCrawlQueue } from './queues/crawl/index.js'

const { inputQueue: crawlQueue, sendCrawlOutput } = createCrawlQueue(config.get('redisUrl'))

crawlQueue.process(crawlCallback(sendCrawlOutput))

console.log('Waiting for messages...')
