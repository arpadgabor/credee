import Queue from 'bull'
import { CrawlInput, CrawlOutput } from './types.js'

export function createQueue(redisUrl: string) {
  const inputQueue = new Queue<CrawlInput>('crawl-input', {
    redis: redisUrl,
    settings: { retryProcessDelay: 5000 },
    defaultJobOptions: {
      timeout: 60_000 * 10, // 10 minutes
    },
  })
  const outputQueue = new Queue<CrawlOutput>('crawl-output', {
    redis: redisUrl,
  })

  async function sendCrawlInput(input: CrawlInput) {
    inputQueue.add(input)
  }
  async function sendCrawlOutput(data: CrawlOutput) {
    outputQueue.add(data)
  }

  return { inputQueue, outputQueue, sendCrawlInput, sendCrawlOutput }
}
