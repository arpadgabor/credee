import type playwright from 'playwright'
import type { Post, Comment } from '@credee/shared/reddit/types.js'

export interface EmittedEvents {
  screenshot: { post: Post; screenshot: Buffer }
  'post-data': { post: Post; comments: Comment[] }
  done: void
}

export interface SubredditSpiderInit {
  page: playwright.Page
  /**
   * @example '/r/Android'
   */
  subreddit: `/r/${string}`
  limit: number
}
