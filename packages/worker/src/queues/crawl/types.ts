import type { RedditCrawledPost } from '../../../src/crawlers/reddit.crawler.types.js'

export interface CrawlInput {
  subreddit: `/r/${string}`
  stopsAfterCount?: number
  stopsAfterSeconds?: number
}
export interface CrawlOutput {
  subreddit: `/r/${string}`
  posts: RedditCrawledPost[]
}
