import type playwright from 'playwright'
import type { Post, Comment } from '@credee/shared/reddit/types'

export interface EmittedEvents {
  // screenshot: { post: Post; screenshot: Buffer }
  'post-data': { post: Post; comments: Comment[]; screenshot: Buffer }
  done: void
}

export interface SubredditSpiderInit {
  feedPage: playwright.Page
  postPage: playwright.Page
  /**
   * @example '/r/Android'
   */
  subreddit: `/r/${string}`
  limit: number
}
