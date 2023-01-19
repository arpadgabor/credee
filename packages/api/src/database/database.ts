import { Generated } from 'kysely'
import type { RichTextJSONSegment, Media } from '@credee/worker/src/crawlers/spiders/subreddit/index.js'

export interface RedditPost {
  id: Generated<number>

  post_id: string
  screenshot_filename: string
  created_at: Date
  title: string

  subreddit: string
  author: string
  permalink: string

  domain: string
  url: string
  url_title: string

  score: number
  ratio: number
  gold_count: number

  is_original_content: boolean
  is_self_post: boolean
  is_cross_post: boolean
  is_video: boolean
  is_image: boolean
  is_link: boolean

  media: Media

  nr_of_comments: number
  comments?: string
  comments_raw: {
    id: string
    author: string
    content: RichTextJSONSegment
    createdAt: string
    editedAt: string | null
    gildings: null
    goldCount: number
    permalink: string
    score: number
    voteState: number
  }[]

  awards?: {
    id: string
    name: string
    count: number
    description: string
    icon: string
  }[]

  inserted_at?: Date
}

export interface Database {
  reddit_posts: RedditPost
}
