import type playwright from 'playwright'
import type { Post } from './subreddit.types.js'
import type { Comment } from './comment.types.js'

export type DataCallback = { post: Post; screenshot: Buffer } | { post: Post; comments: Comment[] }

export interface SubredditSpiderInit {
  page: playwright.Page
  /**
   * @example '/r/Android'
   */
  subreddit: `/r/${string}`
}
