import type { RedditCrawledPost } from '../../../src/crawlers/reddit.crawler.types.js'

export interface CrawlInput {
  subreddit: `/r/${string}`
}
export interface CrawlOutput {
  subreddit: `/r/${string}`
  posts: RedditCrawledPost[]
}
