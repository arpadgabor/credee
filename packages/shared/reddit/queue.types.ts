import type { Job } from 'bullmq'
import { RedditCrawledPost } from './crawler.types'

export interface CrawlInput {
  subreddit: `/r/${string}`
  count?: number
}

export interface CrawlOutput {
  jobId: Job['id']
  subreddit: `/r/${string}`
  posts: RedditCrawledPost[]
}
