import Bull from 'bull'
import type { RedditCrawledPost } from '../../crawlers/reddit.crawler.types.js'

export interface CrawlInput {
  subreddit: `/r/${string}`
  stopsAfterCount?: number
  stopsAfterSeconds?: number
}
export interface CrawlOutput {
  jobId: Bull.JobId
  subreddit: `/r/${string}`
  posts: RedditCrawledPost[]
}
