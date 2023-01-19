import { queue, queueEvents } from './queue.js'
import type { CrawlInput, CrawlOutput } from './types.js'

export const Reddit = {
  queue,
  queueEvents,
}

export namespace Reddit {
  export type Input = CrawlInput
  export type Output = CrawlOutput
}
