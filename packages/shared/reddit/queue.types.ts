import type { Job } from 'bullmq'
import { RedditCrawledPost } from './crawler.types.js'

export interface CrawlInput {
  subreddit: `/r/${string}`
  stopsAfterCount?: number
  stopsAfterSeconds?: number
}

export interface CrawlOutput {
  jobId: Job['id']
  subreddit: `/r/${string}`
  posts: RedditCrawledPost[]
}
